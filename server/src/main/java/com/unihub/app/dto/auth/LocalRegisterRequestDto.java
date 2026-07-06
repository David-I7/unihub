package com.unihub.app.dto.auth;


import com.unihub.app.validation.Username;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class LocalRegisterRequestDto {

    @Email
    @NotBlank
    private String email;

    @NotBlank
    @Username
    private String username;

    @NotBlank
    @Size(min = 8, max = 100)
    private String password;

}
