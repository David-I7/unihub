package com.unihub.app.dto.user;

import lombok.Builder;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Builder
public record UserProfileResponseDto(
        UUID id,
        String username,
        String email,
        String role,
        List<String> permissions,
        OffsetDateTime createdAt
) {
}
