package com.unihub.app.controllers;

import com.unihub.app.config.AppConfig;
import com.unihub.app.config.SecurityConfig;
import com.unihub.app.config.SessionProperties;
import com.unihub.app.dto.auth.LocalRegisterRequestDto;
import com.unihub.app.dto.auth.LocalUsernameOrEmailLoginRequestDto;
import com.unihub.app.exceptions.GlobalExceptionHandler;
import com.unihub.app.entities.authentication.Session;
import com.unihub.app.entities.authentication.User;
import com.unihub.app.entities.authentication.UserIdentity;
import com.unihub.app.mappers.ObjectErrorMapper;
import com.unihub.app.mappers.UserMapper;
import com.unihub.app.repositories.authentication.SessionRepository;
import com.unihub.app.repositories.authentication.UserIdentityRepository;
import com.unihub.app.repositories.authentication.UserRepository;
import com.unihub.app.security.JwtSessionManagementFilter;
import com.unihub.app.security.OAuth2AuthenticationFailureHandler;
import com.unihub.app.security.OAuth2AuthenticationSuccessHandler;
import com.unihub.app.services.JwtService;
import com.unihub.app.services.auth.SessionService;
import com.unihub.app.services.auth.UserIdentityService;
import com.unihub.app.services.auth.UserService;
import com.unihub.app.utils.ProblemDetailUtil;
import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import tools.jackson.databind.ObjectMapper;

import java.time.OffsetDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import static org.hamcrest.Matchers.containsString;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

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
        ProblemDetailUtil.class,
        GlobalExceptionHandler.class
})
public class AuthControllerTests {

    private static final String BASE_URL = "/api/v1/auth";

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private SessionProperties sessionProperties;

    @MockitoBean
    private UserRepository userRepository;

    @MockitoBean
    private SessionRepository sessionRepository;

    @MockitoBean
    private UserIdentityRepository userIdentityRepository;

    // =========================================================================
    // POST /api/v1/auth/register/local
    // =========================================================================

    @Test
    @DisplayName("""
            Given: unauthenticated user
            When: /register/local endpoint is called with valid and unique credentials
            Then: 201 created is returned with session response and set-cookie
            """)
    public void testRegisterLocal_Success() throws Exception {
        when(userRepository.findByUsernameOrEmail(anyString(), anyString())).thenReturn(Collections.emptyList());
        when(userRepository.save(any(User.class)))
                .thenAnswer(invocation -> {
                    User user = invocation.getArgument(0, User.class);
                    user.setId(UUID.randomUUID());
                    return user;
                });
        when(userIdentityRepository.save(any(UserIdentity.class))).thenAnswer(i -> i.getArgument(0));
        when(sessionRepository.save(any(Session.class))).thenAnswer(i -> {
            Session s = i.getArgument(0);
            s.setId(UUID.randomUUID());
            return s;
        });

        var request = new LocalRegisterRequestDto("test@gmail.com", "testuser", "12345678");

        mockMvc.perform(post(BASE_URL + "/register/local")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(header().string("Location", containsString("/api/v1/auth/refresh")))
                .andExpect(jsonPath("$.user.id").exists())
                .andExpect(jsonPath("$.user.username").value(request.getUsername()))
                .andExpect(jsonPath("$.user.email").value(request.getEmail()))
                .andExpect(jsonPath("$.accessToken").exists())
                .andExpect(cookie().exists("refreshToken"));

        verify(userRepository).save(any(User.class));
        verify(userIdentityRepository).save(any(UserIdentity.class));
        verify(sessionRepository).save(any(Session.class));
    }

    @Test
    @DisplayName("""
            Given: unauthenticated user
            When: /register/local endpoint is called with an existing username
            Then: 409 conflict is returned
            """)
    public void testRegisterLocal_Conflict_UsernameTaken() throws Exception {
        when(userRepository.findByUsernameOrEmail(anyString(), anyString()))
                .thenReturn(List.of(User.builder()
                        .username("testuser")
                        .id(UUID.randomUUID())
                        .email("other@gmail.com")
                        .build()));

        var request = new LocalRegisterRequestDto("test@gmail.com", "testuser", "12345678");

        mockMvc.perform(post(BASE_URL + "/register/local")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.detail").value("Username is already taken"));
    }

    @Test
    @DisplayName("""
            Given: unauthenticated user
            When: /register/local endpoint is called with an existing email
            Then: 409 conflict is returned
            """)
    public void testRegisterLocal_Conflict_EmailTaken() throws Exception {
        when(userRepository.findByUsernameOrEmail(anyString(), anyString()))
                .thenReturn(List.of(User.builder()
                        .email("test@gmail.com")
                        .id(UUID.randomUUID())
                        .username("otheruser")
                        .build()));

        var request = new LocalRegisterRequestDto("test@gmail.com", "testuser", "12345678");

        mockMvc.perform(post(BASE_URL + "/register/local")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.detail").value("Email is already taken"));
    }

    @Test
    @DisplayName("""
            Given: unauthenticated user
            When: /register/local endpoint is called with both an existing email and username across 2 users
            Then: 409 conflict is returned
            """)
    public void testRegisterLocal_Conflict_UsernameAndEmailTaken() throws Exception {
        when(userRepository.findByUsernameOrEmail(anyString(), anyString()))
                .thenReturn(List.of(
                        User.builder().email("test@gmail.com").id(UUID.randomUUID()).username("user1").build(),
                        User.builder().email("other@gmail.com").id(UUID.randomUUID()).username("testuser").build()
                ));

        var request = new LocalRegisterRequestDto("test@gmail.com", "testuser", "12345678");

        mockMvc.perform(post(BASE_URL + "/register/local")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.detail").value("Username and email are already taken"));
    }

    @Test
    @DisplayName("""
            Given: unauthenticated user
            When: /register/local endpoint is called with invalid email format
            Then: 400 bad request is returned
            """)
    public void testRegisterLocal_ValidationError_InvalidEmail() throws Exception {
        var request = new LocalRegisterRequestDto("invalid-email", "testuser", "12345678");

        mockMvc.perform(post(BASE_URL + "/register/local")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors").exists());
    }

    @Test
    @DisplayName("""
            Given: unauthenticated user
            When: /register/local endpoint is called with invalid username format
            Then: 400 bad request is returned
            """)
    public void testRegisterLocal_ValidationError_InvalidUsername() throws Exception {
        var request = new LocalRegisterRequestDto("test@gmail.com", "-invalid-user-", "12345678");

        mockMvc.perform(post(BASE_URL + "/register/local")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors").exists());
    }

    @Test
    @DisplayName("""
            Given: unauthenticated user
            When: /register/local endpoint is called with a password shorter than 8 characters
            Then: 400 bad request is returned
            """)
    public void testRegisterLocal_ValidationError_ShortPassword() throws Exception {
        var request = new LocalRegisterRequestDto("test@gmail.com", "testuser", "12345");

        mockMvc.perform(post(BASE_URL + "/register/local")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors").exists());
    }

    @Test
    @DisplayName("""
            Given: authenticated user with active session cookie
            When: /register/local endpoint is called
            Then: 400 bad request is returned because user is already authenticated
            """)
    public void testRegisterLocal_AlreadyAuthenticated() throws Exception {
        UUID userId = UUID.randomUUID();
        User user = User.builder().id(userId).email("active@gmail.com").username("activeuser").build();
        String token = jwtService.generateToken(userId.toString(), Map.of(), sessionProperties.refreshTokenExpirationSec());

        Session activeSession = Session.builder()
                .id(UUID.randomUUID())
                .user(user)
                .refreshToken(token)
                .revoked(false)
                .expiresAt(OffsetDateTime.now().plusDays(1))
                .build();

        when(sessionRepository.findByRefreshToken(token)).thenReturn(Optional.of(activeSession));

        var request = new LocalRegisterRequestDto("test@gmail.com", "testuser", "12345678");

        mockMvc.perform(post(BASE_URL + "/register/local")
                        .cookie(new Cookie("refreshToken", token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.detail").value(containsString("User is already authenticated.")));
    }

    // =========================================================================
    // POST /api/v1/auth/login/local
    // =========================================================================

    @Test
    @DisplayName("""
            Given: registered user
            When: /login/local endpoint is called with valid username and password
            Then: 200 ok is returned with session response and set-cookie
            """)
    public void testLoginLocal_Success_WithUsername() throws Exception {
        String rawPassword = "password123";
        String encodedPassword = passwordEncoder.encode(rawPassword);
        User existingUser = User.builder()
                .id(UUID.randomUUID())
                .username("testuser")
                .email("test@gmail.com")
                .password(encodedPassword)
                .build();

        when(userRepository.findByUsernameOrEmail("testuser", null)).thenReturn(List.of(existingUser));
        when(sessionRepository.save(any(Session.class))).thenAnswer(i -> {
            Session s = i.getArgument(0);
            s.setId(UUID.randomUUID());
            return s;
        });

        var request = new LocalUsernameOrEmailLoginRequestDto(null, "testuser", rawPassword);

        mockMvc.perform(post(BASE_URL + "/login/local")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.user.username").value("testuser"))
                .andExpect(jsonPath("$.user.email").value("test@gmail.com"))
                .andExpect(jsonPath("$.accessToken").exists())
                .andExpect(cookie().exists("refreshToken"));
    }

    @Test
    @DisplayName("""
            Given: registered user
            When: /login/local endpoint is called with valid email and password
            Then: 200 ok is returned with session response and set-cookie
            """)
    public void testLoginLocal_Success_WithEmail() throws Exception {
        String rawPassword = "password123";
        String encodedPassword = passwordEncoder.encode(rawPassword);
        User existingUser = User.builder()
                .id(UUID.randomUUID())
                .username("testuser")
                .email("test@gmail.com")
                .password(encodedPassword)
                .build();

        when(userRepository.findByUsernameOrEmail(null, "test@gmail.com")).thenReturn(List.of(existingUser));
        when(sessionRepository.save(any(Session.class))).thenAnswer(i -> {
            Session s = i.getArgument(0);
            s.setId(UUID.randomUUID());
            return s;
        });

        var request = new LocalUsernameOrEmailLoginRequestDto("test@gmail.com", null, rawPassword);

        mockMvc.perform(post(BASE_URL + "/login/local")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.user.email").value("test@gmail.com"))
                .andExpect(jsonPath("$.accessToken").exists())
                .andExpect(cookie().exists("refreshToken"));
    }

    @Test
    @DisplayName("""
            Given: non-existent user
            When: /login/local endpoint is called
            Then: 404 not found is returned
            """)
    public void testLoginLocal_UserNotFound() throws Exception {
        when(userRepository.findByUsernameOrEmail(any(), any())).thenReturn(Collections.emptyList());

        var request = new LocalUsernameOrEmailLoginRequestDto("nonexistent@gmail.com", null, "password123");

        mockMvc.perform(post(BASE_URL + "/login/local")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.detail").value("User not found"));
    }

    @Test
    @DisplayName("""
            Given: user registered via third-party provider (null password)
            When: /login/local endpoint is called
            Then: 400 bad request is returned with password error message
            """)
    public void testLoginLocal_AccountWithoutPassword() throws Exception {
        User oauthUser = User.builder()
                .id(UUID.randomUUID())
                .username("oauthuser")
                .email("oauth@gmail.com")
                .password(null)
                .build();

        when(userRepository.findByUsernameOrEmail("oauthuser", null)).thenReturn(List.of(oauthUser));

        var request = new LocalUsernameOrEmailLoginRequestDto(null, "oauthuser", "password123");

        mockMvc.perform(post(BASE_URL + "/login/local")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.detail").value("This account does not have a password. Login using a third-party provider and set a password to use this feature."));
    }

    @Test
    @DisplayName("""
            Given: registered user
            When: /login/local endpoint is called with incorrect password
            Then: 401 unauthorized is returned
            """)
    public void testLoginLocal_IncorrectPassword() throws Exception {
        String encodedPassword = passwordEncoder.encode("correctpassword");
        User existingUser = User.builder()
                .id(UUID.randomUUID())
                .username("testuser")
                .email("test@gmail.com")
                .password(encodedPassword)
                .build();

        when(userRepository.findByUsernameOrEmail("testuser", null)).thenReturn(List.of(existingUser));

        var request = new LocalUsernameOrEmailLoginRequestDto(null, "testuser", "wrongpassword");

        mockMvc.perform(post(BASE_URL + "/login/local")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.detail").value("Incorrect password"));
    }

    @Test
    @DisplayName("""
            Given: unauthenticated user
            When: /login/local endpoint is called without username and email
            Then: 400 bad request is returned
            """)
    public void testLoginLocal_ValidationError_MissingUsernameAndEmail() throws Exception {
        var request = new LocalUsernameOrEmailLoginRequestDto(null, null, "password123");

        mockMvc.perform(post(BASE_URL + "/login/local")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors").exists());
    }

    @Test
    @DisplayName("""
            Given: user with active session cookie
            When: /login/local endpoint is called
            Then: 400 bad request is returned because user is already authenticated
            """)
    public void testLoginLocal_AlreadyAuthenticated() throws Exception {
        UUID userId = UUID.randomUUID();
        User user = User.builder().id(userId).email("active@gmail.com").username("activeuser").build();
        String token = jwtService.generateToken(userId.toString(), Map.of(), sessionProperties.refreshTokenExpirationSec());

        Session activeSession = Session.builder()
                .id(UUID.randomUUID())
                .user(user)
                .refreshToken(token)
                .revoked(false)
                .expiresAt(OffsetDateTime.now().plusDays(1))
                .build();

        when(sessionRepository.findByRefreshToken(token)).thenReturn(Optional.of(activeSession));

        var request = new LocalUsernameOrEmailLoginRequestDto("active@gmail.com", null, "password123");

        mockMvc.perform(post(BASE_URL + "/login/local")
                        .cookie(new Cookie("refreshToken", token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.detail").value(containsString("User is already authenticated.")));
    }

    // =========================================================================
    // POST /api/v1/auth/logout
    // =========================================================================

    @Test
    @DisplayName("""
            Given: authenticated user with active refresh token cookie
            When: /logout endpoint is called
            Then: 200 ok is returned, cookie is cleared, and session family is revoked
            """)
    public void testLogout_Success() throws Exception {
        UUID userId = UUID.randomUUID();
        UUID initialSessionId = UUID.randomUUID();
        User user = User.builder().id(userId).email("user@gmail.com").username("user").build();
        String token = jwtService.generateToken(userId.toString(), Map.of(), sessionProperties.refreshTokenExpirationSec());

        Session session = Session.builder()
                .id(UUID.randomUUID())
                .initialSessionId(initialSessionId)
                .user(user)
                .refreshToken(token)
                .revoked(false)
                .expiresAt(OffsetDateTime.now().plusDays(5))
                .build();

        when(sessionRepository.findByRefreshToken(token)).thenReturn(Optional.of(session));

        mockMvc.perform(post(BASE_URL + "/logout")
                        .cookie(new Cookie("refreshToken", token)))
                .andExpect(status().isOk())
                .andExpect(cookie().maxAge("refreshToken", 0));

        verify(sessionRepository).revokeSessionFamily(initialSessionId);
    }

    @Test
    @DisplayName("""
            Given: request without refresh token cookie
            When: /logout endpoint is called
            Then: 401 unauthorized is returned
            """)
    public void testLogout_MissingRefreshToken() throws Exception {
        mockMvc.perform(post(BASE_URL + "/logout"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.detail").value("No refresh token found."));
    }

    @Test
    @DisplayName("""
            Given: request with valid JWT token not found in database
            When: /logout endpoint is called
            Then: 401 unauthorized is returned and cookie is cleared
            """)
    public void testLogout_InvalidRefreshToken_NotFoundInDb() throws Exception {
        UUID userId = UUID.randomUUID();
        String token = jwtService.generateToken(userId.toString(), Map.of(), sessionProperties.refreshTokenExpirationSec());

        when(sessionRepository.findByRefreshToken(token)).thenReturn(Optional.empty());

        mockMvc.perform(post(BASE_URL + "/logout")
                        .cookie(new Cookie("refreshToken", token)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.detail").value("Refresh token is invalid."))
                .andExpect(cookie().maxAge("refreshToken", 0));
    }

    @Test
    @DisplayName("""
            Given: request with revoked refresh token (token reuse)
            When: /logout endpoint is called
            Then: 401 unauthorized is returned, session family is revoked, and cookie is cleared
            """)
    public void testLogout_RevokedRefreshToken_ReuseDetected() throws Exception {
        UUID userId = UUID.randomUUID();
        UUID initialSessionId = UUID.randomUUID();
        User user = User.builder().id(userId).email("user@gmail.com").username("user").build();
        String token = jwtService.generateToken(userId.toString(), Map.of(), sessionProperties.refreshTokenExpirationSec());

        Session revokedSession = Session.builder()
                .id(UUID.randomUUID())
                .initialSessionId(initialSessionId)
                .user(user)
                .refreshToken(token)
                .revoked(true)
                .expiresAt(OffsetDateTime.now().plusDays(1))
                .build();

        when(sessionRepository.findByRefreshToken(token)).thenReturn(Optional.of(revokedSession));

        mockMvc.perform(post(BASE_URL + "/logout")
                        .cookie(new Cookie("refreshToken", token)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.detail").value("Refresh token is invalid."))
                .andExpect(cookie().maxAge("refreshToken", 0));

        verify(sessionRepository).revokeSessionFamily(initialSessionId);
    }

    @Test
    @DisplayName("""
            Given: request with expired refresh token
            When: /logout endpoint is called
            Then: 401 unauthorized is returned and cookie is cleared
            """)
    public void testLogout_ExpiredRefreshToken() throws Exception {
        UUID userId = UUID.randomUUID();
        String token = jwtService.generateToken(userId.toString(), Map.of(), -100);

        mockMvc.perform(post(BASE_URL + "/logout")
                        .cookie(new Cookie("refreshToken", token)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.detail").value("Refresh token is invalid."))
                .andExpect(cookie().maxAge("refreshToken", 0));
    }

    @Test
    @DisplayName("""
            Given: request with malformed refresh token
            When: /logout endpoint is called
            Then: 401 unauthorized is returned and cookie is cleared
            """)
    public void testLogout_MalformedRefreshToken() throws Exception {
        mockMvc.perform(post(BASE_URL + "/logout")
                        .cookie(new Cookie("refreshToken", "invalid-token-string")))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.detail").value("Refresh token is invalid."))
                .andExpect(cookie().maxAge("refreshToken", 0));
    }

    // =========================================================================
    // POST /api/v1/auth/refresh
    // =========================================================================

    @Test
    @DisplayName("""
            Given: user with valid active refresh token cookie
            When: /refresh endpoint is called
            Then: 200 ok is returned with new access token and user DTO
            """)
    public void testRefresh_Success_ActiveSession() throws Exception {
        UUID userId = UUID.randomUUID();
        User user = User.builder().id(userId).email("user@gmail.com").username("user").build();
        String token = jwtService.generateToken(userId.toString(), Map.of(), sessionProperties.refreshTokenExpirationSec());

        Session session = Session.builder()
                .id(UUID.randomUUID())
                .user(user)
                .refreshToken(token)
                .revoked(false)
                .expiresAt(OffsetDateTime.now().plusDays(5))
                .build();

        when(sessionRepository.findByRefreshToken(token)).thenReturn(Optional.of(session));

        mockMvc.perform(post(BASE_URL + "/refresh")
                        .cookie(new Cookie("refreshToken", token)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.user.id").value(userId.toString()))
                .andExpect(jsonPath("$.user.username").value("user"))
                .andExpect(jsonPath("$.user.email").value("user@gmail.com"))
                .andExpect(jsonPath("$.accessToken").exists());
    }

    @Test
    @DisplayName("""
            Given: user with refresh token cookie requiring rotation
            When: /refresh endpoint is called
            Then: 200 ok is returned with new access token, user DTO, and updated set-cookie header
            """)
    public void testRefresh_Success_RotateRequired() throws Exception {
        UUID userId = UUID.randomUUID();
        User user = User.builder().id(userId).email("user@gmail.com").username("user").build();
        String token = jwtService.generateToken(userId.toString(), Map.of(), sessionProperties.refreshTokenExpirationSec());

        Session session = Session.builder()
                .id(UUID.randomUUID())
                .user(user)
                .refreshToken(token)
                .revoked(false)
                .expiresAt(OffsetDateTime.now().plusHours(12))
                .build();

        when(sessionRepository.findByRefreshToken(token)).thenReturn(Optional.of(session));
        when(sessionRepository.save(any(Session.class))).thenAnswer(i -> {
            Session s = i.getArgument(0);
            if (s.getId() == null) s.setId(UUID.randomUUID());
            return s;
        });

        mockMvc.perform(post(BASE_URL + "/refresh")
                        .cookie(new Cookie("refreshToken", token)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.user.id").value(userId.toString()))
                .andExpect(jsonPath("$.user.username").value("user"))
                .andExpect(jsonPath("$.accessToken").exists())
                .andExpect(cookie().exists("refreshToken"));

        verify(sessionRepository, times(2)).save(any(Session.class));
    }

    @Test
    @DisplayName("""
            Given: request without refresh token cookie
            When: /refresh endpoint is called
            Then: 401 unauthorized is returned
            """)
    public void testRefresh_MissingRefreshToken() throws Exception {
        mockMvc.perform(post(BASE_URL + "/refresh"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.detail").value("No refresh token found."));
    }

    @Test
    @DisplayName("""
            Given: request with valid JWT token not found in database
            When: /refresh endpoint is called
            Then: 401 unauthorized is returned and cookie is cleared
            """)
    public void testRefresh_InvalidRefreshToken_NotFoundInDb() throws Exception {
        UUID userId = UUID.randomUUID();
        String token = jwtService.generateToken(userId.toString(), Map.of(), sessionProperties.refreshTokenExpirationSec());

        when(sessionRepository.findByRefreshToken(token)).thenReturn(Optional.empty());

        mockMvc.perform(post(BASE_URL + "/refresh")
                        .cookie(new Cookie("refreshToken", token)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.detail").value("Refresh token is invalid."))
                .andExpect(cookie().maxAge("refreshToken", 0));
    }

    @Test
    @DisplayName("""
            Given: request with revoked refresh token (token reuse)
            When: /refresh endpoint is called
            Then: 401 unauthorized is returned and session family is revoked
            """)
    public void testRefresh_RevokedRefreshToken_ReuseDetected() throws Exception {
        UUID userId = UUID.randomUUID();
        UUID initialSessionId = UUID.randomUUID();
        User user = User.builder().id(userId).email("user@gmail.com").username("user").build();
        String token = jwtService.generateToken(userId.toString(), Map.of(), sessionProperties.refreshTokenExpirationSec());

        Session revokedSession = Session.builder()
                .id(UUID.randomUUID())
                .initialSessionId(initialSessionId)
                .user(user)
                .refreshToken(token)
                .revoked(true)
                .expiresAt(OffsetDateTime.now().plusDays(1))
                .build();

        when(sessionRepository.findByRefreshToken(token)).thenReturn(Optional.of(revokedSession));

        mockMvc.perform(post(BASE_URL + "/refresh")
                        .cookie(new Cookie("refreshToken", token)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.detail").value("Refresh token is invalid."))
                .andExpect(cookie().maxAge("refreshToken", 0));

        verify(sessionRepository).revokeSessionFamily(initialSessionId);
    }

    @Test
    @DisplayName("""
            Given: request with expired refresh token
            When: /refresh endpoint is called
            Then: 401 unauthorized is returned and cookie is cleared
            """)
    public void testRefresh_ExpiredRefreshToken() throws Exception {
        UUID userId = UUID.randomUUID();
        String token = jwtService.generateToken(userId.toString(), Map.of(), -100);

        mockMvc.perform(post(BASE_URL + "/refresh")
                        .cookie(new Cookie("refreshToken", token)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.detail").value("Refresh token is invalid."))
                .andExpect(cookie().maxAge("refreshToken", 0));
    }

    @Test
    @DisplayName("""
            Given: request with malformed refresh token
            When: /refresh endpoint is called
            Then: 401 unauthorized is returned and cookie is cleared
            """)
    public void testRefresh_MalformedRefreshToken() throws Exception {
        mockMvc.perform(post(BASE_URL + "/refresh")
                        .cookie(new Cookie("refreshToken", "invalid-token-string")))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.detail").value("Refresh token is invalid."))
                .andExpect(cookie().maxAge("refreshToken", 0));
    }
}
