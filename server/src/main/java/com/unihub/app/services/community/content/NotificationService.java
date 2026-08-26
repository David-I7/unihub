package com.unihub.app.services.community.content;

import com.unihub.app.dto.PageDto;
import com.unihub.app.dto.community.content.NotificationResponseDto;
import com.unihub.app.entities.authentication.User;
import com.unihub.app.entities.community.content.EventReminder;
import com.unihub.app.entities.community.content.Notification;
import com.unihub.app.entities.community.content.NotificationType;
import com.unihub.app.entities.community.content.ReminderStatus;
import com.unihub.app.mappers.PageMapper;
import com.unihub.app.mappers.community.CommunityContentMapper;
import com.unihub.app.repositories.community.content.EventReminderRepository;
import com.unihub.app.repositories.community.content.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final EventReminderRepository reminderRepository;
    private final CommunityContentMapper contentMapper;
    private final PageMapper pageMapper;

    @Transactional(readOnly = true)
    public PageDto<NotificationResponseDto> getUserNotifications(User user, Pageable pageable) {
        Page<Notification> page = notificationRepository.findByUserIdOrderByCreatedAtDesc(user.getId(), pageable);
        return pageMapper.toPageDto(page.map(contentMapper::toNotificationResponseDto));
    }

    @Transactional(readOnly = true)
    public long getUnreadCount(User user) {
        return notificationRepository.countByUserIdAndIsReadFalse(user.getId());
    }

    @Transactional
    public void markAsRead(User user, UUID notificationId) {
        notificationRepository.markAsReadByIdAndUserId(notificationId, user.getId());
    }

    @Transactional
    public void markAllAsRead(User user) {
        notificationRepository.markAllAsReadByUserId(user.getId());
    }

    @Scheduled(fixedDelay = 60000)
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

            Notification notification = Notification.builder()
                    .user(reminder.getUser())
                    .title(title)
                    .message(message)
                    .type(NotificationType.EVENT_REMINDER)
                    .event(reminder.getEvent())
                    .isRead(false)
                    .build();

            notificationRepository.save(notification);

            reminder.setStatus(ReminderStatus.SENT);
            reminderRepository.save(reminder);
        }
    }
}
