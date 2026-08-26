package com.unihub.app.dto.community.resources.response;

import com.unihub.app.entities.community.resources.StudyYearName;
import lombok.Builder;

@Builder
public record StudyYearResponseDto(
        int id,
        StudyYearName studyYearName,
        long coursesCount,
        long archivedCoursesCount,
        long creditsCount
) {
}
