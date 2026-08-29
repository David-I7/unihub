package com.unihub.app.controllers;

import com.unihub.app.domain.RoleType;
import com.unihub.app.dto.UserDto;
import com.unihub.app.dto.community.OwnerDto;
import com.unihub.app.dto.community.content.request.CreateEventRequestDto;
import com.unihub.app.dto.community.content.response.CalendarEventResponseDto;
import com.unihub.app.dto.community.content.response.EventResponseDto;
import com.unihub.app.entities.community.content.EventLocation;
import com.unihub.app.entities.community.content.EventType;
import com.unihub.app.entities.community.resources.StudyYearName;
import com.unihub.app.repositories.authentication.SessionRepository;
import com.unihub.app.repositories.authentication.UserIdentityRepository;
import com.unihub.app.repositories.authentication.UserRepository;
import com.unihub.app.repositories.authorization.PermissionRepository;
import com.unihub.app.repositories.authorization.RoleRepository;
import com.unihub.app.repositories.community.resources.CommunityMemberRepository;
import com.unihub.app.security.JwtAuthentication;
import com.unihub.app.services.community.content.CalendarService;
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
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.unihub.app.BaseIntegrationTest;

@AutoConfigureMockMvc
public class CalendarControllerTests extends BaseIntegrationTest {

    private static final String BASE_URL = "/api/v1/calendar";

    @Autowired
    private MockMvc mockMvc;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @MockitoBean
    private CalendarService calendarService;

    private UUID userId;
    private UserDto userDto;

    @BeforeEach
    public void setUp() {
        userId = UUID.randomUUID();
        userDto = new UserDto(userId, "david@example.com", "david", false, RoleType.USER);
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
            Then: 200 OK is returned with event list
            """)
    public void testGetEvents_Success() throws Exception {
        UUID eventId = UUID.randomUUID();
        OffsetDateTime startTime = OffsetDateTime.now().plusDays(2);
        OffsetDateTime endTime = startTime.plusHours(2);

        CalendarEventResponseDto eventDto = CalendarEventResponseDto.builder()
                .id(eventId)
                .title("Final Exam")
                .type(EventType.EXAM)
                .startTime(startTime)
                .endTime(endTime)
                .durationMinutes(120)
                .location(EventLocation.IN_PERSON)
                .courseSlug("pa")
                .courseName("Programarea Algoritmilor")
                .courseAbbreviation("PA")
                .communitySlug("fmi-info-id")
                .communityName("FMI - Informatica ID")
                .studyYear(StudyYearName.YEAR_1)
                .isSubscribed(true)
                .build();

        when(calendarService.getEvents(
                eq(userId),
                eq(2026),
                eq(8),
                eq("fmi-info-id"),
                eq(StudyYearName.YEAR_1),
                eq("pa")
        )).thenReturn(List.of(eventDto));

        mockMvc.perform(get(BASE_URL)
                        .param("year", "2026")
                        .param("month", "8")
                        .param("communitySlug", "fmi-info-id")
                        .param("studyYear", "year-1")
                        .param("courseSlug", "pa")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].id").value(eventId.toString()))
                .andExpect(jsonPath("$[0].title").value("Final Exam"))
                .andExpect(jsonPath("$[0].type").value("EXAM"))
                .andExpect(jsonPath("$[0].location").value("IN_PERSON"))
                .andExpect(jsonPath("$[0].courseSlug").value("pa"))
                .andExpect(jsonPath("$[0].communitySlug").value("fmi-info-id"))
                .andExpect(jsonPath("$[0].isSubscribed").value(true));
    }

    @Test
    @DisplayName("""
            Given: invalid month parameter
            When: GET /api/v1/calendar is called with month=13
            Then: 400 Bad Request is returned
            """)
    public void testGetEvents_InvalidMonth_BadRequest() throws Exception {
        when(calendarService.getEvents(eq(userId), eq(2026), eq(13), any(), any(), any()))
                .thenThrow(new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid month value: must be between 1 and 12"));

        mockMvc.perform(get(BASE_URL)
                        .param("year", "2026")
                        .param("month", "13")
                        .param("communitySlug", "fmi-info-id")
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
        when(calendarService.getEvents(eq(userId), any(), any(), eq("other-comm"), any(), any()))
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

        CalendarEventResponseDto responseDto = CalendarEventResponseDto.builder()
                .id(eventId)
                .title("Midterm Exam")
                .type(EventType.EXAM)
                .startTime(startTime)
                .location(EventLocation.IN_PERSON)
                .courseSlug("sd")
                .courseName("Data Structures")
                .courseAbbreviation("SD")
                .communitySlug("fmi-info-id")
                .communityName("FMI - Informatica ID")
                .studyYear(StudyYearName.YEAR_1)
                .isSubscribed(false)
                .build();

        when(calendarService.createEvent(eq(userDto), any(CreateEventRequestDto.class))).thenReturn(responseDto);

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
                .description("Introductory lecture")
                .location(EventLocation.IN_PERSON)
                .locationDetails("Room 101")
                .startTime(startTime)
                .courseSlug("asc")
                .courseName("Arhitectura sistemelor de calcul")
                .courseAbbreviation("ASC")
                .communitySlug("fmi-info-id")
                .communityName("FMI - Informatica ID")
                .studyYear(StudyYearName.YEAR_1)
                .owner(new OwnerDto(userId, "david", false))
                .reminders(List.of())
                .build();

        when(calendarService.getEventById(userId, eventId)).thenReturn(eventDto);

        mockMvc.perform(get(BASE_URL + "/events/" + eventId)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(eventId.toString()))
                .andExpect(jsonPath("$.title").value("Lecture 1"))
                .andExpect(jsonPath("$.type").value("LECTURE"))
                .andExpect(jsonPath("$.courseSlug").value("asc"))
                .andExpect(jsonPath("$.communitySlug").value("fmi-info-id"));
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
}
