package com.unihub.app.services;

import com.unihub.app.entities.authentication.User;
import com.unihub.app.entities.community.content.*;
import com.unihub.app.entities.community.resources.Course;
import com.unihub.app.mappers.PageMapper;
import com.unihub.app.mappers.community.CommunityContentMapper;
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

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class NotificationServiceTests {

    @Mock
    private NotificationRepository notificationRepository;

    @Mock
    private EventReminderRepository reminderRepository;

    @Spy
    private CommunityContentMapper contentMapper = new CommunityContentMapper();

    @Spy
    private PageMapper pageMapper = new PageMapper();

    @InjectMocks
    private NotificationService notificationService;

    @Test
    @DisplayName("processDueReminders sends notifications and updates reminder status to SENT")
    public void testProcessDueReminders() {
        User user = User.builder().id(UUID.randomUUID()).username("david").build();
        Course course = Course.builder().id(1L).name("ASC").build();
        Event event = Event.builder()
                .id(UUID.randomUUID())
                .title("Examen Scris")
                .type(EventType.EXAM)
                .startTime(OffsetDateTime.now().plusHours(1))
                .course(course)
                .build();

        EventReminder reminder = EventReminder.builder()
                .id(UUID.randomUUID())
                .user(user)
                .event(event)
                .offsetMinutes(60)
                .remindAt(OffsetDateTime.now().minusMinutes(1))
                .status(ReminderStatus.PENDING)
                .build();

        when(reminderRepository.findPendingDueReminders(eq(ReminderStatus.PENDING), any(OffsetDateTime.class)))
                .thenReturn(List.of(reminder));

        notificationService.processDueReminders();

        verify(notificationRepository, times(1)).save(any(Notification.class));
        assertEquals(ReminderStatus.SENT, reminder.getStatus());
        verify(reminderRepository, times(1)).save(reminder);
    }
}
