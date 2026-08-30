package com.unihub.app.dto.community.resources.request;

import lombok.Builder;

@Builder
public record UpdateTeacherRequestDto(
        String firstName,
        String lastName,
        Integer estimatedAge
) {
}
