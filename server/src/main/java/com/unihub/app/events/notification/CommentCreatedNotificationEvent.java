package com.unihub.app.events.notification;

import com.unihub.app.entities.authentication.User;
import com.unihub.app.entities.community.content.Comment;
import com.unihub.app.entities.community.content.Post;

public record CommentCreatedNotificationEvent(
        Comment comment,
        Post post,
        User commentAuthor
) {
}
