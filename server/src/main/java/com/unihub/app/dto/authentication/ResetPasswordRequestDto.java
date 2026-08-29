package com.unihub.app.dto.authentication;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ResetPasswordRequestDto(
        @NotBlank(message = "Token cannot be blank")
        String token,

        @Size(min = 8, message = "Password must be at least 8 characters")
        String newPassword
) {
}
