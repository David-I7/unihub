package com.unihub.app.events.notification;

import com.unihub.app.entities.authentication.User;
import com.unihub.app.entities.community.content.Event;

import java.util.List;
import java.util.UUID;

public record EventUpdatedDomainNotificationEvent(
        Event event,
        User updater,
        List<UUID> recipientUserIds
) {
}
