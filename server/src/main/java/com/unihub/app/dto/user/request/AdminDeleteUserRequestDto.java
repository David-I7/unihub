package com.unihub.app.dto.user.request;

import jakarta.validation.constraints.NotBlank;

public record AdminDeleteUserRequestDto(
        @NotBlank(message = "Reason is required")
        String reason
) {
}
