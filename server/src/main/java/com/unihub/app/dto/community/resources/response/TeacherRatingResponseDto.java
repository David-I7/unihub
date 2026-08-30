package com.unihub.app.dto.community.resources.response;

import com.unihub.app.dto.community.OwnerDto;
import lombok.Builder;

import java.time.OffsetDateTime;
import java.util.List;

@Builder
public record TeacherRatingResponseDto(
        long id,
        String title,
        String description,
        OffsetDateTime createdAt,
        boolean isAnonymous,
        OwnerDto author,
        List<TeacherRatingValueResponseDto> values
) {
}
