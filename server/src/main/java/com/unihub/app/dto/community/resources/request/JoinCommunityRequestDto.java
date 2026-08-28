package com.unihub.app.dto.community.resources.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record JoinCommunityRequestDto(
        @NotBlank(message = "Join code is required")
        @Size(min = 8, max = 8, message = "Join code must be 8 characters long")
        String joinCode
) {
        public JoinCommunityRequestDto {
                joinCode = joinCode != null ? joinCode.trim().toUpperCase() : null;
        }
}
