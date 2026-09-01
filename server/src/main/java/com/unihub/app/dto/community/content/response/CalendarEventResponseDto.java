package com.unihub.app.dto.community.content.response;

import com.unihub.app.entities.community.content.EventLocation;
import com.unihub.app.entities.community.content.EventType;
import lombok.Builder;

import java.time.OffsetDateTime;
import java.util.UUID;

@Builder
public record CalendarEventResponseDto(
        UUID id,
        String title,
        EventType type,
        OffsetDateTime startTime,
        Double durationHours,
        EventLocation location,
        String courseAbbreviation,
        boolean isSubscribed
) {
}
