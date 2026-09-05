package com.unihub.app.dto.community.resources.response;

import lombok.Builder;

import java.util.List;

@Builder
public record CourseCardResponseDto(
        Long id,
        String name,
        String slug,
        String abbreviation,
        int semester,
        int creditPoints,
        boolean archived,
        String description,
        List<TeacherSummaryResponseDto> teachers
) {
}
