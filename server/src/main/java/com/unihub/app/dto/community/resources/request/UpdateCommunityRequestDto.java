package com.unihub.app.dto.community.resources.request;

import com.unihub.app.validation.Username;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.util.UUID;

public record UpdateCommunityRequestDto(
        @Size(min = 3, max = 100, message = "Community name must be between 3 and 100 characters")
        @Pattern(regexp = "^[a-zA-Z0-9 ]+$", message = "Community name must contain only alphanumeric characters and spaces")
        String name,

        @Pattern(regexp = "^[a-z0-9]+(?:-[a-z0-9]+)*$", message = "Slug must contain only lowercase alphanumeric characters and hyphens")
        @Size(min = 3, max = 100, message = "Slug must be between 3 and 100 characters")
        String slug,

        @Size(max = 1000, message = "Description must not exceed 1000 characters")
        String description,

        @Size(max = 50000, message = "Readme must not exceed 50000 characters")
        String readme,

        @Pattern(regexp = "^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$", message = "Background color must be a valid hex color code")
        String backgroundColor,

        Boolean verified,

        @Username
        String newOwnerUsername
) {
        public UpdateCommunityRequestDto(String name, String slug, String description, String backgroundColor, Boolean verified, String newOwnerUsername) {
                this(name, slug, description, null, backgroundColor, verified, newOwnerUsername);
        }

        public UpdateCommunityRequestDto {
                name = name != null ? name.trim() : name;
                slug = slug != null ? slug.trim() : slug;
                description = description != null ? description.trim() : description;
                readme = readme != null ? readme.trim() : readme;
                backgroundColor = backgroundColor != null ? backgroundColor.trim() : backgroundColor;
        }
}
