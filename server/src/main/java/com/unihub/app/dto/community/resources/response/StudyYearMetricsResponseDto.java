package com.unihub.app.dto.community.resources.response;

import com.unihub.app.entities.community.resources.StudyYearName;
import lombok.Builder;

import java.time.OffsetDateTime;

@Builder
public record StudyYearMetricsResponseDto(
        int id,
        StudyYearName studyYearName,
        OffsetDateTime createdAt,
        long coursesCount,
        long archivedCoursesCount,
        long creditsCount
) {
}
