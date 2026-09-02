package com.unihub.app.dto.community.content.response;

import com.unihub.app.entities.community.content.EventLocation;
import com.unihub.app.entities.community.content.EventType;
import com.unihub.app.entities.community.content.ReminderStatus;
import com.unihub.app.entities.community.resources.StudyYearName;
import lombok.Builder;

import java.time.OffsetDateTime;
import java.util.UUID;

@Builder
public record UserReminderResponseDto(
        UUID id,
        int offsetMinutes,
        OffsetDateTime remindAt,
        ReminderStatus status,
        UUID eventId,
        String eventTitle,
        EventType eventType,
        OffsetDateTime eventStartTime,
        Float durationHours,
        EventLocation eventLocation,
        String courseSlug,
        String courseName,
        String courseAbbreviation,
        String communitySlug,
        String communityName,
        StudyYearName studyYear
) {
}
