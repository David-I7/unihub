package com.unihub.app.mappers.community;

import com.unihub.app.dto.community.OwnerDto;
import com.unihub.app.dto.community.content.response.*;
import com.unihub.app.entities.community.content.*;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;

@Component
public class CommunityContentMapper {
    public CommentResponseDto toCommentResponseDto(Comment comment) {
        return CommentResponseDto.builder()
                .id(comment.getId())
                .postId(comment.getPost().getId())
                .content(comment.getContent())
                .createdAt(comment.getCreatedAt())
                .updatedAt(comment.getUpdatedAt())
                .owner(new OwnerDto(comment.getOwner().getId(), comment.getOwner().getUsername()))
                .build();
    }

    public PostResponseDto toPostResponseDto(Post post) {
        return toPostResponseDto(post, Collections.emptyList());
    }

    public PostResponseDto toPostResponseDto(Post post, List<CommentResponseDto> comments) {
        return PostResponseDto.builder()
                .id(post.getId())
                .title(post.getTitle())
                .description(post.getDescription())
                .channel(post.getChannel())
                .pinned(post.isPinned())
                .likesCount(post.getLikesCount())
                .commentsCount(post.getCommentsCount())
                .createdAt(post.getCreatedAt())
                .updatedAt(post.getUpdatedAt())
                .owner(new OwnerDto(post.getOwner().getId(), post.getOwner().getUsername()))
                .comments(comments)
                .build();
    }

    public FolderSummaryDto toFolderSummaryDto(Folder folder) {
        OwnerDto owner = folder.getOwner() == null
                ? null
                : new OwnerDto(folder.getOwner().getId(), folder.getOwner().getUsername());

        return FolderSummaryDto.builder()
                .id(folder.getId())
                .name(folder.getName())
                .parentFolderId(folder.getParentFolder() == null ? null : folder.getParentFolder().getId())
                .createdAt(folder.getCreatedAt())
                .owner(owner)
                .build();
    }

    public MaterialFileDto toMaterialFileDto(MaterialFile materialFile) {
        OwnerDto owner = materialFile.getOwner() == null
                ? null
                : new OwnerDto(materialFile.getOwner().getId(), materialFile.getOwner().getUsername());

        return MaterialFileDto.builder()
                .id(materialFile.getId())
                .title(materialFile.getTitle())
                .description(materialFile.getDescription())
                .storageKey(materialFile.getStorageKey())
                .mediaType(materialFile.getMediaType() != null ? materialFile.getMediaType().toString() : null)
                .size(materialFile.getSize())
                .createdAt(materialFile.getCreatedAt())
                .owner(owner)
                .build();
    }

    public MaterialLinkDto toMaterialLinkDto(MaterialLink materialLink) {
        OwnerDto owner = materialLink.getOwner() == null
                ? null
                : new OwnerDto(materialLink.getOwner().getId(), materialLink.getOwner().getUsername());

        return MaterialLinkDto.builder()
                .id(materialLink.getId())
                .title(materialLink.getTitle())
                .description(materialLink.getDescription())
                .url(materialLink.getUrl())
                .linkType(materialLink.getLinkType())
                .createdAt(materialLink.getCreatedAt())
                .owner(owner)
                .build();
    }

    public EventResponseDto toEventResponseDto(Event event) {
        return toEventResponseDto(event, false, Collections.emptyList());
    }

    public EventResponseDto toEventResponseDto(Event event, boolean isSubscribed) {
        return toEventResponseDto(event, isSubscribed, Collections.emptyList());
    }

    public EventResponseDto toEventResponseDto(Event event, boolean isSubscribed, List<EventReminderResponseDto> reminders) {
        OwnerDto owner = event.getOwner() == null
                ? null
                : new OwnerDto(event.getOwner().getId(), event.getOwner().getUsername());

        return EventResponseDto.builder()
                .id(event.getId())
                .title(event.getTitle())
                .description(event.getDescription())
                .type(event.getType())
                .startTime(event.getStartTime())
                .endTime(event.getEndTime())
                .durationMinutes(event.getDurationMinutes())
                .location(event.getLocation())
                .locationDetails(event.getLocationDetails())
                .courseId(event.getCourse().getId())
                .courseSlug(event.getCourse().getSlug())
                .courseName(event.getCourse().getName())
                .communitySlug(event.getCommunity().getSlug())
                .createdAt(event.getCreatedAt())
                .updatedAt(event.getUpdatedAt())
                .owner(owner)
                .isSubscribed(isSubscribed)
                .reminders(reminders != null ? reminders : Collections.emptyList())
                .build();
    }

    public EventReminderResponseDto toEventReminderResponseDto(EventReminder reminder) {
        return EventReminderResponseDto.builder()
                .id(reminder.getId())
                .eventId(reminder.getEvent().getId())
                .offsetMinutes(reminder.getOffsetMinutes())
                .remindAt(reminder.getRemindAt())
                .status(reminder.getStatus())
                .createdAt(reminder.getCreatedAt())
                .build();
    }

    public NotificationResponseDto toNotificationResponseDto(Notification notification) {
        return NotificationResponseDto.builder()
                .id(notification.getId())
                .title(notification.getTitle())
                .message(notification.getMessage())
                .type(notification.getType())
                .eventId(notification.getEvent() != null ? notification.getEvent().getId() : null)
                .isRead(notification.isRead())
                .createdAt(notification.getCreatedAt())
                .build();
    }
}
