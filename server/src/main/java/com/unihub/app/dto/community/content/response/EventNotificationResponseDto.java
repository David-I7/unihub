package com.unihub.app.dto.community.content.response;

import com.unihub.app.dto.community.OwnerDto;
import com.unihub.app.entities.community.content.EventNotificationType;
import com.unihub.app.entities.community.content.NotificationCategory;
import lombok.Builder;

import java.time.OffsetDateTime;
import java.util.UUID;

@Builder
public record EventNotificationResponseDto(
        UUID id,
        String title,
        String message,
        NotificationCategory category,
        EventNotificationType type,
        boolean isRead,
        OffsetDateTime createdAt,
        UUID eventId,
        OwnerDto actor,
        String communitySlug
) implements NotificationResponseDto {
}
