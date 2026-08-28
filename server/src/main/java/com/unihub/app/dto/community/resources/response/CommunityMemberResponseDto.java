package com.unihub.app.dto.community.resources.response;

import lombok.Builder;

import java.time.OffsetDateTime;
import java.util.UUID;

@Builder
public record CommunityMemberResponseDto(
        UUID userId,
        String username,
        String email,
        String role,
        OffsetDateTime joinedAt
) {
}
