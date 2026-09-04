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
import java.util.List;
import java.util.UUID;

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

    public PostDetailResponseDto toPostDetailResponseDto(Post post, Boolean isLiked) {
        String communitySlug = null;
        String communityName = null;
        String studyYearSlug = null;
        String studyYearName = null;
        String courseSlug = null;
        String courseName = null;

        if (post.getCommunityPost() != null && post.getCommunityPost().getCommunity() != null) {
            communitySlug = post.getCommunityPost().getCommunity().getSlug();
            communityName = post.getCommunityPost().getCommunity().getName();
        } else if (post.getCoursePost() != null && post.getCoursePost().getCourse() != null) {
            var course = post.getCoursePost().getCourse();
            courseSlug = course.getSlug();
            courseName = course.getName();
            if (course.getStudyYear() != null) {
                if (course.getStudyYear().getStudyYearName() != null) {
                    studyYearName = course.getStudyYear().getStudyYearName().name();
                    studyYearSlug = course.getStudyYear().getStudyYearName().name().toLowerCase().replace('_', '-');
                }
                if (course.getStudyYear().getCommunity() != null) {
                    communitySlug = course.getStudyYear().getCommunity().getSlug();
                    communityName = course.getStudyYear().getCommunity().getName();
                }
            }
        }

        return PostDetailResponseDto.builder()
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
                .communitySlug(communitySlug)
                .communityName(communityName)
                .studyYearSlug(studyYearSlug)
                .studyYearName(studyYearName)
                .courseSlug(courseSlug)
                .courseName(courseName)
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
                .courseAbbreviation(event.getCourse() != null ? event.getCourse().getAbbreviation() : null)
                .communityName(event.getCommunity() != null ? event.getCommunity().getName() : null)
                .isSubscribed(isSubscribed)
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

        return UserReminderResponseDto.builder()
                .id(reminder.getId())
                .offsetMinutes(reminder.getOffsetMinutes())
                .remindAt(reminder.getRemindAt())
                .status(reminder.getStatus())
                .eventId(event != null ? event.getId() : null)
                .eventTitle(event != null ? event.getTitle() : null)
                .eventType(event != null ? event.getType() : null)
                .eventStartTime(event != null ? event.getStartTime() : null)
                .build();
    }

    public Notification toNotificationEntity(
            User user,
            User actor,
            String message,
            NotificationCategory category,
            NotificationType type,
            NotificationMetadata metadata
    ) {
        return Notification.builder()
                .user(user)
                .actor(actor)
                .message(message)
                .category(category)
                .type(type)
                .metadata(metadata)
                .isRead(false)
                .build();
    }

    public Notification toEventNotificationEntity(User user, String message, NotificationType type, Event event, User actor) {
        NotificationMetadata metadata = toEventNotificationMetadata(event);
        return toNotificationEntity(user,actor, message, NotificationCategory.EVENT, type, metadata);
    }

    public Notification toPostNotificationEntity(User user, String message, NotificationType type, Post post, User actor) {
        return toPostNotificationEntity(user, message, type, post, actor, null);
    }

    public Notification toPostNotificationEntity(User user, String message, NotificationType type, Post post, User actor, UUID commentId) {
        NotificationMetadata metadata = toPostNotificationMetadata(post, commentId);
        return toNotificationEntity(user, actor, message, NotificationCategory.POST, type, metadata);
    }

    public NotificationMetadata toPostNotificationMetadata(Post post) {
        return toPostNotificationMetadata(post, null);
    }

    public NotificationMetadata toPostNotificationMetadata(Post post, UUID commentId) {
        NotificationMetadata.NotificationMetadataBuilder builder = NotificationMetadata.builder();
        if (post != null) {
            builder.postId(post.getId());
        }
        if (commentId != null) {
            builder.commentId(commentId);
        }
        return builder.build();
    }

    public NotificationMetadata toEventNotificationMetadata(Event event) {
        NotificationMetadata.NotificationMetadataBuilder builder = NotificationMetadata.builder();
        if (event != null) {
            builder.eventId(event.getId());
        }
        return builder.build();
    }
}
