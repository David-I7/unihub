package com.unihub.app.dto.community.content.request;

import com.unihub.app.entities.community.content.EventLocation;
import com.unihub.app.entities.community.content.EventType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;

import java.time.OffsetDateTime;

@Builder
public record CreateEventRequestDto(
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

        @NotNull(message = "Course ID is required")
        Long courseId,

        @NotBlank(message = "Community slug is required")
        String communitySlug
) {
}
