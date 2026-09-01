package com.unihub.app.services.community.content;

import com.unihub.app.dto.PageDto;
import com.unihub.app.dto.community.OwnerDto;
import com.unihub.app.dto.community.content.response.NotificationResponseDto;
import com.unihub.app.entities.community.content.*;
import com.unihub.app.events.email.EventReminderNotificationEvent;
import com.unihub.app.mappers.PageMapper;
import com.unihub.app.mappers.community.CommunityContentMapper;
import com.unihub.app.repositories.community.content.EventReminderRepository;
import com.unihub.app.repositories.community.content.NotificationProjection;
import com.unihub.app.repositories.community.content.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
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

    @Transactional(readOnly = true)
    public PageDto<NotificationResponseDto> getUserNotifications(
            UUID userId,
            NotificationCategory category,
            NotificationType type,
            Boolean isRead,
            Pageable pageable
    ) {
        Page<NotificationProjection> page = notificationRepository.findUserNotifications(
                userId,
                category,
                type,
                isRead,
                pageable
        );
        return pageMapper.toPageDto(page.map(this::toDto));
    }

    private NotificationResponseDto toDto(NotificationProjection p) {
        OwnerDto actor = p.getActorId() != null
                ? new OwnerDto(p.getActorId(), p.getActorUsername(), Boolean.TRUE.equals(p.getActorActive()))
                : null;

        return NotificationResponseDto.builder()
                .id(p.getId())
                .title(p.getTitle())
                .message(p.getMessage())
                .category(p.getCategory())
                .type(p.getType())
                .isRead(p.getIsRead())
                .createdAt(p.getCreatedAt())
                .eventId(p.getEventId())
                .actor(actor)
                .communitySlug(p.getCommunitySlug())
                .communityName(p.getCommunityName())
                .studyYearName(p.getStudyYearName())
                .courseName(p.getCourseName())
                .courseSlug(p.getCourseSlug())
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

        for (EventReminder reminder : dueReminders) {
            String title = "Reminder: " + reminder.getEvent().getTitle();
            String message = String.format("The %s for %s starts at %s",
                    reminder.getEvent().getType().name().toLowerCase(),
                    reminder.getEvent().getCourse().getName(),
                    reminder.getEvent().getStartTime());

            Notification notification = contentMapper.toEventNotificationEntity(
                    reminder.getUser(),
                    title,
                    message,
                    NotificationType.EVENT_REMINDER,
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
