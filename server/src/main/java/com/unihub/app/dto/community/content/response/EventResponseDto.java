package com.unihub.app.dto.community.content.response;

import com.unihub.app.dto.community.OwnerDto;
import com.unihub.app.entities.community.content.EventLocation;
import com.unihub.app.entities.community.content.EventType;
import com.unihub.app.entities.community.resources.StudyYearName;
import lombok.*;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Builder
@AllArgsConstructor
@Getter
@NoArgsConstructor
@Setter
public class EventResponseDto{
        private UUID id;
        private String title;
        private EventType type;
        private String description;
        private String locationDetails;
        private OffsetDateTime startTime;
        private OffsetDateTime endTime;
        private Integer durationMinutes;
        private EventLocation location;
        private String courseSlug;
        private String courseName;
        private String courseAbbreviation;
        private String communitySlug;
        private String communityName;
        private StudyYearName studyYear;
        private OwnerDto owner;
        private List<EventReminderResponseDto> reminders;
}
