package com.unihub.app.dto.community.content.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreatePostRequestDto(
        @NotBlank(message = "Title is required")
        @Size(max = 100, message = "Title must not exceed 100 characters")
        String title,

        @NotBlank(message = "Description is required")
        @Size(max = 10000, message = "Description must not exceed 10000 characters")
        String description
) {
}
