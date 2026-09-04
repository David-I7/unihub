package com.unihub.app.services.community.content;

import com.unihub.app.entities.authentication.User;
import com.unihub.app.entities.community.content.Notification;
import com.unihub.app.entities.community.content.NotificationCategory;
import com.unihub.app.entities.community.content.NotificationMetadata;
import com.unihub.app.entities.community.content.NotificationType;
import com.unihub.app.events.notification.*;
import com.unihub.app.mappers.community.CommunityContentMapper;
import com.unihub.app.repositories.authentication.UserRepository;
import com.unihub.app.repositories.community.content.NotificationRepository;
import com.unihub.app.repositories.community.resources.CommunityMemberRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Component
@RequiredArgsConstructor
@Slf4j
public class NotificationEventListener {

    private final NotificationRepository notificationRepository;
    private final CommunityMemberRepository communityMemberRepository;
    private final UserRepository userRepository;
    private final CommunityContentMapper contentMapper;
    private final int MAX_NOTIFICATION_MESSAGE_LENGTH = 50;

    private static String truncate(String text, int maxLength) {
        if (text.length() <= maxLength) {
            return text;
        }
        return text.substring(0, maxLength);
    }

    @Async
    @EventListener
    @Transactional
    public void handleCommunityPostCreated(CommunityPostCreatedNotificationEvent event) {
        log.info("Handling CommunityPostCreatedNotificationEvent for post {}", event.post().getId());
        List<User> members = communityMemberRepository.findMembersByCommunityIdExcludingUser(
                event.community().getId(),
                event.author().getId()
        );

        if (members.isEmpty()) {
            return;
        }

        String message = String.format("posted in %s: \"%s\"",
                event.community().getName(),
                truncate(event.post().getTitle(), MAX_NOTIFICATION_MESSAGE_LENGTH));
        NotificationMetadata metadata = contentMapper.toPostNotificationMetadata(event.post());

        List<Notification> notifications = new ArrayList<>(members.size());
        for (User member : members) {
            notifications.add(contentMapper.toNotificationEntity(
                    member,
                    event.author(),
                    message,
                    NotificationCategory.POST,
                    NotificationType.COMMUNITY_POST,
                    metadata
            ));
        }

        notificationRepository.saveAll(notifications);
    }

    @Async
    @EventListener
    @Transactional
    public void handleCoursePostCreated(CoursePostCreatedNotificationEvent event) {
        log.info("Handling CoursePostCreatedNotificationEvent for post {}", event.post().getId());
        UUID communityId = event.course().getStudyYear().getCommunity().getId();
        List<User> members = communityMemberRepository.findMembersByCommunityIdExcludingUser(
                communityId,
                event.author().getId()
        );

        if (members.isEmpty()) {
            return;
        }

        String message = String.format("posted in %s: \"%s\"",
                event.course().getName(),
                truncate(event.post().getTitle(), MAX_NOTIFICATION_MESSAGE_LENGTH));
        NotificationMetadata metadata = contentMapper.toPostNotificationMetadata(event.post());

        List<Notification> notifications = new ArrayList<>(members.size());
        for (User member : members) {
            notifications.add(contentMapper.toNotificationEntity(
                    member,
                    event.author(),
                    message,
                    NotificationCategory.POST,
                    NotificationType.COURSE_POST,
                    metadata
            ));
        }

        notificationRepository.saveAll(notifications);
    }

    @Async
    @EventListener
    @Transactional
    public void handleCommentCreated(CommentCreatedNotificationEvent event) {
        log.info("Handling CommentCreatedNotificationEvent for post {}", event.post().getId());
        User postOwner = event.post().getOwner();

        if (postOwner == null || postOwner.getId().equals(event.commentAuthor().getId())) {
            return;
        }

        String message = String.format("commented on your post: \"%s\"",
                truncate(event.comment().getContent(), MAX_NOTIFICATION_MESSAGE_LENGTH));

        Notification notification = contentMapper.toPostNotificationEntity(
                postOwner,
                message,
                NotificationType.POST_COMMENT,
                event.post(),
                event.commentAuthor(),
                event.comment().getId()
        );

        notificationRepository.save(notification);
    }

    @Async
    @EventListener
    @Transactional
    public void handlePostLiked(PostLikedNotificationEvent event) {
        log.info("Handling PostLikedNotificationEvent for post {}", event.post().getId());
        User postOwner = event.post().getOwner();

        if (postOwner == null || postOwner.getId().equals(event.liker().getId())) {
            return;
        }

        String message = String.format("liked your post \"%s\"",
                truncate(event.post().getTitle(), MAX_NOTIFICATION_MESSAGE_LENGTH));

        Notification notification = contentMapper.toPostNotificationEntity(
                postOwner,
                message,
                NotificationType.POST_LIKE,
                event.post(),
                event.liker()
        );

        notificationRepository.save(notification);
    }

    @Async
    @EventListener
    @Transactional
    public void handleEventUpdated(EventUpdatedDomainNotificationEvent event) {
        log.info("Handling EventUpdatedDomainNotificationEvent for event {}", event.event().getId());
        if (event.recipientUserIds().isEmpty()) {
            return;
        }

        List<User> recipients = userRepository.findAllById(event.recipientUserIds());
        String message = String.format("updated the event \"%s\"", truncate(event.event().getTitle(),MAX_NOTIFICATION_MESSAGE_LENGTH));

        List<Notification> notifications = new ArrayList<>();
        for (User recipient : recipients) {
            if (event.updater() != null && recipient.getId().equals(event.updater().getId())) {
                continue;
            }
            notifications.add(contentMapper.toEventNotificationEntity(
                    recipient,
                    message,
                    NotificationType.EVENT_UPDATED,
                    event.event(),
                    event.updater()
            ));
        }

        if (!notifications.isEmpty()) {
            notificationRepository.saveAll(notifications);
        }
    }

    @Async
    @EventListener
    @Transactional
    public void handleEventCancelled(EventCancelledDomainNotificationEvent event) {
        log.info("Handling EventCancelledDomainNotificationEvent for event {}", event.eventTitle());
        if (event.recipientUserIds().isEmpty()) {
            return;
        }

        List<User> recipients = userRepository.findAllById(event.recipientUserIds());
        String message = String.format("cancelled the event \"%s\"", truncate(event.eventTitle(), MAX_NOTIFICATION_MESSAGE_LENGTH));

        List<Notification> notifications = new ArrayList<>();
        for (User recipient : recipients) {
            if (event.canceller() != null && recipient.getId().equals(event.canceller().getId())) {
                continue;
            }
            notifications.add(contentMapper.toNotificationEntity(
                    recipient,
                    event.canceller(),
                    message,
                    NotificationCategory.EVENT,
                    NotificationType.EVENT_CANCELLED,
                    null
            ));
        }

        if (!notifications.isEmpty()) {
            notificationRepository.saveAll(notifications);
        }
    }
}
