package com.unihub.app.services;

import com.unihub.app.domain.RoleType;
import com.unihub.app.dto.user.UserCommunitiesResponseDto;
import com.unihub.app.dto.user.UserEnrolledCommunityDto;
import com.unihub.app.dto.user.UserProfileResponseDto;
import com.unihub.app.dto.user.request.UpdateUserProfileRequestDto;
import com.unihub.app.dto.user.request.UpdateUserRoleRequestDto;
import com.unihub.app.entities.authentication.User;
import com.unihub.app.entities.authorization.Role;
import com.unihub.app.entities.community.resources.Community;
import com.unihub.app.entities.community.resources.CommunityMember;
import com.unihub.app.mappers.UserMapper;
import com.unihub.app.repositories.authentication.UserIdentityRepository;
import com.unihub.app.repositories.authentication.UserRepository;
import com.unihub.app.repositories.community.resources.CommunityMemberRepository;
import com.unihub.app.repositories.community.resources.CommunityRepository;
import com.unihub.app.services.authentication.UserIdentityService;
import com.unihub.app.services.authentication.UserService;
import com.unihub.app.services.authorization.RoleService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.server.ResponseStatusException;

import java.time.OffsetDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class UserServiceTests {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private UserIdentityService userIdentityService;

    @Mock
    private RoleService roleService;

    @Mock
    private CommunityMemberRepository communityMemberRepository;

    @Mock
    private CommunityRepository communityRepository;

    private UserMapper userMapper;

    private UserService userService;

    @org.junit.jupiter.api.BeforeEach
    public void setUp() {
        userMapper = new UserMapper(roleService);
        userService = new UserService(
                userRepository,
                passwordEncoder,
                userIdentityService,
                roleService,
                communityMemberRepository,
                communityRepository,
                userMapper
        );
    }

    // =========================================================================
    // getUserProfile
    // =========================================================================

    @Test
    @DisplayName("getUserProfile returns user profile with role and permissions")
    public void testGetUserProfile_Success() {
        UUID userId = UUID.randomUUID();
        UUID roleId = UUID.randomUUID();
        OffsetDateTime createdAt = OffsetDateTime.now().minusDays(10);
        Role role = Role.builder().id(roleId).name("STUDENT").build();
        User user = User.builder()
                .id(userId)
                .username("john_doe")
                .email("john@example.com")
                .roleId(roleId)
                .createdAt(createdAt)
                .build();

        List<String> permissions = List.of("CREATE_POST", "VIEW_CALENDAR");

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(roleService.getRoleById(roleId)).thenReturn(role);
        when(roleService.getPermissionNamesByRoleName("STUDENT")).thenReturn(permissions);

        UserProfileResponseDto result = userService.getUserProfile(userId);

        assertNotNull(result);
        assertEquals(userId, result.id());
        assertEquals("john_doe", result.username());
        assertEquals("john@example.com", result.email());
        assertEquals("STUDENT", result.role());
        assertEquals(permissions, result.permissions());
        assertEquals(createdAt, result.createdAt());

        verify(userRepository).findById(userId);
    }

    @Test
    @DisplayName("getUserProfile throws 404 when user not found")
    public void testGetUserProfile_NotFound() {
        UUID userId = UUID.randomUUID();
        when(userRepository.findById(userId)).thenReturn(Optional.empty());

        assertThrows(ResponseStatusException.class, () -> userService.getUserProfile(userId));
    }

    // =========================================================================
    // updateProfile
    // =========================================================================

    @Test
    @DisplayName("updateProfile updates username when not taken")
    public void testUpdateProfile_Success() {
        UUID userId = UUID.randomUUID();
        UUID roleId = UUID.randomUUID();
        Role role = Role.builder().id(roleId).name("USER").build();
        User user = User.builder()
                .id(userId)
                .username("old_name")
                .email("user@example.com")
                .roleId(roleId)
                .createdAt(OffsetDateTime.now())
                .build();

        UpdateUserProfileRequestDto dto = new UpdateUserProfileRequestDto("new_name", null, null);

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(userRepository.findByUsername("new_name")).thenReturn(Optional.empty());
        when(userRepository.save(any(User.class))).thenReturn(user);
        when(roleService.getRoleById(roleId)).thenReturn(role);
        when(roleService.getPermissionNamesByRoleName("USER")).thenReturn(List.of());

        UserProfileResponseDto result = userService.updateProfile(userId, dto);

        assertNotNull(result);
        assertEquals("new_name", user.getUsername());
        verify(userRepository).save(user);
    }

    // =========================================================================
    // updateUserRole
    // =========================================================================

    @Test
    @DisplayName("updateUserRole updates target user role")
    public void testUpdateUserRole_Success() {
        UUID targetId = UUID.randomUUID();
        UUID oldRoleId = UUID.randomUUID();
        UUID newRoleId = UUID.randomUUID();

        Role newRole = Role.builder().id(newRoleId).name("ADMIN").build();
        User target = User.builder().id(targetId).username("bob").email("bob@example.com").roleId(oldRoleId).build();
        UpdateUserRoleRequestDto dto = new UpdateUserRoleRequestDto(RoleType.ADMIN);

        when(userRepository.findByUsername("bob")).thenReturn(Optional.of(target));
        when(roleService.getRoleByName(RoleType.ADMIN)).thenReturn(newRole);
        when(userRepository.save(any(User.class))).thenReturn(target);
        when(roleService.getRoleById(newRoleId)).thenReturn(newRole);
        when(roleService.getPermissionNamesByRoleName("ADMIN")).thenReturn(List.of("MANAGE_USERS"));

        UserProfileResponseDto result = userService.updateUserRole("bob", dto);

        assertNotNull(result);
        assertEquals(newRoleId, target.getRoleId());
        verify(userRepository).save(target);
    }

    // =========================================================================
    // selfDelete
    // =========================================================================

    @Test
    @DisplayName("selfDelete deletes user when user does not own any communities")
    public void testSelfDelete_Success() {
        UUID userId = UUID.randomUUID();

        when(communityRepository.existsByOwnerId(userId)).thenReturn(false);

        userService.selfDelete(userId);

        verify(userRepository).deleteById(userId);
    }

    // =========================================================================
    // adminDeleteUser
    // =========================================================================

    @Test
    @DisplayName("adminDeleteUser deletes user when not root and not owning communities")
    public void testAdminDeleteUser_Success() {
        UUID userId = UUID.randomUUID();
        UUID userRoleId = UUID.randomUUID();
        UUID rootRoleId = UUID.randomUUID();

        User user = User.builder().id(userId).username("bob").roleId(userRoleId).build();
        Role rootRole = Role.builder().id(rootRoleId).name("ROOT").build();

        when(userRepository.findByUsername("bob")).thenReturn(Optional.of(user));
        when(roleService.getRoleByName(RoleType.ROOT)).thenReturn(rootRole);
        when(communityRepository.existsByOwnerId(userId)).thenReturn(false);

        userService.adminDeleteUser("bob");

        verify(userRepository).deleteById(userId);
    }

    // =========================================================================
    // getUserEnrolledCommunities
    // =========================================================================

    @Test
    @DisplayName("getUserEnrolledCommunities returns enrolled communities and role permissions")
    public void testGetUserEnrolledCommunities_Success() {
        UUID userId = UUID.randomUUID();
        OffsetDateTime joinedAt1 = OffsetDateTime.now().minusDays(20);
        OffsetDateTime joinedAt2 = OffsetDateTime.now().minusDays(10);
        UUID roleId1 = UUID.randomUUID();
        UUID roleId2 = UUID.randomUUID();

        Role memberRole = Role.builder().id(roleId1).name("COMMUNITY_MEMBER").build();
        Role adminRole = Role.builder().id(roleId2).name("COMMUNITY_ADMIN").build();

        Community comm1 = Community.builder()
                .id(UUID.randomUUID())
                .name("Computer Science")
                .slug("cs")
                .build();

        Community comm2 = Community.builder()
                .id(UUID.randomUUID())
                .name("Mathematics")
                .slug("math")
                .build();

        CommunityMember member1 = CommunityMember.builder()
                .community(comm1)
                .roleId(roleId1)
                .joinedAt(joinedAt1)
                .build();

        CommunityMember member2 = CommunityMember.builder()
                .community(comm2)
                .roleId(roleId2)
                .joinedAt(joinedAt2)
                .build();

        when(communityMemberRepository.findMembershipsByUserIdWithCommunity(userId))
                .thenReturn(List.of(member1, member2));
        when(roleService.getRoleById(roleId1)).thenReturn(memberRole);
        when(roleService.getRoleById(roleId2)).thenReturn(adminRole);
        when(roleService.getPermissionNamesByRoleName("COMMUNITY_MEMBER"))
                .thenReturn(List.of("VIEW_POSTS"));
        when(roleService.getPermissionNamesByRoleName("COMMUNITY_ADMIN"))
                .thenReturn(List.of("VIEW_POSTS", "DELETE_POST"));

        UserCommunitiesResponseDto result = userService.getUserEnrolledCommunities(userId);

        assertNotNull(result);
        assertEquals(2, result.communities().size());

        UserEnrolledCommunityDto c1 = result.communities().get(0);
        assertEquals(comm1.getId(), c1.id());
        assertEquals("Computer Science", c1.name());
        assertEquals("cs", c1.slug());
        assertEquals("COMMUNITY_MEMBER", c1.role());
        assertEquals(joinedAt1, c1.joinedAt());

        UserEnrolledCommunityDto c2 = result.communities().get(1);
        assertEquals(comm2.getId(), c2.id());
        assertEquals("Mathematics", c2.name());
        assertEquals("math", c2.slug());
        assertEquals("COMMUNITY_ADMIN", c2.role());
        assertEquals(joinedAt2, c2.joinedAt());

        assertNotNull(result.permissionsByRole());
        assertEquals(List.of("VIEW_POSTS"), result.permissionsByRole().get("COMMUNITY_MEMBER"));
        assertEquals(List.of("VIEW_POSTS", "DELETE_POST"), result.permissionsByRole().get("COMMUNITY_ADMIN"));
    }

    @Test
    @DisplayName("getUserEnrolledCommunities returns empty response when user has no enrolled communities")
    public void testGetUserEnrolledCommunities_EmptyMemberships() {
        UUID userId = UUID.randomUUID();
        when(communityMemberRepository.findMembershipsByUserIdWithCommunity(userId))
                .thenReturn(Collections.emptyList());

        UserCommunitiesResponseDto result = userService.getUserEnrolledCommunities(userId);

        assertNotNull(result);
        assertTrue(result.communities().isEmpty());
        assertTrue(result.permissionsByRole().isEmpty());
    }
}
