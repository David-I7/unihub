package com.unihub.app.controllers;

import com.unihub.app.dto.auth.LocalRegisterRequestDto;
import com.unihub.app.dto.auth.SessionResponseDto;
import com.unihub.app.services.SessionService;
import com.unihub.app.services.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequiredArgsConstructor
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final UserService userService;

    private final SessionService sessionService;

    @RequestMapping("/login")
    public String login(){
        return "login";
    }

    @RequestMapping("/register")
    public SessionResponseDto register(@Valid LocalRegisterRequestDto localRegisterRequestDto){



    }

}
