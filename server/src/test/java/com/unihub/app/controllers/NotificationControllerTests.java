package com.unihub.app.controllers;

import com.unihub.app.BaseIntegrationTest;
import com.unihub.app.dto.PageDto;
import com.unihub.app.dto.UserDto;
import com.unihub.app.dto.community.OwnerDto;
import com.unihub.app.dto.community.content.response.EventNotificationResponseDto;
import com.unihub.app.dto.community.content.response.NotificationResponseDto;
import com.unihub.app.dto.community.content.response.PostNotificationResponseDto;
import com.unihub.app.entities.community.content.EventNotificationType;
import com.unihub.app.entities.community.content.NotificationCategory;
import com.unihub.app.entities.community.content.PostNotificationType;
import com.unihub.app.security.JwtAuthentication;
import com.unihub.app.services.community.content.NotificationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@AutoConfigureMockMvc
public class NotificationControllerTests extends BaseIntegrationTest {

    private static final String BASE_URL = "/api/v1/notifications";

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private NotificationService notificationService;

    private UUID userId;
    private UserDto userDto;

    @BeforeEach
    public void setUp() {
        userId = UUID.randomUUID();
        userDto = new UserDto(userId, "david@example.com", "david", false, com.unihub.app.domain.RoleType.USER);
        JwtAuthentication auth = new JwtAuthentication(userDto);
        SecurityContextHolder.getContext().setAuthentication(auth);
    }

    // =========================================================================
    // GET /api/v1/notifications
    // =========================================================================

    @Test
    @DisplayName("""
            Given: user has event and post notifications
            When: GET /api/v1/notifications is called
            Then: 200 OK is returned with polymorphic serialized notifications
            """)
    public void testGetNotifications_Success() throws Exception {
        UUID eventNotificationId = UUID.randomUUID();
        UUID postNotificationId = UUID.randomUUID();
        UUID eventId = UUID.randomUUID();
        UUID postId = UUID.randomUUID();
        OffsetDateTime createdAt = OffsetDateTime.now();

        EventNotificationResponseDto eventDto = EventNotificationResponseDto.builder()
                .id(eventNotificationId)
                .title("Reminder: Exam")
                .message("Exam starts soon")
                .category(NotificationCategory.EVENT)
                .type(EventNotificationType.REMINDER)
                .eventId(eventId)
                .communitySlug("fmi-hub")
                .isRead(false)
                .createdAt(createdAt)
                .build();

        PostNotificationResponseDto postDto = PostNotificationResponseDto.builder()
                .id(postNotificationId)
                .title("New post in Algorithms")
                .message("Alice posted: 'Homework 1 discussion'")
                .category(NotificationCategory.POST)
                .type(PostNotificationType.COURSE_POST)
                .postId(postId)
                .actor(new OwnerDto(UUID.randomUUID(), "alice", true))
                .communitySlug("fmi-hub")
                .studyYear("YEAR_2")
                .courseSlug("algorithms")
                .isRead(false)
                .createdAt(createdAt)
                .build();

        PageDto<NotificationResponseDto> pageDto = PageDto.<NotificationResponseDto>builder()
                .content(List.of(eventDto, postDto))
                .number(0)
                .size(20)
                .totalElements(2)
                .totalPages(1)
                .first(true)
                .last(true)
                .build();

        when(notificationService.getUserNotifications(eq(userId), eq(null), eq(null), eq(null), any(Pageable.class)))
                .thenReturn(pageDto);

        mockMvc.perform(get(BASE_URL)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray())
                .andExpect(jsonPath("$.content[0].category").value("EVENT"))
                .andExpect(jsonPath("$.content[0].type").value("REMINDER"))
                .andExpect(jsonPath("$.content[0].eventId").value(eventId.toString()))
                .andExpect(jsonPath("$.content[0].communitySlug").value("fmi-hub"))
                .andExpect(jsonPath("$.content[1].category").value("POST"))
                .andExpect(jsonPath("$.content[1].type").value("COURSE_POST"))
                .andExpect(jsonPath("$.content[1].postId").value(postId.toString()))
                .andExpect(jsonPath("$.content[1].courseSlug").value("algorithms"))
                .andExpect(jsonPath("$.totalElements").value(2));
    }

    @Test
    @DisplayName("""
            Given: category and type filters
            When: GET /api/v1/notifications?category=EVENT&type=REMINDER is called
            Then: filters are passed to service
            """)
    public void testGetNotifications_WithFilters() throws Exception {
        PageDto<NotificationResponseDto> pageDto = PageDto.<NotificationResponseDto>builder()
                .content(List.of())
                .number(0)
                .size(20)
                .totalElements(0)
                .totalPages(0)
                .first(true)
                .last(true)
                .build();

        when(notificationService.getUserNotifications(eq(userId), eq(NotificationCategory.EVENT), eq("REMINDER"), eq(true), any(Pageable.class)))
                .thenReturn(pageDto);

        mockMvc.perform(get(BASE_URL)
                        .param("category", "EVENT")
                        .param("type", "REMINDER")
                        .param("isRead", "true")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray())
                .andExpect(jsonPath("$.totalElements").value(0));
    }

    // =========================================================================
    // GET /api/v1/notifications/unread-count
    // =========================================================================

    @Test
    @DisplayName("""
            Given: user has unread notifications
            When: GET /api/v1/notifications/unread-count is called
            Then: 200 OK is returned with unread count
            """)
    public void testGetUnreadCount_Success() throws Exception {
        when(notificationService.getUnreadCount(userId, null)).thenReturn(5L);

        mockMvc.perform(get(BASE_URL + "/unread-count")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.unreadCount").value(5));
    }

    @Test
    @DisplayName("""
            Given: category filter
            When: GET /api/v1/notifications/unread-count?category=EVENT is called
            Then: category is passed to service
            """)
    public void testGetUnreadCount_WithCategory() throws Exception {
        when(notificationService.getUnreadCount(userId, NotificationCategory.EVENT)).thenReturn(2L);

        mockMvc.perform(get(BASE_URL + "/unread-count")
                        .param("category", "EVENT")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.unreadCount").value(2));
    }

    // =========================================================================
    // PATCH /api/v1/notifications/{notificationId}/read
    // =========================================================================

    @Test
    @DisplayName("""
            Given: valid notificationId
            When: PATCH /api/v1/notifications/{notificationId}/read is called
            Then: 204 No Content is returned
            """)
    public void testMarkAsRead_Success() throws Exception {
        UUID notificationId = UUID.randomUUID();

        mockMvc.perform(patch(BASE_URL + "/" + notificationId + "/read")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNoContent());

        verify(notificationService).markAsRead(userId, notificationId);
    }

    // =========================================================================
    // PATCH /api/v1/notifications/read-all
    // =========================================================================

    @Test
    @DisplayName("""
            Given: user has unread notifications
            When: PATCH /api/v1/notifications/read-all is called
            Then: 204 No Content is returned
            """)
    public void testMarkAllAsRead_Success() throws Exception {
        mockMvc.perform(patch(BASE_URL + "/read-all")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNoContent());

        verify(notificationService).markAllAsRead(userId);
    }
}
