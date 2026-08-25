package com.unihub.app.dto.community.resources;

import lombok.Builder;

import java.util.UUID;

@Builder
public record CourseTeacherDto(
        UUID id,
        String firstName,
        String lastName,
        float averageRating,
        int ratingsCount
) {
}
