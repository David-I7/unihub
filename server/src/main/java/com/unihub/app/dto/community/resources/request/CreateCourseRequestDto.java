package com.unihub.app.dto.community.resources.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Builder;

import java.util.List;
import java.util.UUID;

@Builder
public record CreateCourseRequestDto(
        @NotBlank(message = "Course name is required")
        @Size(min = 2, max = 100, message = "Course name must be between 2 and 100 characters")
        String name,

        @NotBlank(message = "Course slug is required")
        @Pattern(regexp = "^[a-z0-9]+(?:-[a-z0-9]+)*$", message = "Slug must contain only lowercase alphanumeric characters and hyphens")
        @Size(min = 2, max = 100, message = "Slug must be between 2 and 100 characters")
        String slug,

        @NotBlank(message = "Course abbreviation is required")
        @Size(min = 2, max = 4, message = "Abbreviation must be between 2 and 4 characters")
        String abbreviation,

        @NotNull(message = "Semester is required")
        @Min(value = 1, message = "Semester must be either 1 or 2")
        @Max(value = 2, message = "Semester must be either 1 or 2")
        Integer semester,

        @Min(value = 1, message = "Credit points must be at least 1")
        @Max(value = 6, message = "Credit points cannot exceed 6")
        Integer creditPoints,

        @Size(max = 1000, message = "Description must not exceed 1000 characters")
        String description,

        @Size(max = 50000, message = "Readme must not exceed 50000 characters")
        String readme,

        List<UUID> teacherIds
) {
    public CreateCourseRequestDto {
        name = name != null ? name.trim() : name;
        slug = slug != null ? slug.trim() : slug;
        abbreviation = abbreviation != null ? abbreviation.trim() : abbreviation;
        description = description != null ? description.trim() : description;
        readme = readme != null ? readme.trim() : readme;
        if (creditPoints == null) {
            creditPoints = 5;
        }
    }
}
