package com.unihub.app.dto.community.content.request;

import com.unihub.app.entities.community.content.EventLocation;
import com.unihub.app.entities.community.content.EventType;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.Builder;

import java.time.OffsetDateTime;

@Builder
public record BatchEventItemDto(
        @NotNull(message = "Course ID is required")
        Long courseId,

        @NotBlank(message = "Title is required")
        @Size(min = 1, max = 100, message = "Title must not exceed 100 characters")
        String title,

        @Size(max = 500, message = "Description must not exceed 500 characters")
        String description,

        @NotNull(message = "Event type is required")
        EventType type,

        @NotNull(message = "Start time is required")
        OffsetDateTime startTime,

        @Positive(message = "Duration must be positive")
        @Max(value = 168, message = "Duration cannot exceed 168 hours")
        Float durationHours,

        @NotNull(message = "Event location is required")
        EventLocation location,

        @Size(max = 500, message = "Location details must not exceed 500 characters")
        String locationDetails
) {
    public BatchEventItemDto {
        title = title != null ? title.trim() : title;
        description = description != null ? description.trim() : description;
        locationDetails = locationDetails != null ? locationDetails.trim() : locationDetails;
    }

    @AssertTrue(message = "Batch event type must be either LECTURE or EXAM")
    public boolean isValidBatchType() {
        return type == null || type == EventType.LECTURE || type == EventType.EXAM;
    }
}
