package com.unihub.app.dto.community.resources.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import lombok.Builder;

import java.util.List;

@Builder
public record UpdateTeacherRatingRequestDto(
        @NotBlank(message = "Review title is required")
        @Size(max = 255, message = "Review title cannot exceed 255 characters")
        String title,

        String description,

        boolean isAnonymous,

        @NotEmpty(message = "Rating values cannot be empty")
        List<@Valid RatingValueRequestDto> values
) {
}
