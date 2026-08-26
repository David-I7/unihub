package com.unihub.app.dto.community.content.response;

import com.unihub.app.entities.community.content.ReminderStatus;
import lombok.Builder;

import java.time.OffsetDateTime;
import java.util.UUID;

@Builder
public record EventReminderResponseDto(
        UUID id,
        UUID eventId,
        int offsetMinutes,
        OffsetDateTime remindAt,
        ReminderStatus status,
        OffsetDateTime createdAt
) {
}
