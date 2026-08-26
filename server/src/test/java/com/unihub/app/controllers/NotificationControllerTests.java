package com.unihub.app.controllers;

import com.unihub.app.config.AppConfig;
import com.unihub.app.config.SecurityConfig;
import com.unihub.app.config.SessionProperties;
import com.unihub.app.dto.PageDto;
import com.unihub.app.dto.UserDto;
import com.unihub.app.dto.community.content.response.NotificationResponseDto;
import com.unihub.app.entities.community.content.NotificationType;
import com.unihub.app.exceptions.GlobalExceptionHandler;
import com.unihub.app.mappers.ObjectErrorMapper;
import com.unihub.app.mappers.PageMapper;
import com.unihub.app.mappers.UserMapper;
import com.unihub.app.repositories.authentication.SessionRepository;
import com.unihub.app.repositories.authentication.UserIdentityRepository;
import com.unihub.app.repositories.authentication.UserRepository;
import com.unihub.app.repositories.authorization.RoleRepository;
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
import com.unihub.app.services.community.content.NotificationService;
import com.unihub.app.utils.ProblemDetailUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
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

@WebMvcTest(NotificationController.class)
@EnableConfigurationProperties(SessionProperties.class)
@Import({
        AppConfig.class,
        SecurityConfig.class,
        OAuth2AuthenticationFailureHandler.class,
        OAuth2AuthenticationSuccessHandler.class,
        OAuth2ProviderUserInfoExtractor.class,
        RoleService.class,
        JwtSessionManagementFilter.class,
        SessionService.class,
        UserService.class,
        JwtService.class,
        UserMapper.class,
        UserIdentityService.class,
        PageMapper.class,
        ObjectErrorMapper.class,
        ProblemDetailUtil.class,
        GlobalExceptionHandler.class,
        AuthorizationService.class
})
public class NotificationControllerTests {

    private static final String BASE_URL = "/api/v1/notifications";

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private NotificationService notificationService;

    @MockitoBean
    private UserRepository userRepository;

    @MockitoBean
    private SessionRepository sessionRepository;

    @MockitoBean
    private UserIdentityRepository userIdentityRepository;

    @MockitoBean
    private RoleRepository roleRepository;

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
    // GET /api/v1/notifications
    // =========================================================================

    @Test
    @DisplayName("""
            Given: user has notifications
            When: GET /api/v1/notifications is called
            Then: 200 OK is returned with paginated notifications
            """)
    public void testGetNotifications_Success() throws Exception {
        UUID notificationId = UUID.randomUUID();
        UUID eventId = UUID.randomUUID();
        OffsetDateTime createdAt = OffsetDateTime.now();

        NotificationResponseDto notificationDto = NotificationResponseDto.builder()
                .id(notificationId)
                .title("Reminder: Exam")
                .message("Exam starts soon")
                .type(NotificationType.EVENT_REMINDER)
                .eventId(eventId)
                .isRead(false)
                .createdAt(createdAt)
                .build();

        PageDto<NotificationResponseDto> pageDto = PageDto.<NotificationResponseDto>builder()
                .content(List.of(notificationDto))
                .number(0)
                .size(20)
                .totalElements(1)
                .totalPages(1)
                .first(true)
                .last(true)
                .build();

        when(notificationService.getUserNotifications(eq(userId), any(Pageable.class))).thenReturn(pageDto);

        mockMvc.perform(get(BASE_URL)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray())
                .andExpect(jsonPath("$.content[0].id").value(notificationId.toString()))
                .andExpect(jsonPath("$.content[0].title").value("Reminder: Exam"))
                .andExpect(jsonPath("$.content[0].message").value("Exam starts soon"))
                .andExpect(jsonPath("$.content[0].type").value("EVENT_REMINDER"))
                .andExpect(jsonPath("$.content[0].eventId").value(eventId.toString()))
                .andExpect(jsonPath("$.content[0].isRead").value(false))
                .andExpect(jsonPath("$.totalElements").value(1));
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
        when(notificationService.getUnreadCount(userId)).thenReturn(5L);

        mockMvc.perform(get(BASE_URL + "/unread-count")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.unreadCount").value(5));
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
