package com.unihub.app.services.authentication;

import com.unihub.app.config.SessionProperties;
import com.unihub.app.domain.JwtSession;
import com.unihub.app.dto.UserDto;
import com.unihub.app.entities.authentication.Session;
import com.unihub.app.entities.authentication.User;
import com.unihub.app.exceptions.InvalidJwtTokenException;
import com.unihub.app.mappers.UserMapper;
import com.unihub.app.repositories.authentication.SessionRepository;
import com.unihub.app.services.JwtService;
import com.unihub.app.domain.RoleType;
import com.unihub.app.security.TokenRevocationService;
import com.unihub.app.services.authorization.RoleService;
import com.unihub.app.utils.AppUtils;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.MalformedJwtException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.Duration;
import java.time.OffsetDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class SessionService {

    private final AppUtils appUtils;

    private final SessionProperties sessionProperties;

    private final UserMapper userMapper;

    private final JwtService jwtService;

    private final SessionRepository sessionRepository;

    private final RoleService roleService;

    private final TokenRevocationService tokenRevocationService;

    public static enum SessionStatus{
        ACTIVE,REVOKED,MALFORMED,EXPIRED,INVALID,ROTATE_REQUIRED,ABSENT
    }

    public SessionStatus validateRefreshTokenSession(HttpServletRequest request, HttpServletResponse response){
        return _validateRefreshTokenSession(request,response).sessionStatus();
    }

    @Transactional
    public JwtSession createSession(User user) {
        return _createSession(user, null);
    }

    public ResponseCookie clearSessionCookie() {
        var cookie = createSessionCookie("");
        return cookie.mutate().maxAge(0).build();
    }

    @Transactional
    public JwtSession refreshSession(HttpServletRequest request, HttpServletResponse response){
        SessionAndSessionStatus sessionAndSessionStatusStatus = _validateRefreshTokenSession(request,response);
        SessionStatus sessionStatus = sessionAndSessionStatusStatus.sessionStatus();
        Session session = sessionAndSessionStatusStatus.session();

        if(sessionStatus != SessionStatus.ACTIVE && sessionStatus != SessionStatus.ROTATE_REQUIRED && sessionStatus != SessionStatus.ABSENT){
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED,"Refresh token is invalid.");
        } else if (sessionStatus == SessionStatus.ABSENT) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "No refresh token found.");
        }

        if(sessionStatus == SessionStatus.ROTATE_REQUIRED){
            return rotateSession(session);
        }

        // Generate a new access token
        User user = session.getUser();
        String accessToken = createAccessToken(user);
        return new JwtSession(userMapper.toDto(user), accessToken, null);
    }

    public UserDto parseAccessToken(String accessToken) {
        Claims claims = decodeToken(accessToken);
        try {
            UUID userId = UUID.fromString(claims.getSubject());
            Date issuedAt = claims.getIssuedAt();
            if (issuedAt != null && tokenRevocationService.isTokenRevoked(userId, issuedAt.toInstant())) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Administration requires you to login again after some permission changes.");
            }
            String roleStr = claims.get("role", String.class);
            RoleType role = roleStr != null ? RoleType.valueOf(roleStr) : null;
            return new UserDto(
                    userId,
                    claims.get("email", String.class),
                    claims.get("username", String.class),
                    claims.get("emailVerified", Boolean.class),
                    role
            );
        } catch (ResponseStatusException e) {
            throw e;
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid access token.");
        }
    }

    @Transactional
    public ResponseCookie logout(HttpServletRequest request, HttpServletResponse response){
        SessionAndSessionStatus sessionAndSessionStatusStatus = _validateRefreshTokenSession(request, response);
        SessionStatus sessionStatus = sessionAndSessionStatusStatus.sessionStatus();
        Session session = sessionAndSessionStatusStatus.session();

        if(sessionStatus != SessionStatus.ACTIVE && sessionStatus != SessionStatus.ROTATE_REQUIRED && sessionStatus != SessionStatus.ABSENT){
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED,"Refresh token is invalid.");
        } else if (sessionStatus == SessionStatus.ABSENT) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "No refresh token found.");
        }

        sessionRepository.revokeSessionFamily(getSessionFamilyId(session));

        return clearSessionCookie();
    }

    @Transactional
    public void revokeAllUserSessions(UUID userId) {
        sessionRepository.revokeAllByUserId(userId);
    }

    @Transactional
    public void invalidateUserTokens(UUID userId) {
        sessionRepository.revokeAllByUserId(userId);
        tokenRevocationService.revokeUserTokens(userId);
    }

    private UUID getSessionFamilyId(Session session) {
        return session.getInitialSessionId() == null ? session.getId() : session.getInitialSessionId();
    }

    private ResponseCookie createSessionCookie(String refreshToken) {
        return ResponseCookie.from("refreshToken", refreshToken)
                .httpOnly(true)
                .secure(!appUtils.isDevelopment())
                .path("/api/v1/auth")
                .maxAge(Duration.ofSeconds(sessionProperties.refreshTokenExpirationSec()))
                .sameSite(appUtils.isDevelopment() ? "Lax" : "Strict")
                .build();
    }

    private String createAccessToken(User user) {
        String role = user.getRoleId() != null ? roleService.getRoleById(user.getRoleId()).getName() : null;
        Map<String, Object> claims = (role != null)
                ? Map.of("email", user.getEmail(), "username", user.getUsername(), "emailVerified", user.isEmailVerified(), "role", role)
                : Map.of("email", user.getEmail(), "username", user.getUsername(), "emailVerified", user.isEmailVerified());
        return jwtService.generateToken(user.getId().toString(),
                claims,
                sessionProperties.accessTokenExpirationSec());
    }

    private String createRefreshToken(User user) {
        return jwtService.generateToken(user.getId().toString(),
                Map.of(),
                sessionProperties.refreshTokenExpirationSec());
    }

    private JwtSession _createSession(User user, UUID initialSessionId) {
        String refreshToken = createRefreshToken(user);

        OffsetDateTime sessionExpiresAt = OffsetDateTime.now().plusSeconds(sessionProperties.refreshTokenExpirationSec());

        var session = Session.builder()
                .expiresAt(sessionExpiresAt)
                .refreshToken(refreshToken)
                .initialSessionId(initialSessionId)
                .user(user)
                .build();

        sessionRepository.save(session);

        String accessToken = createAccessToken(user);

        return new JwtSession(userMapper.toDto(user), accessToken, createSessionCookie(refreshToken));
    }

    private JwtSession rotateSession(Session oldSession){
        oldSession.setRevoked(true);
        sessionRepository.save(oldSession);
        return _createSession(oldSession.getUser(), getSessionFamilyId(oldSession));
    }

    private SessionAndSessionStatus getSessionAndSessionStatus(String refreshToken){
        Session session = null;
        try {
            jwtService.parseClaims(refreshToken);
            session = getSession(refreshToken);
            if (session == null) return new SessionAndSessionStatus(session, SessionStatus.INVALID);

            if (!session.isRevoked()) {
                if(session.getExpiresAt().isBefore(OffsetDateTime.now().plusSeconds(sessionProperties.refreshTokenRotateWindowSec()))){
                    return new SessionAndSessionStatus(session, SessionStatus.ROTATE_REQUIRED);
                }
                return new SessionAndSessionStatus(session, SessionStatus.ACTIVE);
            }
            else {
                // Token reuse detected. This scenario happens when a user logs in and then immediately logs out and logs in again, or refreshToken was rotated.
                sessionRepository.revokeSessionFamily(getSessionFamilyId(session));
            }return new SessionAndSessionStatus(session, SessionStatus.REVOKED);
        } catch (InvalidJwtTokenException e) {
            if(e.getCause() instanceof ExpiredJwtException) {
                session = getSession(refreshToken);
                if(session != null && session.isRevoked()){
                    // Token reuse detected. This scenario happens when a user logs in and then immediately logs out and logs in again, or refreshToken was rotated.
                    sessionRepository.revokeSessionFamily(getSessionFamilyId(session));
                    return new SessionAndSessionStatus(session, SessionStatus.REVOKED);
                }else if (session != null && !session.isRevoked()){
                    session.setRevoked(true);
                    sessionRepository.save(session);
                    return new SessionAndSessionStatus(session, SessionStatus.EXPIRED);
                }else return new SessionAndSessionStatus(session, SessionStatus.INVALID);
            }else if (e.getCause() instanceof MalformedJwtException){
                return new SessionAndSessionStatus(session, SessionStatus.MALFORMED);
            }else {
                return new SessionAndSessionStatus(session, SessionStatus.INVALID);
            }
        }catch (Exception e){
            return new SessionAndSessionStatus(null, SessionStatus.INVALID);
        }
    }

    private Claims decodeToken(String token){
        try{
            return jwtService.parseClaims(token);
        }catch (InvalidJwtTokenException e){
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED,e.getMessage());
        }
    }

    private Session getSession(String refreshToken){
        return sessionRepository.findByRefreshTokenWithUser(refreshToken).orElse(null);
    }

    private SessionAndSessionStatus _validateRefreshTokenSession(HttpServletRequest request, HttpServletResponse response){
        Cookie refreshToken = null;
        if(request.getCookies() != null){
            refreshToken = Arrays.stream(request.getCookies()).filter(cookie->cookie.getName().equals("refreshToken")).findFirst().orElse(null);
        }

        SessionAndSessionStatus sessionAndSessionStatus = new SessionAndSessionStatus(null, SessionStatus.ABSENT);
        if(refreshToken != null){
            sessionAndSessionStatus = getSessionAndSessionStatus(refreshToken.getValue());
            SessionStatus sessionStatus = sessionAndSessionStatus.sessionStatus();

            if(sessionStatus == SessionStatus.REVOKED || sessionStatus == SessionStatus.EXPIRED || sessionStatus == SessionStatus.MALFORMED || sessionStatus == SessionStatus.INVALID){
                response.setHeader(HttpHeaders.SET_COOKIE,clearSessionCookie().toString());

                throw new ResponseStatusException(HttpStatus.UNAUTHORIZED,"Refresh token is invalid.");
            }
        }
        return sessionAndSessionStatus;
    }

    private record SessionAndSessionStatus(Session session, SessionStatus sessionStatus){
    }

    @Scheduled(cron = "@daily")
    @Transactional
    protected void deleteExpiredSessionFamilies(){
        List<UUID> expiredFamilyIds;
        int deletedCount = 0;
        do {
            expiredFamilyIds = sessionRepository.findExpiredFamilyIds(
                     PageRequest.of(0, 1000)
            );
            if (!expiredFamilyIds.isEmpty()) {
                sessionRepository.deleteByFamilyIds(expiredFamilyIds);
                deletedCount += expiredFamilyIds.size();
            }
        } while (!expiredFamilyIds.isEmpty());
        log.info("Purged {} expired session records.", deletedCount);
    }
}
