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
        userService.register(user);

        return ResponseEntity.ok(new MessageResponseDto("Verification email sent. Please check your inbox."));
    }

    @PostMapping("/confirm-register")
    public ResponseEntity<SessionResponseDto> confirmRegister(@Valid @RequestBody JwtTokenRequestDto request) {
        User registeredUser = userService.confirmRegister(request.token());
        JwtSession session = sessionService.createSession(registeredUser);

        return ResponseEntity.created(URI.create(appUtils.getOrigin() + "/api/v1/auth/refresh"))
                .header("Set-Cookie", session.cookie().toString())
                .body(new SessionResponseDto(session.userDto(), session.accessToken()));
    }

    @PostMapping("/confirm-email")
    public ResponseEntity<MessageResponseDto> confirmEmail(@Valid @RequestBody JwtTokenRequestDto request) {
        userService.confirmEmail(request.token());
        return ResponseEntity.ok(new MessageResponseDto("Email has been successfully verified."));
    }

    @PostMapping("/verify-email")
    public ResponseEntity<MessageResponseDto> confirmEmail(@Valid @RequestBody EmailRequestDto request) {
        userService.requestConfirmEmail(request.email());

        return ResponseEntity.ok(new MessageResponseDto("If an account exists with that email, an email verification link has been sent."));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<MessageResponseDto> forgotPassword(@Valid @RequestBody EmailRequestDto request) {
        userService.requestPasswordReset(request.email());
        return ResponseEntity.ok(new MessageResponseDto("If an account exists with that email, a password reset link has been sent."));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<MessageResponseDto> resetPassword(@Valid @RequestBody ResetPasswordRequestDto request) {
        userService.resetPassword(request.token(), request.newPassword());
        return ResponseEntity.ok(new MessageResponseDto("Password has been successfully reset. Please log in with your new password."));
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
