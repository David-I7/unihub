package com.unihub.app.dto.community.content.response;

import com.unihub.app.dto.community.OwnerDto;
import com.unihub.app.entities.community.content.NotificationCategory;
import com.unihub.app.entities.community.content.NotificationType;
import lombok.Builder;

import java.time.OffsetDateTime;
import java.util.UUID;

@Builder
public record NotificationResponseDto(
        UUID id,
        String message,
        NotificationCategory category,
        NotificationType type,
        boolean isRead,
        OffsetDateTime createdAt,
        UUID eventId,
        OwnerDto actor,
        String communitySlug,
        String communityName,
        String studyYearName,
        String courseName,
        String courseSlug
) {
}
