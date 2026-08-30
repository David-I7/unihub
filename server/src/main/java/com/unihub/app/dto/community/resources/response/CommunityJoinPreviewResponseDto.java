package com.unihub.app.dto.community.resources.response;

import lombok.Builder;

import java.util.UUID;

@Builder
public record CommunityJoinPreviewResponseDto(
        UUID communityId,
        String name,
        String slug,
        String description,
        String backgroundColor,
        int memberCount,
        boolean verified,
        boolean isMember
) {
}
