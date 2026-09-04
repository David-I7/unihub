package com.unihub.app.dto.community.content.response;

import lombok.Builder;

import java.util.UUID;

@Builder
public record BreadcrumbDto(
        UUID id,
        String name,
        String type
) {
}
