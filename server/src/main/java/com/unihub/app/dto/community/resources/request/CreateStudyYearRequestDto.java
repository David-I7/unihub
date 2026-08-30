package com.unihub.app.dto.community.resources.request;

import com.unihub.app.entities.community.resources.StudyYearName;
import jakarta.validation.constraints.NotNull;

public record CreateStudyYearRequestDto(
        @NotNull(message = "Study year name cannot be null")
        StudyYearName studyYearName
) {
}
