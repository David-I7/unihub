package com.unihub.app.dto.community.content.response;

import com.unihub.app.dto.community.OwnerDto;
import lombok.Builder;

import java.time.OffsetDateTime;
import java.util.UUID;

@Builder
public record FolderSummaryDto(
        UUID id,
        String name,
        UUID parentFolderId,
        OffsetDateTime createdAt,
        OwnerDto owner
) {
}
