package com.unihub.app.dto.community.resources.response;

import com.unihub.app.entities.community.resources.StudyYearName;
import lombok.Builder;

@Builder
public record StudyYearIdentifiersResponseDto(
        int id,
        StudyYearName studyYearName
) {
}
