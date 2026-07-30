package com.unihub.app.controllers;

import com.unihub.app.domain.JwtSession;
import com.unihub.app.dto.auth.LocalRegisterRequestDto;
import com.unihub.app.dto.auth.LocalUsernameOrEmailLoginRequestDto;
import com.unihub.app.dto.auth.SessionResponseDto;
import com.unihub.app.entities.auth.AuthProvider;
import com.unihub.app.entities.auth.User;
import com.unihub.app.services.SessionService;
import com.unihub.app.services.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequiredArgsConstructor
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final UserService userService;

    private final SessionService sessionService;

    @PostMapping("/login/local")
    public ResponseEntity<?> login(@Valid @RequestBody LocalUsernameOrEmailLoginRequestDto request){
        User user = User.builder()
                .email(request.getEmail())
                .username(request.getUsername())
                .password(request.getPassword())
                .build();

        var loggedInUser = userService.login(user);
        var session = sessionService.createSession(loggedInUser);

        return ResponseEntity.ok()
                .header("Set-Cookie",session.cookie().toString())
                .body(new SessionResponseDto(session.userDto(),session.accessToken()));
    }

    @PostMapping("/register/local")
    public ResponseEntity<SessionResponseDto> register(@Valid @RequestBody LocalRegisterRequestDto request){
        User user = User.builder()
                .email(request.getEmail())
                .username(request.getUsername())
                .password(request.getPassword())
                .build();

        var registeredUser = userService.register(user);
        JwtSession session = sessionService.createSession(registeredUser);

        return ResponseEntity.ok()
                .header("Set-Cookie",session.cookie().toString())
                .body(new SessionResponseDto(session.userDto(),session.accessToken()));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@CookieValue("refreshToken") String refreshToken){
        ResponseCookie expiredCookie = sessionService.logout(refreshToken);

        return ResponseEntity
                .ok()
                .header("Set-Cookie",expiredCookie.toString())
                .build();
    }
}
