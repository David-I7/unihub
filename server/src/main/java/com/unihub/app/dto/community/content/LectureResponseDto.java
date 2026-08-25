package com.unihub.app.dto.community.content;

import com.unihub.app.dto.community.OwnerDto;
import com.unihub.app.entities.community.content.LectureLocation;
import lombok.Builder;

import java.time.OffsetDateTime;
import java.util.UUID;

@Builder
public record LectureResponseDto(
        UUID id,
        String title,
        String description,
        OffsetDateTime startTime,
        OffsetDateTime endTime,
        LectureLocation location,
        OffsetDateTime createdAt,
        OwnerDto owner
) {
}
