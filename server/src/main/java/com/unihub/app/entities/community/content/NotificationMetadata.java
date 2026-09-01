package com.unihub.app.entities.community.content;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;

import java.util.UUID;

@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public record NotificationMetadata(
        String communitySlug,
        String communityName,
        String studyYearName,
        String courseSlug,
        String courseName,
        UUID eventId,
        UUID actorId,
        String actorUsername
) {
}
