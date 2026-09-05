package com.unihub.app.dto.authentication;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ResetPasswordRequestDto(
        @NotBlank(message = "Token cannot be blank")
        String token,

        @Size(min = 8, max = 64, message = "Password must be between 8 and 64 characters")
        String newPassword
) {
}
