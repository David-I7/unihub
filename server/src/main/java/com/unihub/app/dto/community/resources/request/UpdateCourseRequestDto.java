package com.unihub.app.dto.community.resources.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Builder;

import java.util.List;
import java.util.UUID;

@Builder
public record UpdateCourseRequestDto(
        @Size(min = 2, max = 100, message = "Course name must be between 2 and 100 characters")
        String name,

        @Pattern(regexp = "^[a-z0-9]+(?:-[a-z0-9]+)*$", message = "Slug must contain only lowercase alphanumeric characters and hyphens")
        @Size(min = 2, max = 100, message = "Slug must be between 2 and 100 characters")
        String slug,

        @Size(min = 1, max = 20, message = "Abbreviation must be between 1 and 20 characters")
        String abbreviation,

        @Min(value = 1, message = "Semester must be either 1 or 2")
        @Max(value = 2, message = "Semester must be either 1 or 2")
        Integer semester,

        @Min(value = 1, message = "Credit points must be at least 1")
        @Max(value = 30, message = "Credit points cannot exceed 30")
        Integer creditPoints,

        @Size(max = 1000, message = "Description must not exceed 1000 characters")
        String description,

        @Size(max = 50000, message = "Readme must not exceed 50000 characters")
        String readme,

        Boolean archived,

        List<UUID> teacherIds
) {
    public UpdateCourseRequestDto {
        name = (name != null && !name.isBlank()) ? name.trim() : null;
        slug = (slug != null && !slug.isBlank()) ? slug.trim() : null;
        abbreviation = (abbreviation != null && !abbreviation.isBlank()) ? abbreviation.trim() : null;
        description = (description != null && !description.isBlank()) ? description.trim() : (description != null ? null : description);
        readme = (readme != null && !readme.isBlank()) ? readme.trim() : (readme != null ? null : readme);
    }
}
