package com.unihub.app.events.email;

import java.time.OffsetDateTime;

public record EventReminderNotificationEvent(
        String email,
        String username,
        String eventTitle,
        String eventType,
        String courseName,
        String courseAbbreviation,
        OffsetDateTime startTime,
        String location,
        String locationDetails,
        String eventUrl
) {
}
