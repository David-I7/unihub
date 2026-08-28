package com.unihub.app.dto.authentication;

import com.unihub.app.validation.Username;
import com.unihub.app.validation.UsernameOrEmail;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@UsernameOrEmail
@Builder
public record LocalUsernameOrEmailLoginRequestDto(

    @Email
    String email,

    @Username
    String username,

    @NotBlank
    @Size(min = 8, max = 100)
    String password
    ){

    public LocalUsernameOrEmailLoginRequestDto {
        if (email != null) {
            email = email.trim();
        }
        if (username != null) {
            username = username.trim();
        }
        if (password != null) {
            password = password.trim();
        }
    }
}
