package com.unihub.app.dto.community.content.request;

import jakarta.validation.constraints.Size;

public record UpdatePostRequestDto(
        @Size(max = 200, message = "Title must not exceed 200 characters")
        String title,

        @Size(max = 10000, message = "Description must not exceed 10000 characters")
        String description
) {
}
