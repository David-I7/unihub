package com.unihub.app.dto.community.resources.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;

@Builder
public record RatingValueRequestDto(
        @NotNull(message = "Metric ID is required")
        Integer metricId,

        @NotNull(message = "Rating value is required")
        @Min(value = 1, message = "Rating value must be at least 1")
        @Max(value = 5, message = "Rating value must not exceed 5")
        int value
) {
}
