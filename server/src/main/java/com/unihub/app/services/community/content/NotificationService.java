package com.unihub.app.services.community.content;

import com.unihub.app.dto.PageDto;
import com.unihub.app.dto.community.OwnerDto;
import com.unihub.app.dto.community.content.response.NotificationResponseDto;
import com.unihub.app.entities.community.content.*;
import com.unihub.app.events.email.EventReminderNotificationEvent;
import com.unihub.app.mappers.PageMapper;
import com.unihub.app.mappers.community.CommunityContentMapper;
import com.unihub.app.mappers.community.CommunityResourceMapper;
import com.unihub.app.repositories.community.content.EventReminderRepository;
import com.unihub.app.repositories.community.content.NotificationRepository;
import jakarta.persistence.criteria.JoinType;
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

import java.time.Duration;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final EventReminderRepository reminderRepository;
    private final CommunityContentMapper contentMapper;
    private final PageMapper pageMapper;
    private final ApplicationEventPublisher eventPublisher;
    private final CommunityResourceMapper communityResourceMapper;

    @Transactional(readOnly = true)
    public PageDto<NotificationResponseDto> getUserNotifications(
            UUID userId,
            NotificationCategory category,
            NotificationType type,
            Boolean isRead,
            Pageable pageable
    ) {
        Specification<Notification> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (query.getResultType() != Long.class && query.getResultType() != long.class) {
                root.fetch("actor", JoinType.LEFT);
            }

            predicates.add(cb.equal(root.get("user").get("id"), userId));
            if (category != null) {
                predicates.add(cb.equal(root.get("category"), category));
            }
            if (type != null) {
                predicates.add(cb.equal(root.get("type"), type));
            }
            if (isRead != null) {
                predicates.add(cb.equal(root.get("isRead"), isRead));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<Notification> page = notificationRepository.findAll(spec, pageable);
        return pageMapper.toPageDto(page.map(this::toDto));
    }

    private NotificationResponseDto toDto(Notification n) {
        NotificationMetadata meta = n.getMetadata();
        OwnerDto actor = communityResourceMapper.toOwnerDto(n.getActor());

        return NotificationResponseDto.builder()
                .id(n.getId())
                .message(n.getMessage())
                .category(n.getCategory())
                .type(n.getType())
                .isRead(n.isRead())
                .createdAt(n.getCreatedAt())
                .eventId(meta != null ? meta.eventId() : null)
                .actor(actor)
                .communitySlug(meta != null ? meta.communitySlug() : null)
                .communityName(meta != null ? meta.communityName() : null)
                .studyYearName(meta != null ? meta.studyYearName() : null)
                .courseName(meta != null ? meta.courseName() : null)
                .courseSlug(meta != null ? meta.courseSlug() : null)
                .build();
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

        List<Notification> notifications = new ArrayList<>();
        List<EventReminder> sentReminders = new ArrayList<>();
        for (EventReminder reminder : dueReminders) {

            String message = String.format("The %s for %s %s",
                    reminder.getEvent().getType().name().toLowerCase(),
                    reminder.getEvent().getCourse().getName(),
                    getUrgencyLabel(reminder.getEvent().getStartTime(), reminder.getEvent().getType()));

            Notification notification = contentMapper.toEventNotificationEntity(
                    reminder.getUser(),
                    message,
                    NotificationType.EVENT_REMINDER,
                    reminder.getEvent(),
                    null
            );

            notifications.add(notification);
            reminder.setStatus(ReminderStatus.SENT);
            sentReminders.add(reminder);

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
        notificationRepository.saveAll(notifications);
        reminderRepository.saveAll(sentReminders);
    }

    public static String getUrgencyLabel(OffsetDateTime startTime, EventType eventType) {
        OffsetDateTime now = OffsetDateTime.now();
        long minutesUntilStart = Duration.between(now, startTime).toMinutes();

        if (minutesUntilStart <= 0) {
            return eventType.equals(EventType.ASSIGNMENT) ? "is due now" : "is starting now";
        }

        String verb = eventType.equals(EventType.ASSIGNMENT) ? "is due" : "starts";

        if (minutesUntilStart < 60) {
            return String.format("%s in %dm", verb, minutesUntilStart);
        }

        long hours = minutesUntilStart / 60;
        long remainingMinutes = minutesUntilStart % 60;

        if (hours < 24) {
            if (remainingMinutes == 0) {
                return  String.format("%s in %dh", verb, hours);
            }
            return String.format("%s in %dh %dm", verb, hours, remainingMinutes);
        }

        long days = hours / 24;
        if (days < 7) {
            return String.format("%s in %dd", verb, days);
        }

        long weeks = days / 7;
        return String.format("%s in %dw", verb, weeks);
    }
}
