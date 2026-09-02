package com.unihub.app.dto.community.resources.request;

import com.unihub.app.validation.Username;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Builder;
import org.openapitools.jackson.nullable.JsonNullable;

@Builder
public record UpdateCommunityRequestDto(
        JsonNullable<@NotNull(message = "Community name cannot be null") @Size(min = 3, max = 100, message = "Community name must be between 3 and 100 characters")
        @Pattern(regexp = "^[a-zA-Z0-9 ]+$", message = "Community name must contain only alphanumeric characters and spaces") String> name,

        JsonNullable<@NotNull(message = "Slug cannot be null") @Pattern(regexp = "^[a-z0-9]+(?:-[a-z0-9]+)*$", message = "Slug must contain only lowercase alphanumeric characters and hyphens")
        @Size(min = 3, max = 100, message = "Slug must be between 3 and 100 characters") String> slug,

        JsonNullable<@Size(max = 1000, message = "Description must not exceed 1000 characters") String> description,

        JsonNullable<@Size(max = 50000, message = "Readme must not exceed 50000 characters") String> readme,

        JsonNullable<@Pattern(regexp = "^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$", message = "Background color must be a valid hex color code") String> backgroundColor,

        JsonNullable<Boolean> verified,

        JsonNullable<@Username String> newOwnerUsername
) {
        public UpdateCommunityRequestDto(String name, String slug, String description, String backgroundColor, Boolean verified, String newOwnerUsername) {
                this(
                        name != null ? JsonNullable.of(name) : JsonNullable.undefined(),
                        slug != null ? JsonNullable.of(slug) : JsonNullable.undefined(),
                        description != null ? JsonNullable.of(description) : JsonNullable.undefined(),
                        JsonNullable.undefined(),
                        backgroundColor != null ? JsonNullable.of(backgroundColor) : JsonNullable.undefined(),
                        verified != null ? JsonNullable.of(verified) : JsonNullable.undefined(),
                        newOwnerUsername != null ? JsonNullable.of(newOwnerUsername) : JsonNullable.undefined()
                );
        }

        public UpdateCommunityRequestDto {
                name = name == null ? JsonNullable.undefined() : name.map(String::trim);
                slug = slug == null ? JsonNullable.undefined() : slug.map(String::trim);
                description = description == null ? JsonNullable.undefined() : description.map(String::trim);
                readme = readme == null ? JsonNullable.undefined() : readme.map(String::trim);
                backgroundColor = backgroundColor == null ? JsonNullable.undefined() : backgroundColor.map(String::trim);
                verified = verified == null ? JsonNullable.undefined() : verified;
                newOwnerUsername = newOwnerUsername == null ? JsonNullable.undefined() : newOwnerUsername.map(String::trim);
        }
}
