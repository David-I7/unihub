package com.unihub.app.dto.community.resources.response;

import lombok.Builder;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Builder
public record TeacherDetailResponseDto(
        UUID id,
        String firstName,
        String lastName,
        Integer estimatedAge,
        float averageRating,
        int ratingsCount,
        OffsetDateTime createdAt,
        List<CourseIdentifiersResponseDto> coursesTaught,
        List<TeacherMetricRatingDto> detailedRatings
) {
}
