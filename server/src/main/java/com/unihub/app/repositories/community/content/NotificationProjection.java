package com.unihub.app.repositories.community.content;

import com.unihub.app.entities.community.content.NotificationCategory;
import com.unihub.app.entities.community.content.NotificationType;

import java.time.OffsetDateTime;
import java.util.UUID;

public interface NotificationProjection {
    UUID getId();
    String getTitle();
    String getMessage();
    NotificationCategory getCategory();
    NotificationType getType();
    boolean getIsRead();
    OffsetDateTime getCreatedAt();
    UUID getEventId();
    UUID getActorId();
    String getActorUsername();
    Boolean getActorActive();
    String getCommunitySlug();
    String getCommunityName();
    String getStudyYearName();
    String getCourseName();
    String getCourseSlug();
}
