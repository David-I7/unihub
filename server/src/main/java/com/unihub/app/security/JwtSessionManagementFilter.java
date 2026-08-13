package com.unihub.app.security;

import com.unihub.app.dto.UserDto;
import com.unihub.app.services.SessionService;
import com.unihub.app.utils.ProblemDetailUtil;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.server.ResponseStatusException;
import java.io.IOException;
import java.util.Arrays;


@Component
@Slf4j
@RequiredArgsConstructor
public class JwtSessionManagementFilter extends OncePerRequestFilter {

    private final SessionService sessionService;

    private final ProblemDetailUtil problemDetailUtil;


    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        String requestPath = request.getServletPath();

        boolean isAuthenticated = SecurityContextHolder.getContext().getAuthentication() != null
                && SecurityContextHolder.getContext().getAuthentication().isAuthenticated();

        if(isAuthenticated){
            // If the user is authenticated, proceed with the request
            filterChain.doFilter(request, response);
            return;
        }

        if(!shouldAuthenticatePath(requestPath)){
            if(!requestPath.startsWith("/api/v1/auth/refresh") && !requestPath.startsWith("/api/v1/auth/logout")){
                try {
                    sessionService.validateRefreshTokenSession(request, response);
                }catch (ResponseStatusException e){
                    problemDetailUtil.writeProblemDetail(request,response, HttpStatus.valueOf(e.getStatusCode().value()), e.getMessage());
                    return;
                }
            }
            filterChain.doFilter(request,response);
            return;
        }

        // Extract user from access token
        String authHeader = request.getHeader(HttpHeaders.AUTHORIZATION);

        if(authHeader == null || !authHeader.startsWith("Bearer ")){
            problemDetailUtil.writeProblemDetail(request,response, HttpStatus.UNAUTHORIZED, "Authorization header is missing or invalid.");
            return;
        }

        try{
            String accessToken = authHeader.substring("Bearer ".length());
            UserDto userDto = sessionService.parseAccessToken(accessToken);
            SecurityContextHolder.getContext().setAuthentication(new JwtAuthentication(userDto));
            filterChain.doFilter(request,response);
        }catch (ResponseStatusException e){
            problemDetailUtil.writeProblemDetail(request,response, HttpStatus.valueOf(e.getStatusCode().value()), e.getMessage());
        }
    }

    private boolean shouldAuthenticatePath(String path){
        return !(path.startsWith("/api/v1/auth/register")
                || path.startsWith("/api/v1/auth/login")
                || path.startsWith("/api/v1/auth/oauth2")
                || path.equals("/api/v1/auth/logout")
                || path.equals("/api/v1/auth/refresh")
                || path.startsWith("/api/v1/auth/oauth2/authorization"));
    }
}
