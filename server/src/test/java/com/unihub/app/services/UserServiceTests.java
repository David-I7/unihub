package com.unihub.app.services;

import com.unihub.app.config.EmailProperties;
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
import com.unihub.app.repositories.authentication.UserRepository;
import com.unihub.app.events.email.EmailVerificationRequestedEvent;
import com.unihub.app.events.email.PasswordResetRequestedEvent;
import com.unihub.app.events.email.RegisterVerificationRequestedEvent;
import com.unihub.app.events.email.UserDeletedEvent;
import com.unihub.app.events.email.UserWelcomeEvent;
import com.unihub.app.repositories.community.resources.CommunityMemberRepository;
import com.unihub.app.repositories.community.resources.CommunityRepository;
import com.unihub.app.services.authentication.SessionService;
import com.unihub.app.services.authentication.UserIdentityService;
import com.unihub.app.services.authentication.UserService;
import com.unihub.app.services.authentication.VerificationCodeService;
import com.unihub.app.services.authorization.RoleService;
import com.unihub.app.utils.AppUtils;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;
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

    @Mock
    private ApplicationEventPublisher eventPublisher;

    @Mock
    private JwtService jwtService;

    @Mock
    private SessionService sessionService;

    @Mock
    private AppUtils appUtils;

    private UserMapper userMapper;
    private VerificationCodeService verificationCodeService;
    private UserService userService;

    @org.junit.jupiter.api.BeforeEach
    public void setUp() {
        userMapper = new UserMapper(roleService);
        verificationCodeService = new VerificationCodeService();
        EmailProperties emailProperties = new EmailProperties(
                "no-reply@unihub.com",
                "support@unihub.com",
                "notification@unihub.com",
                86400L,
                900L
        );
        userService = new UserService(
                userRepository,
                passwordEncoder,
                userIdentityService,
                roleService,
                communityMemberRepository,
                communityRepository,
                userMapper,
                eventPublisher,
                jwtService,
                sessionService,
                emailProperties,
                appUtils,
                verificationCodeService
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

        UpdateUserProfileRequestDto dto = new UpdateUserProfileRequestDto("new_name");

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
    @DisplayName("updateUserRole updates target user role and invalidates user tokens")
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
        verify(sessionService).invalidateUserTokens(targetId);
    }

    // =========================================================================
    // selfDelete
    // =========================================================================

    @Test
    @DisplayName("selfDelete marks user deletedAt and invalidates tokens when user does not own any communities")
    public void testSelfDelete_Success() {
        UUID userId = UUID.randomUUID();
        User user = User.builder().id(userId).email("user@example.com").username("user").build();

        when(communityRepository.existsByOwnerId(userId)).thenReturn(false);
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));

        userService.selfDelete(userId);

        assertNotNull(user.getDeletedAt());
        verify(userRepository).save(user);
        verify(sessionService).invalidateUserTokens(userId);
        verify(eventPublisher).publishEvent(any(UserDeletedEvent.class));
    }

    // =========================================================================
    // adminDeleteUser
    // =========================================================================

    @Test
    @DisplayName("adminDeleteUser hard-deletes user when not root and not owning communities")
    public void testAdminDeleteUser_Success() {
        UUID userId = UUID.randomUUID();
        UUID userRoleId = UUID.randomUUID();
        UUID rootRoleId = UUID.randomUUID();

        User user = User.builder().id(userId).username("bob").email("bob@example.com").roleId(userRoleId).build();
        Role rootRole = Role.builder().id(rootRoleId).name("ROOT").build();

        when(userRepository.findByUsername("bob")).thenReturn(Optional.of(user));
        when(roleService.getRoleByName(RoleType.ROOT)).thenReturn(rootRole);
        when(communityRepository.existsByOwnerId(userId)).thenReturn(false);

        userService.adminDeleteUser("bob", "Violation of terms");

        verify(sessionService).invalidateUserTokens(userId);
        verify(userRepository).deleteById(userId);
        verify(eventPublisher).publishEvent(any(UserDeletedEvent.class));
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

    // =========================================================================
    // register & confirmEmail & resetPassword
    // =========================================================================

    @Test
    @DisplayName("register publishes RegisterVerificationRequestedEvent when email and username are available")
    public void testRegister_PublishesVerificationEvent() {
        User user = User.builder().email("test@example.com").username("testuser").password("secret123").build();
        when(userRepository.findByUsernameOrEmail("testuser", "test@example.com")).thenReturn(Collections.emptyList());
        when(passwordEncoder.encode("secret123")).thenReturn("encodedSecret");

        userService.register(user);

        verify(eventPublisher).publishEvent(any(RegisterVerificationRequestedEvent.class));
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("confirmRegister saves user and local identity, sets emailVerified true, and publishes UserWelcomeEvent")
    public void testConfirmRegister_Success() {
        verificationCodeService.savePendingRegistration("testuser", "test@example.com", "encodedSecret", "123456");

        when(userRepository.findByUsernameOrEmail("testuser", "test@example.com")).thenReturn(Collections.emptyList());
        Role userRole = Role.builder().id(UUID.randomUUID()).name("USER").build();
        when(roleService.getRoleByName(RoleType.USER)).thenReturn(userRole);
        when(userRepository.save(any(User.class))).thenAnswer(i -> {
            User u = i.getArgument(0);
            u.setId(UUID.randomUUID());
            return u;
        });

        User confirmedUser = userService.confirmRegister("test@example.com", "123456");

        assertNotNull(confirmedUser);
        assertEquals("testuser", confirmedUser.getUsername());
        assertEquals("test@example.com", confirmedUser.getEmail());
        assertTrue(confirmedUser.isEmailVerified());
        verify(userIdentityService).save(any());
        verify(eventPublisher).publishEvent(any(UserWelcomeEvent.class));
    }

    @Test
    @DisplayName("requestConfirmEmail publishes EmailVerificationRequestedEvent when user exists and email is not verified")
    public void testRequestConfirmEmail_Success() {
        UUID userId = UUID.randomUUID();
        User user = User.builder().id(userId).email("user@example.com").username("user").emailVerified(false).build();
        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));

        userService.requestConfirmEmail("user@example.com");

        verify(eventPublisher).publishEvent(any(EmailVerificationRequestedEvent.class));
    }

    @Test
    @DisplayName("confirmEmail marks existing user emailVerified true")
    public void testConfirmEmail_Success() {
        verificationCodeService.savePendingEmailVerification("user@example.com", "123456");

        User user = User.builder().id(UUID.randomUUID()).email("user@example.com").username("user").emailVerified(false).build();
        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));

        User updatedUser = userService.confirmEmail("user@example.com", "123456");

        assertNotNull(updatedUser);
        assertTrue(updatedUser.isEmailVerified());
        verify(userRepository).save(user);
    }

    @Test
    @DisplayName("requestPasswordReset publishes PasswordResetRequestedEvent when user exists")
    public void testRequestPasswordReset_Success() {
        UUID userId = UUID.randomUUID();
        User user = User.builder().id(userId).email("user@example.com").username("user").build();
        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));
        when(jwtService.generateToken(eq(userId.toString()), anyMap(), eq(900L))).thenReturn("jwt-reset-token");

        userService.requestPasswordReset("user@example.com");

        verify(eventPublisher).publishEvent(any(PasswordResetRequestedEvent.class));
    }

    @Test
    @DisplayName("resetPassword updates password and revokes all active sessions")
    public void testResetPassword_Success() {
        UUID userId = UUID.randomUUID();
        User user = User.builder().id(userId).email("user@example.com").username("user").password("oldEncoded").build();
        io.jsonwebtoken.Claims claims = mock(io.jsonwebtoken.Claims.class);
        when(claims.get(JwtService.PURPOSE_CLAIM, String.class)).thenReturn(JwtService.PURPOSE_PASSWORD_RESET);
        when(claims.getSubject()).thenReturn(userId.toString());

        when(jwtService.parseClaims("reset-token")).thenReturn(claims);
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(passwordEncoder.encode("newPassword")).thenReturn("newEncoded");

        userService.resetPassword("reset-token", "newPassword");

        assertEquals("newEncoded", user.getPassword());
        verify(userRepository).save(user);
        verify(sessionService).revokeAllUserSessions(userId);
    }

    // =========================================================================
    // login & purgeExpiredDeletedUsers
    // =========================================================================

    @Test
    @DisplayName("login reactivates soft-deleted user when deleted within 30 days")
    public void testLogin_ReactivatesUserWithin30Days() {
        OffsetDateTime deletedAt = OffsetDateTime.now().minusDays(5);
        User userInDb = User.builder()
                .id(UUID.randomUUID())
                .username("john")
                .email("john@example.com")
                .password("encodedPassword")
                .deletedAt(deletedAt)
                .build();
        User loginInput = User.builder().username("john").password("rawPassword").build();

        when(userRepository.findByUsernameOrEmail("john", null)).thenReturn(List.of(userInDb));
        when(passwordEncoder.matches("rawPassword", "encodedPassword")).thenReturn(true);

        User result = userService.login(loginInput);

        assertNotNull(result);
        assertNull(result.getDeletedAt());
        verify(userRepository).save(userInDb);
    }

    @Test
    @DisplayName("login throws 401 when soft-deleted user is older than 30 days")
    public void testLogin_ThrowsWhenDeletedLongerThan30Days() {
        OffsetDateTime deletedAt = OffsetDateTime.now().minusDays(35);
        User userInDb = User.builder()
                .id(UUID.randomUUID())
                .username("john")
                .email("john@example.com")
                .password("encodedPassword")
                .deletedAt(deletedAt)
                .build();
        User loginInput = User.builder().username("john").password("rawPassword").build();

        when(userRepository.findByUsernameOrEmail("john", null)).thenReturn(List.of(userInDb));
        when(passwordEncoder.matches("rawPassword", "encodedPassword")).thenReturn(true);

        ResponseStatusException ex = assertThrows(
                ResponseStatusException.class,
                () -> userService.login(loginInput)
        );

        assertEquals(HttpStatus.UNAUTHORIZED, ex.getStatusCode());
        assertEquals("Account has been deleted.", ex.getReason());
    }

    @Test
    @DisplayName("purgeExpiredDeletedUsers deletes users with deletedAt older than 30 days")
    public void testPurgeExpiredDeletedUsers_DeletesExpiredUsers() {
        User expiredUser = User.builder().id(UUID.randomUUID()).deletedAt(OffsetDateTime.now().minusDays(31)).build();
        when(userRepository.findByDeletedAtIsNotNullAndDeletedAtLessThanEqual(any(OffsetDateTime.class)))
                .thenReturn(List.of(expiredUser));

        userService.purgeExpiredDeletedUsers();

        verify(userRepository).deleteAll(List.of(expiredUser));
    }
}
