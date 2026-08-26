package com.unihub.app.dto.user;

import lombok.Builder;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Builder
public record UserEnrolledCommunityDto(
        UUID id,
        String name,
        String slug,
        String description,
        Long memberCount,
        String role,
        List<String> permissions,
        OffsetDateTime joinedAt
) {
}
