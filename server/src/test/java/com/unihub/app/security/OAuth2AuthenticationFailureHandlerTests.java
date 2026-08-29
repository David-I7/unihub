package com.unihub.app.security;

import com.unihub.app.config.AppConfig;
import com.unihub.app.config.SecurityConfig;
import com.unihub.app.config.SessionProperties;
import com.unihub.app.controllers.authentication.AuthController;
import com.unihub.app.exceptions.GlobalExceptionHandler;
import com.unihub.app.mappers.ObjectErrorMapper;
import com.unihub.app.mappers.UserMapper;
import com.unihub.app.repositories.authentication.SessionRepository;
import com.unihub.app.repositories.authentication.UserIdentityRepository;
import com.unihub.app.repositories.authentication.UserRepository;
import com.unihub.app.repositories.authorization.PermissionRepository;
import com.unihub.app.repositories.authorization.RoleRepository;
import com.unihub.app.repositories.community.resources.CommunityMemberRepository;
import com.unihub.app.services.JwtService;
import com.unihub.app.services.authentication.SessionService;
import com.unihub.app.services.authentication.UserIdentityService;
import com.unihub.app.services.authentication.UserService;
import com.unihub.app.services.authorization.RoleService;
import com.unihub.app.utils.ProblemDetailUtil;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import static org.assertj.core.api.Assertions.assertThat;

import com.unihub.app.BaseIntegrationTest;

@AutoConfigureMockMvc
public class OAuth2AuthenticationFailureHandlerTests extends BaseIntegrationTest {

    private static final String CLIENT_ORIGIN = "http://localhost:5173";

    @Autowired
    private OAuth2AuthenticationFailureHandler failureHandler;

    @Autowired
    private com.unihub.app.utils.AppUtils appUtils;

    @Test
    @DisplayName("""
            Given: isDevelopment is true
            When: onAuthenticationFailure is invoked
            Then: user is redirected to clientOrigin + '/oauth2?status=failure&provider=GOOGLE'
            """)
    public void testOAuth2Failure_WhenIsDevelopmentTrue_RedirectsToClientOriginFailureUrl() throws Exception {
        ReflectionTestUtils.setField(appUtils, "developmentProperties", new com.unihub.app.config.DevelopmentProperties(CLIENT_ORIGIN, true));

        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setRequestURI("/api/v1/auth/oauth2/code/google");
        MockHttpServletResponse response = new MockHttpServletResponse();

        failureHandler.onAuthenticationFailure(request, response, new BadCredentialsException("OAuth2 failed"));

        assertThat(response.getRedirectedUrl()).isEqualTo(CLIENT_ORIGIN + "/oauth2?status=failure&provider=GOOGLE");
    }

    @Test
    @DisplayName("""
            Given: isDevelopment is false
            When: onAuthenticationFailure is invoked
            Then: user is redirected to current context path + '/oauth2?status=failure&provider=GOOGLE'
            """)
    public void testOAuth2Failure_WhenIsDevelopmentFalse_RedirectsToContextPathFailureUrl() throws Exception {
        ReflectionTestUtils.setField(appUtils, "developmentProperties", new com.unihub.app.config.DevelopmentProperties(CLIENT_ORIGIN, false));

        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setRequestURI("/api/v1/auth/oauth2/code/google");
        request.setServerName("unihub.com");
        request.setServerPort(80);
        MockHttpServletResponse response = new MockHttpServletResponse();

        RequestContextHolder.setRequestAttributes(
                new ServletRequestAttributes(request)
        );

        try {
            failureHandler.onAuthenticationFailure(request, response, new BadCredentialsException("OAuth2 failed"));
            assertThat(response.getRedirectedUrl()).isEqualTo("http://unihub.com/oauth2?status=failure&provider=GOOGLE");
        } finally {
            RequestContextHolder.resetRequestAttributes();
            ReflectionTestUtils.setField(appUtils, "developmentProperties", new com.unihub.app.config.DevelopmentProperties(CLIENT_ORIGIN, true));
        }
    }
}
