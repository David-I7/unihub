package com.unihub.app.controllers;

import com.unihub.app.domain.RoleType;
import com.unihub.app.dto.PageDto;
import com.unihub.app.dto.UserDto;
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
import org.springframework.data.domain.Pageable;
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
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.unihub.app.BaseIntegrationTest;

@AutoConfigureMockMvc
public class UserControllerTests extends BaseIntegrationTest {

    private static final String BASE_URL = "/api/v1/users";

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private UserService userService;

    @MockitoBean
    private AuthorizationService authorizationService;

    private UUID userId;
    private UserDto userDto;

    @BeforeEach
    public void setUp() {
        userId = UUID.randomUUID();
        userDto = new UserDto(userId, "david@example.com", "david", true, RoleType.USER);

        JwtAuthentication authentication = new JwtAuthentication(userDto);
        SecurityContextHolder.getContext().setAuthentication(authentication);
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
            Then: 200 OK is returned with user profile
            """)
    public void testGetMyProfile_Authenticated_Success() throws Exception {
        UserProfileResponseDto profileDto = UserProfileResponseDto.builder()
                .id(userId)
                .username("david")
                .email("david@example.com")
                .role("USER")
                .emailVerified(true)
                .permissions(List.of("READ_COMMUNITY", "CREATE_COMMUNITY"))
                .createdAt(OffsetDateTime.now())
                .build();

        when(userService.getUserProfile(userId)).thenReturn(profileDto);

        mockMvc.perform(get(BASE_URL + "/me")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(userId.toString()))
                .andExpect(jsonPath("$.username").value("david"))
                .andExpect(jsonPath("$.email").value("david@example.com"))
                .andExpect(jsonPath("$.role").value("USER"))
                .andExpect(jsonPath("$.emailVerified").value(true))
                .andExpect(jsonPath("$.permissions[0]").value("READ_COMMUNITY"));
    }

    // =========================================================================
    // PATCH /api/v1/users/me
    // =========================================================================

    @Test
    @DisplayName("""
            Given: valid update profile request
            When: PATCH /api/v1/users/me is called
            Then: 200 OK is returned with updated user profile
            """)
    public void testUpdateProfile_Success() throws Exception {
        UpdateUserProfileRequestDto requestDto = new UpdateUserProfileRequestDto("new_username");

        UserProfileResponseDto updatedProfile = UserProfileResponseDto.builder()
                .id(userId)
                .username("new_username")
                .email("david@example.com")
                .role("USER")
                .emailVerified(true)
                .permissions(List.of())
                .createdAt(OffsetDateTime.now())
                .build();

        when(userService.updateProfile(eq(userId), any(UpdateUserProfileRequestDto.class))).thenReturn(updatedProfile);

        mockMvc.perform(patch(BASE_URL + "/me")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestDto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value("new_username"));
    }

    @Test
    @DisplayName("""
            Given: taken username
            When: PATCH /api/v1/users/me is called
            Then: 409 Conflict is returned
            """)
    public void testUpdateProfile_UsernameConflict() throws Exception {
        UpdateUserProfileRequestDto requestDto = new UpdateUserProfileRequestDto("taken_username");

        when(userService.updateProfile(eq(userId), any(UpdateUserProfileRequestDto.class)))
                .thenThrow(new ResponseStatusException(HttpStatus.CONFLICT, "Username is already taken"));

        mockMvc.perform(patch(BASE_URL + "/me")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestDto)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.detail").value("Username is already taken"));
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
            Given: authenticated user with enrolled communities
            When: GET /api/v1/users/me/communities is called
            Then: 200 OK is returned with paginated UserEnrolledCommunityDto
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

        PageDto<UserEnrolledCommunityDto> pageDto = PageDto.<UserEnrolledCommunityDto>builder()
                .content(List.of(communityDto))
                .number(0)
                .size(10)
                .totalElements(1)
                .totalPages(1)
                .first(true)
                .last(true)
                .build();

        when(userService.getUserEnrolledCommunities(eq(userId), any(Pageable.class))).thenReturn(pageDto);

        mockMvc.perform(get(BASE_URL + "/me/communities")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray())
                .andExpect(jsonPath("$.content[0].id").value(commId.toString()))
                .andExpect(jsonPath("$.content[0].name").value("Computer Science"))
                .andExpect(jsonPath("$.content[0].slug").value("cs"))
                .andExpect(jsonPath("$.content[0].role").value("COMMUNITY_MEMBER"));
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

        UserProfileResponseDto updatedProfile = UserProfileResponseDto.builder()
                .id(UUID.randomUUID())
                .username("target_user")
                .email("target@example.com")
                .role("ADMIN")
                .emailVerified(true)
                .permissions(List.of("ADMIN_PERMISSION"))
                .createdAt(OffsetDateTime.now())
                .build();

        when(authorizationService.hasGlobalPermission(com.unihub.app.domain.PermissionType.UPDATE_USER_ROLE)).thenReturn(true);
        when(userService.updateUserRole(eq("target_user"), any(UpdateUserRoleRequestDto.class))).thenReturn(updatedProfile);

        mockMvc.perform(patch(BASE_URL + "/target_user/role")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestDto)))
                .andExpect(status().isOk())
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
    public void testAdminDeleteUser_Success() throws Exception {
        AdminDeleteUserRequestDto requestDto = new AdminDeleteUserRequestDto("Violation of terms");

        when(authorizationService.hasGlobalPermission(com.unihub.app.domain.PermissionType.DELETE_USER)).thenReturn(true);
        doNothing().when(userService).adminDeleteUser(eq("target_user"), eq("Violation of terms"));

        mockMvc.perform(delete(BASE_URL + "/target_user")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestDto)))
                .andExpect(status().isNoContent());

        verify(userService).adminDeleteUser("target_user", "Violation of terms");
    }
}
