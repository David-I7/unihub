package com.unihub.app.dto.community.resources;

import com.unihub.app.entities.community.resources.StudyYearName;
import lombok.Builder;

@Builder
public record StudyYearSummaryDto(
        int id,
        StudyYearName studyYearName,
        long coursesCount,
        long creditsCount
) {
}
