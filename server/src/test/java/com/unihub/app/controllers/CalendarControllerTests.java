package com.unihub.app.controllers;

import com.unihub.app.config.AppConfig;
import com.unihub.app.config.SecurityConfig;
import com.unihub.app.config.SessionProperties;
import com.unihub.app.dto.UserDto;
import com.unihub.app.dto.community.OwnerDto;
import com.unihub.app.dto.community.content.request.CreateEventReminderRequestDto;
import com.unihub.app.dto.community.content.request.CreateEventRequestDto;
import com.unihub.app.dto.community.content.request.UpdateEventRequestDto;
import com.unihub.app.dto.community.content.response.EventReminderResponseDto;
import com.unihub.app.dto.community.content.response.EventResponseDto;
import com.unihub.app.entities.community.content.EventLocation;
import com.unihub.app.entities.community.content.EventType;
import com.unihub.app.entities.community.content.ReminderStatus;
import com.unihub.app.entities.community.resources.StudyYearName;
import com.unihub.app.exceptions.GlobalExceptionHandler;
import com.unihub.app.mappers.ObjectErrorMapper;
import com.unihub.app.mappers.PageMapper;
import com.unihub.app.mappers.UserMapper;
import com.unihub.app.repositories.authentication.SessionRepository;
import com.unihub.app.repositories.authentication.UserIdentityRepository;
import com.unihub.app.repositories.authentication.UserRepository;
import com.unihub.app.repositories.authorization.PermissionRepository;
import com.unihub.app.repositories.authorization.RoleRepository;
import com.unihub.app.repositories.community.resources.CommunityMemberRepository;
import com.unihub.app.security.JwtAuthentication;
import com.unihub.app.security.JwtSessionManagementFilter;
import com.unihub.app.security.OAuth2AuthenticationFailureHandler;
import com.unihub.app.security.OAuth2AuthenticationSuccessHandler;
import com.unihub.app.security.OAuth2ProviderUserInfoExtractor;
import com.unihub.app.services.JwtService;
import com.unihub.app.services.authentication.SessionService;
import com.unihub.app.services.authentication.UserIdentityService;
import com.unihub.app.services.authentication.UserService;
import com.unihub.app.services.authorization.AuthorizationService;
import com.unihub.app.services.authorization.RoleService;
import com.unihub.app.services.community.content.CalendarService;
import com.unihub.app.utils.ProblemDetailUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.server.ResponseStatusException;
import tools.jackson.databind.ObjectMapper;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
public class CalendarControllerTests {

    private static final String BASE_URL = "/api/v1/calendar";

    @Autowired
    private MockMvc mockMvc;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @MockitoBean
    private CalendarService calendarService;

    @MockitoBean
    private UserRepository userRepository;

    @MockitoBean
    private SessionRepository sessionRepository;

    @MockitoBean
    private UserIdentityRepository userIdentityRepository;

    @MockitoBean
    private RoleRepository roleRepository;

    @MockitoBean
    private PermissionRepository permissionRepository;

    @MockitoBean
    private CommunityMemberRepository communityMemberRepository;

    private UUID userId;
    private UserDto userDto;

    @BeforeEach
    public void setUp() {
        userId = UUID.randomUUID();
        userDto = new UserDto(userId, "david@example.com", "david");
        JwtAuthentication auth = new JwtAuthentication(userDto);
        SecurityContextHolder.getContext().setAuthentication(auth);
    }

    // =========================================================================
    // GET /api/v1/calendar
    // =========================================================================

    @Test
    @DisplayName("""
            Given: authenticated user and events exist
            When: GET /api/v1/calendar is called with query params
            Then: 200 OK is returned with event list including subscription status
            """)
    public void testGetEvents_Success() throws Exception {
        UUID eventId = UUID.randomUUID();
        UUID ownerId = UUID.randomUUID();
        OffsetDateTime startTime = OffsetDateTime.now().plusDays(2);
        OffsetDateTime endTime = startTime.plusHours(2);
        OffsetDateTime createdAt = OffsetDateTime.now();

        EventReminderResponseDto reminderDto = EventReminderResponseDto.builder()
                .id(UUID.randomUUID())
                .eventId(eventId)
                .offsetMinutes(30)
                .remindAt(startTime.minusMinutes(30))
                .status(ReminderStatus.PENDING)
                .createdAt(createdAt)
                .build();

        EventResponseDto eventDto = EventResponseDto.builder()
                .id(eventId)
                .title("Final Exam")
                .description("Algorithms final exam")
                .type(EventType.EXAM)
                .startTime(startTime)
                .endTime(endTime)
                .durationMinutes(120)
                .location(EventLocation.IN_PERSON)
                .locationDetails("Room 101")
                .courseId(1L)
                .courseSlug("pa")
                .courseName("Programarea Algoritmilor")
                .communitySlug("fmi-info-id")
                .createdAt(createdAt)
                .updatedAt(createdAt)
                .owner(new OwnerDto(ownerId, "prof"))
                .isSubscribed(true)
                .reminders(List.of(reminderDto))
                .build();

        when(calendarService.getEvents(
                eq(userId),
                eq(2026),
                eq(8),
                eq("fmi-info-id"),
                eq(StudyYearName.YEAR_1),
                eq("pa"),
                eq(EventType.EXAM)
        )).thenReturn(List.of(eventDto));

        mockMvc.perform(get(BASE_URL)
                        .param("year", "2026")
                        .param("month", "8")
                        .param("communitySlug", "fmi-info-id")
                        .param("studyYear", "year-1")
                        .param("courseSlug", "pa")
                        .param("type", "EXAM")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].id").value(eventId.toString()))
                .andExpect(jsonPath("$[0].title").value("Final Exam"))
                .andExpect(jsonPath("$[0].type").value("EXAM"))
                .andExpect(jsonPath("$[0].location").value("IN_PERSON"))
                .andExpect(jsonPath("$[0].courseSlug").value("pa"))
                .andExpect(jsonPath("$[0].communitySlug").value("fmi-info-id"))
                .andExpect(jsonPath("$[0].isSubscribed").value(true))
                .andExpect(jsonPath("$[0].reminders[0].offsetMinutes").value(30));
    }

    @Test
    @DisplayName("""
            Given: invalid month parameter
            When: GET /api/v1/calendar is called with month=13
            Then: 400 Bad Request is returned
            """)
    public void testGetEvents_InvalidMonth_BadRequest() throws Exception {
        when(calendarService.getEvents(eq(userId), eq(2026), eq(13), any(), any(), any(), any()))
                .thenThrow(new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid month value: must be between 1 and 12"));

        mockMvc.perform(get(BASE_URL)
                        .param("year", "2026")
                        .param("month", "13")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.detail").value("Invalid month value: must be between 1 and 12"));
    }

    @Test
    @DisplayName("""
            Given: user not a member of specified community
            When: GET /api/v1/calendar is called with communitySlug
            Then: 403 Forbidden is returned
            """)
    public void testGetEvents_NotMember_Forbidden() throws Exception {
        when(calendarService.getEvents(eq(userId), any(), any(), eq("other-comm"), any(), any(), any()))
                .thenThrow(new ResponseStatusException(HttpStatus.FORBIDDEN, "User is not a member of this community"));

        mockMvc.perform(get(BASE_URL)
                        .param("communitySlug", "other-comm")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.detail").value("User is not a member of this community"));
    }

    // =========================================================================
    // POST /api/v1/calendar/events
    // =========================================================================

    @Test
    @DisplayName("""
            Given: valid event creation payload
            When: POST /api/v1/calendar/events is called
            Then: 201 Created is returned with event details
            """)
    public void testCreateEvent_Success() throws Exception {
        UUID eventId = UUID.randomUUID();
        OffsetDateTime startTime = OffsetDateTime.now().plusDays(3);

        CreateEventRequestDto requestDto = CreateEventRequestDto.builder()
                .title("Midterm Exam")
                .description("Chapter 1-4")
                .type(EventType.EXAM)
                .startTime(startTime)
                .location(EventLocation.IN_PERSON)
                .locationDetails("Amphitheater A")
                .courseId(1L)
                .communitySlug("fmi-info-id")
                .build();

        EventResponseDto responseDto = EventResponseDto.builder()
                .id(eventId)
                .title("Midterm Exam")
                .description("Chapter 1-4")
                .type(EventType.EXAM)
                .startTime(startTime)
                .location(EventLocation.IN_PERSON)
                .locationDetails("Amphitheater A")
                .courseId(1L)
                .courseSlug("sd")
                .courseName("Data Structures")
                .communitySlug("fmi-info-id")
                .isSubscribed(false)
                .reminders(List.of())
                .build();

        when(calendarService.createEvent(eq(userId), any(CreateEventRequestDto.class))).thenReturn(responseDto);

        mockMvc.perform(post(BASE_URL + "/events")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestDto)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(eventId.toString()))
                .andExpect(jsonPath("$.title").value("Midterm Exam"))
                .andExpect(jsonPath("$.type").value("EXAM"))
                .andExpect(jsonPath("$.communitySlug").value("fmi-info-id"));
    }

    // =========================================================================
    // PATCH /api/v1/calendar/events/{eventId}
    // =========================================================================

    @Test
    @DisplayName("""
            Given: valid event update payload
            When: PATCH /api/v1/calendar/events/{eventId} is called
            Then: 200 OK is returned with updated event
            """)
    public void testUpdateEvent_Success() throws Exception {
        UUID eventId = UUID.randomUUID();
        OffsetDateTime startTime = OffsetDateTime.now().plusDays(4);

        UpdateEventRequestDto requestDto = UpdateEventRequestDto.builder()
                .title("Rescheduled Exam")
                .startTime(startTime)
                .build();

        EventResponseDto responseDto = EventResponseDto.builder()
                .id(eventId)
                .title("Rescheduled Exam")
                .type(EventType.EXAM)
                .startTime(startTime)
                .isSubscribed(false)
                .reminders(List.of())
                .build();

        when(calendarService.updateEvent(eq(userId), eq(eventId), any(UpdateEventRequestDto.class)))
                .thenReturn(responseDto);

        mockMvc.perform(patch(BASE_URL + "/events/" + eventId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestDto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(eventId.toString()))
                .andExpect(jsonPath("$.title").value("Rescheduled Exam"));
    }

    // =========================================================================
    // DELETE /api/v1/calendar/events/{eventId}
    // =========================================================================

    @Test
    @DisplayName("""
            Given: existing event
            When: DELETE /api/v1/calendar/events/{eventId} is called
            Then: 204 No Content is returned
            """)
    public void testDeleteEvent_Success() throws Exception {
        UUID eventId = UUID.randomUUID();

        doNothing().when(calendarService).deleteEvent(userId, eventId);

        mockMvc.perform(delete(BASE_URL + "/events/" + eventId)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNoContent());

        verify(calendarService).deleteEvent(userId, eventId);
    }

    // =========================================================================
    // GET /api/v1/calendar/events/{eventId}
    // =========================================================================

    @Test
    @DisplayName("""
            Given: event exists and user is community member
            When: GET /api/v1/calendar/events/{eventId} is called
            Then: 200 OK is returned with event details
            """)
    public void testGetEventById_Success() throws Exception {
        UUID eventId = UUID.randomUUID();
        OffsetDateTime startTime = OffsetDateTime.now().plusDays(1);

        EventResponseDto eventDto = EventResponseDto.builder()
                .id(eventId)
                .title("Lecture 1")
                .type(EventType.LECTURE)
                .startTime(startTime)
                .courseSlug("asc")
                .communitySlug("fmi-info-id")
                .isSubscribed(false)
                .reminders(List.of())
                .build();

        when(calendarService.getEventById(userId, eventId)).thenReturn(eventDto);

        mockMvc.perform(get(BASE_URL + "/events/" + eventId)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(eventId.toString()))
                .andExpect(jsonPath("$.title").value("Lecture 1"))
                .andExpect(jsonPath("$.type").value("LECTURE"))
                .andExpect(jsonPath("$.isSubscribed").value(false));
    }

    @Test
    @DisplayName("""
            Given: event does not exist
            When: GET /api/v1/calendar/events/{eventId} is called
            Then: 404 Not Found is returned
            """)
    public void testGetEventById_NotFound() throws Exception {
        UUID eventId = UUID.randomUUID();

        when(calendarService.getEventById(userId, eventId))
                .thenThrow(new ResponseStatusException(HttpStatus.NOT_FOUND, "Event not found"));

        mockMvc.perform(get(BASE_URL + "/events/" + eventId)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.detail").value("Event not found"));
    }

    // =========================================================================
    // POST /api/v1/calendar/events/{eventId}/reminders
    // =========================================================================

    @Test
    @DisplayName("""
            Given: valid reminder request
            When: POST /api/v1/calendar/events/{eventId}/reminders is called
            Then: 201 Created is returned with created reminder
            """)
    public void testCreateReminder_Success() throws Exception {
        UUID eventId = UUID.randomUUID();
        UUID reminderId = UUID.randomUUID();
        OffsetDateTime remindAt = OffsetDateTime.now().plusDays(1);
        OffsetDateTime createdAt = OffsetDateTime.now();

        CreateEventReminderRequestDto requestDto = CreateEventReminderRequestDto.builder()
                .offsetMinutes(30)
                .build();

        EventReminderResponseDto responseDto = EventReminderResponseDto.builder()
                .id(reminderId)
                .eventId(eventId)
                .offsetMinutes(30)
                .remindAt(remindAt)
                .status(ReminderStatus.PENDING)
                .createdAt(createdAt)
                .build();

        when(calendarService.createReminder(eq(userId), eq(eventId), any(CreateEventReminderRequestDto.class)))
                .thenReturn(responseDto);

        mockMvc.perform(post(BASE_URL + "/events/" + eventId + "/reminders")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestDto)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(reminderId.toString()))
                .andExpect(jsonPath("$.eventId").value(eventId.toString()))
                .andExpect(jsonPath("$.offsetMinutes").value(30))
                .andExpect(jsonPath("$.status").value("PENDING"));
    }

    @Test
    @DisplayName("""
            Given: duplicate reminder offset
            When: POST /api/v1/calendar/events/{eventId}/reminders is called
            Then: 409 Conflict is returned
            """)
    public void testCreateReminder_Duplicate_Conflict() throws Exception {
        UUID eventId = UUID.randomUUID();
        CreateEventReminderRequestDto requestDto = CreateEventReminderRequestDto.builder()
                .offsetMinutes(15)
                .build();

        when(calendarService.createReminder(eq(userId), eq(eventId), any(CreateEventReminderRequestDto.class)))
                .thenThrow(new ResponseStatusException(HttpStatus.CONFLICT, "A reminder with this offset already exists for this event"));

        mockMvc.perform(post(BASE_URL + "/events/" + eventId + "/reminders")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestDto)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.detail").value("A reminder with this offset already exists for this event"));
    }

    // =========================================================================
    // GET /api/v1/calendar/events/{eventId}/reminders
    // =========================================================================

    @Test
    @DisplayName("""
            Given: user has reminders for event
            When: GET /api/v1/calendar/events/{eventId}/reminders is called
            Then: 200 OK is returned with reminders list
            """)
    public void testGetUserReminders_Success() throws Exception {
        UUID eventId = UUID.randomUUID();
        UUID reminderId = UUID.randomUUID();
        OffsetDateTime remindAt = OffsetDateTime.now().plusDays(1);

        EventReminderResponseDto reminderDto = EventReminderResponseDto.builder()
                .id(reminderId)
                .eventId(eventId)
                .offsetMinutes(15)
                .remindAt(remindAt)
                .status(ReminderStatus.PENDING)
                .createdAt(OffsetDateTime.now())
                .build();

        when(calendarService.getUserReminders(userId, eventId)).thenReturn(List.of(reminderDto));

        mockMvc.perform(get(BASE_URL + "/events/" + eventId + "/reminders")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].id").value(reminderId.toString()))
                .andExpect(jsonPath("$[0].offsetMinutes").value(15));
    }

    // =========================================================================
    // DELETE /api/v1/calendar/events/{eventId}/reminders/{reminderId}
    // =========================================================================

    @Test
    @DisplayName("""
            Given: existing reminder
            When: DELETE /api/v1/calendar/events/{eventId}/reminders/{reminderId} is called
            Then: 204 No Content is returned
            """)
    public void testDeleteReminder_Success() throws Exception {
        UUID eventId = UUID.randomUUID();
        UUID reminderId = UUID.randomUUID();

        doNothing().when(calendarService).deleteReminder(userId, eventId, reminderId);

        mockMvc.perform(delete(BASE_URL + "/events/" + eventId + "/reminders/" + reminderId)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNoContent());

        verify(calendarService).deleteReminder(userId, eventId, reminderId);
    }

    // =========================================================================
    // DELETE /api/v1/calendar/events/{eventId}/reminders
    // =========================================================================

    @Test
    @DisplayName("""
            Given: user has reminders for event
            When: DELETE /api/v1/calendar/events/{eventId}/reminders is called
            Then: 204 No Content is returned
            """)
    public void testDeleteAllReminders_Success() throws Exception {
        UUID eventId = UUID.randomUUID();

        doNothing().when(calendarService).deleteAllReminders(userId, eventId);

        mockMvc.perform(delete(BASE_URL + "/events/" + eventId + "/reminders")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNoContent());

        verify(calendarService).deleteAllReminders(userId, eventId);
    }
}
