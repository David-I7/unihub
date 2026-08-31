package com.unihub.app.dto.community.content.request;

import com.unihub.app.entities.community.content.MaterialLinkType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.UUID;

public record CreateMaterialLinkRequestDto(
        @NotBlank(message = "Title is required")
        @Size(max = 200, message = "Title must not exceed 200 characters")
        String title,

        @Size(max = 2000, message = "Description must not exceed 2000 characters")
        String description,

        UUID folderId,

        @NotBlank(message = "URL is required")
        String url,

        @NotNull(message = "Link type is required")
        MaterialLinkType linkType
) {
}
