package com.unihub.app.dto.community.resources;

import com.unihub.app.dto.community.OwnerDto;
import lombok.Builder;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Builder
public record CommunityDetailResponseDto(
        UUID id,
        String name,
        String description,
        int memberCount,
        OffsetDateTime createdAt,
        OwnerDto owner,
        String backgroundColor,
        boolean verified,
        String slug,
        List<StudyYearSummaryDto> studyYears
) {
}
