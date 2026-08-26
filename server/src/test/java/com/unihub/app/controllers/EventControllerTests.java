package com.unihub.app.controllers;

import com.unihub.app.config.AppConfig;
import com.unihub.app.config.SecurityConfig;
import com.unihub.app.config.SessionProperties;
import com.unihub.app.controllers.community.resources.EventController;
import com.unihub.app.dto.community.content.EventResponseDto;
import com.unihub.app.entities.community.content.EventLocation;
import com.unihub.app.entities.community.content.EventType;
import com.unihub.app.exceptions.GlobalExceptionHandler;
import com.unihub.app.mappers.ObjectErrorMapper;
import com.unihub.app.mappers.PageMapper;
import com.unihub.app.mappers.UserMapper;
import com.unihub.app.repositories.authentication.SessionRepository;
import com.unihub.app.repositories.authentication.UserIdentityRepository;
import com.unihub.app.repositories.authentication.UserRepository;
import com.unihub.app.repositories.authorization.RoleRepository;
import com.unihub.app.security.JwtSessionManagementFilter;
import com.unihub.app.security.OAuth2AuthenticationFailureHandler;
import com.unihub.app.security.OAuth2AuthenticationSuccessHandler;
import com.unihub.app.security.OAuth2ProviderUserInfoExtractor;
import com.unihub.app.services.JwtService;
import com.unihub.app.services.authentication.SessionService;
import com.unihub.app.services.authentication.UserIdentityService;
import com.unihub.app.services.authentication.UserService;
import com.unihub.app.services.authorization.RoleService;
import com.unihub.app.services.community.content.EventService;
import com.unihub.app.services.community.content.SubscriptionService;
import com.unihub.app.utils.ProblemDetailUtil;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(EventController.class)
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
        com.unihub.app.utils.StringToStudyYearNameConverter.class
})
public class EventControllerTests {

    private static final String BASE_URL = "/api/v1/communities/fmi-info-id/events";

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private EventService eventService;

    @MockitoBean
    private SubscriptionService subscriptionService;

    @MockitoBean
    private UserService userService;

    @MockitoBean
    private UserRepository userRepository;

    @MockitoBean
    private SessionRepository sessionRepository;

    @MockitoBean
    private UserIdentityRepository userIdentityRepository;

    @MockitoBean
    private RoleRepository roleRepository;

    @Test
    @DisplayName("GET /api/v1/communities/{communitySlug}/events returns list of events")
    public void testGetEvents_Success() throws Exception {
        UUID eventId = UUID.randomUUID();
        EventResponseDto dto = EventResponseDto.builder()
                .id(eventId)
                .title("Examen ASC")
                .type(EventType.EXAM)
                .startTime(OffsetDateTime.now().plusDays(5))
                .location(EventLocation.IN_PERSON)
                .courseId(1L)
                .courseSlug("asc")
                .courseName("ASC")
                .communitySlug("fmi-info-id")
                .createdAt(OffsetDateTime.now())
                .updatedAt(OffsetDateTime.now())
                .isSubscribed(false)
                .build();

        when(eventService.getEvents(eq("fmi-info-id"), any(), any(), any(), any(), any(), any()))
                .thenReturn(List.of(dto));

        mockMvc.perform(get(BASE_URL).contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].id").value(eventId.toString()))
                .andExpect(jsonPath("$[0].title").value("Examen ASC"));
    }
}
