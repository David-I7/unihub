package com.unihub.app.dto.community.content.request;

import com.unihub.app.entities.community.content.EventLocation;
import com.unihub.app.entities.community.content.EventType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Builder;

import java.time.OffsetDateTime;

@Builder
public record CreateEventRequestDto(
        @NotBlank(message = "Title is required")
        @Size(min=1,max = 120, message = "Title must not exceed 120 characters")
        String title,

        @Size(max = 2000, message = "Description must not exceed 2000 characters")
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
