package com.unihub.app.events.notification;

import com.unihub.app.entities.authentication.User;
import com.unihub.app.entities.community.content.Post;

public record PostLikedNotificationEvent(
        Post post,
        User liker
) {
}
