package com.unihub.app.dto.community.resources.response;

import com.unihub.app.dto.globalResources.TeacherResponseDto;
import lombok.Builder;

import java.time.OffsetDateTime;
import java.util.List;

@Builder
public record CourseTeachersResponseDto(
        CourseResponseDto course,
        List<TeacherResponseDto> teachers
) {
}
