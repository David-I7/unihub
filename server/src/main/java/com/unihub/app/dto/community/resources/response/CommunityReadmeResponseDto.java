package com.unihub.app.dto.community.resources.response;

import lombok.Builder;

@Builder
public record CommunityReadmeResponseDto(
        String readme
) {
}
