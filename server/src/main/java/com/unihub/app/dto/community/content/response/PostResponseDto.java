package com.unihub.app.dto.community.content.response;

import com.unihub.app.dto.community.OwnerDto;
import com.unihub.app.entities.community.content.CommunicationChannel;
import lombok.Builder;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Builder
public record PostResponseDto(
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
        List<CommentResponseDto> comments,
        Boolean isLiked
) {
}
