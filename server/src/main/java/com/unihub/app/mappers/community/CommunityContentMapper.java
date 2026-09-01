package com.unihub.app.mappers.community;

import com.unihub.app.dto.community.OwnerDto;
import com.unihub.app.dto.community.content.request.CreateCommentRequestDto;
import com.unihub.app.dto.community.content.request.CreateEventRequestDto;
import com.unihub.app.dto.community.content.request.CreatePostRequestDto;
import com.unihub.app.dto.community.content.response.*;
import com.unihub.app.entities.authentication.User;
import com.unihub.app.entities.community.content.*;
import com.unihub.app.entities.community.resources.Community;
import com.unihub.app.entities.community.resources.Course;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
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
                .owner(new OwnerDto(comment.getOwner().getId(), comment.getOwner().getUsername(), comment.getOwner().isActive()))
                .build();
    }

    public PostResponseDto toPostResponseDto(Post post) {
        return toPostResponseDto(post, null);
    }

    public PostResponseDto toPostResponseDto(Post post, Boolean isLiked) {
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
                .owner(new OwnerDto(post.getOwner().getId(), post.getOwner().getUsername(), post.getOwner().isActive()))
                .isLiked(isLiked)
                .build();
    }

    public Post toPostEntity(CreatePostRequestDto dto, CommunicationChannel channel, User owner) {
        return Post.builder()
                .title(dto.title())
                .description(dto.description())
                .channel(channel)
                .pinned(false)
                .likesCount(0)
                .commentsCount(0)
                .owner(owner)
                .build();
    }

    public Comment toCommentEntity(CreateCommentRequestDto dto, Post post, User owner) {
        return Comment.builder()
                .post(post)
                .owner(owner)
                .content(dto.content())
                .build();
    }

    public FolderSummaryDto toFolderSummaryDto(Folder folder) {
        OwnerDto owner = folder.getOwner() == null
                ? null
                : new OwnerDto(folder.getOwner().getId(), folder.getOwner().getUsername(), folder.getOwner().isActive());

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
                : new OwnerDto(materialFile.getOwner().getId(), materialFile.getOwner().getUsername(), materialFile.getOwner().isActive());

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
                : new OwnerDto(materialLink.getOwner().getId(), materialLink.getOwner().getUsername(), materialLink.getOwner().isActive());

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

    public CourseMaterialsResponseDto toCourseMaterialsResponseDto(List<Folder> folders, List<Resource> resources) {
        List<FolderSummaryDto> folderDtos = folders.stream()
                .map(this::toFolderSummaryDto)
                .toList();

        List<MaterialFileDto> fileDtos = new ArrayList<>();
        List<MaterialLinkDto> linkDtos = new ArrayList<>();

        for (Resource resource : resources) {
            if (resource instanceof MaterialFile file) {
                fileDtos.add(toMaterialFileDto(file));
            } else if (resource instanceof MaterialLink link) {
                linkDtos.add(toMaterialLinkDto(link));
            }
        }

        return CourseMaterialsResponseDto.builder()
                .folders(folderDtos)
                .files(fileDtos)
                .links(linkDtos)
                .build();
    }

    public MaterialResponseDto toMaterialResponseDto(Resource resource) {
        if (resource instanceof MaterialFile file) {
            return MaterialResponseDto.builder()
                    .type(ResourceType.MATERIAL_FILE)
                    .file(toMaterialFileDto(file))
                    .build();
        } else if (resource instanceof MaterialLink link) {
            return MaterialResponseDto.builder()
                    .type(ResourceType.MATERIAL_LINK)
                    .link(toMaterialLinkDto(link))
                    .build();
        }
        return MaterialResponseDto.builder()
                .type(resource.getType())
                .build();
    }

    public Event toEventEntity(CreateEventRequestDto requestDto, Course course, Community community, User owner) {
        return Event.builder()
                .title(requestDto.title())
                .description(requestDto.description())
                .type(requestDto.type())
                .startTime(requestDto.startTime())
                .durationHours(requestDto.durationHours())
                .location(requestDto.location())
                .locationDetails(requestDto.locationDetails())
                .course(course)
                .community(community)
                .owner(owner)
                .build();
    }

    public CalendarEventResponseDto toCalendarEventResponseDto(Event event, boolean isSubscribed) {
        return CalendarEventResponseDto.builder()
                .id(event.getId())
                .title(event.getTitle())
                .type(event.getType())
                .startTime(event.getStartTime())
                .durationHours(event.getDurationHours())
                .location(event.getLocation())
                .courseSlug(event.getCourse() != null ? event.getCourse().getSlug() : null)
                .courseName(event.getCourse() != null ? event.getCourse().getName() : null)
                .courseAbbreviation(event.getCourse() != null ? event.getCourse().getAbbreviation() : null)
                .communitySlug(event.getCommunity() != null ? event.getCommunity().getSlug() : null)
                .communityName(event.getCommunity() != null ? event.getCommunity().getName() : null)
                .studyYear(event.getCourse() != null && event.getCourse().getStudyYear() != null ? event.getCourse().getStudyYear().getStudyYearName() : null)
                .isSubscribed(isSubscribed)
                .ownerId(event.getOwner() != null ? event.getOwner().getId() : null)
                .build();
    }

    public EventResponseDto toEventResponseDto(Event event, List<EventReminderResponseDto> reminders) {
        OwnerDto owner = event.getOwner() == null
                ? null
                : new OwnerDto(event.getOwner().getId(), event.getOwner().getUsername(), event.getOwner().isActive());

        return EventResponseDto.builder()
                .id(event.getId())
                .title(event.getTitle())
                .type(event.getType())
                .description(event.getDescription())
                .locationDetails(event.getLocationDetails())
                .startTime(event.getStartTime())
                .durationHours(event.getDurationHours())
                .location(event.getLocation())
                .courseSlug(event.getCourse() != null ? event.getCourse().getSlug() : null)
                .courseName(event.getCourse() != null ? event.getCourse().getName() : null)
                .courseAbbreviation(event.getCourse() != null ? event.getCourse().getAbbreviation() : null)
                .communitySlug(event.getCommunity() != null ? event.getCommunity().getSlug() : null)
                .communityName(event.getCommunity() != null ? event.getCommunity().getName() : null)
                .studyYear(event.getCourse() != null && event.getCourse().getStudyYear() != null ? event.getCourse().getStudyYear().getStudyYearName() : null)
                .owner(owner)
                .reminders(reminders)
                .build();
    }

    public EventReminderResponseDto toEventReminderResponseDto(EventReminder reminder) {
        return EventReminderResponseDto.builder()
                .id(reminder.getId())
                .eventId(reminder.getEvent().getId())
                .offsetMinutes(reminder.getOffsetMinutes())
                .remindAt(reminder.getRemindAt())
                .status(reminder.getStatus())
                .build();
    }

    public UserReminderResponseDto toUserReminderResponseDto(EventReminder reminder) {
        Event event = reminder.getEvent();
        Course course = event != null ? event.getCourse() : null;
        Community community = event != null ? event.getCommunity() : null;

        return UserReminderResponseDto.builder()
                .id(reminder.getId())
                .offsetMinutes(reminder.getOffsetMinutes())
                .remindAt(reminder.getRemindAt())
                .status(reminder.getStatus())
                .eventId(event != null ? event.getId() : null)
                .eventTitle(event != null ? event.getTitle() : null)
                .eventType(event != null ? event.getType() : null)
                .eventStartTime(event != null ? event.getStartTime() : null)
                .durationHours(event != null ? event.getDurationHours() : null)
                .eventLocation(event != null ? event.getLocation() : null)
                .courseSlug(course != null ? course.getSlug() : null)
                .courseName(course != null ? course.getName() : null)
                .courseAbbreviation(course != null ? course.getAbbreviation() : null)
                .communitySlug(community != null ? community.getSlug() : null)
                .communityName(community != null ? community.getName() : null)
                .studyYear(course != null && course.getStudyYear() != null ? course.getStudyYear().getStudyYearName() : null)
                .build();
    }

    public EventNotification toEventNotificationEntity(User user, String title, String message, EventNotificationType type, Event event, User actor) {
        return EventNotification.builder()
                .user(user)
                .title(title)
                .message(message)
                .category(NotificationCategory.EVENT)
                .type(type)
                .event(event)
                .actor(actor)
                .isRead(false)
                .build();
    }

    public PostNotification toPostNotificationEntity(User user, String title, String message, PostNotificationType type, Post post, User actor) {
        return PostNotification.builder()
                .user(user)
                .title(title)
                .message(message)
                .category(NotificationCategory.POST)
                .type(type)
                .post(post)
                .actor(actor)
                .isRead(false)
                .build();
    }

    public SystemNotification toSystemNotificationEntity(User user, String title, String message, SystemNotificationType type) {
        return SystemNotification.builder()
                .user(user)
                .title(title)
                .message(message)
                .category(NotificationCategory.SYSTEM)
                .type(type != null ? type : SystemNotificationType.GENERAL)
                .isRead(false)
                .build();
    }

    public EventNotificationResponseDto toEventNotificationResponseDto(EventNotification notification) {
        String communitySlug = notification.getEvent() != null && notification.getEvent().getCommunity() != null
                ? notification.getEvent().getCommunity().getSlug()
                : null;
        OwnerDto actor = notification.getActor() != null
                ? new OwnerDto(notification.getActor().getId(), notification.getActor().getUsername(), notification.getActor().isActive())
                : null;

        return EventNotificationResponseDto.builder()
                .id(notification.getId())
                .title(notification.getTitle())
                .message(notification.getMessage())
                .category(NotificationCategory.EVENT)
                .type(notification.getType())
                .isRead(notification.isRead())
                .createdAt(notification.getCreatedAt())
                .eventId(notification.getEvent() != null ? notification.getEvent().getId() : null)
                .actor(actor)
                .communitySlug(communitySlug)
                .build();
    }

    public PostNotificationResponseDto toPostNotificationResponseDto(
            PostNotification notification,
            String communitySlug,
            String studyYear,
            String courseSlug
    ) {
        OwnerDto actor = notification.getActor() != null
                ? new OwnerDto(notification.getActor().getId(), notification.getActor().getUsername(), notification.getActor().isActive())
                : null;

        return PostNotificationResponseDto.builder()
                .id(notification.getId())
                .title(notification.getTitle())
                .message(notification.getMessage())
                .category(NotificationCategory.POST)
                .type(notification.getType())
                .isRead(notification.isRead())
                .createdAt(notification.getCreatedAt())
                .postId(notification.getPost() != null ? notification.getPost().getId() : null)
                .actor(actor)
                .communitySlug(communitySlug)
                .studyYear(studyYear)
                .courseSlug(courseSlug)
                .build();
    }

    public SystemNotificationResponseDto toSystemNotificationResponseDto(SystemNotification notification) {
        return SystemNotificationResponseDto.builder()
                .id(notification.getId())
                .title(notification.getTitle())
                .message(notification.getMessage())
                .category(NotificationCategory.SYSTEM)
                .type(notification.getType())
                .isRead(notification.isRead())
                .createdAt(notification.getCreatedAt())
                .build();
    }

    public NotificationResponseDto toNotificationResponseDto(
            Notification notification,
            String communitySlug,
            String studyYear,
            String courseSlug
    ) {
        if (notification instanceof EventNotification en) {
            return toEventNotificationResponseDto(en);
        } else if (notification instanceof PostNotification pn) {
            return toPostNotificationResponseDto(pn, communitySlug, studyYear, courseSlug);
        } else if (notification instanceof SystemNotification sn) {
            return toSystemNotificationResponseDto(sn);
        }
        throw new IllegalArgumentException("Unknown notification entity type: " + notification.getClass().getName());
    }
}
