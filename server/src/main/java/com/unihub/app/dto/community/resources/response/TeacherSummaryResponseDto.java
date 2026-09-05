package com.unihub.app.dto.community.resources.response;

import lombok.Builder;

import java.util.UUID;

@Builder
public record TeacherSummaryResponseDto(
        UUID id,
        String firstName,
        String lastName
) {
}
