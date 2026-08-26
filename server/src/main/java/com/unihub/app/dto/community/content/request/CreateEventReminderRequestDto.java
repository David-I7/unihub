package com.unihub.app.dto.community.content.request;

import jakarta.validation.constraints.Min;
import lombok.Builder;

@Builder
public record CreateEventReminderRequestDto(
        @Min(value = 0, message = "offsetMinutes must be non-negative")
        Integer offsetMinutes
) {
    public CreateEventReminderRequestDto {
        if (offsetMinutes == null) {
            offsetMinutes = 15;
        }
    }
}
