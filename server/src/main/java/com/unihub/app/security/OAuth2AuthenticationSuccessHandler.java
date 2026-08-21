package com.unihub.app.security;

import com.unihub.app.domain.AuthProvider;
import com.unihub.app.services.auth.SessionService;
import com.unihub.app.services.auth.UserService;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.io.IOException;

@Component
@RequiredArgsConstructor
@Slf4j
public class OAuth2AuthenticationSuccessHandler implements AuthenticationSuccessHandler {

    private final SessionService sessionService;

    private final UserService userService;

    @Value("${app.is-development}")
    private boolean isDevelopment;

    @Value("${app.client-origin}")
    private String clientOrigin;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException, ServletException {

        OAuth2AuthenticationToken token = (OAuth2AuthenticationToken) authentication;
        var principal = token.getPrincipal();
        String origin = isDevelopment ? clientOrigin :
            ServletUriComponentsBuilder
                .fromCurrentContextPath()
                .build()
                .toUriString();

        try {
            AuthProvider provider = AuthProvider.valueOf(token.getAuthorizedClientRegistrationId().toUpperCase());
            String providerUserId = principal.getAttribute("sub");
            String email = principal.getAttribute("email");

            var user = userService.registerOrLoginWithProvider(provider, providerUserId, email);
            var session = sessionService.createSession(user);

            response.setHeader("Set-Cookie",session.cookie().toString());
            response.sendRedirect(origin + "/oauth2/success");

        }catch (Exception e){
            log.error("Error occurred during OAuth2 authentication", e);
            response.sendRedirect(origin + "/oauth2/failure");
        }
    }
}
