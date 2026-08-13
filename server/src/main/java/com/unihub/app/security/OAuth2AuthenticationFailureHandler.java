package com.unihub.app.security;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.authentication.AuthenticationFailureHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.io.IOException;

@Component
public class OAuth2AuthenticationFailureHandler implements AuthenticationFailureHandler {

    @Value("${app.is-development}")
    private boolean isDevelopment;

    @Value("${app.client-origin}")
    private String clientOrigin;

    @Override
    public void onAuthenticationFailure(HttpServletRequest request, HttpServletResponse response, AuthenticationException exception) throws IOException, ServletException {
        String origin = isDevelopment ? clientOrigin :
                ServletUriComponentsBuilder
                        .fromCurrentContextPath()
                        .build()
                        .toUriString();

        response.sendRedirect(origin + "/oauth2/failure");

    }
}
