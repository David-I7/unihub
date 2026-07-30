package com.unihub.app.security;

import com.unihub.app.dto.UserDto;
import com.unihub.app.services.SessionService;
import com.unihub.app.utils.ProblemDetailUtil;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
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
            boolean valid = isValidRefreshToken(request,response);
            if(!valid) return;
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

    private boolean isValidRefreshToken(HttpServletRequest request, HttpServletResponse response){
        Cookie refreshToken = null;
        if(request.getCookies() != null){
            refreshToken = Arrays.stream(request.getCookies()).filter(cookie->cookie.getName().equals("refreshToken")).findFirst().orElse(null);
        }

        String path = request.getServletPath();

        if(refreshToken != null){
            SessionService.SessionStatus sessionStatus = sessionService.getSessionStatus(refreshToken.getValue());

            if(sessionStatus == SessionService.SessionStatus.REVOKED || sessionStatus == SessionService.SessionStatus.EXPIRED || sessionStatus == SessionService.SessionStatus.MALFORMED || sessionStatus == SessionService.SessionStatus.INVALID){
                ResponseCookie expiredCookie = sessionService.clearSessionCookie();
                expiredCookie.mutate().path(refreshToken.getPath());
                response.setHeader(HttpHeaders.SET_COOKIE,sessionService.clearSessionCookie().toString());

                problemDetailUtil.writeProblemDetail(request,response, HttpStatus.UNAUTHORIZED, "Refresh token is invalid.");
                return false;
            }

            if(sessionStatus == SessionService.SessionStatus.ACTIVE){
                if(path != null && !path.startsWith("/api/v1/auth/refresh") && !path.startsWith("/api/v1/auth/logout")){
                    problemDetailUtil.writeProblemDetail(request,response, HttpStatus.BAD_REQUEST, "User is already authenticated.");
                    return false;
                }
            }
        }
        return true;
    }
}
