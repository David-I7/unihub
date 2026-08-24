package com.unihub.app.security;

import com.unihub.app.config.AppConfig;
import com.unihub.app.config.SecurityConfig;
import com.unihub.app.config.SessionProperties;
import com.unihub.app.controllers.AuthController;
import com.unihub.app.entities.authentication.AuthProvider;
import com.unihub.app.entities.authentication.Session;
import com.unihub.app.entities.authentication.User;
import com.unihub.app.entities.authentication.UserIdentity;
import com.unihub.app.mappers.ObjectErrorMapper;
import com.unihub.app.mappers.UserMapper;
import com.unihub.app.repositories.authentication.SessionRepository;
import com.unihub.app.repositories.authentication.UserIdentityRepository;
import com.unihub.app.entities.authorization.Role;
import com.unihub.app.repositories.authentication.UserRepository;
import com.unihub.app.repositories.authorization.RoleRepository;
import com.unihub.app.services.JwtService;
import com.unihub.app.services.authentication.SessionService;
import com.unihub.app.services.authentication.UserIdentityService;
import com.unihub.app.services.authentication.UserService;
import com.unihub.app.services.authorization.RoleService;
import com.unihub.app.utils.ProblemDetailUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@WebMvcTest(AuthController.class)
@EnableConfigurationProperties(SessionProperties.class)
@Import({
        AppConfig.class,
        SecurityConfig.class,
        OAuth2AuthenticationFailureHandler.class,
        OAuth2AuthenticationSuccessHandler.class,
        OAuth2ProviderUserInfoExtractor.class,
        RoleService.class,
        JwtSessionManagementFilter.class,
        SessionService.class,
        UserService.class,
        JwtService.class,
        UserMapper.class,
        UserIdentityService.class,
        ObjectErrorMapper.class,
        ProblemDetailUtil.class
})
public class OAuth2AuthenticationSuccessHandlerTests {

    private static final String CLIENT_ORIGIN = "http://localhost:5173";

    @Autowired
    private OAuth2AuthenticationSuccessHandler successHandler;

    @MockitoBean
    private UserRepository userRepository;

    @MockitoBean
    private SessionRepository sessionRepository;

    @MockitoBean
    private UserIdentityRepository userIdentityRepository;

    @MockitoBean
    private RoleRepository roleRepository;

    @BeforeEach
    public void setUp() {
        when(roleRepository.findByName(anyString()))
                .thenReturn(Optional.of(Role.builder().name("USER").build()));
    }

    @Test
    @DisplayName("""
            Given: new Google OAuth2 user authentication
            When: onAuthenticationSuccess is invoked
            Then: user and identity are registered, refreshToken cookie is set, and redirected to frontend success URL
            """)
    public void testOAuth2Success_NewUser_RegistersAndRedirectsToSuccess() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest();
        MockHttpServletResponse response = new MockHttpServletResponse();

        String sub = "google-sub-1001";
        String email = "googleuser@gmail.com";

        OAuth2User oauth2User = new DefaultOAuth2User(
                List.of(new SimpleGrantedAuthority("ROLE_USER")),
                Map.of("sub", sub, "email", email, "name", "Google User"),
                "sub"
        );

        OAuth2AuthenticationToken authToken = new OAuth2AuthenticationToken(
                oauth2User,
                oauth2User.getAuthorities(),
                "google"
        );

        when(userIdentityRepository.findByProviderAndProviderSubject(AuthProvider.GOOGLE, sub))
                .thenReturn(Optional.empty());
        when(userRepository.findByEmail(email))
                .thenReturn(Optional.empty());
        when(userRepository.save(any(User.class)))
                .thenAnswer(i -> {
                    User u = i.getArgument(0);
                    u.setId(UUID.randomUUID());
                    return u;
                });
        when(userIdentityRepository.save(any(UserIdentity.class)))
                .thenAnswer(i -> i.getArgument(0));
        when(sessionRepository.save(any(Session.class)))
                .thenAnswer(i -> {
                    Session s = i.getArgument(0);
                    s.setId(UUID.randomUUID());
                    return s;
                });

        successHandler.onAuthenticationSuccess(request, response, authToken);

        assertThat(response.getHeader("Set-Cookie")).contains("refreshToken=");
        assertThat(response.getRedirectedUrl()).isEqualTo(CLIENT_ORIGIN + "/oauth2/success?provider=GOOGLE");

        verify(userRepository).save(any(User.class));
        verify(userIdentityRepository).save(any(UserIdentity.class));
        verify(sessionRepository).save(any(Session.class));
    }

    @Test
    @DisplayName("""
            Given: existing Google OAuth2 user authentication
            When: onAuthenticationSuccess is invoked
            Then: session is created, refreshToken cookie is set, and redirected to frontend success URL
            """)
    public void testOAuth2Success_ExistingUser_LoginsAndRedirectsToSuccess() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest();
        MockHttpServletResponse response = new MockHttpServletResponse();

        String sub = "google-sub-1002";
        String email = "existinggoogle@gmail.com";
        UUID userId = UUID.randomUUID();

        User existingUser = User.builder()
                .id(userId)
                .email(email)
                .username("existinggoogle")
                .build();

        UserIdentity identity = UserIdentity.builder()
                .id(UUID.randomUUID())
                .user(existingUser)
                .provider(AuthProvider.GOOGLE)
                .providerSubject(sub)
                .build();

        OAuth2User oauth2User = new DefaultOAuth2User(
                List.of(new SimpleGrantedAuthority("ROLE_USER")),
                Map.of("sub", sub, "email", email),
                "sub"
        );

        OAuth2AuthenticationToken authToken = new OAuth2AuthenticationToken(
                oauth2User,
                oauth2User.getAuthorities(),
                "google"
        );

        when(userIdentityRepository.findByProviderAndProviderSubject(AuthProvider.GOOGLE, sub))
                .thenReturn(Optional.of(identity));
        when(sessionRepository.save(any(Session.class)))
                .thenAnswer(i -> {
                    Session s = i.getArgument(0);
                    s.setId(UUID.randomUUID());
                    return s;
                });

        successHandler.onAuthenticationSuccess(request, response, authToken);

        assertThat(response.getHeader("Set-Cookie")).contains("refreshToken=");
        assertThat(response.getRedirectedUrl()).isEqualTo(CLIENT_ORIGIN + "/oauth2/success?provider=GOOGLE");
        verify(sessionRepository).save(any(Session.class));
    }

    @Test
    @DisplayName("""
            Given: user registered via email/password matching Google OAuth2 email
            When: onAuthenticationSuccess is invoked
            Then: Google identity is linked to existing account, session created, and redirected to success
            """)
    public void testOAuth2Success_LinkExistingLocalAccount() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest();
        MockHttpServletResponse response = new MockHttpServletResponse();

        String sub = "google-sub-1003";
        String email = "localuser@gmail.com";
        UUID userId = UUID.randomUUID();

        User existingLocalUser = User.builder()
                .id(userId)
                .email(email)
                .username("localuser")
                .password("encodedpassword")
                .build();

        OAuth2User oauth2User = new DefaultOAuth2User(
                List.of(new SimpleGrantedAuthority("ROLE_USER")),
                Map.of("sub", sub, "email", email),
                "sub"
        );

        OAuth2AuthenticationToken authToken = new OAuth2AuthenticationToken(
                oauth2User,
                oauth2User.getAuthorities(),
                "google"
        );

        when(userIdentityRepository.findByProviderAndProviderSubject(AuthProvider.GOOGLE, sub))
                .thenReturn(Optional.empty());
        when(userRepository.findByEmail(email))
                .thenReturn(Optional.of(existingLocalUser));
        when(userIdentityRepository.save(any(UserIdentity.class)))
                .thenAnswer(i -> i.getArgument(0));
        when(sessionRepository.save(any(Session.class)))
                .thenAnswer(i -> {
                    Session s = i.getArgument(0);
                    s.setId(UUID.randomUUID());
                    return s;
                });

        successHandler.onAuthenticationSuccess(request, response, authToken);

        assertThat(response.getHeader("Set-Cookie")).contains("refreshToken=");
        assertThat(response.getRedirectedUrl()).isEqualTo(CLIENT_ORIGIN + "/oauth2/success?provider=GOOGLE");

        verify(userIdentityRepository).save(any(UserIdentity.class));
        verify(sessionRepository).save(any(Session.class));
    }

    @Test
    @DisplayName("""
            Given: OAuth2 authentication exception or missing provider parameters
            When: onAuthenticationSuccess is invoked with invalid parameters
            Then: error is caught and redirected to frontend failure URL
            """)
    public void testOAuth2Success_Exception_RedirectsToFailure() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest();
        MockHttpServletResponse response = new MockHttpServletResponse();

        OAuth2User oauth2User = new DefaultOAuth2User(
                List.of(new SimpleGrantedAuthority("ROLE_USER")),
                Map.of("email", "no-sub@gmail.com"),
                "email"
        );

        OAuth2AuthenticationToken authToken = new OAuth2AuthenticationToken(
                oauth2User,
                oauth2User.getAuthorities(),
                "invalid_provider"
        );

        successHandler.onAuthenticationSuccess(request, response, authToken);

        assertThat(response.getRedirectedUrl()).isEqualTo(CLIENT_ORIGIN + "/oauth2/failure?provider=INVALID_PROVIDER");
    }

    @Test
    @DisplayName("""
            Given: isDevelopment is false
            When: onAuthenticationSuccess is invoked
            Then: user is redirected to current context path + '/oauth2/success'
            """)
    public void testOAuth2Success_WhenIsDevelopmentFalse_RedirectsToContextPathSuccessUrl() throws Exception {
        ReflectionTestUtils.setField(successHandler, "isDevelopment", false);

        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setServerName("unihub.com");
        request.setServerPort(80);
        MockHttpServletResponse response = new MockHttpServletResponse();

        RequestContextHolder.setRequestAttributes(
                new ServletRequestAttributes(request)
        );

        String sub = "google-sub-2001";
        String email = "produser@gmail.com";
        UUID userId = UUID.randomUUID();

        User existingUser = User.builder().id(userId).email(email).username("produser").build();
        UserIdentity identity = UserIdentity.builder().id(UUID.randomUUID()).user(existingUser).provider(AuthProvider.GOOGLE).providerSubject(sub).build();

        OAuth2User oauth2User = new DefaultOAuth2User(List.of(new SimpleGrantedAuthority("ROLE_USER")), Map.of("sub", sub, "email", email), "sub");
        OAuth2AuthenticationToken authToken = new OAuth2AuthenticationToken(oauth2User, oauth2User.getAuthorities(), "google");

        when(userIdentityRepository.findByProviderAndProviderSubject(AuthProvider.GOOGLE, sub)).thenReturn(Optional.of(identity));
        when(sessionRepository.save(any(Session.class))).thenAnswer(i -> {
            Session s = i.getArgument(0);
            s.setId(UUID.randomUUID());
            return s;
        });

        try {
            successHandler.onAuthenticationSuccess(request, response, authToken);
            assertThat(response.getRedirectedUrl()).isEqualTo("http://unihub.com/oauth2/success?provider=GOOGLE");
        } finally {
            RequestContextHolder.resetRequestAttributes();
            ReflectionTestUtils.setField(successHandler, "isDevelopment", true);
        }
    }
}
