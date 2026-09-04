package com.unihub.app.dto.community.resources.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record JoinCommunityRequestDto(
        @NotBlank(message = "Join code is required")
        @Size(min = 8, max = 8, message = "Invalid join code")
        @Pattern(regexp = "^[A-Z0-9]+$", message = "Invalid join code")
        String joinCode
) {
        public JoinCommunityRequestDto {
                joinCode = joinCode != null ? joinCode.trim().toUpperCase() : null;
        }
}
