package com.unihub.app.dto.community.content.response;

import com.unihub.app.dto.community.OwnerDto;
import com.unihub.app.entities.community.content.NotificationCategory;
import com.unihub.app.entities.community.content.PostNotificationType;
import lombok.Builder;

import java.time.OffsetDateTime;
import java.util.UUID;

@Builder
public record PostNotificationResponseDto(
        UUID id,
        String title,
        String message,
        NotificationCategory category,
        PostNotificationType type,
        boolean isRead,
        OffsetDateTime createdAt,
        UUID postId,
        OwnerDto actor,
        String communitySlug,
        String studyYear,
        String courseSlug
) implements NotificationResponseDto {
}
