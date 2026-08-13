package com.unihub.app.controllers;

import com.unihub.app.domain.JwtSession;
import com.unihub.app.dto.auth.LocalRegisterRequestDto;
import com.unihub.app.dto.auth.LocalUsernameOrEmailLoginRequestDto;
import com.unihub.app.dto.auth.SessionResponseDto;
import com.unihub.app.entities.auth.AuthProvider;
import com.unihub.app.entities.auth.User;
import com.unihub.app.services.SessionService;
import com.unihub.app.services.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;

@Controller
@RequiredArgsConstructor
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final UserService userService;

    private final SessionService sessionService;

    @PostMapping("/login/local")
    public ResponseEntity<?> login(@Valid @RequestBody LocalUsernameOrEmailLoginRequestDto request) {
        User user = User.builder()
                .email(request.getEmail())
                .username(request.getUsername())
                .password(request.getPassword())
                .build();

        var loggedInUser = userService.login(user);
        var session = sessionService.createSession(loggedInUser);

        return ResponseEntity.ok()
                .header("Set-Cookie", session.cookie().toString())
                .body(new SessionResponseDto(session.userDto(), session.accessToken()));
    }

    @PostMapping("/register/local")
    public ResponseEntity<SessionResponseDto> register(@Valid @RequestBody LocalRegisterRequestDto request) {
        User user = User.builder()
                .email(request.getEmail())
                .username(request.getUsername())
                .password(request.getPassword())
                .build();

        var registeredUser = userService.register(user);
        JwtSession session = sessionService.createSession(registeredUser);

        return ResponseEntity.created(URI.create(getOrigin() + "/api/v1/auth/refresh"))
                .header("Set-Cookie", session.cookie().toString())
                .body(new SessionResponseDto(session.userDto(), session.accessToken()));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout( HttpServletRequest request, HttpServletResponse response) {
        ResponseCookie expiredCookie = sessionService.logout(request, response);

        return ResponseEntity
                .ok()
                .header("Set-Cookie", expiredCookie.toString())
                .build();
    }

    @PostMapping("/refresh")
    public ResponseEntity<SessionResponseDto> refresh(HttpServletRequest request, HttpServletResponse response) {
        JwtSession session = sessionService.refreshSession(request, response);

        ResponseEntity<SessionResponseDto> responseEntity = ResponseEntity.ok().body(new SessionResponseDto(session.userDto(), session.accessToken()));

        if (session.cookie() != null) {
            response.setHeader("Set-Cookie", session.cookie().toString());
        }

        return responseEntity;
    }

//    @DeleteMapping("/delete-user")
//    public ResponseEntity<?> deleteUser(HttpServletRequest request, HttpServletResponse response){
//        ResponseCookie expiredCookie = sessionService.logout(request, response);
//
//        userService.delete(session.userDto().id());
//
//        return ResponseEntity.ok()
//                .header("Set-Cookie", expiredCookie.toString())
//                .build();
//    }

    private String getOrigin(){
        return ServletUriComponentsBuilder
                .fromCurrentContextPath()
                .build()
                .toUriString();
    }
}
