package com.unihub.app.services;

import com.unihub.app.config.SessionProperties;
import com.unihub.app.domain.JwtSession;
import com.unihub.app.dto.UserDto;
import com.unihub.app.entities.auth.AuthProvider;
import com.unihub.app.entities.auth.Session;
import com.unihub.app.entities.auth.User;
import com.unihub.app.exceptions.InvalidJwtTokenException;
import com.unihub.app.mappers.UserMapper;
import com.unihub.app.repositories.SessionRepository;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.MalformedJwtException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.Duration;
import java.time.OffsetDateTime;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SessionService {

    @Value("${app.is-development}")
    private boolean isDevelopment;

    private final SessionProperties sessionProperties;

    private final UserMapper userMapper;

    private final UserService userService;

    private final JwtService jwtService;

    private final SessionRepository sessionRepository;


    private ResponseCookie createSessionCookie(String refreshToken) {
        return ResponseCookie.from("refreshToken", refreshToken)
                .httpOnly(true)
                .secure(!isDevelopment)
                .path("/api/v1/auth")
                .maxAge(Duration.ofSeconds(sessionProperties.refreshTokenExpirationSec()))
                .sameSite(isDevelopment ? "Lax" : "Strict")
                .build();
    }

    public ResponseCookie clearSessionCookie() {
        var cookie = createSessionCookie("");
        return cookie.mutate().maxAge(0).build();
    }

    private String createAccessToken(User user) {
        return jwtService.generateToken(user.getId().toString(),
                Map.of("email", user.getEmail(), "username", user.getUsername()),
                sessionProperties.accessTokenExpirationSec());
    }

    private String createRefreshToken(User user) {
        return jwtService.generateToken(user.getId().toString(),
                Map.of(),
                sessionProperties.refreshTokenExpirationSec());
    }

    public JwtSession createSession(User user) {
        String refreshToken = createRefreshToken(user);

        OffsetDateTime sessionExpiresAt = OffsetDateTime.now().plusSeconds(sessionProperties.refreshTokenExpirationSec());

        var session = Session.builder()
                .expiresAt(sessionExpiresAt)
                .refreshToken(refreshToken)
                .user(user)
                .build();

        sessionRepository.save(session);

        String accessToken = createAccessToken(user);

        return new JwtSession(userMapper.toDto(user), accessToken, createSessionCookie(refreshToken));
    }


    public SessionStatus getSessionStatus(String refreshToken) {
        Session session = null;
        try {
            jwtService.parseClaims(refreshToken);
            session = getSession(refreshToken);
            if (session == null) return SessionStatus.INVALID;

            if (!session.isRevoked()) return SessionStatus.ACTIVE;
            else {
                // Token reuse detected. This scenario happens when a user logs in and then immediately logs out and logs in again, or refreshToken was rotated.
                sessionRepository.revokeSessionFamily(session.getInitialSessionId());
            }return SessionStatus.REVOKED;
        } catch (InvalidJwtTokenException e) {
           if(e.getCause() instanceof ExpiredJwtException) {
                session = getSession(refreshToken);
                if(session != null && session.isRevoked()){
                    // Token reuse detected. This scenario happens when a user logs in and then immediately logs out and logs in again, or refreshToken was rotated.
                    sessionRepository.revokeSessionFamily(session.getInitialSessionId());
                    return SessionStatus.REVOKED;
                }else if (session != null && !session.isRevoked()){
                    session.setRevoked(true);
                    sessionRepository.save(session);
                    return SessionStatus.EXPIRED;
                }else return SessionStatus.INVALID;
            }else if (e.getCause() instanceof MalformedJwtException){
                return SessionStatus.MALFORMED;
            }else {
                return SessionStatus.INVALID;
            }
        }catch (Exception e){
            return SessionStatus.INVALID;
        }
    }


    private Claims decodeToken(String token){
        try{
            return jwtService.parseClaims(token);
        }catch (InvalidJwtTokenException e){
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED,e.getMessage());
        }
    }

    public UserDto parseAccessToken(String accessToken){
        Claims claims = decodeToken(accessToken);
        try {
            return new UserDto(
                    UUID.fromString(claims.getSubject()),
                    claims.get("email", String.class),
                    claims.get("username", String.class)
            );
        }catch (Exception e){
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED,"Invalid access token.");
        }
    }

    public ResponseCookie logout(String refreshToken){
        Session session = getSession(refreshToken);
        session.setRevoked(true);
        sessionRepository.revokeSessionFamily(session.getInitialSessionId());
        sessionRepository.save(session);

        return clearSessionCookie();
    }


    private Session getSession(String refreshToken){
        return sessionRepository.findByRefreshToken(refreshToken).orElse(null);
    }

    public static enum SessionStatus{
        ACTIVE,REVOKED,MALFORMED,EXPIRED,INVALID
    }

}
