package com.unihub.app.dto.community.content;

import com.unihub.app.entities.community.content.NotificationType;
import lombok.Builder;

import java.time.OffsetDateTime;
import java.util.UUID;

@Builder
public record NotificationResponseDto(
        UUID id,
        String title,
        String message,
        NotificationType type,
        UUID eventId,
        boolean isRead,
        OffsetDateTime createdAt
) {
}
