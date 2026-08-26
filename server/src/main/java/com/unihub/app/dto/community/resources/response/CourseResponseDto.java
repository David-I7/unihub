package com.unihub.app.dto.community.resources.response;

import lombok.Builder;

import java.time.OffsetDateTime;

@Builder
public record CourseResponseDto (
        Long id,
        String name,
        String slug,
        String abbreviation,
        int semester,
        int creditPoints,
        boolean archived,
        String description,
        OffsetDateTime createdAt
) {
}
