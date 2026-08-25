package com.unihub.app.dto.community.content;

import com.unihub.app.dto.community.OwnerDto;
import lombok.Builder;

import java.time.OffsetDateTime;
import java.util.UUID;

@Builder
public record MaterialFileDto(
        UUID id,
        String title,
        String description,
        String storageKey,
        String mediaType,
        long size,
        OffsetDateTime createdAt,
        OwnerDto owner
) {
}
