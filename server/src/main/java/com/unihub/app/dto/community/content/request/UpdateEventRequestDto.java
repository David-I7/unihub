package com.unihub.app.dto.community.content.request;

import com.unihub.app.entities.community.content.EventLocation;
import com.unihub.app.entities.community.content.EventType;
import lombok.Builder;

import java.time.OffsetDateTime;

@Builder
public record UpdateEventRequestDto(
        String title,
        String description,
        EventType type,
        OffsetDateTime startTime,
        OffsetDateTime endTime,
        Integer durationMinutes,
        EventLocation location,
        String locationDetails
) {
}
