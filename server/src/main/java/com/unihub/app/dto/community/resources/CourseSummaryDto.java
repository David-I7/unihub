package com.unihub.app.dto.community.resources;

import lombok.Builder;

import java.util.List;

@Builder
public record CourseSummaryDto(
        int id,
        String name,
        String abbreviation,
        int semester,
        int creditPoints,
        boolean archived,
        String description,
        List<CourseTeacherDto> teachers
) {
}
