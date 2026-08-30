package com.unihub.app.services;

import com.unihub.app.domain.PermissionType;
import com.unihub.app.domain.RoleType;
import com.unihub.app.dto.UserDto;
import com.unihub.app.entities.authorization.Role;
import com.unihub.app.entities.community.resources.CommunityMember;
import com.unihub.app.repositories.community.resources.CommunityMemberRepository;
import com.unihub.app.security.JwtAuthentication;
import com.unihub.app.services.authorization.AuthorizationService;
import com.unihub.app.services.authorization.RoleService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class AuthorizationServiceTests {

    @Mock
    private CommunityMemberRepository communityMemberRepository;

    @Mock
    private RoleService roleService;

    private AuthorizationService authorizationService;

    @BeforeEach
    public void setUp() {
        authorizationService = new AuthorizationService(communityMemberRepository, roleService);
        SecurityContextHolder.clearContext();
    }

    @AfterEach
    public void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    @DisplayName("safeRequireAuthentication returns null when no authentication exists")
    public void testSafeRequireAuthentication_NoAuth() {
        assertNull(authorizationService.safeRequireAuthentication());
    }

    @Test
    @DisplayName("safeRequireAuthentication returns null when authentication is not JwtAuthentication")
    public void testSafeRequireAuthentication_AnonymousAuth() {
        AnonymousAuthenticationToken anonymous = new AnonymousAuthenticationToken(
                "key",
                "anonymousUser",
                List.of(new SimpleGrantedAuthority("ROLE_ANONYMOUS"))
        );
        SecurityContextHolder.getContext().setAuthentication(anonymous);

        assertNull(authorizationService.safeRequireAuthentication());
    }

    @Test
    @DisplayName("safeRequireAuthentication returns JwtAuthentication when authenticated")
    public void testSafeRequireAuthentication_Success() {
        UserDto userDto = new UserDto(UUID.randomUUID(), "david@example.com", "david", false, RoleType.USER);
        JwtAuthentication auth = new JwtAuthentication(userDto);
        SecurityContextHolder.getContext().setAuthentication(auth);

        JwtAuthentication result = authorizationService.safeRequireAuthentication();
        assertNotNull(result);
        assertEquals(userDto, result.getUserDto());
        assertEquals(userDto, result.getPrincipal());
    }

    @Test
    @DisplayName("requireAuthentication throws 401 when not authenticated")
    public void testRequireAuth_ThrowsUnauthorizedWhenNoAuth() {
        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> authorizationService.requireAuthentication()
        );

        assertEquals(HttpStatus.UNAUTHORIZED, exception.getStatusCode());
        assertEquals("Authentication required", exception.getReason());
    }

    @Test
    @DisplayName("requireAuthentication returns JwtAuthentication when authenticated")
    public void testRequireAuth_Success() {
        UserDto userDto = new UserDto(UUID.randomUUID(), "david@example.com", "david", false, RoleType.USER);
        JwtAuthentication auth = new JwtAuthentication(userDto);
        SecurityContextHolder.getContext().setAuthentication(auth);

        JwtAuthentication result = authorizationService.requireAuthentication();
        assertNotNull(result);
        assertEquals(userDto, result.getUserDto());
    }

    @Test
    @DisplayName("hasGlobalPermission returns true when user has permission")
    public void testHasGlobalPermission_True() {
        UserDto userDto = new UserDto(UUID.randomUUID(), "admin@example.com", "admin", true, RoleType.ADMIN);
        JwtAuthentication auth = new JwtAuthentication(userDto);
        SecurityContextHolder.getContext().setAuthentication(auth);

        when(roleService.getPermissionNamesByRoleType(RoleType.ADMIN)).thenReturn(List.of(PermissionType.VERIFY_COMMUNITY.getValue()));

        assertTrue(authorizationService.hasGlobalPermission(PermissionType.VERIFY_COMMUNITY));
    }

    @Test
    @DisplayName("hasCommunityPermission returns true when member has community permission")
    public void testHasCommunityPermission_True() {
        UUID userId = UUID.randomUUID();
        UUID roleId = UUID.randomUUID();
        CommunityMember member = CommunityMember.builder().roleId(roleId).build();

        UserDto userDto = new UserDto(userId, "member@example.com", "member", true, RoleType.USER);
        JwtAuthentication auth = new JwtAuthentication(userDto);
        SecurityContextHolder.getContext().setAuthentication(auth);

        when(roleService.getPermissionNamesByRoleType(RoleType.USER)).thenReturn(List.of());
        when(communityMemberRepository.findMemberByCommunitySlug("fmi", userId)).thenReturn(Optional.of(member));
        when(roleService.getRoleById(roleId)).thenReturn(Role.builder().id(roleId).name("COMMUNITY_ADMIN").build());
        when(roleService.getPermissionNamesByRoleType(RoleType.COMMUNITY_ADMIN)).thenReturn(List.of(PermissionType.CREATE_MEMBER.getValue()));

        assertTrue(authorizationService.hasCommunityPermission("fmi", userId, PermissionType.CREATE_MEMBER));
    }
}
