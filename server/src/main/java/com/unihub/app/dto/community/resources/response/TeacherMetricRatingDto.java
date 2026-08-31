package com.unihub.app.dto.community.resources.response;

import lombok.Builder;

@Builder
public record TeacherMetricRatingDto(
        int metricId,
        String metricName,
        String description,
        float averageRating,
        long ratingsCount
) {
}
