package com.unihub.app.dto.community.resources.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Builder;
import org.openapitools.jackson.nullable.JsonNullable;

@Builder
public record UpdateTeacherRequestDto(
        JsonNullable<@NotNull(message = "First name cannot be null") @Size(min = 1, max = 50, message = "First name must be between 1 and 50 characters") String> firstName,
        JsonNullable<@NotNull(message = "Last name cannot be null") @Size(min = 1, max = 50, message = "Last name must be between 1 and 50 characters") String> lastName,
        JsonNullable<Integer> estimatedAge
) {
    public UpdateTeacherRequestDto {
        firstName = firstName == null ? JsonNullable.undefined() : firstName.map(String::trim);
        lastName = lastName == null ? JsonNullable.undefined() : lastName.map(String::trim);
        estimatedAge = estimatedAge == null ? JsonNullable.undefined() : estimatedAge;
    }

    public static class UpdateTeacherRequestDtoBuilder {
        public UpdateTeacherRequestDtoBuilder firstName(String firstName) {
            this.firstName = firstName != null ? JsonNullable.of(firstName) : JsonNullable.of(null);
            return this;
        }

        public UpdateTeacherRequestDtoBuilder lastName(String lastName) {
            this.lastName = lastName != null ? JsonNullable.of(lastName) : JsonNullable.of(null);
            return this;
        }

        public UpdateTeacherRequestDtoBuilder estimatedAge(Integer estimatedAge) {
            this.estimatedAge = estimatedAge != null ? JsonNullable.of(estimatedAge) : JsonNullable.of(null);
            return this;
        }
    }
}
