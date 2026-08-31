package com.unihub.app.events.notification;

import com.unihub.app.entities.authentication.User;
import com.unihub.app.entities.community.content.Post;
import com.unihub.app.entities.community.resources.Course;

public record CoursePostCreatedNotificationEvent(
        Post post,
        Course course,
        User author
) {
}
