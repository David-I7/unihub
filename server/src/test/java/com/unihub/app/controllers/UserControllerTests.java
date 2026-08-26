package com.unihub.app.controllers;

import com.unihub.app.config.AppConfig;
import com.unihub.app.config.SecurityConfig;
import com.unihub.app.config.SessionProperties;
import com.unihub.app.controllers.user.UserController;
import com.unihub.app.dto.UserDto;
import com.unihub.app.dto.user.UserCommunitiesResponseDto;
import com.unihub.app.dto.user.UserEnrolledCommunityDto;
import com.unihub.app.dto.user.UserProfileResponseDto;
import com.unihub.app.exceptions.GlobalExceptionHandler;
import com.unihub.app.mappers.ObjectErrorMapper;
import com.unihub.app.mappers.PageMapper;
import com.unihub.app.mappers.UserMapper;
import com.unihub.app.repositories.authentication.SessionRepository;
import com.unihub.app.repositories.authentication.UserIdentityRepository;
import com.unihub.app.repositories.authentication.UserRepository;
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
import com.unihub.app.utils.ProblemDetailUtil;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
public class UserControllerTests {

    private static final String BASE_URL = "/api/v1/users/me";

    @Autowired
    private MockMvc mockMvc;

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

    @MockitoBean
    private CommunityMemberRepository communityMemberRepository;

    private UUID userId;
    private UserDto userDto;

    @BeforeEach
    public void setUp() {
        userId = UUID.randomUUID();
        userDto = new UserDto(userId, "john@example.com", "john_doe");
    }

    @AfterEach
    public void tearDown() {
        SecurityContextHolder.clearContext();
    }

    // =========================================================================
    // GET /api/v1/users/me
    // =========================================================================

    @Test
    @DisplayName("""
            Given: authenticated user
            When: GET /api/v1/users/me is called
            Then: 200 OK is returned with UserProfileResponseDto
            """)
    public void testGetMyProfile_Authenticated_Success() throws Exception {
        JwtAuthentication auth = new JwtAuthentication(userDto);
        SecurityContextHolder.getContext().setAuthentication(auth);

        OffsetDateTime createdAt = OffsetDateTime.now();
        UserProfileResponseDto profileDto = UserProfileResponseDto.builder()
                .id(userId)
                .username("john_doe")
                .email("john@example.com")
                .role("STUDENT")
                .permissions(List.of("CREATE_POST", "VIEW_CALENDAR"))
                .createdAt(createdAt)
                .build();

        when(userService.getUserProfile(userId)).thenReturn(profileDto);

        mockMvc.perform(get(BASE_URL)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(userId.toString()))
                .andExpect(jsonPath("$.username").value("john_doe"))
                .andExpect(jsonPath("$.email").value("john@example.com"))
                .andExpect(jsonPath("$.role").value("STUDENT"))
                .andExpect(jsonPath("$.permissions[0]").value("CREATE_POST"))
                .andExpect(jsonPath("$.permissions[1]").value("VIEW_CALENDAR"))
                .andExpect(jsonPath("$.createdAt").exists());
    }

    @Test
    @DisplayName("""
            Given: unauthenticated request
            When: GET /api/v1/users/me is called
            Then: 401 Unauthorized is returned
            """)
    public void testGetMyProfile_Unauthenticated() throws Exception {
        mockMvc.perform(get(BASE_URL)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isUnauthorized());
    }

    // =========================================================================
    // GET /api/v1/users/me/communities
    // =========================================================================

    @Test
    @DisplayName("""
            Given: authenticated user
            When: GET /api/v1/users/me/communities is called
            Then: 200 OK is returned with UserCommunitiesResponseDto
            """)
    public void testGetMyCommunities_Authenticated_Success() throws Exception {
        JwtAuthentication auth = new JwtAuthentication(userDto);
        SecurityContextHolder.getContext().setAuthentication(auth);

        UUID commId = UUID.randomUUID();
        OffsetDateTime joinedAt = OffsetDateTime.now();

        UserEnrolledCommunityDto communityDto = UserEnrolledCommunityDto.builder()
                .id(commId)
                .name("Computer Science")
                .slug("cs")
                .description("CS Community")
                .memberCount(100L)
                .role("MEMBER")
                .permissions(List.of("CREATE_POST", "VIEW_CALENDAR"))
                .joinedAt(joinedAt)
                .build();

        UserCommunitiesResponseDto communitiesResponseDto = UserCommunitiesResponseDto.builder()
                .communities(List.of(communityDto))
                .permissions(List.of("CREATE_POST", "VIEW_CALENDAR"))
                .build();

        when(userService.getUserEnrolledCommunities(userId)).thenReturn(communitiesResponseDto);

        mockMvc.perform(get(BASE_URL + "/communities")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.communities").isArray())
                .andExpect(jsonPath("$.communities[0].id").value(commId.toString()))
                .andExpect(jsonPath("$.communities[0].name").value("Computer Science"))
                .andExpect(jsonPath("$.communities[0].slug").value("cs"))
                .andExpect(jsonPath("$.communities[0].description").value("CS Community"))
                .andExpect(jsonPath("$.communities[0].memberCount").value(100))
                .andExpect(jsonPath("$.communities[0].role").value("MEMBER"))
                .andExpect(jsonPath("$.communities[0].permissions[0]").value("CREATE_POST"))
                .andExpect(jsonPath("$.communities[0].permissions[1]").value("VIEW_CALENDAR"))
                .andExpect(jsonPath("$.communities[0].joinedAt").exists())
                .andExpect(jsonPath("$.permissions[0]").value("CREATE_POST"))
                .andExpect(jsonPath("$.permissions[1]").value("VIEW_CALENDAR"));
    }

    @Test
    @DisplayName("""
            Given: unauthenticated request
            When: GET /api/v1/users/me/communities is called
            Then: 401 Unauthorized is returned
            """)
    public void testGetMyCommunities_Unauthenticated() throws Exception {
        mockMvc.perform(get(BASE_URL + "/communities")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isUnauthorized());
    }
}
