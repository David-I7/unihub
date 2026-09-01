package com.unihub.app.services;

import com.unihub.app.domain.RoleType;
import com.unihub.app.dto.UserDto;
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
import com.unihub.app.mappers.UserMapper;
import com.unihub.app.mappers.community.CommunityContentMapper;
import com.unihub.app.repositories.authentication.UserRepository;
import com.unihub.app.repositories.community.content.EventReminderRepository;
import com.unihub.app.repositories.community.content.EventRepository;
import com.unihub.app.repositories.community.resources.CommunityMemberRepository;
import com.unihub.app.repositories.community.resources.CommunityRepository;
import com.unihub.app.repositories.community.resources.CourseRepository;
import com.unihub.app.services.authorization.AuthorizationService;
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
    private AuthorizationService authorizationService;

    @Mock
    private org.springframework.context.ApplicationEventPublisher eventPublisher;

    @Mock
    private UserRepository userRepository;

    @Mock
    private UserMapper userMapper;

    @Spy
    private CommunityContentMapper contentMapper = new CommunityContentMapper();

    @Spy
    private com.unihub.app.mappers.PageMapper pageMapper = new com.unihub.app.mappers.PageMapper();

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
    @DisplayName("getEvents returns list of events when events exist")
    public void testGetEvents_Success() {
        UUID userId = UUID.randomUUID();
        String slug = "test-community";
        UUID commId = UUID.randomUUID();
        Community community = createTestCommunity(commId, slug);

        CalendarEventResponseDto eventDto = new CalendarEventResponseDto(
                UUID.randomUUID(),
                "Midterm Exam",
                EventType.EXAM,
                OffsetDateTime.now().plusDays(1),
                2.0,
                EventLocation.IN_PERSON,
                "PA",
                false
        );

        when(communityRepository.findBySlug(slug)).thenReturn(Optional.of(community));
        when(communityMemberRepository.isMemberOfCommunity(slug, userId)).thenReturn(true);
        when(eventRepository.findEventsByCommunityIds(eq(List.of(commId)), any(), any(), any(), any(), eq(userId)))
                .thenReturn(List.of(eventDto));

        List<CalendarEventResponseDto> result = calendarService.getEvents(userId, 2026, 4, slug, null, null);

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("Midterm Exam", result.get(0).title());
        assertEquals("PA", result.get(0).courseAbbreviation());
        assertFalse(result.get(0).isSubscribed());
    }

    @Test
    @DisplayName("getEvents throws 404 when community does not exist")
    public void testGetEvents_CommunityNotFound() {
        UUID userId = UUID.randomUUID();
        when(communityRepository.findBySlug("non-existent")).thenReturn(Optional.empty());

        ResponseStatusException ex = assertThrows(
                ResponseStatusException.class,
                () -> calendarService.getEvents(userId, 2026, 4, "non-existent", null, null)
        );
        assertEquals(HttpStatus.NOT_FOUND, ex.getStatusCode());
    }

    @Test
    @DisplayName("getEvents throws 403 when user is not a member of the community")
    public void testGetEvents_NotMember() {
        UUID userId = UUID.randomUUID();
        String slug = "test-community";
        Community community = createTestCommunity(UUID.randomUUID(), slug);
        when(communityRepository.findBySlug(slug)).thenReturn(Optional.of(community));
        when(communityMemberRepository.isMemberOfCommunity(slug, userId)).thenReturn(false);

        ResponseStatusException ex = assertThrows(
                ResponseStatusException.class,
                () -> calendarService.getEvents(userId, 2026, 4, slug, null, null)
        );
        assertEquals(HttpStatus.FORBIDDEN, ex.getStatusCode());
        assertEquals("User is not a member of this community", ex.getReason());
    }

    @Test
    @DisplayName("getEvents marks isSubscribed as true when user has a reminder for the event")
    public void testGetEvents_SubscribedEvent() {
        UUID userId = UUID.randomUUID();
        String slug = "test-community";
        UUID commId = UUID.randomUUID();
        Community community = createTestCommunity(commId, slug);

        CalendarEventResponseDto eventDto = new CalendarEventResponseDto(
                UUID.randomUUID(),
                "Midterm Exam",
                EventType.EXAM,
                OffsetDateTime.now().plusDays(1),
                2.0,
                EventLocation.IN_PERSON,
                "PA",
                true
        );

        when(communityRepository.findBySlug(slug)).thenReturn(Optional.of(community));
        when(communityMemberRepository.isMemberOfCommunity(slug, userId)).thenReturn(true);
        when(eventRepository.findEventsByCommunityIds(eq(List.of(commId)), any(), any(), any(), any(), eq(userId)))
                .thenReturn(List.of(eventDto));

        List<CalendarEventResponseDto> result = calendarService.getEvents(userId, 2026, 4, slug, null, null);

        assertNotNull(result);
        assertEquals(1, result.size());
        assertTrue(result.get(0).isSubscribed());
    }

    // =========================================================================
    // createEvent
    // =========================================================================

    @Test
    @DisplayName("createEvent creates and returns CalendarEventResponseDto")
    public void testCreateEvent_Success() {
        UUID userId = UUID.randomUUID();
        String slug = "test-community";
        Community community = createTestCommunity(UUID.randomUUID(), slug);
        Course course = createTestCourse(community);
        User owner = User.builder().id(userId).username("owner").build();
        UserDto userDto = new UserDto(userId, "owner@example.com", "owner", true, RoleType.USER);

        CreateEventRequestDto requestDto = CreateEventRequestDto.builder()
                .title("New Exam")
                .description("Exam description")
                .type(EventType.EXAM)
                .startTime(OffsetDateTime.now().plusDays(2))
                .durationHours(2.0)
                .location(EventLocation.IN_PERSON)
                .courseId(1L)
                .communitySlug(slug)
                .build();

        when(communityRepository.findBySlug(slug)).thenReturn(Optional.of(community));
        when(communityMemberRepository.isMemberOfCommunity(slug, userId)).thenReturn(true);
        when(authorizationService.hasCommunityPermission(slug, userId, com.unihub.app.domain.PermissionType.CREATE_EVENT)).thenReturn(true);
        when(courseRepository.findByIdWithStudyYearAndCommunity(1L)).thenReturn(Optional.of(course));
        when(userMapper.toEntity(userDto)).thenReturn(owner);
        when(eventRepository.save(any(Event.class))).thenAnswer(invocation -> {
            Event e = invocation.getArgument(0);
            e.setId(UUID.randomUUID());
            e.setCreatedAt(OffsetDateTime.now());
            e.setUpdatedAt(OffsetDateTime.now());
            return e;
        });

        CalendarEventResponseDto result = calendarService.createEvent(userDto, requestDto);

        assertNotNull(result);
        assertEquals("New Exam", result.title());
        assertEquals(EventType.EXAM, result.type());
        assertFalse(result.isSubscribed());
        verify(eventRepository).save(any(Event.class));
    }

    @Test
    @DisplayName("createEvent throws 400 when course does not belong to specified community")
    public void testCreateEvent_CourseMismatch() {
        UUID userId = UUID.randomUUID();
        UUID communityId1 = UUID.randomUUID();
        UUID communityId2 = UUID.randomUUID();
        UserDto userDto = new UserDto(userId, "owner@example.com", "owner", true, RoleType.USER);

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
        when(authorizationService.hasCommunityPermission("comm-1", userId, com.unihub.app.domain.PermissionType.CREATE_EVENT)).thenReturn(true);
        when(courseRepository.findByIdWithStudyYearAndCommunity(1L)).thenReturn(Optional.of(courseFromComm2));

        ResponseStatusException ex = assertThrows(
                ResponseStatusException.class,
                () -> calendarService.createEvent(userDto, requestDto)
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
                .owner(new OwnerDto(userId, "prof",true))
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

    // =========================================================================
    // createReminder
    // =========================================================================

    @Test
    @DisplayName("createReminder throws 409 Conflict when user already has a reminder for event")
    public void testCreateReminder_Conflict() {
        UUID userId = UUID.randomUUID();
        UUID eventId = UUID.randomUUID();
        UserDto userDto = new UserDto(userId, "david@example.com", "david", true, RoleType.USER);

        Community community = createTestCommunity(UUID.randomUUID(), "fmi");
        Event event = Event.builder().id(eventId).community(community).build();

        when(eventRepository.findById(eventId)).thenReturn(Optional.of(event));
        when(communityMemberRepository.isMemberOfCommunity("fmi", userId)).thenReturn(true);
        when(reminderRepository.existsByUserIdAndEventId(userId, eventId)).thenReturn(true);

        ResponseStatusException ex = assertThrows(
                ResponseStatusException.class,
                () -> calendarService.createReminder(eventId, userDto, new com.unihub.app.dto.community.content.request.CreateEventReminderRequestDto(15))
        );
        assertEquals(HttpStatus.CONFLICT, ex.getStatusCode());
        assertEquals("A reminder is already set for this event", ex.getReason());
    }

    @Test
    @DisplayName("createReminder succeeds when no existing reminder")
    public void testCreateReminder_Success() {
        UUID userId = UUID.randomUUID();
        UUID eventId = UUID.randomUUID();
        UserDto userDto = new UserDto(userId, "david@example.com", "david", true, RoleType.USER);
        User user = User.builder().id(userId).username("david").build();

        Community community = createTestCommunity(UUID.randomUUID(), "fmi");
        Event event = Event.builder()
                .id(eventId)
                .title("Exam")
                .startTime(OffsetDateTime.now().plusDays(1))
                .community(community)
                .build();

        when(eventRepository.findById(eventId)).thenReturn(Optional.of(event));
        when(communityMemberRepository.isMemberOfCommunity("fmi", userId)).thenReturn(true);
        when(reminderRepository.existsByUserIdAndEventId(userId, eventId)).thenReturn(false);
        when(userMapper.toEntity(userDto)).thenReturn(user);
        when(reminderRepository.save(any(EventReminder.class))).thenAnswer(invocation -> {
            EventReminder r = invocation.getArgument(0);
            r.setId(UUID.randomUUID());
            return r;
        });

        com.unihub.app.dto.community.content.response.EventReminderResponseDto result =
                calendarService.createReminder(eventId, userDto, new com.unihub.app.dto.community.content.request.CreateEventReminderRequestDto(15));

        assertNotNull(result);
        assertEquals(15, result.offsetMinutes());
        assertEquals(eventId, result.eventId());
    }

    // =========================================================================
    // deleteReminder
    // =========================================================================

    @Test
    @DisplayName("deleteReminder calls repository deleteByUserIdAndEventId")
    public void testDeleteReminder_Success() {
        UUID userId = UUID.randomUUID();
        UUID eventId = UUID.randomUUID();
        UserDto userDto = new UserDto(userId, "david@example.com", "david", true, RoleType.USER);

        when(eventRepository.existsById(eventId)).thenReturn(true);

        calendarService.deleteReminder(eventId, userDto);

        verify(reminderRepository).deleteByUserIdAndEventId(userId, eventId);
    }

    // =========================================================================
    // getUpcomingEvents
    // =========================================================================

    @Test
    @DisplayName("getUpcomingEvents returns page of upcoming events for user's enrolled communities")
    public void testGetUpcomingEvents_Success() {
        UUID userId = UUID.randomUUID();
        UUID communityId = UUID.randomUUID();
        OffsetDateTime now = OffsetDateTime.now();

        CalendarEventResponseDto eventDto = CalendarEventResponseDto.builder()
                .id(UUID.randomUUID())
                .title("Examen ASC")
                .type(EventType.EXAM)
                .startTime(now.plusDays(2))
                .courseAbbreviation("ASC")
                .isSubscribed(false)
                .build();

        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(0, 5);
        org.springframework.data.domain.Page<CalendarEventResponseDto> page = new org.springframework.data.domain.PageImpl<>(
                List.of(eventDto), pageable, 1
        );

        when(communityMemberRepository.findCommunityIdsByUserId(userId)).thenReturn(List.of(communityId));
        when(eventRepository.findUpcomingEventsByCommunityIds(eq(List.of(communityId)), any(), any(), eq(userId), eq(pageable)))
                .thenReturn(page);

        var result = calendarService.getUpcomingEvents(userId, 7, pageable);

        assertNotNull(result);
        assertEquals(1, result.content().size());
        assertEquals("Examen ASC", result.content().get(0).title());
    }

    @Test
    @DisplayName("getUpcomingEvents returns empty page when user has no enrolled communities")
    public void testGetUpcomingEvents_NoCommunities() {
        UUID userId = UUID.randomUUID();
        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(0, 5);

        when(communityMemberRepository.findCommunityIdsByUserId(userId)).thenReturn(Collections.emptyList());

        var result = calendarService.getUpcomingEvents(userId, 7, pageable);

        assertNotNull(result);
        assertTrue(result.content().isEmpty());
        assertEquals(0, result.totalElements());
    }

    // =========================================================================
    // getUserReminders
    // =========================================================================

    @Test
    @DisplayName("getUserReminders returns page of active user reminders")
    public void testGetUserReminders_Success() {
        UUID userId = UUID.randomUUID();
        UUID reminderId = UUID.randomUUID();
        OffsetDateTime now = OffsetDateTime.now();

        Event event = Event.builder()
                .id(UUID.randomUUID())
                .title("Examen ASC")
                .type(EventType.EXAM)
                .startTime(now.plusDays(2))
                .build();

        EventReminder reminder = EventReminder.builder()
                .id(reminderId)
                .event(event)
                .offsetMinutes(15)
                .remindAt(now.plusDays(2).minusMinutes(15))
                .status(com.unihub.app.entities.community.content.ReminderStatus.PENDING)
                .build();

        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(0, 5);
        org.springframework.data.domain.Page<EventReminder> page = new org.springframework.data.domain.PageImpl<>(
                List.of(reminder), pageable, 1
        );

        when(reminderRepository.findUserRemindersByStatus(userId, com.unihub.app.entities.community.content.ReminderStatus.PENDING, pageable))
                .thenReturn(page);

        var result = calendarService.getUserReminders(userId, com.unihub.app.entities.community.content.ReminderStatus.PENDING, pageable);

        assertNotNull(result);
        assertEquals(1, result.content().size());
        assertEquals(reminderId, result.content().get(0).id());
        assertEquals("Examen ASC", result.content().get(0).eventTitle());
    }
}
