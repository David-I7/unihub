package com.unihub.app.services;

import com.unihub.app.dto.PageDto;
import com.unihub.app.dto.community.content.response.EventNotificationResponseDto;
import com.unihub.app.dto.community.content.response.NotificationResponseDto;
import com.unihub.app.entities.authentication.User;
import com.unihub.app.entities.community.content.*;
import com.unihub.app.entities.community.resources.Community;
import com.unihub.app.entities.community.resources.Course;
import com.unihub.app.events.email.EventReminderNotificationEvent;
import com.unihub.app.mappers.PageMapper;
import com.unihub.app.mappers.community.CommunityContentMapper;
import com.unihub.app.repositories.community.content.CommunityPostRepository;
import com.unihub.app.repositories.community.content.CoursePostRepository;
import com.unihub.app.repositories.community.content.EventReminderRepository;
import com.unihub.app.repositories.community.content.NotificationRepository;
import com.unihub.app.services.community.content.NotificationService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.jpa.domain.Specification;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class NotificationServiceTests {

    @Mock
    private NotificationRepository notificationRepository;

    @Mock
    private EventReminderRepository reminderRepository;

    @Mock
    private CommunityPostRepository communityPostRepository;

    @Mock
    private CoursePostRepository coursePostRepository;

    @Spy
    private CommunityContentMapper contentMapper = new CommunityContentMapper();

    @Spy
    private PageMapper pageMapper = new PageMapper();

    @Mock
    private ApplicationEventPublisher eventPublisher;

    @InjectMocks
    private NotificationService notificationService;

    @Test
    @DisplayName("getUserNotifications returns mapped page of notification DTOs")
    public void testGetUserNotifications_Success() {
        UUID userId = UUID.randomUUID();
        User user = User.builder().id(userId).username("david").build();

        Event event = Event.builder()
                .id(UUID.randomUUID())
                .title("Algorithms Exam")
                .community(Community.builder().slug("fmi-info").build())
                .build();

        EventNotification eventNotification = EventNotification.builder()
                .id(UUID.randomUUID())
                .user(user)
                .title("Reminder: Algorithms Exam")
                .message("Exam starts soon")
                .category(NotificationCategory.EVENT)
                .type(EventNotificationType.REMINDER)
                .event(event)
                .isRead(false)
                .createdAt(OffsetDateTime.now())
                .build();

        PageRequest pageRequest = PageRequest.of(0, 10);
        when(notificationRepository.findAll(any(Specification.class), eq(pageRequest)))
                .thenReturn(new PageImpl<>(List.of(eventNotification), pageRequest, 1));

        PageDto<NotificationResponseDto> result = notificationService.getUserNotifications(
                userId,
                NotificationCategory.EVENT,
                "REMINDER",
                false,
                pageRequest
        );

        assertNotNull(result);
        assertEquals(1, result.totalElements());
        NotificationResponseDto dto = result.content().get(0);
        assertInstanceOf(EventNotificationResponseDto.class, dto);
        EventNotificationResponseDto eventDto = (EventNotificationResponseDto) dto;
        assertEquals("Reminder: Algorithms Exam", eventDto.title());
        assertEquals("fmi-info", eventDto.communitySlug());
    }

    @Test
    @DisplayName("getUnreadCount returns total or category unread count")
    public void testGetUnreadCount() {
        UUID userId = UUID.randomUUID();

        when(notificationRepository.countByUserIdAndIsReadFalse(userId)).thenReturn(10L);
        when(notificationRepository.countByUserIdAndCategoryAndIsReadFalse(userId, NotificationCategory.EVENT)).thenReturn(3L);

        assertEquals(10L, notificationService.getUnreadCount(userId, null));
        assertEquals(3L, notificationService.getUnreadCount(userId, NotificationCategory.EVENT));
    }

    @Test
    @DisplayName("markAsRead and markAllAsRead invoke repository methods")
    public void testMarkAsRead() {
        UUID userId = UUID.randomUUID();
        UUID notificationId = UUID.randomUUID();

        notificationService.markAsRead(userId, notificationId);
        verify(notificationRepository).markAsReadByIdAndUserId(notificationId, userId);

        notificationService.markAllAsRead(userId);
        verify(notificationRepository).markAllAsReadByUserId(userId);
    }

    @Test
    @DisplayName("processDueReminders creates EventNotification and publishes email event")
    public void testProcessDueReminders() {
        UUID userId = UUID.randomUUID();
        User user = User.builder().id(userId).email("david@example.com").username("david").build();

        Course course = Course.builder().name("Algorithms").build();
        Event event = Event.builder()
                .id(UUID.randomUUID())
                .title("Midterm Exam")
                .type(EventType.EXAM)
                .course(course)
                .startTime(OffsetDateTime.now().plusHours(1))
                .location(EventLocation.IN_PERSON)
                .locationDetails("Room 101")
                .build();

        EventReminder reminder = EventReminder.builder()
                .id(UUID.randomUUID())
                .user(user)
                .event(event)
                .status(ReminderStatus.PENDING)
                .offsetMinutes(15)
                .remindAt(OffsetDateTime.now().minusMinutes(1))
                .build();

        when(reminderRepository.findPendingDueReminders(eq(ReminderStatus.PENDING), any(OffsetDateTime.class)))
                .thenReturn(List.of(reminder));

        notificationService.processDueReminders();

        verify(notificationRepository).save(any(EventNotification.class));
        verify(reminderRepository).save(reminder);
        assertEquals(ReminderStatus.SENT, reminder.getStatus());
        verify(eventPublisher).publishEvent(any(EventReminderNotificationEvent.class));
    }
}
