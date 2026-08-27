package com.unihub.app.dto.community.resources.response;

import lombok.Builder;

@Builder
public record CourseIdentifiersResponseDto(
        Long id,
        String name,
        String slug,
        String abbreviation,
        int semester
) {
}
