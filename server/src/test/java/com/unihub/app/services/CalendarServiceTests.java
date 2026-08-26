package com.unihub.app.services;

import com.unihub.app.dto.community.content.request.CreateEventReminderRequestDto;
import com.unihub.app.dto.community.content.request.CreateEventRequestDto;
import com.unihub.app.dto.community.content.request.UpdateEventRequestDto;
import com.unihub.app.dto.community.content.response.EventReminderResponseDto;
import com.unihub.app.dto.community.content.response.EventResponseDto;
import com.unihub.app.entities.authentication.User;
import com.unihub.app.entities.authorization.Role;
import com.unihub.app.entities.community.content.*;
import com.unihub.app.entities.community.resources.*;
import com.unihub.app.mappers.community.CommunityContentMapper;
import com.unihub.app.repositories.authentication.UserRepository;
import com.unihub.app.repositories.community.content.EventReminderRepository;
import com.unihub.app.repositories.community.content.EventRepository;
import com.unihub.app.repositories.community.content.NotificationRepository;
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
import static org.mockito.Mockito.*;

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
    private NotificationRepository notificationRepository;

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

    private Event createTestEvent(UUID id, Community community, Course course, OffsetDateTime startTime, User owner) {
        return Event.builder()
                .id(id)
                .title("Exam")
                .description("Midterm Exam")
                .type(EventType.EXAM)
                .startTime(startTime)
                .endTime(startTime.plusHours(2))
                .durationMinutes(120)
                .location(EventLocation.IN_PERSON)
                .locationDetails("Room 101")
                .course(course)
                .community(community)
                .owner(owner)
                .createdAt(OffsetDateTime.now())
                .updatedAt(OffsetDateTime.now())
                .build();
    }

    // =========================================================================
    // getEvents
    // =========================================================================

    @Test
    @DisplayName("getEvents with valid month and communitySlug returns events with isSubscribed flag")
    public void testGetEvents_WithCommunitySlug_Success() {
        UUID userId = UUID.randomUUID();
        UUID communityId = UUID.randomUUID();
        UUID eventId = UUID.randomUUID();
        String slug = "fmi-info";

        Community community = createTestCommunity(communityId, slug);
        Course course = createTestCourse(community);
        OffsetDateTime startTime = OffsetDateTime.now().plusDays(2);
        User owner = User.builder().id(UUID.randomUUID()).username("prof").build();
        Event event = createTestEvent(eventId, community, course, startTime, owner);

        EventReminder reminder = EventReminder.builder()
                .id(UUID.randomUUID())
                .event(event)
                .user(User.builder().id(userId).build())
                .offsetMinutes(15)
                .remindAt(startTime.minusMinutes(15))
                .status(ReminderStatus.PENDING)
                .createdAt(OffsetDateTime.now())
                .build();

        when(communityRepository.findBySlug(slug)).thenReturn(Optional.of(community));
        when(communityMemberRepository.isMemberOfCommunity(slug, userId)).thenReturn(true);
        when(eventRepository.findEventsByCommunityIds(eq(List.of(communityId)), eq("sd"), eq(StudyYearName.YEAR_1), eq(EventType.EXAM), any(), any()))
                .thenReturn(List.of(event));
        when(reminderRepository.findByUserIdAndEventIdIn(userId, List.of(eventId)))
                .thenReturn(List.of(reminder));

        List<EventResponseDto> result = calendarService.getEvents(
                userId, 2026, 8, slug, StudyYearName.YEAR_1, "sd", EventType.EXAM
        );

        assertNotNull(result);
        assertEquals(1, result.size());
        EventResponseDto dto = result.get(0);
        assertEquals(eventId, dto.id());
        assertTrue(dto.isSubscribed());
        assertEquals(1, dto.reminders().size());
        assertEquals(15, dto.reminders().get(0).offsetMinutes());
    }

    @Test
    @DisplayName("getEvents across all joined communities when communitySlug is null")
    public void testGetEvents_AllJoinedCommunities() {
        UUID userId = UUID.randomUUID();
        UUID comm1 = UUID.randomUUID();
        UUID comm2 = UUID.randomUUID();

        when(communityMemberRepository.findCommunityIdsByUserId(userId)).thenReturn(List.of(comm1, comm2));
        when(eventRepository.findEventsByCommunityIds(eq(List.of(comm1, comm2)), any(), any(), any(), any(), any()))
                .thenReturn(Collections.emptyList());

        List<EventResponseDto> result = calendarService.getEvents(
                userId, null, null, null, null, null, null
        );

        assertNotNull(result);
        assertTrue(result.isEmpty());
        verify(eventRepository).findEventsByCommunityIds(eq(List.of(comm1, comm2)), any(), any(), any(), any(), any());
    }

    @Test
    @DisplayName("getEvents throws 400 when month is invalid")
    public void testGetEvents_InvalidMonth() {
        UUID userId = UUID.randomUUID();
        ResponseStatusException ex = assertThrows(
                ResponseStatusException.class,
                () -> calendarService.getEvents(userId, 2026, 13, null, null, null, null)
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
                () -> calendarService.getEvents(userId, 2026, 8, slug, null, null, null)
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

        EventResponseDto result = calendarService.createEvent(userId, requestDto);

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
    // updateEvent
    // =========================================================================

    @Test
    @DisplayName("updateEvent updates event and sends notifications to subscribed users")
    public void testUpdateEvent_Success() {
        UUID ownerId = UUID.randomUUID();
        UUID subscriberId = UUID.randomUUID();
        UUID eventId = UUID.randomUUID();
        Community community = createTestCommunity(UUID.randomUUID(), "fmi");
        Course course = createTestCourse(community);
        OffsetDateTime startTime = OffsetDateTime.now().plusDays(2);
        User owner = User.builder().id(ownerId).username("owner").build();
        User subscriber = User.builder().id(subscriberId).username("sub").build();
        Event event = createTestEvent(eventId, community, course, startTime, owner);

        EventReminder reminder = EventReminder.builder()
                .id(UUID.randomUUID())
                .event(event)
                .user(subscriber)
                .offsetMinutes(30)
                .remindAt(startTime.minusMinutes(30))
                .status(ReminderStatus.PENDING)
                .build();

        OffsetDateTime newStartTime = startTime.plusDays(1);
        UpdateEventRequestDto requestDto = UpdateEventRequestDto.builder()
                .title("Updated Title")
                .startTime(newStartTime)
                .build();

        when(eventRepository.findEventByIdWithDetails(eventId)).thenReturn(Optional.of(event));
        when(eventRepository.save(any(Event.class))).thenReturn(event);
        when(reminderRepository.findByEventIdWithUser(eventId)).thenReturn(List.of(reminder));
        when(reminderRepository.findByUserIdAndEventId(ownerId, eventId)).thenReturn(Collections.emptyList());

        EventResponseDto result = calendarService.updateEvent(ownerId, eventId, requestDto);

        assertNotNull(result);
        assertEquals("Updated Title", event.getTitle());
        verify(notificationRepository).save(any(Notification.class));
        verify(reminderRepository).save(reminder);
    }

    @Test
    @DisplayName("updateEvent throws 403 when user is not owner or community admin")
    public void testUpdateEvent_Forbidden() {
        UUID ownerId = UUID.randomUUID();
        UUID otherUserId = UUID.randomUUID();
        UUID eventId = UUID.randomUUID();
        Community community = createTestCommunity(UUID.randomUUID(), "fmi");
        Course course = createTestCourse(community);
        User owner = User.builder().id(ownerId).username("owner").build();
        Event event = createTestEvent(eventId, community, course, OffsetDateTime.now().plusDays(2), owner);

        Role memberRole = Role.builder().name("COMMUNITY_MEMBER").build();
        CommunityMember member = CommunityMember.builder()
                .user(User.builder().id(otherUserId).build())
                .community(community)
                .role(memberRole)
                .build();

        when(eventRepository.findEventByIdWithDetails(eventId)).thenReturn(Optional.of(event));
        when(communityMemberRepository.findMemberWithRoleByCommunitySlug("fmi", otherUserId))
                .thenReturn(Optional.of(member));

        UpdateEventRequestDto requestDto = UpdateEventRequestDto.builder().title("New").build();

        ResponseStatusException ex = assertThrows(
                ResponseStatusException.class,
                () -> calendarService.updateEvent(otherUserId, eventId, requestDto)
        );
        assertEquals(HttpStatus.FORBIDDEN, ex.getStatusCode());
    }

    // =========================================================================
    // deleteEvent
    // =========================================================================

    @Test
    @DisplayName("deleteEvent sends cancellation notification and deletes event")
    public void testDeleteEvent_Success() {
        UUID ownerId = UUID.randomUUID();
        UUID subscriberId = UUID.randomUUID();
        UUID eventId = UUID.randomUUID();
        Community community = createTestCommunity(UUID.randomUUID(), "fmi");
        Course course = createTestCourse(community);
        User owner = User.builder().id(ownerId).username("owner").build();
        User subscriber = User.builder().id(subscriberId).username("sub").build();
        Event event = createTestEvent(eventId, community, course, OffsetDateTime.now().plusDays(2), owner);

        EventReminder reminder = EventReminder.builder()
                .id(UUID.randomUUID())
                .event(event)
                .user(subscriber)
                .offsetMinutes(30)
                .status(ReminderStatus.PENDING)
                .build();

        when(eventRepository.findEventByIdWithDetails(eventId)).thenReturn(Optional.of(event));
        when(reminderRepository.findByEventIdWithUser(eventId)).thenReturn(List.of(reminder));

        calendarService.deleteEvent(ownerId, eventId);

        verify(notificationRepository).save(any(Notification.class));
        verify(eventRepository).delete(event);
    }

    // =========================================================================
    // getEventById
    // =========================================================================

    @Test
    @DisplayName("getEventById returns event with reminders when user is member")
    public void testGetEventById_Success() {
        UUID userId = UUID.randomUUID();
        UUID eventId = UUID.randomUUID();
        Community community = createTestCommunity(UUID.randomUUID(), "fmi");
        Course course = createTestCourse(community);
        User owner = User.builder().id(UUID.randomUUID()).username("prof").build();
        Event event = createTestEvent(eventId, community, course, OffsetDateTime.now().plusDays(1), owner);

        when(eventRepository.findEventByIdWithDetails(eventId)).thenReturn(Optional.of(event));
        when(communityMemberRepository.isMemberOfCommunity("fmi", userId)).thenReturn(true);
        when(reminderRepository.findByUserIdAndEventId(userId, eventId)).thenReturn(Collections.emptyList());

        EventResponseDto dto = calendarService.getEventById(userId, eventId);

        assertNotNull(dto);
        assertEquals(eventId, dto.id());
        assertFalse(dto.isSubscribed());
    }

    // =========================================================================
    // createReminder
    // =========================================================================

    @Test
    @DisplayName("createReminder successfully saves reminder when valid")
    public void testCreateReminder_Success() {
        UUID userId = UUID.randomUUID();
        UUID eventId = UUID.randomUUID();
        Community community = createTestCommunity(UUID.randomUUID(), "fmi");
        Course course = createTestCourse(community);
        OffsetDateTime startTime = OffsetDateTime.now().plusDays(2);
        User user = User.builder().id(userId).username("david").build();
        Event event = createTestEvent(eventId, community, course, startTime, user);

        when(eventRepository.findEventByIdWithDetails(eventId)).thenReturn(Optional.of(event));
        when(communityMemberRepository.isMemberOfCommunity("fmi", userId)).thenReturn(true);
        when(reminderRepository.existsByUserIdAndEventIdAndOffsetMinutes(userId, eventId, 30)).thenReturn(false);
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(reminderRepository.save(any(EventReminder.class))).thenAnswer(invocation -> {
            EventReminder r = invocation.getArgument(0);
            r.setId(UUID.randomUUID());
            r.setCreatedAt(OffsetDateTime.now());
            return r;
        });

        CreateEventReminderRequestDto requestDto = CreateEventReminderRequestDto.builder()
                .offsetMinutes(30)
                .build();

        EventReminderResponseDto result = calendarService.createReminder(userId, eventId, requestDto);

        assertNotNull(result);
        assertEquals(eventId, result.eventId());
        assertEquals(30, result.offsetMinutes());
        assertEquals(ReminderStatus.PENDING, result.status());
        verify(reminderRepository).save(any(EventReminder.class));
    }

    @Test
    @DisplayName("createReminder throws 400 when remindAt is in the past")
    public void testCreateReminder_PastReminder() {
        UUID userId = UUID.randomUUID();
        UUID eventId = UUID.randomUUID();
        Community community = createTestCommunity(UUID.randomUUID(), "fmi");
        Course course = createTestCourse(community);
        User user = User.builder().id(userId).username("david").build();
        OffsetDateTime startTime = OffsetDateTime.now().plusMinutes(10);
        Event event = createTestEvent(eventId, community, course, startTime, user);

        when(eventRepository.findEventByIdWithDetails(eventId)).thenReturn(Optional.of(event));
        when(communityMemberRepository.isMemberOfCommunity("fmi", userId)).thenReturn(true);

        CreateEventReminderRequestDto requestDto = CreateEventReminderRequestDto.builder()
                .offsetMinutes(30)
                .build();

        ResponseStatusException ex = assertThrows(
                ResponseStatusException.class,
                () -> calendarService.createReminder(userId, eventId, requestDto)
        );
        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
        assertEquals("Cannot set a reminder for the past", ex.getReason());
    }

    @Test
    @DisplayName("createReminder throws 409 when reminder with same offset already exists")
    public void testCreateReminder_DuplicateOffset() {
        UUID userId = UUID.randomUUID();
        UUID eventId = UUID.randomUUID();
        Community community = createTestCommunity(UUID.randomUUID(), "fmi");
        Course course = createTestCourse(community);
        OffsetDateTime startTime = OffsetDateTime.now().plusDays(1);
        User user = User.builder().id(userId).username("david").build();
        Event event = createTestEvent(eventId, community, course, startTime, user);

        when(eventRepository.findEventByIdWithDetails(eventId)).thenReturn(Optional.of(event));
        when(communityMemberRepository.isMemberOfCommunity("fmi", userId)).thenReturn(true);
        when(reminderRepository.existsByUserIdAndEventIdAndOffsetMinutes(userId, eventId, 15)).thenReturn(true);

        CreateEventReminderRequestDto requestDto = CreateEventReminderRequestDto.builder()
                .offsetMinutes(15)
                .build();

        ResponseStatusException ex = assertThrows(
                ResponseStatusException.class,
                () -> calendarService.createReminder(userId, eventId, requestDto)
        );
        assertEquals(HttpStatus.CONFLICT, ex.getStatusCode());
    }

    // =========================================================================
    // deleteReminder
    // =========================================================================

    @Test
    @DisplayName("deleteReminder removes reminder when belonging to user and event")
    public void testDeleteReminder_Success() {
        UUID userId = UUID.randomUUID();
        UUID eventId = UUID.randomUUID();
        UUID reminderId = UUID.randomUUID();

        Event event = Event.builder().id(eventId).build();
        EventReminder reminder = EventReminder.builder()
                .id(reminderId)
                .event(event)
                .user(User.builder().id(userId).build())
                .build();

        when(reminderRepository.findByIdAndUserId(reminderId, userId)).thenReturn(Optional.of(reminder));

        calendarService.deleteReminder(userId, eventId, reminderId);

        verify(reminderRepository).delete(reminder);
    }

    @Test
    @DisplayName("deleteAllReminders deletes all user reminders for event")
    public void testDeleteAllReminders_Success() {
        UUID userId = UUID.randomUUID();
        UUID eventId = UUID.randomUUID();

        when(eventRepository.existsById(eventId)).thenReturn(true);

        calendarService.deleteAllReminders(userId, eventId);

        verify(reminderRepository).deleteByUserIdAndEventId(userId, eventId);
    }
}
