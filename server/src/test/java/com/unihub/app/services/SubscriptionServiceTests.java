package com.unihub.app.services;

import com.unihub.app.entities.authentication.User;
import com.unihub.app.entities.community.content.Event;
import com.unihub.app.entities.community.content.EventReminder;
import com.unihub.app.entities.community.content.EventSubscription;
import com.unihub.app.entities.community.content.EventType;
import com.unihub.app.entities.community.resources.Community;
import com.unihub.app.entities.community.resources.Course;
import com.unihub.app.entities.community.resources.StudyYear;
import com.unihub.app.entities.community.resources.StudyYearName;
import com.unihub.app.mappers.community.CommunityContentMapper;
import com.unihub.app.repositories.community.content.EventReminderRepository;
import com.unihub.app.repositories.community.content.EventRepository;
import com.unihub.app.repositories.community.content.EventSubscriptionRepository;
import com.unihub.app.services.community.content.SubscriptionService;
import com.unihub.app.services.community.resources.CourseService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class SubscriptionServiceTests {

    @Mock
    private EventRepository eventRepository;

    @Mock
    private EventSubscriptionRepository subscriptionRepository;

    @Mock
    private EventReminderRepository reminderRepository;

    @Mock
    private CourseService courseService;

    @Spy
    private CommunityContentMapper contentMapper = new CommunityContentMapper();

    @InjectMocks
    private SubscriptionService subscriptionService;

    @Test
    @DisplayName("subscribeToEvent creates subscription and default reminders when none provided")
    public void testSubscribeToEvent_DefaultReminders() {
        UUID userId = UUID.randomUUID();
        UUID eventId = UUID.randomUUID();
        User user = User.builder().id(userId).username("david").build();
        Event event = Event.builder()
                .id(eventId)
                .title("Examen")
                .startTime(OffsetDateTime.now().plusDays(2))
                .build();

        when(eventRepository.findById(eventId)).thenReturn(Optional.of(event));
        when(subscriptionRepository.existsByUserIdAndEventId(userId, eventId)).thenReturn(false);

        subscriptionService.subscribeToEvent(user, eventId, null);

        verify(subscriptionRepository, times(1)).save(any(EventSubscription.class));
        verify(reminderRepository, times(2)).save(any(EventReminder.class)); // 1440 and 60
    }

    @Test
    @DisplayName("subscribeToCourseEvents subscribes user to all events of that course")
    public void testSubscribeToCourseEvents() {
        UUID userId = UUID.randomUUID();
        User user = User.builder().id(userId).username("david").build();
        Community comm = Community.builder().slug("fmi-info-id").name("FMI").build();
        StudyYear sy = StudyYear.builder().community(comm).build();
        Course course = Course.builder().id(1L).slug("asc").studyYear(sy).build();

        Event event1 = Event.builder().id(UUID.randomUUID()).title("E1").startTime(OffsetDateTime.now().plusDays(1)).build();
        Event event2 = Event.builder().id(UUID.randomUUID()).title("E2").startTime(OffsetDateTime.now().plusDays(2)).build();

        when(courseService.verifyCourseExists("fmi-info-id", StudyYearName.YEAR_1, "asc")).thenReturn(course);
        when(eventRepository.findByCourseId(1L)).thenReturn(List.of(event1, event2));
        when(eventRepository.findById(event1.getId())).thenReturn(Optional.of(event1));
        when(eventRepository.findById(event2.getId())).thenReturn(Optional.of(event2));

        int count = subscriptionService.subscribeToCourseEvents(user, "fmi-info-id", StudyYearName.YEAR_1, "asc", List.of(60));

        assertEquals(2, count);
        verify(subscriptionRepository, times(2)).save(any(EventSubscription.class));
    }
}
