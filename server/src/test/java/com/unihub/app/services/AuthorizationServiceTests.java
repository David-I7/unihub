package com.unihub.app.services;

import com.unihub.app.dto.UserDto;
import com.unihub.app.security.JwtAuthentication;
import com.unihub.app.services.authorization.AuthorizationService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

public class AuthorizationServiceTests {

    private AuthorizationService authorizationService;

    @BeforeEach
    public void setUp() {
        authorizationService = new AuthorizationService();
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
        UserDto userDto = new UserDto(UUID.randomUUID(), "david@example.com", "david");
        JwtAuthentication auth = new JwtAuthentication(userDto);
        SecurityContextHolder.getContext().setAuthentication(auth);

        JwtAuthentication result = authorizationService.safeRequireAuthentication();
        assertNotNull(result);
        assertEquals(userDto, result.getUserDto());
        assertEquals(userDto, result.getPrincipal());
    }

    @Test
    @DisplayName("requireAuth throws 403 when not authenticated")
    public void testRequireAuth_ThrowsForbiddenWhenNoAuth() {
        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> authorizationService.requireAuthentication()
        );

        assertEquals(HttpStatus.FORBIDDEN, exception.getStatusCode());
        assertEquals("Authentication required", exception.getReason());
    }

    @Test
    @DisplayName("requireAuth returns JwtAuthentication when authenticated")
    public void testRequireAuth_Success() {
        UserDto userDto = new UserDto(UUID.randomUUID(), "david@example.com", "david");
        JwtAuthentication auth = new JwtAuthentication(userDto);
        SecurityContextHolder.getContext().setAuthentication(auth);

        JwtAuthentication result = authorizationService.requireAuthentication();
        assertNotNull(result);
        assertEquals(userDto, result.getUserDto());
    }
}
