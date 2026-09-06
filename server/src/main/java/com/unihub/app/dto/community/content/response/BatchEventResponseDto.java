package com.unihub.app.dto.community.content.response;

import lombok.Builder;

import java.util.List;

@Builder
public record BatchEventResponseDto(
        int createdCount,
        int updatedCount,
        List<CalendarEventResponseDto> events
) {
}
