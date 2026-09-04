package com.unihub.app.dto.community.content.response;

import com.unihub.app.dto.community.OwnerDto;
import com.unihub.app.entities.community.content.CommunicationChannel;
import lombok.Builder;

import java.time.OffsetDateTime;
import java.util.UUID;

@Builder
public record PostDetailResponseDto(
        UUID id,
        String title,
        String description,
        CommunicationChannel channel,
        boolean pinned,
        int likesCount,
        int commentsCount,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt,
        OwnerDto owner,
        Boolean isLiked,
        String communitySlug,
        String communityName,
        String studyYearSlug,
        String studyYearName,
        String courseSlug,
        String courseName
) {
}
