package com.unihub.app.controllers.authentication;

import com.unihub.app.domain.JwtSession;
import com.unihub.app.dto.authentication.*;
import com.unihub.app.entities.authentication.User;
import com.unihub.app.mappers.UserMapper;
import com.unihub.app.services.authentication.SessionService;
import com.unihub.app.services.authentication.UserService;
import com.unihub.app.utils.AppUtils;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.net.URI;

@Controller
@RequiredArgsConstructor
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final UserService userService;
    private final SessionService sessionService;
    private final UserMapper userMapper;
    private final AppUtils appUtils;

    @PostMapping("/login/local")
    public ResponseEntity<?> login(@Valid @RequestBody LocalUsernameOrEmailLoginRequestDto request) {
        User user = userMapper.toEntity(request);

        var loggedInUser = userService.login(user);
        var session = sessionService.createSession(loggedInUser);

        return ResponseEntity.ok()
                .header("Set-Cookie", session.cookie().toString())
                .body(new SessionResponseDto(session.userDto(), session.accessToken()));
    }

    @PostMapping("/register/local")
    public ResponseEntity<MessageResponseDto> register(@Valid @RequestBody LocalRegisterRequestDto request) {
        User user = userMapper.toEntity(request);
        MessageResponseDto message = userService.register(user);

        return ResponseEntity.ok(message);
    }

    @PostMapping("/confirm-register")
    public ResponseEntity<SessionResponseDto> confirmRegister(@Valid @RequestBody ConfirmRegisterRequestDto request) {
        User registeredUser = userService.confirmRegister(request.email(), request.code());
        JwtSession session = sessionService.createSession(registeredUser);

        return ResponseEntity.created(URI.create(appUtils.getOrigin() + "/api/v1/auth/refresh"))
                .header("Set-Cookie", session.cookie().toString())
                .body(new SessionResponseDto(session.userDto(), session.accessToken()));
    }

    @PostMapping("/confirm-email")
    public ResponseEntity<MessageResponseDto> confirmEmail(@Valid @RequestBody ConfirmEmailRequestDto request) {
        MessageResponseDto message = userService.confirmEmail(request.email(), request.code());
        return ResponseEntity.ok(message);
    }

    @PostMapping("/verify-email")
    public ResponseEntity<MessageResponseDto> verifyEmail(@Valid @RequestBody EmailRequestDto request) {
        MessageResponseDto message = userService.requestConfirmEmail(request.email());

        return ResponseEntity.ok(message);
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<MessageResponseDto> forgotPassword(@Valid @RequestBody EmailRequestDto request) {
        MessageResponseDto message = userService.requestPasswordReset(request.email());
        return ResponseEntity.ok(message);
    }

    @PostMapping("/reset-password")
    public ResponseEntity<MessageResponseDto> resetPassword(@Valid @RequestBody ResetPasswordRequestDto request) {
        MessageResponseDto message = userService.resetPassword(request.token(), request.newPassword());
        return ResponseEntity.ok(message);
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
}
