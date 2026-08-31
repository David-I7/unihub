package com.unihub.app.dto.community.content.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.UUID;

public record CreateFolderRequestDto(
        @NotBlank(message = "Folder name is required")
        @Size(min = 1, max = 100, message = "Folder name must be between 1 and 100 characters")
        String name,
        UUID parentFolderId
) {
        public CreateFolderRequestDto {
                name = name != null ? name.trim() : name;
        }
}
