package com.unihub.app.events.email;

import java.time.OffsetDateTime;

public record EventReminderNotificationEvent(
        String email,
        String username,
        String eventTitle,
        String eventType,
        String courseName,
        OffsetDateTime startTime,
        String location,
        String locationDetails
) {
}
