package com.unihub.app.services;

import com.unihub.app.dto.community.OwnerDto;
import com.unihub.app.dto.community.content.request.CreateEventRequestDto;
import com.unihub.app.dto.community.content.response.CalendarEventResponseDto;
import com.unihub.app.dto.community.content.response.EventResponseDto;
import com.unihub.app.entities.authentication.User;
import com.unihub.app.entities.community.content.Event;
import com.unihub.app.entities.community.content.EventLocation;
import com.unihub.app.entities.community.content.EventReminder;
import com.unihub.app.entities.community.content.EventType;
import com.unihub.app.entities.community.resources.Community;
import com.unihub.app.entities.community.resources.Course;
import com.unihub.app.entities.community.resources.StudyYear;
import com.unihub.app.entities.community.resources.StudyYearName;
import com.unihub.app.mappers.community.CommunityContentMapper;
import com.unihub.app.repositories.authentication.UserRepository;
import com.unihub.app.repositories.community.content.EventReminderRepository;
import com.unihub.app.repositories.community.content.EventRepository;
import com.unihub.app.repositories.community.resources.CommunityMemberRepository;
import com.unihub.app.repositories.community.resources.CommunityRepository;
import com.unihub.app.repositories.community.resources.CourseRepository;
import com.unihub.app.services.community.content.CalendarService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.time.OffsetDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class CalendarServiceTests {

    @Mock
    private EventRepository eventRepository;

    @Mock
    private EventReminderRepository reminderRepository;

    @Mock
    private CommunityRepository communityRepository;

    @Mock
    private CommunityMemberRepository communityMemberRepository;

    @Mock
    private CourseRepository courseRepository;

    @Mock
    private UserRepository userRepository;

    @Spy
    private CommunityContentMapper contentMapper = new CommunityContentMapper();

    @InjectMocks
    private CalendarService calendarService;

    private Community createTestCommunity(UUID id, String slug) {
        return Community.builder()
                .id(id)
                .name("Test Community")
                .slug(slug)
                .description("Description")
                .build();
    }

    private Course createTestCourse(Community community) {
        StudyYear studyYear = StudyYear.builder()
                .id(1)
                .studyYearName(StudyYearName.YEAR_1)
                .community(community)
                .build();

        return Course.builder()
                .id(1L)
                .name("Data Structures")
                .slug("sd")
                .abbreviation("SD")
                .studyYear(studyYear)
                .semester(1)
                .build();
    }

    // =========================================================================
    // getEvents
    // =========================================================================

    @Test
    @DisplayName("getEvents with valid month and communitySlug returns events")
    public void testGetEvents_WithCommunitySlug_Success() {
        UUID userId = UUID.randomUUID();
        UUID communityId = UUID.randomUUID();
        UUID eventId = UUID.randomUUID();
        String slug = "fmi-info";

        Community community = createTestCommunity(communityId, slug);

        CalendarEventResponseDto eventDto = CalendarEventResponseDto.builder()
                .id(eventId)
                .title("Exam")
                .type(EventType.EXAM)
                .startTime(OffsetDateTime.now().plusDays(2))
                .communitySlug(slug)
                .courseSlug("sd")
                .isSubscribed(true)
                .build();

        when(communityRepository.findBySlug(slug)).thenReturn(Optional.of(community));
        when(communityMemberRepository.isMemberOfCommunity(slug, userId)).thenReturn(true);
        when(eventRepository.findEventsByCommunityIds(eq(List.of(communityId)), eq("sd"), eq(StudyYearName.YEAR_1), any(), any(), eq(userId)))
                .thenReturn(List.of(eventDto));

        List<CalendarEventResponseDto> result = calendarService.getEvents(
                userId, 2026, 8, slug, StudyYearName.YEAR_1, "sd"
        );

        assertNotNull(result);
        assertEquals(1, result.size());
        CalendarEventResponseDto dto = result.get(0);
        assertEquals(eventId, dto.id());
        assertTrue(dto.isSubscribed());
    }

    @Test
    @DisplayName("getEvents throws 400 when communitySlug is null or blank")
    public void testGetEvents_MissingCommunitySlug() {
        UUID userId = UUID.randomUUID();
        ResponseStatusException ex = assertThrows(
                ResponseStatusException.class,
                () -> calendarService.getEvents(userId, 2026, 8, null, null, null)
        );
        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
        assertEquals("Community slug is required", ex.getReason());
    }

    @Test
    @DisplayName("getEvents throws 400 when month is invalid")
    public void testGetEvents_InvalidMonth() {
        UUID userId = UUID.randomUUID();
        ResponseStatusException ex = assertThrows(
                ResponseStatusException.class,
                () -> calendarService.getEvents(userId, 2026, 13, "fmi", null, null)
        );
        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
    }

    @Test
    @DisplayName("getEvents throws 403 when user is not member of requested community")
    public void testGetEvents_NotMember() {
        UUID userId = UUID.randomUUID();
        String slug = "private-comm";
        Community community = createTestCommunity(UUID.randomUUID(), slug);

        when(communityRepository.findBySlug(slug)).thenReturn(Optional.of(community));
        when(communityMemberRepository.isMemberOfCommunity(slug, userId)).thenReturn(false);

        ResponseStatusException ex = assertThrows(
                ResponseStatusException.class,
                () -> calendarService.getEvents(userId, 2026, 8, slug, null, null)
        );
        assertEquals(HttpStatus.FORBIDDEN, ex.getStatusCode());
    }

    // =========================================================================
    // createEvent
    // =========================================================================

    @Test
    @DisplayName("createEvent successfully creates and returns event")
    public void testCreateEvent_Success() {
        UUID userId = UUID.randomUUID();
        UUID communityId = UUID.randomUUID();
        String slug = "fmi-info";

        Community community = createTestCommunity(communityId, slug);
        Course course = createTestCourse(community);
        User owner = User.builder().id(userId).username("david").build();
        OffsetDateTime startTime = OffsetDateTime.now().plusDays(2);

        CreateEventRequestDto requestDto = CreateEventRequestDto.builder()
                .title("New Exam")
                .description("Midterm")
                .type(EventType.EXAM)
                .startTime(startTime)
                .location(EventLocation.IN_PERSON)
                .courseId(1L)
                .communitySlug(slug)
                .build();

        when(communityRepository.findBySlug(slug)).thenReturn(Optional.of(community));
        when(communityMemberRepository.isMemberOfCommunity(slug, userId)).thenReturn(true);
        when(courseRepository.findByIdWithStudyYearAndCommunity(1L)).thenReturn(Optional.of(course));
        when(userRepository.findById(userId)).thenReturn(Optional.of(owner));
        when(eventRepository.save(any(Event.class))).thenAnswer(invocation -> {
            Event e = invocation.getArgument(0);
            e.setId(UUID.randomUUID());
            e.setCreatedAt(OffsetDateTime.now());
            e.setUpdatedAt(OffsetDateTime.now());
            return e;
        });

        CalendarEventResponseDto result = calendarService.createEvent(userId, requestDto);

        assertNotNull(result);
        assertEquals("New Exam", result.title());
        assertEquals(EventType.EXAM, result.type());
        assertEquals(slug, result.communitySlug());
        assertFalse(result.isSubscribed());
        verify(eventRepository).save(any(Event.class));
    }

    @Test
    @DisplayName("createEvent throws 400 when course does not belong to specified community")
    public void testCreateEvent_CourseMismatch() {
        UUID userId = UUID.randomUUID();
        UUID communityId1 = UUID.randomUUID();
        UUID communityId2 = UUID.randomUUID();

        Community community1 = createTestCommunity(communityId1, "comm-1");
        Community community2 = createTestCommunity(communityId2, "comm-2");
        Course courseFromComm2 = createTestCourse(community2);

        CreateEventRequestDto requestDto = CreateEventRequestDto.builder()
                .title("Exam")
                .type(EventType.EXAM)
                .startTime(OffsetDateTime.now().plusDays(1))
                .location(EventLocation.IN_PERSON)
                .courseId(1L)
                .communitySlug("comm-1")
                .build();

        when(communityRepository.findBySlug("comm-1")).thenReturn(Optional.of(community1));
        when(communityMemberRepository.isMemberOfCommunity("comm-1", userId)).thenReturn(true);
        when(courseRepository.findByIdWithStudyYearAndCommunity(1L)).thenReturn(Optional.of(courseFromComm2));

        ResponseStatusException ex = assertThrows(
                ResponseStatusException.class,
                () -> calendarService.createEvent(userId, requestDto)
        );
        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
        assertEquals("Course does not belong to the specified community", ex.getReason());
    }

    // =========================================================================
    // getEventById
    // =========================================================================

    @Test
    @DisplayName("getEventById returns event with reminders when user is member")
    public void testGetEventById_Success() {
        UUID userId = UUID.randomUUID();
        UUID eventId = UUID.randomUUID();
        OffsetDateTime startTime = OffsetDateTime.now().plusDays(1);

        EventResponseDto eventDto = EventResponseDto.builder()
                .id(eventId)
                .title("Lecture 1")
                .type(EventType.LECTURE)
                .description("Intro")
                .location(EventLocation.IN_PERSON)
                .startTime(startTime)
                .courseSlug("asc")
                .communitySlug("fmi")
                .studyYear(StudyYearName.YEAR_1)
                .owner(new OwnerDto(userId, "prof"))
                .reminders(Collections.emptyList())
                .build();

        when(eventRepository.findEventById(eventId)).thenReturn(Optional.of(eventDto));
        when(communityMemberRepository.isMemberOfCommunity("fmi", userId)).thenReturn(true);
        when(reminderRepository.findByUserIdAndEventId(userId, eventId)).thenReturn(Collections.emptyList());

        EventResponseDto dto = calendarService.getEventById(userId, eventId);

        assertNotNull(dto);
        assertEquals(eventId, dto.getId());
        assertEquals("Lecture 1", dto.getTitle());
    }

    @Test
    @DisplayName("getEventById throws 404 when event not found")
    public void testGetEventById_NotFound() {
        UUID userId = UUID.randomUUID();
        UUID eventId = UUID.randomUUID();

        when(eventRepository.findEventById(eventId)).thenReturn(Optional.empty());

        assertThrows(ResponseStatusException.class, () -> calendarService.getEventById(userId, eventId));
    }
}
