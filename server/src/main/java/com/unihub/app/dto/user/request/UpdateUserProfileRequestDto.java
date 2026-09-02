package com.unihub.app.dto.user.request;

import com.unihub.app.validation.Username;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import org.openapitools.jackson.nullable.JsonNullable;

@Builder
public record UpdateUserProfileRequestDto(
        JsonNullable<@NotNull(message = "Username cannot be null") @Username String> username
) {
        public UpdateUserProfileRequestDto(String username) {
                this(username != null ? JsonNullable.of(username) : JsonNullable.undefined());
        }

        public UpdateUserProfileRequestDto {
                username = username == null ? JsonNullable.undefined() : username.map(String::trim);
        }

        public static class UpdateUserProfileRequestDtoBuilder {
                public UpdateUserProfileRequestDtoBuilder username(String username) {
                        this.username = username != null ? JsonNullable.of(username) : JsonNullable.of(null);
                        return this;
                }
        }
}
