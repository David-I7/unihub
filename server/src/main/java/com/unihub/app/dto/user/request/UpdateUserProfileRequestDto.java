package com.unihub.app.dto.user.request;

import com.unihub.app.validation.Username;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import com.unihub.app.utils.JsonNullableUtils;
import org.openapitools.jackson.nullable.JsonNullable;

@Builder
public record UpdateUserProfileRequestDto(
        JsonNullable<@NotNull(message = "Username cannot be null") @Username String> username
) {
        public UpdateUserProfileRequestDto(String username) {
                this(username != null ? JsonNullable.of(username.trim().toLowerCase()) : JsonNullable.undefined());
        }

        public UpdateUserProfileRequestDto {
                username = JsonNullableUtils.trimToLowerCase(username);
        }
}
