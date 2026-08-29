package com.unihub.app.dto.authentication;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record EmailRequestDto(
        @NotBlank(message = "Email cannot be blank")
        @Email(message = "Invalid email format")
        String email
) {
}
