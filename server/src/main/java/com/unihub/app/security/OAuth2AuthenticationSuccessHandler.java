package com.unihub.app.security;

import com.unihub.app.entities.authentication.AuthProvider;
import com.unihub.app.services.authentication.SessionService;
import com.unihub.app.services.authentication.UserService;
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
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.io.IOException;
import java.util.Objects;

@Component
@RequiredArgsConstructor
@Slf4j
public class OAuth2AuthenticationSuccessHandler implements AuthenticationSuccessHandler {

    private final SessionService sessionService;

    private final UserService userService;

    private final OAuth2ProviderUserInfoExtractor providerUserInfoExtractor;

    @Value("${app.is-development}")
    private boolean isDevelopment;

    @Value("${app.client-origin}")
    private String clientOrigin;

    @Override
    @Transactional
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException, ServletException {

        OAuth2AuthenticationToken token = (OAuth2AuthenticationToken) authentication;
        String origin = isDevelopment ? clientOrigin :
            ServletUriComponentsBuilder
                .fromCurrentContextPath()
                .build()
                .toUriString();

        try {
            AuthProvider provider = AuthProvider.valueOf(token.getAuthorizedClientRegistrationId().toUpperCase());
            var providerUserInfo = providerUserInfoExtractor.extract(provider, token);

            var user = userService.registerOrLoginWithProvider(provider, providerUserInfo.providerSubjectId(), providerUserInfo.email());
            var session = sessionService.createSession(user);

            response.setHeader("Set-Cookie",session.cookie().toString());
            response.sendRedirect(origin + "/oauth2?status=success&provider=" + provider.name());

        }catch (Exception e){
            log.error("Error occurred during OAuth2 authentication", e);
            response.sendRedirect(origin + "/oauth2?status=failure&provider=" + token.getAuthorizedClientRegistrationId().toUpperCase());
        }
    }
}
