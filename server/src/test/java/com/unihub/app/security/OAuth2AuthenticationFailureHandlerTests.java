package com.unihub.app.security;

import com.unihub.app.config.AppConfig;
import com.unihub.app.config.SecurityConfig;
import com.unihub.app.config.SessionProperties;
import com.unihub.app.controllers.AuthController;
import com.unihub.app.exceptions.GlobalExceptionHandler;
import com.unihub.app.mappers.ObjectErrorMapper;
import com.unihub.app.mappers.UserMapper;
import com.unihub.app.repositories.SessionRepository;
import com.unihub.app.repositories.UserIdentityRepository;
import com.unihub.app.repositories.UserRepository;
import com.unihub.app.services.JwtService;
import com.unihub.app.services.SessionService;
import com.unihub.app.services.UserIdentityService;
import com.unihub.app.services.UserService;
import com.unihub.app.utils.ProblemDetailUtil;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import static org.assertj.core.api.Assertions.assertThat;

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
public class OAuth2AuthenticationFailureHandlerTests {

    private static final String CLIENT_ORIGIN = "http://localhost:5173";

    @Autowired
    private OAuth2AuthenticationFailureHandler failureHandler;

    @MockitoBean
    private UserRepository userRepository;

    @MockitoBean
    private SessionRepository sessionRepository;

    @MockitoBean
    private UserIdentityRepository userIdentityRepository;

    @Test
    @DisplayName("""
            Given: isDevelopment is true
            When: onAuthenticationFailure is invoked
            Then: user is redirected to clientOrigin + '/oauth2/failure'
            """)
    public void testOAuth2Failure_WhenIsDevelopmentTrue_RedirectsToClientOriginFailureUrl() throws Exception {
        ReflectionTestUtils.setField(failureHandler, "isDevelopment", true);
        ReflectionTestUtils.setField(failureHandler, "clientOrigin", CLIENT_ORIGIN);

        MockHttpServletRequest request = new MockHttpServletRequest();
        MockHttpServletResponse response = new MockHttpServletResponse();

        failureHandler.onAuthenticationFailure(request, response, new BadCredentialsException("OAuth2 failed"));

        assertThat(response.getRedirectedUrl()).isEqualTo(CLIENT_ORIGIN + "/oauth2/failure");
    }

    @Test
    @DisplayName("""
            Given: isDevelopment is false
            When: onAuthenticationFailure is invoked
            Then: user is redirected to current context path + '/oauth2/failure'
            """)
    public void testOAuth2Failure_WhenIsDevelopmentFalse_RedirectsToContextPathFailureUrl() throws Exception {
        ReflectionTestUtils.setField(failureHandler, "isDevelopment", false);

        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setServerName("unihub.com");
        request.setServerPort(80);
        MockHttpServletResponse response = new MockHttpServletResponse();

        RequestContextHolder.setRequestAttributes(
                new ServletRequestAttributes(request)
        );

        try {
            failureHandler.onAuthenticationFailure(request, response, new BadCredentialsException("OAuth2 failed"));
            assertThat(response.getRedirectedUrl()).isEqualTo("http://unihub.com/oauth2/failure");
        } finally {
            RequestContextHolder.resetRequestAttributes();
            ReflectionTestUtils.setField(failureHandler, "isDevelopment", true);
        }
    }
}
