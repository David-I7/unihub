package com.unihub.app.dto.community.content.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UpdateCommentRequestDto(
        @NotBlank(message = "Content is required")
        @Size(max = 2000, message = "Content must not exceed 2000 characters")
        String content
) {
}
