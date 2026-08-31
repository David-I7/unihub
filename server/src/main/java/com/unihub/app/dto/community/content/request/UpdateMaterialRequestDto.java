package com.unihub.app.dto.community.content.request;

import com.unihub.app.entities.community.content.MaterialLinkType;
import jakarta.validation.constraints.Size;

import java.util.UUID;

public record UpdateMaterialRequestDto(
        @Size(min = 1, max = 200, message = "Title must be between 1 and 200 characters")
        String title,

        @Size(max = 2000, message = "Description must not exceed 2000 characters")
        String description,

        UUID folderId,
        Boolean moveToRoot,

        String url,
        MaterialLinkType linkType
) {
}
