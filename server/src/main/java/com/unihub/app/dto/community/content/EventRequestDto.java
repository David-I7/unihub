package com.unihub.app.dto.community.content;

import com.unihub.app.entities.community.content.EventLocation;
import com.unihub.app.entities.community.content.EventType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;

import java.time.OffsetDateTime;
import java.util.List;

@Builder
public record EventRequestDto(
        @NotBlank(message = "Title is required")
        String title,

        String description,

        @NotNull(message = "Event type is required")
        EventType type,

        @NotNull(message = "Start time is required")
        OffsetDateTime startTime,

        OffsetDateTime endTime,

        Integer durationMinutes,

        @NotNull(message = "Event location is required")
        EventLocation location,

        String locationDetails,

        List<Integer> offsetMinutes
) {
}
