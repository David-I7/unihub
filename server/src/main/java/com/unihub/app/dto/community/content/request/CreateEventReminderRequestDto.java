package com.unihub.app.dto.community.content.request;

import jakarta.validation.constraints.Min;
import lombok.Builder;
import lombok.NonNull;

@Builder
public record CreateEventReminderRequestDto(
        @NonNull
        @Min(value = 15, message = "offsetMinutes must be non-negative")
        Integer offsetMinutes
) {
}
