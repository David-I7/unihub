package com.unihub.app.controllers;

import com.unihub.app.domain.JwtSession;
import com.unihub.app.dto.auth.LocalRegisterRequestDto;
import com.unihub.app.dto.auth.LocalUsernameOrEmailLoginRequestDto;
import com.unihub.app.dto.auth.SessionResponseDto;
import com.unihub.app.entities.User;
import com.unihub.app.services.SessionService;
import com.unihub.app.services.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
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
    public String login(@Valid @RequestBody LocalUsernameOrEmailLoginRequestDto request, @CookieValue(value = "refreshToken",required = false) String refreshToken){
        User user = User.builder()
                .email(request.getEmail())
                .username(request.getUsername())
                .password(request.getPassword())
                .build();

        var session = sessionService.login(user);

        return "login";
    }

    @PostMapping("/register/local")
    public ResponseEntity<SessionResponseDto> register(@Valid @RequestBody LocalRegisterRequestDto request){
        User user = User.builder()
                .email(request.getEmail())
                .username(request.getUsername())
                .password(request.getPassword())
                .build();

        user = userService.register(user);

        JwtSession session = sessionService.createSession(user);

        return ResponseEntity.ok()
                .header("Set-Cookie",session.cookie().toString())
                .body(new SessionResponseDto(session.userDto(),session.accessToken()));
    }

}
