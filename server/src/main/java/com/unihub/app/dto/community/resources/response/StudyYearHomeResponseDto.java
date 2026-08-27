package com.unihub.app.dto.community.resources.response;

import lombok.Builder;

import java.util.List;

@Builder
public record StudyYearHomeResponseDto(
        StudyYearResponseDto studyYear,
        List<CourseHomeResponseDto> courses
) {
}
