package com.unihub.app.dto.community.content.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateCommentRequestDto(
        @NotBlank(message = "Content is required")
        @Size(max = 500, message = "Content must not exceed 500 characters")
        String content
) {
}
