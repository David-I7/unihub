package com.unihub.app.dto.community.content.response;

import com.unihub.app.dto.community.OwnerDto;
import com.unihub.app.entities.community.content.MaterialLinkType;
import lombok.Builder;

import java.time.OffsetDateTime;
import java.util.UUID;

@Builder
public record MaterialLinkDto(
        UUID id,
        String title,
        String description,
        String url,
        MaterialLinkType linkType,
        OffsetDateTime createdAt,
        OwnerDto owner
) {
}
