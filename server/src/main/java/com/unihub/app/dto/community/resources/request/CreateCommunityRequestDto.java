package com.unihub.app.dto.community.resources.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record CreateCommunityRequestDto(
        @NotBlank(message = "Community name is required")
        @Size(min = 3, max = 100, message = "Community name must be between 3 and 100 characters")
        @Pattern(regexp = "^[a-zA-Z0-9 ]+$", message = "Community name must contain only alphanumeric characters and spaces")
        String name,

        @NotBlank(message = "Community slug is required")
        @Pattern(regexp = "^[a-z0-9]+(?:-[a-z0-9]+)*$", message = "Slug must contain only lowercase alphanumeric characters and hyphens in between characters")
        @Size(min = 3, max = 100, message = "Slug must be between 3 and 100 characters")
        String slug,

        @NotBlank(message = "Description is required")
        @Size(max = 1000, message = "Description must not exceed 1000 characters")
        String description,

        @Size(max = 50000, message = "Readme must not exceed 50000 characters")
        String readme,

        @NotBlank(message = "Background color is required")
        @Pattern(regexp = "^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$", message = "Background color must be a valid hex color code")
        String backgroundColor
) {

        public CreateCommunityRequestDto(String name, String slug, String description, String backgroundColor) {
                this(name, slug, description, null, backgroundColor);
        }

        public CreateCommunityRequestDto {
                name = name != null ? name.trim() : name;
                slug = slug != null ? slug.trim() : slug;
                description = description != null ? description.trim() : description;
                readme = readme != null ? readme.trim() : readme;
                backgroundColor = backgroundColor != null ? backgroundColor.trim() : backgroundColor;
        }
}
