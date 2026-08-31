package com.unihub.app.dto.community.content.response;

import com.unihub.app.entities.community.content.NotificationCategory;
import com.unihub.app.entities.community.content.SystemNotificationType;
import lombok.Builder;

import java.time.OffsetDateTime;
import java.util.UUID;

@Builder
public record SystemNotificationResponseDto(
        UUID id,
        String title,
        String message,
        NotificationCategory category,
        SystemNotificationType type,
        boolean isRead,
        OffsetDateTime createdAt
) implements NotificationResponseDto {
}
