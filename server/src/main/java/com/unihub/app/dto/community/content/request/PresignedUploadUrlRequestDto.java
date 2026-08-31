package com.unihub.app.dto.community.content.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record PresignedUploadUrlRequestDto(
        @NotBlank(message = "File name is required")
        String fileName,

        @NotBlank(message = "Content-Type is required")
        String contentType,

        @NotNull(message = "File size is required")
        @Positive(message = "File size must be positive")
        Long size
) {
        public PresignedUploadUrlRequestDto {
                fileName = fileName != null ? fileName.trim() : fileName;
        }
}
