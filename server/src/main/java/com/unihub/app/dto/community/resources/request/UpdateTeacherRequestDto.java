package com.unihub.app.dto.community.resources.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.Builder;
import org.openapitools.jackson.nullable.JsonNullable;

@Builder
public record UpdateTeacherRequestDto(
        JsonNullable<@NotNull(message = "First name cannot be null") @Size(min = 1, max = 50, message = "First name must be between 1 and 50 characters") String> firstName,
        JsonNullable<@NotNull(message = "Last name cannot be null") @Size(min = 1, max = 50, message = "Last name must be between 1 and 50 characters") String> lastName,
        JsonNullable<@Positive(message = "Estimated age must be a positive integer") Integer> estimatedAge
) {
    public UpdateTeacherRequestDto {
        firstName = firstName == null ? JsonNullable.undefined() : firstName.map(String::trim);
        lastName = lastName == null ? JsonNullable.undefined() : lastName.map(String::trim);
        estimatedAge = estimatedAge == null ? JsonNullable.undefined() : estimatedAge;
    }
}
