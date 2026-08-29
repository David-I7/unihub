package com.unihub.app.security;

import com.unihub.app.dto.UserDto;
import com.unihub.app.services.authentication.SessionService;
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


@Component
@Slf4j
@RequiredArgsConstructor
public class JwtSessionManagementFilter extends OncePerRequestFilter {

    private final SessionService sessionService;

    private final ProblemDetailUtil problemDetailUtil;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        String requestPath = request.getRequestURI();

        boolean isAuthenticated = SecurityContextHolder.getContext().getAuthentication() != null
                && SecurityContextHolder.getContext().getAuthentication().isAuthenticated();

        if(isAuthenticated){
            // If the user is authenticated, proceed with the request
            filterChain.doFilter(request, response);
            return;
        }

        if(!shouldAuthenticatePath(requestPath)){
            if(shouldNotBeAuthenticated(requestPath)){
                try {
                    SessionService.SessionStatus status =  sessionService.validateRefreshTokenSession(request, response);
                    if(status == SessionService.SessionStatus.ACTIVE || status == SessionService.SessionStatus.ROTATE_REQUIRED){
                        throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"User is already authenticated.");
                    }
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

        if(authHeader == null){
            // Allow anonymous access to resources
            filterChain.doFilter(request,response);
            return;
        }

        if( !authHeader.startsWith("Bearer ")){
            problemDetailUtil.writeProblemDetail(request,response, HttpStatus.UNAUTHORIZED, "Authorization header is missing or invalid.");
            return;
        }

        try{
            String accessToken = authHeader.substring("Bearer ".length());
            UserDto userDto = sessionService.parseAccessToken(accessToken);
            SecurityContextHolder.getContext().setAuthentication(new JwtAuthentication(userDto));
            filterChain.doFilter(request,response);
        }catch (ResponseStatusException e){
            if (e.getStatusCode() == HttpStatus.FORBIDDEN) {
                response.setHeader(HttpHeaders.SET_COOKIE, sessionService.clearSessionCookie().toString());
            }
            problemDetailUtil.writeProblemDetail(request,response, HttpStatus.valueOf(e.getStatusCode().value()), e.getReason() != null ? e.getReason() : e.getMessage());
        }
    }

    private boolean shouldAuthenticatePath(String path){
        return !path.startsWith("/api/v1/auth");
    }

    private boolean shouldNotBeAuthenticated(String path){
        return path.startsWith("/api/v1/auth/login/local") ||
                path.startsWith("/api/v1/auth/register/local") ||
                path.startsWith("/api/v1/auth/confirm-register");
    }
}
