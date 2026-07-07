package com.unihub.app.controllers;

import com.unihub.app.domain.JwtSession;
import com.unihub.app.dto.auth.LocalRegisterRequestDto;
import com.unihub.app.dto.auth.SessionResponseDto;
import com.unihub.app.entities.User;
import com.unihub.app.services.SessionService;
import com.unihub.app.services.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
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
    public String login(){
        return "login";
    }

    @PostMapping("/register/local")
    public ResponseEntity<SessionResponseDto> register(@Valid @RequestBody LocalRegisterRequestDto localRegisterRequestDto){
        User user = User.builder()
                .email(localRegisterRequestDto.getEmail())
                .username(localRegisterRequestDto.getUsername())
                .password(localRegisterRequestDto.getPassword())
                .build();

        user = userService.create(user);

        JwtSession session = sessionService.createSession(user);

        return ResponseEntity.ok()
                .header("Set-Cookie",session.cookie().toString())
                .body(new SessionResponseDto(session.userDto(),session.accessToken()));
    }

}
