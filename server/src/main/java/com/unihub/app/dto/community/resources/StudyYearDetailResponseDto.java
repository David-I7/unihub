package com.unihub.app.dto.community.resources;

import com.unihub.app.entities.community.resources.StudyYearName;
import lombok.Builder;

import java.util.List;

@Builder
public record StudyYearDetailResponseDto(
        int id,
        StudyYearName studyYearName,
        List<CourseSummaryDto> courses
) {
}
