package com.unihub.app.events.notification;

import com.unihub.app.entities.authentication.User;

import java.util.List;
import java.util.UUID;

public record EventCancelledDomainNotificationEvent(
        String eventTitle,
        String communitySlug,
        User canceller,
        List<UUID> recipientUserIds
) {
}
