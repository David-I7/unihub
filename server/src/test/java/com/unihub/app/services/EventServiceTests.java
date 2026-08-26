package com.unihub.app.services;

import com.unihub.app.dto.community.content.EventRequestDto;
import com.unihub.app.dto.community.content.EventResponseDto;
import com.unihub.app.entities.authentication.User;
import com.unihub.app.entities.community.content.*;
import com.unihub.app.entities.community.resources.Community;
import com.unihub.app.entities.community.resources.Course;
import com.unihub.app.entities.community.resources.StudyYear;
import com.unihub.app.entities.community.resources.StudyYearName;
import com.unihub.app.mappers.community.CommunityContentMapper;
import com.unihub.app.repositories.community.content.EventReminderRepository;
import com.unihub.app.repositories.community.content.EventRepository;
import com.unihub.app.repositories.community.content.EventSubscriptionRepository;
import com.unihub.app.services.community.content.EventService;
import com.unihub.app.services.community.resources.CommunityService;
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
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class EventServiceTests {

    @Mock
    private EventRepository eventRepository;

    @Mock
    private EventSubscriptionRepository eventSubscriptionRepository;

    @Mock
    private EventReminderRepository eventReminderRepository;

    @Mock
    private CourseService courseService;

    @Mock
    private CommunityService communityService;

    @Spy
    private CommunityContentMapper contentMapper = new CommunityContentMapper();

    @InjectMocks
    private EventService eventService;

    @Test
    @DisplayName("getEvents returns list of events with subscription flags")
    public void testGetEvents_Success() {
        UUID userId = UUID.randomUUID();
        User user = User.builder().id(userId).username("david").build();
        Community comm = Community.builder().slug("fmi-info-id").name("FMI").build();
        StudyYear sy = StudyYear.builder().community(comm).build();
        Course course = Course.builder().id(1L).slug("asc").name("ASC").studyYear(sy).build();

        Event event = Event.builder()
                .id(UUID.randomUUID())
                .title("Examen ASC")
                .type(EventType.EXAM)
                .startTime(OffsetDateTime.now().plusDays(10))
                .location(EventLocation.IN_PERSON)
                .course(course)
                .community(comm)
                .owner(user)
                .createdAt(OffsetDateTime.now())
                .updatedAt(OffsetDateTime.now())
                .build();

        when(eventRepository.findEvents(eq("fmi-info-id"), isNull(), isNull(), isNull(), isNull(), isNull()))
                .thenReturn(List.of(event));
        when(eventSubscriptionRepository.existsByUserIdAndEventId(userId, event.getId()))
                .thenReturn(true);

        List<EventResponseDto> result = eventService.getEvents("fmi-info-id", null, null, null, null, null, user);

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("Examen ASC", result.get(0).title());
        assertTrue(result.get(0).isSubscribed());
    }

    @Test
    @DisplayName("createEvent creates event and auto-subscribes with reminders")
    public void testCreateEvent_WithReminders_Success() {
        User user = User.builder().id(UUID.randomUUID()).username("david").build();
        Community comm = Community.builder().slug("fmi-info-id").name("FMI").build();
        StudyYear sy = StudyYear.builder().community(comm).build();
        Course course = Course.builder().id(1L).slug("asc").name("ASC").studyYear(sy).build();
        OffsetDateTime startTime = OffsetDateTime.now().plusDays(5);

        EventRequestDto request = EventRequestDto.builder()
                .title("Examen ASC")
                .type(EventType.EXAM)
                .startTime(startTime)
                .location(EventLocation.IN_PERSON)
                .offsetMinutes(List.of(1440, 60))
                .build();

        when(courseService.verifyCourseExists("fmi-info-id", StudyYearName.YEAR_1, "asc"))
                .thenReturn(course);
        when(eventRepository.save(any(Event.class)))
                .thenAnswer(inv -> {
                    Event e = inv.getArgument(0);
                    e.setId(UUID.randomUUID());
                    e.setCreatedAt(OffsetDateTime.now());
                    e.setUpdatedAt(OffsetDateTime.now());
                    return e;
                });

        EventResponseDto result = eventService.createEvent("fmi-info-id", "asc", StudyYearName.YEAR_1, request, user);

        assertNotNull(result);
        assertEquals("Examen ASC", result.title());
        verify(eventSubscriptionRepository, times(1)).save(any(EventSubscription.class));
        verify(eventReminderRepository, times(2)).save(any(EventReminder.class));
    }
}
