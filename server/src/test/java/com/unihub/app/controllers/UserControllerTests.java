package com.unihub.app.controllers;

import com.unihub.app.domain.RoleType;
import com.unihub.app.dto.UserDto;
import com.unihub.app.dto.user.UserCommunitiesResponseDto;
import com.unihub.app.dto.user.UserEnrolledCommunityDto;
import com.unihub.app.dto.user.UserProfileResponseDto;
import com.unihub.app.dto.user.request.AdminDeleteUserRequestDto;
import com.unihub.app.dto.user.request.UpdateUserProfileRequestDto;
import com.unihub.app.dto.user.request.UpdateUserRoleRequestDto;
import com.unihub.app.repositories.authentication.SessionRepository;
import com.unihub.app.repositories.authentication.UserIdentityRepository;
import com.unihub.app.repositories.authentication.UserRepository;
import com.unihub.app.repositories.authorization.PermissionRepository;
import com.unihub.app.repositories.authorization.RoleRepository;
import com.unihub.app.repositories.community.resources.CommunityMemberRepository;
import com.unihub.app.security.JwtAuthentication;
import com.unihub.app.services.authentication.UserService;
import com.unihub.app.services.authorization.AuthorizationService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
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
import java.util.Map;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.unihub.app.BaseIntegrationTest;

@AutoConfigureMockMvc
public class UserControllerTests extends BaseIntegrationTest {

    private static final String BASE_URL = "/api/v1/users";

    @Autowired
    private MockMvc mockMvc;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @MockitoBean
    private UserService userService;

    @MockitoBean
    private AuthorizationService authorizationService;

    private UUID userId;
    private UserDto userDto;

    @BeforeEach
    public void setUp() {
        userId = UUID.randomUUID();
        userDto = new UserDto(userId, "john@example.com", "john_doe", false, RoleType.ADMIN);
        JwtAuthentication auth = new JwtAuthentication(userDto);
        SecurityContextHolder.getContext().setAuthentication(auth);
        when(authorizationService.safeRequireAuthentication()).thenReturn(auth);
        when(authorizationService.hasGlobalPermission(any())).thenReturn(true);
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

        mockMvc.perform(get(BASE_URL + "/me")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(userId.toString()))
                .andExpect(jsonPath("$.username").value("john_doe"))
                .andExpect(jsonPath("$.email").value("john@example.com"))
                .andExpect(jsonPath("$.role").value("STUDENT"))
                .andExpect(jsonPath("$.permissions[0]").value("CREATE_POST"))
                .andExpect(jsonPath("$.permissions[1]").value("VIEW_CALENDAR"));
    }

    @Test
    @DisplayName("""
            Given: unauthenticated request
            When: GET /api/v1/users/me is called
            Then: 401 Unauthorized is returned
            """)
    public void testGetMyProfile_Unauthenticated() throws Exception {
        SecurityContextHolder.clearContext();

        mockMvc.perform(get(BASE_URL + "/me")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isUnauthorized());
    }

    // =========================================================================
    // PATCH /api/v1/users/me
    // =========================================================================

    @Test
    @DisplayName("""
            Given: authenticated user
            When: PATCH /api/v1/users/me is called
            Then: 200 OK is returned with updated profile
            """)
    public void testUpdateMyProfile_Success() throws Exception {
        UpdateUserProfileRequestDto requestDto = new UpdateUserProfileRequestDto("new_username");
        UserProfileResponseDto profileDto = UserProfileResponseDto.builder()
                .id(userId)
                .username("new_username")
                .email("john@example.com")
                .role("STUDENT")
                .permissions(List.of("CREATE_POST"))
                .createdAt(OffsetDateTime.now())
                .build();

        when(userService.updateProfile(eq(userId), any(UpdateUserProfileRequestDto.class))).thenReturn(profileDto);

        mockMvc.perform(patch(BASE_URL + "/me")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestDto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value("new_username"));
    }

    // =========================================================================
    // DELETE /api/v1/users/me
    // =========================================================================

    @Test
    @DisplayName("""
            Given: authenticated user
            When: DELETE /api/v1/users/me is called
            Then: 204 No Content is returned
            """)
    public void testDeleteMyAccount_Success() throws Exception {
        doNothing().when(userService).selfDelete(userId);

        mockMvc.perform(delete(BASE_URL + "/me")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNoContent());

        verify(userService).selfDelete(userId);
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
        UUID commId = UUID.randomUUID();
        OffsetDateTime joinedAt = OffsetDateTime.now();

        UserEnrolledCommunityDto communityDto = UserEnrolledCommunityDto.builder()
                .id(commId)
                .name("Computer Science")
                .slug("cs")
                .role("COMMUNITY_MEMBER")
                .joinedAt(joinedAt)
                .build();

        UserCommunitiesResponseDto communitiesResponseDto = UserCommunitiesResponseDto.builder()
                .communities(List.of(communityDto))
                .permissionsByRole(Map.of("COMMUNITY_MEMBER", List.of("VIEW_POSTS")))
                .build();

        when(userService.getUserEnrolledCommunities(userId)).thenReturn(communitiesResponseDto);

        mockMvc.perform(get(BASE_URL + "/me/communities")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.communities").isArray())
                .andExpect(jsonPath("$.communities[0].id").value(commId.toString()))
                .andExpect(jsonPath("$.communities[0].name").value("Computer Science"))
                .andExpect(jsonPath("$.communities[0].slug").value("cs"))
                .andExpect(jsonPath("$.communities[0].role").value("COMMUNITY_MEMBER"))
                .andExpect(jsonPath("$.permissionsByRole.COMMUNITY_MEMBER[0]").value("VIEW_POSTS"));
    }

    // =========================================================================
    // PATCH /api/v1/users/{username}/role
    // =========================================================================

    @Test
    @DisplayName("""
            Given: admin user and target username
            When: PATCH /api/v1/users/{username}/role is called
            Then: 200 OK is returned with updated user profile
            """)
    public void testUpdateUserRole_Success() throws Exception {
        UpdateUserRoleRequestDto requestDto = new UpdateUserRoleRequestDto(RoleType.ADMIN);
        UserProfileResponseDto profileDto = UserProfileResponseDto.builder()
                .id(UUID.randomUUID())
                .username("bob")
                .email("bob@example.com")
                .role("ADMIN")
                .permissions(List.of("ADMIN_ALL"))
                .createdAt(OffsetDateTime.now())
                .build();

        when(userService.updateUserRole(eq("bob"), any(UpdateUserRoleRequestDto.class))).thenReturn(profileDto);

        mockMvc.perform(patch(BASE_URL + "/bob/role")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestDto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value("bob"))
                .andExpect(jsonPath("$.role").value("ADMIN"));
    }

    // =========================================================================
    // DELETE /api/v1/users/{username}
    // =========================================================================

    @Test
    @DisplayName("""
            Given: admin user and target username
            When: DELETE /api/v1/users/{username} is called
            Then: 204 No Content is returned
            """)
    public void testDeleteUser_Success() throws Exception {
        AdminDeleteUserRequestDto requestDto = new AdminDeleteUserRequestDto("Violation of terms");
        doNothing().when(userService).adminDeleteUser("bob", "Violation of terms");

        mockMvc.perform(delete(BASE_URL + "/bob")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestDto)))
                .andExpect(status().isNoContent());

        verify(userService).adminDeleteUser("bob", "Violation of terms");
    }
}
