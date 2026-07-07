package com.unihub.app.services;

import com.unihub.app.config.SessionProperties;
import com.unihub.app.domain.JwtSession;
import com.unihub.app.entities.Session;
import com.unihub.app.entities.SessionRevokeReason;
import com.unihub.app.entities.User;
import com.unihub.app.mappers.UserMapper;
import com.unihub.app.repositories.SessionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.Duration;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;

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

    private ResponseCookie createSessionCookie(String refreshToken){
          return ResponseCookie.from("refreshToken", refreshToken)
                .httpOnly(true)
                .secure(!isDevelopment)
                .path("/api/v1/auth")
                .maxAge(Duration.ofSeconds(sessionProperties.refreshTokenExpirationSec()))
                .sameSite(isDevelopment ? "Lax" : "Strict")
                .build();
    }

    private ResponseCookie clearSessionCookie(String refreshToken){
        var cookie = createSessionCookie(refreshToken);
        return cookie.mutate().maxAge(0).build();
    }

    private String createAccessToken(User user){
        return jwtService.generateToken(user.getId().toString(),
                Map.of("email",user.getEmail(),"username",user.getUsername()),
                sessionProperties.accessTokenExpirationSec());
    }

    private String createRefreshToken(User user){
        return jwtService.generateToken(user.getId().toString(),
                Map.of(),
                sessionProperties.refreshTokenExpirationSec());
    }

    public JwtSession createSession(User user){
        String refreshToken = createRefreshToken(user);

        OffsetDateTime sessionExpiresAt = OffsetDateTime.now().plusSeconds(sessionProperties.refreshTokenExpirationSec());

        var session = Session.builder()
                .expiresAt(sessionExpiresAt)
                .refreshToken(refreshToken)
                .user(user)
                .build();

        sessionRepository.save(session);

        String accessToken = createAccessToken(user);

       return new JwtSession(userMapper.toDto(user),accessToken,createSessionCookie(refreshToken));
    }

    public void logout(String refreshToken){

    }

    public JwtSession login(User user, String refreshToken) {
        if(refreshToken != null) {
            var existingSession = sessionRepository.findByRefreshToken(refreshToken);

            if (existingSession.isPresent() && existingSession.get().isRevoked()) {
                handleRevokedSession(existingSession.get());
            }else throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"User is already logged in");
        }

        user = userService.login(user);

        return createSession(user);
    }

    private void handleRevokedSession(Session session){
        if(!session.getRevokedReason().equals(SessionRevokeReason.REUSE_DETECTED)){
            handleSessionReuse(session);
        }else{
            session.setRevoked(true);
            session.setRevokedReason(SessionRevokeReason.LOGOUT);
            sessionRepository.save(session);
        }
    }

    private void handleSessionReuse(Session session){
        session.setRevokedReason(SessionRevokeReason.LOGOUT);
        session.setRevoked(true);

        sessionRepository.save(session);
        sessionRepository.revokeOtherRefreshTokens(session.getUser().getId(),session.getRefreshToken(),SessionRevokeReason.REUSE_DETECTED);
    }


}
