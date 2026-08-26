package com.unihub.app.dto.globalResources;

import com.unihub.app.dto.community.resources.CourseSummaryDto;
import lombok.Builder;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Builder
public record TeacherWithCoursesDto(
        UUID id,
        String firstName,
        String lastName,
        float averageRating,
        int ratingsCount,
        OffsetDateTime createdAt,
        List<CourseSummaryDto> courses
) {
}
