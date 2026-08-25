package com.unihub.app.dto.community.resources;

public record CommunityRequestDto(
        String name,
        String description,
        String backgroundColor,
        String slug
) {
}
