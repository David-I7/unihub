package com.unihub.app.dto.community.resources.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Builder;

@Builder
public record CreateTeacherRequestDto(
        @NotBlank(message = "First name is required")
        @Size(min = 1, max = 50, message = "First name must be between 1 and 50 characters")
        String firstName,

        @NotBlank(message = "Last name is required")
        @Size(min = 1, max = 50, message = "Last name must be between 1 and 50 characters")
        String lastName,

        Integer estimatedAge
) {
        public CreateTeacherRequestDto {
                firstName = firstName != null ? firstName.trim() : firstName;
                lastName = lastName != null ? lastName.trim() : lastName;
        }
}
