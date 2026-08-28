package com.unihub.app.dto.community.resources.response;

import lombok.Builder;

import java.time.OffsetDateTime;
import java.util.UUID;

@Builder
public record CommunityJoinCodeResponseDto(
        UUID id,
        String code,
        UUID communityId,
        String communitySlug,
        Integer maxUses,
        int usesCount,
        OffsetDateTime expiresAt,
        OffsetDateTime createdAt
) {
}
