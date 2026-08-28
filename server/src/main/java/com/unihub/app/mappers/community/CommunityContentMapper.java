package com.unihub.app.mappers.community;

import com.unihub.app.dto.community.OwnerDto;
import com.unihub.app.dto.community.content.request.CreateEventRequestDto;
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

    public Event toEventEntity(CreateEventRequestDto requestDto, Course course, Community community, User owner) {
        return Event.builder()
                .title(requestDto.title())
                .description(requestDto.description())
                .type(requestDto.type())
                .startTime(requestDto.startTime())
                .endTime(requestDto.endTime())
                .durationMinutes(requestDto.durationMinutes())
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
                .endTime(event.getEndTime())
                .durationMinutes(event.getDurationMinutes())
                .location(event.getLocation())
                .courseSlug(event.getCourse() != null ? event.getCourse().getSlug() : null)
                .courseName(event.getCourse() != null ? event.getCourse().getName() : null)
                .courseAbbreviation(event.getCourse() != null ? event.getCourse().getAbbreviation() : null)
                .communitySlug(event.getCommunity() != null ? event.getCommunity().getSlug() : null)
                .communityName(event.getCommunity() != null ? event.getCommunity().getName() : null)
                .studyYear(event.getCourse() != null && event.getCourse().getStudyYear() != null ? event.getCourse().getStudyYear().getStudyYearName() : null)
                .isSubscribed(isSubscribed)
                .build();
    }

    public EventResponseDto toEventResponseDto(Event event, List<EventReminderResponseDto> reminders) {
        OwnerDto owner = event.getOwner() == null
                ? null
                : new OwnerDto(event.getOwner().getId(), event.getOwner().getUsername());

        return EventResponseDto.builder()
                .id(event.getId())
                .title(event.getTitle())
                .type(event.getType())
                .description(event.getDescription())
                .locationDetails(event.getLocationDetails())
                .startTime(event.getStartTime())
                .endTime(event.getEndTime())
                .durationMinutes(event.getDurationMinutes())
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

    public Notification toNotificationEntity(User user, String title, String message, NotificationType type, Event event) {
        return Notification.builder()
                .user(user)
                .title(title)
                .message(message)
                .type(type)
                .event(event)
                .isRead(false)
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
