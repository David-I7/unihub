package com.unihub.app.dto.community.content.response;

import com.unihub.app.entities.community.content.EventLocation;
import com.unihub.app.entities.community.content.EventType;
import com.unihub.app.entities.community.resources.StudyYearName;
import lombok.Builder;

import java.time.OffsetDateTime;
import java.util.UUID;

@Builder
public record CalendarEventResponseDto(
        UUID id,
        String title,
        EventType type,
        OffsetDateTime startTime,
        OffsetDateTime endTime,
        Integer durationMinutes,
        EventLocation location,
        String courseSlug,
        String courseName,
        String courseAbbreviation,
        String communitySlug,
        String communityName,
        StudyYearName studyYear,
        boolean isSubscribed
) {
}
