package com.unihub.app.services;

import com.unihub.app.dto.user.UserCommunitiesResponseDto;
import com.unihub.app.dto.user.UserEnrolledCommunityDto;
import com.unihub.app.dto.user.UserProfileResponseDto;
import com.unihub.app.entities.authentication.User;
import com.unihub.app.entities.authorization.Role;
import com.unihub.app.entities.community.resources.Community;
import com.unihub.app.entities.community.resources.CommunityMember;
import com.unihub.app.repositories.authentication.UserRepository;
import com.unihub.app.repositories.community.resources.CommunityMemberRepository;
import com.unihub.app.services.authentication.UserIdentityService;
import com.unihub.app.services.authentication.UserService;
import com.unihub.app.services.authorization.RoleService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.server.ResponseStatusException;

import java.time.OffsetDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
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

    @InjectMocks
    private UserService userService;

    // =========================================================================
    // getUserProfile
    // =========================================================================

    @Test
    @DisplayName("getUserProfile returns user profile with role and permissions")
    public void testGetUserProfile_Success() {
        UUID userId = UUID.randomUUID();
        OffsetDateTime createdAt = OffsetDateTime.now().minusDays(10);
        Role role = Role.builder().name("STUDENT").build();
        User user = User.builder()
                .id(userId)
                .username("john_doe")
                .email("john@example.com")
                .role(role)
                .createdAt(createdAt)
                .build();

        List<String> permissions = List.of("CREATE_POST", "VIEW_CALENDAR");

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
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
        verify(roleService).getPermissionNamesByRoleName("STUDENT");
    }

    @Test
    @DisplayName("getUserProfile handles user with null role")
    public void testGetUserProfile_NullRole() {
        UUID userId = UUID.randomUUID();
        OffsetDateTime createdAt = OffsetDateTime.now().minusDays(5);
        User user = User.builder()
                .id(userId)
                .username("no_role_user")
                .email("norole@example.com")
                .role(null)
                .createdAt(createdAt)
                .build();

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(roleService.getPermissionNamesByRoleName(null)).thenReturn(Collections.emptyList());

        UserProfileResponseDto result = userService.getUserProfile(userId);

        assertNotNull(result);
        assertEquals(userId, result.id());
        assertNull(result.role());
        assertTrue(result.permissions().isEmpty());
    }

    @Test
    @DisplayName("getUserProfile throws 404 when user not found")
    public void testGetUserProfile_NotFound() {
        UUID userId = UUID.randomUUID();
        when(userRepository.findById(userId)).thenReturn(Optional.empty());

        assertThrows(ResponseStatusException.class, () -> userService.getUserProfile(userId));
    }

    // =========================================================================
    // getUserEnrolledCommunities
    // =========================================================================

    @Test
    @DisplayName("getUserEnrolledCommunities returns enrolled communities and deduplicated permissions")
    public void testGetUserEnrolledCommunities_Success() {
        UUID userId = UUID.randomUUID();
        OffsetDateTime joinedAt1 = OffsetDateTime.now().minusDays(20);
        OffsetDateTime joinedAt2 = OffsetDateTime.now().minusDays(10);

        Role memberRole = Role.builder().name("MEMBER").build();
        Role modRole = Role.builder().name("MODERATOR").build();

        Community comm1 = Community.builder()
                .id(UUID.randomUUID())
                .name("Computer Science")
                .slug("cs")
                .description("CS Community")
                .memberCount(150)
                .build();

        Community comm2 = Community.builder()
                .id(UUID.randomUUID())
                .name("Mathematics")
                .slug("math")
                .description("Math Community")
                .memberCount(75)
                .build();

        CommunityMember member1 = CommunityMember.builder()
                .community(comm1)
                .role(memberRole)
                .joinedAt(joinedAt1)
                .build();

        CommunityMember member2 = CommunityMember.builder()
                .community(comm2)
                .role(modRole)
                .joinedAt(joinedAt2)
                .build();

        when(communityMemberRepository.findMembershipsByUserIdWithCommunityAndRole(userId))
                .thenReturn(List.of(member1, member2));
        when(roleService.getPermissionNamesByRoleName("MEMBER"))
                .thenReturn(List.of("VIEW_POSTS", "CREATE_COMMENT"));
        when(roleService.getPermissionNamesByRoleName("MODERATOR"))
                .thenReturn(List.of("VIEW_POSTS", "CREATE_COMMENT", "DELETE_POST"));

        UserCommunitiesResponseDto result = userService.getUserEnrolledCommunities(userId);

        assertNotNull(result);
        assertEquals(2, result.communities().size());

        UserEnrolledCommunityDto c1 = result.communities().get(0);
        assertEquals(comm1.getId(), c1.id());
        assertEquals("Computer Science", c1.name());
        assertEquals("cs", c1.slug());
        assertEquals("CS Community", c1.description());
        assertEquals(150L, c1.memberCount());
        assertEquals("MEMBER", c1.role());
        assertEquals(List.of("VIEW_POSTS", "CREATE_COMMENT"), c1.permissions());
        assertEquals(joinedAt1, c1.joinedAt());

        UserEnrolledCommunityDto c2 = result.communities().get(1);
        assertEquals(comm2.getId(), c2.id());
        assertEquals("Mathematics", c2.name());
        assertEquals("math", c2.slug());
        assertEquals("Math Community", c2.description());
        assertEquals(75L, c2.memberCount());
        assertEquals("MODERATOR", c2.role());
        assertEquals(List.of("VIEW_POSTS", "CREATE_COMMENT", "DELETE_POST"), c2.permissions());
        assertEquals(joinedAt2, c2.joinedAt());

        // Verify deduplication across all enrolled communities
        assertEquals(List.of("VIEW_POSTS", "CREATE_COMMENT", "DELETE_POST"), result.permissions());
    }

    @Test
    @DisplayName("getUserEnrolledCommunities returns empty response when user has no enrolled communities")
    public void testGetUserEnrolledCommunities_EmptyMemberships() {
        UUID userId = UUID.randomUUID();
        when(communityMemberRepository.findMembershipsByUserIdWithCommunityAndRole(userId))
                .thenReturn(Collections.emptyList());

        UserCommunitiesResponseDto result = userService.getUserEnrolledCommunities(userId);

        assertNotNull(result);
        assertTrue(result.communities().isEmpty());
        assertTrue(result.permissions().isEmpty());
    }

    @Test
    @DisplayName("getUserEnrolledCommunities handles membership with null role")
    public void testGetUserEnrolledCommunities_NullRole() {
        UUID userId = UUID.randomUUID();
        Community comm = Community.builder()
                .id(UUID.randomUUID())
                .name("General")
                .slug("general")
                .description("General Community")
                .memberCount(10)
                .build();

        CommunityMember member = CommunityMember.builder()
                .community(comm)
                .role(null)
                .joinedAt(OffsetDateTime.now())
                .build();

        when(communityMemberRepository.findMembershipsByUserIdWithCommunityAndRole(userId))
                .thenReturn(List.of(member));
        when(roleService.getPermissionNamesByRoleName(null))
                .thenReturn(Collections.emptyList());

        UserCommunitiesResponseDto result = userService.getUserEnrolledCommunities(userId);

        assertNotNull(result);
        assertEquals(1, result.communities().size());
        assertNull(result.communities().get(0).role());
        assertTrue(result.communities().get(0).permissions().isEmpty());
        assertTrue(result.permissions().isEmpty());
    }
}
