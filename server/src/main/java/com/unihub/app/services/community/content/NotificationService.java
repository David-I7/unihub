package com.unihub.app.services.community.content;

import com.unihub.app.dto.PageDto;
import com.unihub.app.dto.community.content.response.NotificationResponseDto;
import com.unihub.app.entities.community.content.*;
import com.unihub.app.entities.community.resources.Course;
import com.unihub.app.events.email.EventReminderNotificationEvent;
import com.unihub.app.mappers.PageMapper;
import com.unihub.app.mappers.community.CommunityContentMapper;
import com.unihub.app.repositories.community.content.CommunityPostRepository;
import com.unihub.app.repositories.community.content.CoursePostRepository;
import com.unihub.app.repositories.community.content.EventReminderRepository;
import com.unihub.app.repositories.community.content.NotificationRepository;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final EventReminderRepository reminderRepository;
    private final CommunityPostRepository communityPostRepository;
    private final CoursePostRepository coursePostRepository;
    private final CommunityContentMapper contentMapper;
    private final PageMapper pageMapper;
    private final ApplicationEventPublisher eventPublisher;

    @Transactional(readOnly = true)
    public PageDto<NotificationResponseDto> getUserNotifications(
            UUID userId,
            NotificationCategory category,
            String type,
            Boolean isRead,
            Pageable pageable
    ) {
        Specification<Notification> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.equal(root.get("user").get("id"), userId));

            if (category != null) {
                predicates.add(cb.equal(root.get("category"), category));
            }

            if (isRead != null) {
                predicates.add(cb.equal(root.get("isRead"), isRead));
            }

            if (type != null && !type.isBlank()) {
                String upperType = type.trim().toUpperCase();
                List<Predicate> typePredicates = new ArrayList<>();

                try {
                    EventNotificationType eventType = EventNotificationType.valueOf(upperType);
                    typePredicates.add(cb.and(
                            cb.equal(root.get("category"), NotificationCategory.EVENT),
                            cb.equal(cb.treat(root, EventNotification.class).get("type"), eventType)
                    ));
                } catch (IllegalArgumentException ignored) {
                }

                try {
                    PostNotificationType postType = PostNotificationType.valueOf(upperType);
                    typePredicates.add(cb.and(
                            cb.equal(root.get("category"), NotificationCategory.POST),
                            cb.equal(cb.treat(root, PostNotification.class).get("type"), postType)
                    ));
                } catch (IllegalArgumentException ignored) {
                }

                try {
                    SystemNotificationType sysType = SystemNotificationType.valueOf(upperType);
                    typePredicates.add(cb.and(
                            cb.equal(root.get("category"), NotificationCategory.SYSTEM),
                            cb.equal(cb.treat(root, SystemNotification.class).get("type"), sysType)
                    ));
                } catch (IllegalArgumentException ignored) {
                }

                if (!typePredicates.isEmpty()) {
                    predicates.add(cb.or(typePredicates.toArray(new Predicate[0])));
                }
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<Notification> page = notificationRepository.findAll(spec, pageable);
        return pageMapper.toPageDto(page.map(this::mapToDto));
    }

    private NotificationResponseDto mapToDto(Notification notification) {
        if (notification instanceof EventNotification en) {
            return contentMapper.toEventNotificationResponseDto(en);
        } else if (notification instanceof PostNotification pn) {
            String communitySlug = null;
            String studyYear = null;
            String courseSlug = null;

            if (pn.getPost() != null) {
                UUID postId = pn.getPost().getId();
                Optional<CommunityPost> commPost = communityPostRepository.findByPostIdWithCommunity(postId);
                if (commPost.isPresent()) {
                    communitySlug = commPost.get().getCommunity().getSlug();
                } else {
                    Optional<CoursePost> coursePost = coursePostRepository.findByPostIdWithCourseDetails(postId);
                    if (coursePost.isPresent()) {
                        Course c = coursePost.get().getCourse();
                        communitySlug = c.getStudyYear().getCommunity().getSlug();
                        studyYear = c.getStudyYear().getStudyYearName().name();
                        courseSlug = c.getSlug();
                    }
                }
            }

            return contentMapper.toPostNotificationResponseDto(pn, communitySlug, studyYear, courseSlug);
        } else if (notification instanceof SystemNotification sn) {
            return contentMapper.toSystemNotificationResponseDto(sn);
        }

        throw new IllegalArgumentException("Unknown notification entity type: " + notification.getClass().getName());
    }

    @Transactional(readOnly = true)
    public long getUnreadCount(UUID userId, NotificationCategory category) {
        if (category != null) {
            return notificationRepository.countByUserIdAndCategoryAndIsReadFalse(userId, category);
        }
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }

    @Transactional
    public void markAsRead(UUID userId, UUID notificationId) {
        notificationRepository.markAsReadByIdAndUserId(notificationId, userId);
    }

    @Transactional
    public void markAllAsRead(UUID userId) {
        notificationRepository.markAllAsReadByUserId(userId);
    }

    @Scheduled(fixedDelay = 60, timeUnit = TimeUnit.SECONDS)
    @Transactional
    public void processDueReminders() {
        OffsetDateTime now = OffsetDateTime.now();
        List<EventReminder> dueReminders = reminderRepository.findPendingDueReminders(ReminderStatus.PENDING, now);

        if (dueReminders.isEmpty()) {
            return;
        }

        log.info("Processing {} due event reminders", dueReminders.size());

        for (EventReminder reminder : dueReminders) {
            String title = "Reminder: " + reminder.getEvent().getTitle();
            String message = String.format("The %s for %s starts at %s",
                    reminder.getEvent().getType().name().toLowerCase(),
                    reminder.getEvent().getCourse().getName(),
                    reminder.getEvent().getStartTime());

            EventNotification notification = contentMapper.toEventNotificationEntity(
                    reminder.getUser(),
                    title,
                    message,
                    EventNotificationType.REMINDER,
                    reminder.getEvent(),
                    null
            );

            notificationRepository.save(notification);

            reminder.setStatus(ReminderStatus.SENT);
            reminderRepository.save(reminder);

            eventPublisher.publishEvent(new EventReminderNotificationEvent(
                    reminder.getUser().getEmail(),
                    reminder.getUser().getUsername(),
                    reminder.getEvent().getTitle(),
                    reminder.getEvent().getType().name(),
                    reminder.getEvent().getCourse().getName(),
                    reminder.getEvent().getStartTime(),
                    reminder.getEvent().getLocation().name(),
                    reminder.getEvent().getLocationDetails()
            ));
        }
    }
}
