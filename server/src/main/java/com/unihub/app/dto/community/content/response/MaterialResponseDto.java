package com.unihub.app.dto.community.content.response;

import com.unihub.app.entities.community.content.ResourceType;
import lombok.Builder;

@Builder
public record MaterialResponseDto(
        ResourceType type,
        MaterialFileDto file,
        MaterialLinkDto link
) {
}
