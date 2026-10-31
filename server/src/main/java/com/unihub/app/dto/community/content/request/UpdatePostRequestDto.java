package com.unihub.app.dto.community.content.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Builder;
import com.unihub.app.utils.JsonNullableUtils;
import org.openapitools.jackson.nullable.JsonNullable;

@Builder
public record UpdatePostRequestDto(
        JsonNullable<@NotNull(message = "Title cannot be null") @Size(min = 1, max = 100, message = "Title must not exceed 100 characters") String> title,
        JsonNullable<@Size(max = 1000, message = "Description must not exceed 1000 characters") String> description
) {
    public UpdatePostRequestDto(String title, String description) {
        this(
                title != null ? JsonNullable.of(title) : JsonNullable.undefined(),
                description != null ? JsonNullable.of(description) : JsonNullable.undefined()
        );
    }

    public UpdatePostRequestDto {
        title = JsonNullableUtils.trim(title);
        description = JsonNullableUtils.trim(description);
    }

    public static class UpdatePostRequestDtoBuilder {
        public UpdatePostRequestDtoBuilder title(String title) {
            this.title = title != null ? JsonNullable.of(title) : JsonNullable.of(null);
            return this;
        }

        public UpdatePostRequestDtoBuilder description(String description) {
            this.description = description != null ? JsonNullable.of(description) : JsonNullable.of(null);
            return this;
        }
    }
}
