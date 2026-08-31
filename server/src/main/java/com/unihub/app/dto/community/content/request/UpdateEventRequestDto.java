package com.unihub.app.dto.community.content.request;

import com.unihub.app.entities.community.content.EventLocation;
import com.unihub.app.entities.community.content.EventType;
import jakarta.validation.constraints.Size;
import lombok.Builder;

import java.time.OffsetDateTime;

@Builder
public record UpdateEventRequestDto(
        @Size(min = 1, max = 120, message = "Title must not exceed 120 characters")
        String title,

        @Size(max = 2000, message = "Description must not exceed 2000 characters")
        String description,

        EventType type,

        OffsetDateTime startTime,

        OffsetDateTime endTime,

        Integer durationMinutes,

        EventLocation location,

        String locationDetails
) {
}
