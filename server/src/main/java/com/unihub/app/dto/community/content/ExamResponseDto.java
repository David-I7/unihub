package com.unihub.app.dto.community.content;

import com.unihub.app.dto.community.OwnerDto;
import lombok.Builder;

import java.time.OffsetDateTime;
import java.util.UUID;

@Builder
public record ExamResponseDto(
        UUID id,
        String title,
        String description,
        OffsetDateTime scheduledDate,
        Integer estimatedDurationMinutes,
        OffsetDateTime createdAt,
        OwnerDto owner
) {
}
