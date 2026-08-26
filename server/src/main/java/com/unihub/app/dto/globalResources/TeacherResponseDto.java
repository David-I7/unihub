package com.unihub.app.dto.globalResources;

import lombok.Builder;

import java.time.OffsetDateTime;
import java.util.UUID;

@Builder
public record TeacherResponseDto(
        UUID id,
        String firstName,
        String lastName,
        float averageRating,
        int ratingsCount,
        OffsetDateTime createdAt
) {
}
