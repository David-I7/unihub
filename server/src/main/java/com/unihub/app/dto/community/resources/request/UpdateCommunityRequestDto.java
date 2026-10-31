package com.unihub.app.dto.community.resources.request;

import com.unihub.app.validation.Username;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Builder;
import com.unihub.app.utils.JsonNullableUtils;
import org.openapitools.jackson.nullable.JsonNullable;

@Builder
public record UpdateCommunityRequestDto(
        JsonNullable<@NotNull(message = "Community name cannot be null") @Size(min = 3, max = 100, message = "Community name must be between 3 and 100 characters")
        @Pattern(regexp = "^[a-zA-Z0-9 ]+$", message = "Community name must contain only alphanumeric characters and spaces") String> name,

        JsonNullable<@NotNull(message = "Slug cannot be null") @Pattern(regexp = "^[a-z0-9]+(?:-[a-z0-9]+)*$", message = "Slug must contain only lowercase alphanumeric characters and hyphens")
        @Size(min = 3, max = 100, message = "Slug must be between 3 and 100 characters") String> slug,

        JsonNullable<@Size(max = 500, message = "Description must not exceed 500 characters") String> description,

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
                        newOwnerUsername != null ? JsonNullable.of(newOwnerUsername.trim().toLowerCase()) : JsonNullable.undefined()
                );
        }

        public UpdateCommunityRequestDto {
                name = JsonNullableUtils.trim(name);
                slug = JsonNullableUtils.trim(slug);
                description = JsonNullableUtils.trim(description);
                readme = JsonNullableUtils.trim(readme);
                backgroundColor = JsonNullableUtils.trim(backgroundColor);
                verified = verified == null ? JsonNullable.undefined() : verified;
                newOwnerUsername = JsonNullableUtils.trimToLowerCase(newOwnerUsername);
        }
}
