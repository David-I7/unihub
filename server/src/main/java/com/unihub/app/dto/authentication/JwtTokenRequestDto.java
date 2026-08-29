package com.unihub.app.dto.authentication;

import jakarta.validation.constraints.NotBlank;

public record JwtTokenRequestDto(
        @NotBlank(message = "Token cannot be blank")
        String token
) {
}
