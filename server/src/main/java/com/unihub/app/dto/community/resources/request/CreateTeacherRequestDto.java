package com.unihub.app.dto.community.resources.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Builder;

@Builder
public record CreateTeacherRequestDto(
        @NotBlank(message = "First name is required")
        String firstName,

        @NotBlank(message = "Last name is required")
        String lastName,

        Integer estimatedAge
) {
}
