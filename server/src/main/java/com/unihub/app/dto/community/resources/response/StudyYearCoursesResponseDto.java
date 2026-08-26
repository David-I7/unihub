package com.unihub.app.dto.community.resources.response;

import com.unihub.app.entities.community.resources.StudyYearName;
import lombok.Builder;

import java.util.List;

@Builder
public record StudyYearCoursesResponseDto(
        int id,
        StudyYearName studyYearName,
        List<CourseTeachersResponseDto> courses
) {
}
