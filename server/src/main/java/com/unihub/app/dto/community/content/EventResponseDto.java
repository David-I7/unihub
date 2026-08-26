package com.unihub.app.dto.community.content;

import com.unihub.app.dto.community.OwnerDto;
import com.unihub.app.entities.community.content.EventLocation;
import com.unihub.app.entities.community.content.EventType;
import lombok.Builder;

import java.time.OffsetDateTime;
import java.util.UUID;

@Builder
public record EventResponseDto(
        UUID id,
        String title,
        String description,
        EventType type,
        OffsetDateTime startTime,
        OffsetDateTime endTime,
        Integer durationMinutes,
        EventLocation location,
        String locationDetails,
        Long courseId,
        String courseSlug,
        String courseName,
        String communitySlug,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt,
        OwnerDto owner,
        boolean isSubscribed
) {
}
