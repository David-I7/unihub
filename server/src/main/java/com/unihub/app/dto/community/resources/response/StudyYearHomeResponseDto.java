package com.unihub.app.dto.community.resources.response;

import com.unihub.app.dto.PageDto;
import lombok.Builder;

@Builder
public record StudyYearHomeResponseDto(
        StudyYearResponseDto studyYear,
        PageDto<CourseCardResponseDto> courses
) {
}

