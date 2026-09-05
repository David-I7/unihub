package com.unihub.app.dto.community.content.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.util.UUID;

public record CreateMaterialFileRequestDto(
        @NotBlank(message = "Title is required")
        @Size(max = 100, message = "Title must not exceed 100 characters")
        String title,

        @Size(max = 500, message = "Description must not exceed 500 characters")
        String description,

        UUID folderId,

        @NotBlank(message = "Storage key is required")
        String storageKey,

        @NotBlank(message = "Media type is required")
        String mediaType,

        @NotNull(message = "Size is required")
        @Positive(message = "Size must be positive")
        Long size
) {
}
