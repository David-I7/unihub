package com.unihub.app.dto.community.content;

import com.unihub.app.dto.community.OwnerDto;
import lombok.Builder;

import java.time.OffsetDateTime;
import java.util.UUID;

@Builder
public record CommentResponseDto(
        UUID id,
        UUID postId,
        String content,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt,
        OwnerDto owner
) {
}
