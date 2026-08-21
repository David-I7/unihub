package com.unihub.app.security;

import com.unihub.app.config.AppConfig;
import com.unihub.app.config.SecurityConfig;
import com.unihub.app.controllers.AuthController;
import com.unihub.app.dto.UserDto;
import com.unihub.app.config.SessionProperties;
import com.unihub.app.mappers.ObjectErrorMapper;
import com.unihub.app.mappers.UserMapper;
import com.unihub.app.repositories.auth.SessionRepository;
import com.unihub.app.repositories.auth.UserIdentityRepository;
import com.unihub.app.repositories.auth.UserRepository;
import com.unihub.app.services.JwtService;
import com.unihub.app.services.auth.SessionService;
import com.unihub.app.services.auth.UserIdentityService;
import com.unihub.app.services.auth.UserService;
import com.unihub.app.utils.ProblemDetailUtil;
import jakarta.servlet.FilterChain;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.web.server.ResponseStatusException;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@WebMvcTest(AuthController.class)
@EnableConfigurationProperties(SessionProperties.class)
@Import({
        AppConfig.class,
        SecurityConfig.class,
        OAuth2AuthenticationFailureHandler.class,
        OAuth2AuthenticationSuccessHandler.class,
        JwtSessionManagementFilter.class,
        SessionService.class,
        UserService.class,
        JwtService.class,
        UserMapper.class,
        UserIdentityService.class,
        ObjectErrorMapper.class,
        ProblemDetailUtil.class
})
public class JwtSessionManagementFilterTests {

    @Autowired
    private JwtSessionManagementFilter jwtSessionManagementFilter;

    @MockitoBean
    private SessionService sessionService;

    @MockitoBean
    private ProblemDetailUtil problemDetailUtil;

    @MockitoBean
    private UserRepository userRepository;

    @MockitoBean
    private SessionRepository sessionRepository;

    @MockitoBean
    private UserIdentityRepository userIdentityRepository;

    @AfterEach
    public void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    @DisplayName("""
            Given: request with user already authenticated in SecurityContext
            When: doFilter is invoked
            Then: filter chain proceeds without path validation or authentication
            """)
    public void testFilter_AlreadyAuthenticated_ProceedsFilterChain() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/v1/protected");
        MockHttpServletResponse response = new MockHttpServletResponse();
        FilterChain filterChain = mock(FilterChain.class);

        UserDto userDto = new UserDto(UUID.randomUUID(), "test@gmail.com", "testuser");
        SecurityContextHolder.getContext().setAuthentication(new JwtAuthentication(userDto));

        jwtSessionManagementFilter.doFilter(request, response, filterChain);

        verify(filterChain).doFilter(request, response);
        verifyNoInteractions(sessionService);
    }

    @Test
    @DisplayName("""
            Given: unauthenticated path request (e.g. /api/v1/auth/register/local)
            When: doFilter is invoked
            Then: refreshToken session is validated and filter chain proceeds
            """)
    public void testFilter_UnauthenticatedPath_ProceedsFilterChain() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest("POST", "/api/v1/auth/register/local");
        MockHttpServletResponse response = new MockHttpServletResponse();
        FilterChain filterChain = mock(FilterChain.class);

        jwtSessionManagementFilter.doFilter(request, response, filterChain);

        verify(sessionService).validateRefreshTokenSession(request, response);
        verify(filterChain).doFilter(request, response);
    }

    @Test
    @DisplayName("""
            Given: unauthenticated path request where session validation fails
            When: doFilter is invoked
            Then: problem detail is written and filter chain stops
            """)
    public void testFilter_UnauthenticatedPath_SessionValidationFails_WritesProblemDetail() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest("POST", "/api/v1/auth/register/local");
        MockHttpServletResponse response = new MockHttpServletResponse();
        FilterChain filterChain = mock(FilterChain.class);

        doThrow(new ResponseStatusException(HttpStatus.BAD_REQUEST, "User is already authenticated."))
                .when(sessionService).validateRefreshTokenSession(request, response);

        jwtSessionManagementFilter.doFilter(request, response, filterChain);

        verify(problemDetailUtil).writeProblemDetail(eq(request), eq(response), eq(HttpStatus.BAD_REQUEST), contains("User is already authenticated."));
        verify(filterChain, never()).doFilter(any(), any());
    }

    @Test
    @DisplayName("""
            Given: protected path request without Authorization header
            When: doFilter is invoked
            Then: 401 Unauthorized problem detail is written and filter chain stops
            """)
    public void testFilter_ProtectedPath_MissingAuthHeader_Writes401ProblemDetail() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/v1/courses");
        MockHttpServletResponse response = new MockHttpServletResponse();
        FilterChain filterChain = mock(FilterChain.class);

        jwtSessionManagementFilter.doFilter(request, response, filterChain);

        verify(problemDetailUtil).writeProblemDetail(eq(request), eq(response), eq(HttpStatus.UNAUTHORIZED), eq("Authorization header is missing or invalid."));
        verify(filterChain, never()).doFilter(any(), any());
    }

    @Test
    @DisplayName("""
            Given: protected path request with non-Bearer Authorization header
            When: doFilter is invoked
            Then: 401 Unauthorized problem detail is written and filter chain stops
            """)
    public void testFilter_ProtectedPath_InvalidAuthHeaderPrefix_Writes401ProblemDetail() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/v1/courses");
        request.addHeader(HttpHeaders.AUTHORIZATION, "Basic invalidtoken");
        MockHttpServletResponse response = new MockHttpServletResponse();
        FilterChain filterChain = mock(FilterChain.class);

        jwtSessionManagementFilter.doFilter(request, response, filterChain);

        verify(problemDetailUtil).writeProblemDetail(eq(request), eq(response), eq(HttpStatus.UNAUTHORIZED), eq("Authorization header is missing or invalid."));
        verify(filterChain, never()).doFilter(any(), any());
    }

    @Test
    @DisplayName("""
            Given: protected path request with valid Bearer access token
            When: doFilter is invoked
            Then: SecurityContext is populated with JwtAuthentication and filter chain proceeds
            """)
    public void testFilter_ProtectedPath_ValidAccessToken_AuthenticatesAndProceeds() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/v1/courses");
        request.addHeader(HttpHeaders.AUTHORIZATION, "Bearer valid-token-string");
        MockHttpServletResponse response = new MockHttpServletResponse();
        FilterChain filterChain = mock(FilterChain.class);

        UserDto userDto = new UserDto(UUID.randomUUID(), "user@gmail.com", "validuser");
        when(sessionService.parseAccessToken("valid-token-string")).thenReturn(userDto);

        jwtSessionManagementFilter.doFilter(request, response, filterChain);

        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNotNull();
        assertThat(SecurityContextHolder.getContext().getAuthentication().getPrincipal()).isEqualTo(userDto);
        verify(filterChain).doFilter(request, response);
    }

    @Test
    @DisplayName("""
            Given: protected path request with invalid/expired Bearer access token
            When: doFilter is invoked
            Then: problem detail is written and filter chain stops
            """)
    public void testFilter_ProtectedPath_InvalidAccessToken_WritesProblemDetail() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/v1/courses");
        request.addHeader(HttpHeaders.AUTHORIZATION, "Bearer expired-token");
        MockHttpServletResponse response = new MockHttpServletResponse();
        FilterChain filterChain = mock(FilterChain.class);

        when(sessionService.parseAccessToken("expired-token"))
                .thenThrow(new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid access token."));

        jwtSessionManagementFilter.doFilter(request, response, filterChain);

        verify(problemDetailUtil).writeProblemDetail(eq(request), eq(response), eq(HttpStatus.UNAUTHORIZED), contains("Invalid access token."));
        verify(filterChain, never()).doFilter(any(), any());
    }
}
