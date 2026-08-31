package com.unihub.app.events.notification;

import com.unihub.app.entities.authentication.User;
import com.unihub.app.entities.community.content.Post;
import com.unihub.app.entities.community.resources.Community;

public record CommunityPostCreatedNotificationEvent(
        Post post,
        Community community,
        User author
) {
}
