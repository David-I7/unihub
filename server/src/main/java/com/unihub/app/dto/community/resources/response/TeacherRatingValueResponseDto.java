package com.unihub.app.dto.community.resources.response;

import lombok.Builder;

@Builder
public record TeacherRatingValueResponseDto(
        int metricId,
        String metricName,
        int value
) {
}
