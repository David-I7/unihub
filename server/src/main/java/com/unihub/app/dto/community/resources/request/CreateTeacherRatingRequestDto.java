package com.unihub.app.dto.community.resources.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import lombok.Builder;

import java.util.List;

@Builder
public record CreateTeacherRatingRequestDto(
        @NotBlank(message = "Review title is required")
        @Size(max = 100, message = "Review title cannot exceed 100 characters")
        String title,

        @Size(max = 500, message = "Review description cannot exceed 500 characters")
        String description,

        boolean isAnonymous,

        @NotEmpty(message = "Rating values cannot be empty")
        List<@Valid RatingValueRequestDto> values
) {
        public CreateTeacherRatingRequestDto {
                title = title != null ? title.trim() : title;
                description = description != null ? description.trim() : description;
        }
}
