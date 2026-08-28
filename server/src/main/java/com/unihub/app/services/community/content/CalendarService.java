package com.unihub.app.services.community.content;

import com.unihub.app.dto.community.content.request.CreateEventReminderRequestDto;
import com.unihub.app.dto.community.content.request.CreateEventRequestDto;
import com.unihub.app.dto.community.content.request.UpdateEventRequestDto;
import com.unihub.app.dto.community.content.response.EventReminderResponseDto;
import com.unihub.app.dto.community.content.response.CalendarEventResponseDto;
import com.unihub.app.entities.authentication.User;
import com.unihub.app.entities.community.content.*;
import com.unihub.app.entities.community.resources.Community;
import com.unihub.app.entities.community.resources.CommunityMember;
import com.unihub.app.entities.community.resources.Course;
import com.unihub.app.entities.community.resources.StudyYearName;
import com.unihub.app.mappers.community.CommunityContentMapper;
import com.unihub.app.repositories.authentication.UserRepository;
import com.unihub.app.repositories.community.content.EventReminderRepository;
import com.unihub.app.repositories.community.content.EventRepository;
import com.unihub.app.repositories.community.content.NotificationRepository;
import com.unihub.app.repositories.community.resources.CommunityMemberRepository;
import com.unihub.app.repositories.community.resources.CommunityRepository;
import com.unihub.app.repositories.community.resources.CourseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.OffsetDateTime;
import java.time.YearMonth;
import java.time.ZoneOffset;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CalendarService {

    private final EventRepository eventRepository;
    private final EventReminderRepository reminderRepository;
    private final CommunityRepository communityRepository;
    private final CommunityMemberRepository communityMemberRepository;
    private final CourseRepository courseRepository;
    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final CommunityContentMapper contentMapper;

    @Transactional(readOnly = true)
    public List<CalendarEventResponseDto> getEvents(
            UUID userId,
            Integer year,
            Integer month,
            String communitySlug,
            StudyYearName studyYear,
            String courseSlug
    ) {
        if (year == null || month == null) {
            OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);
            year = year != null ? year : now.getYear();
            month = month != null ? month : now.getMonthValue();
        }

        if (month < 1 || month > 12) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid month value: must be between 1 and 12");
        }

        YearMonth ym = YearMonth.of(year, month);
        OffsetDateTime from = ym.atDay(1).atStartOfDay().atOffset(ZoneOffset.UTC);
        OffsetDateTime to = ym.atEndOfMonth().atTime(23, 59, 59, 999_999_999).atOffset(ZoneOffset.UTC);

        List<UUID> communityIds;
        if (communitySlug != null && !communitySlug.isBlank()) {
            Community community = communityRepository.findBySlug(communitySlug)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Community not found"));

            boolean isMember = communityMemberRepository.isMemberOfCommunity(communitySlug, userId);
            if (!isMember) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "User is not a member of this community");
            }
            communityIds = List.of(community.getId());
        } else throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Community slug is required");

        return eventRepository.findEventsByCommunityIds(communityIds, courseSlug, studyYear, from, to, userId);
    }

//
//    @Transactional(readOnly = true)
//    public CalendarEventResponseDto getEventById(UUID userId, UUID eventId) {
//        Event event = eventRepository.findEventByIdWithDetails(eventId)
//                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Event not found"));
//
//        boolean isMember = communityMemberRepository.isMemberOfCommunity(event.getCommunity().getSlug(), userId);
//        if (!isMember) {
//            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "User is not a member of this community");
//        }
//
//        List<EventReminder> reminders = reminderRepository.findByUserIdAndEventId(userId, eventId);
//        List<EventReminderResponseDto> reminderDtos = reminders.stream()
//                .map(contentMapper::toEventReminderResponseDto)
//                .toList();
//
//        return contentMapper.toEventResponseDto(event, !reminderDtos.isEmpty(), reminderDtos);
//    }
//
//    @Transactional
//    public CalendarEventResponseDto createEvent(UUID userId, CreateEventRequestDto requestDto) {
//        if (requestDto.endTime() != null && !requestDto.endTime().isAfter(requestDto.startTime())) {
//            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "endTime must be after startTime");
//        }
//
//        Community community = communityRepository.findBySlug(requestDto.communitySlug())
//                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Community not found"));
//
//        boolean isMember = communityMemberRepository.isMemberOfCommunity(requestDto.communitySlug(), userId);
//        if (!isMember) {
//            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "User is not a member of this community");
//        }
//
//        Course course = courseRepository.findByIdWithStudyYearAndCommunity(requestDto.courseId())
//                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Course not found"));
//
//        if (!course.getStudyYear().getCommunity().getId().equals(community.getId())) {
//            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Course does not belong to the specified community");
//        }
//
//        User owner = userRepository.findById(userId)
//                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
//
//        Event event = Event.builder()
//                .title(requestDto.title())
//                .description(requestDto.description())
//                .type(requestDto.type())
//                .startTime(requestDto.startTime())
//                .endTime(requestDto.endTime())
//                .durationMinutes(requestDto.durationMinutes())
//                .location(requestDto.location())
//                .locationDetails(requestDto.locationDetails())
//                .course(course)
//                .community(community)
//                .owner(owner)
//                .build();
//
//        Event saved = eventRepository.save(event);
//        return contentMapper.toEventResponseDto(saved, false, Collections.emptyList());
//    }
//
//    @Transactional
//    public CalendarEventResponseDto updateEvent(UUID userId, UUID eventId, UpdateEventRequestDto requestDto) {
//        Event event = eventRepository.findEventByIdWithDetails(eventId)
//                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Event not found"));
//
//        verifyEventManagementPermission(event, userId);
//
//        if (requestDto.title() != null && !requestDto.title().isBlank()) {
//            event.setTitle(requestDto.title());
//        }
//        if (requestDto.description() != null) {
//            event.setDescription(requestDto.description());
//        }
//        if (requestDto.type() != null) {
//            event.setType(requestDto.type());
//        }
//        if (requestDto.startTime() != null) {
//            OffsetDateTime oldStartTime = event.getStartTime();
//            event.setStartTime(requestDto.startTime());
//            if (requestDto.endTime() == null && event.getEndTime() != null) {
//                java.time.Duration diff = java.time.Duration.between(oldStartTime, event.getEndTime());
//                if (!diff.isNegative() && !diff.isZero()) {
//                    event.setEndTime(requestDto.startTime().plus(diff));
//                } else if (event.getDurationMinutes() != null && event.getDurationMinutes() > 0) {
//                    event.setEndTime(requestDto.startTime().plusMinutes(event.getDurationMinutes()));
//                }
//            }
//        }
//        if (requestDto.endTime() != null) {
//            event.setEndTime(requestDto.endTime());
//        }
//        if (requestDto.durationMinutes() != null) {
//            event.setDurationMinutes(requestDto.durationMinutes());
//        }
//        if (requestDto.location() != null) {
//            event.setLocation(requestDto.location());
//        }
//        if (requestDto.locationDetails() != null) {
//            event.setLocationDetails(requestDto.locationDetails());
//        }
//
//        if (event.getEndTime() != null && !event.getEndTime().isAfter(event.getStartTime())) {
//            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "endTime must be after startTime");
//        }
//
//        Event updatedEvent = eventRepository.save(event);
//
//        // Update pending reminders and notify subscribed users
//        List<EventReminder> reminders = reminderRepository.findByEventIdWithUser(eventId);
//        for (EventReminder reminder : reminders) {
//            if (reminder.getStatus() == ReminderStatus.PENDING) {
//                OffsetDateTime newRemindAt = updatedEvent.getStartTime().minusMinutes(reminder.getOffsetMinutes());
//                if (newRemindAt.isAfter(OffsetDateTime.now())) {
//                    reminder.setRemindAt(newRemindAt);
//                } else {
//                    reminder.setStatus(ReminderStatus.CANCELLED);
//                }
//                reminderRepository.save(reminder);
//            }
//        }
//
//        Set<UUID> notifiedUserIds = new HashSet<>();
//        for (EventReminder reminder : reminders) {
//            UUID targetUserId = reminder.getUser().getId();
//            if (!targetUserId.equals(userId) && notifiedUserIds.add(targetUserId)) {
//                Notification notification = Notification.builder()
//                        .user(reminder.getUser())
//                        .title("Event updated: " + updatedEvent.getTitle())
//                        .message(String.format("The %s for %s has been updated. Scheduled for %s",
//                                updatedEvent.getType().name().toLowerCase(),
//                                updatedEvent.getCourse().getName(),
//                                updatedEvent.getStartTime()))
//                        .type(NotificationType.EVENT_UPDATED)
//                        .event(updatedEvent)
//                        .isRead(false)
//                        .build();
//                notificationRepository.save(notification);
//            }
//        }
//
//        List<EventReminder> userReminders = reminderRepository.findByUserIdAndEventId(userId, eventId);
//        List<EventReminderResponseDto> reminderDtos = userReminders.stream()
//                .map(contentMapper::toEventReminderResponseDto)
//                .toList();
//
//        return contentMapper.toEventResponseDto(updatedEvent, !reminderDtos.isEmpty(), reminderDtos);
//    }
//
//    @Transactional
//    public void deleteEvent(UUID userId, UUID eventId) {
//        Event event = eventRepository.findEventByIdWithDetails(eventId)
//                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Event not found"));
//
//        verifyEventManagementPermission(event, userId);
//
//        List<EventReminder> reminders = reminderRepository.findByEventIdWithUser(eventId);
//        Set<UUID> notifiedUserIds = new HashSet<>();
//        for (EventReminder reminder : reminders) {
//            UUID targetUserId = reminder.getUser().getId();
//            if (!targetUserId.equals(userId) && notifiedUserIds.add(targetUserId)) {
//                Notification notification = Notification.builder()
//                        .user(reminder.getUser())
//                        .title("Event cancelled: " + event.getTitle())
//                        .message(String.format("The %s for %s scheduled for %s has been cancelled.",
//                                event.getType().name().toLowerCase(),
//                                event.getCourse().getName(),
//                                event.getStartTime()))
//                        .type(NotificationType.EVENT_CANCELLED)
//                        .event(null)
//                        .isRead(false)
//                        .build();
//                notificationRepository.save(notification);
//            }
//        }
//
//        eventRepository.delete(event);
//    }
//
//    private void verifyEventManagementPermission(Event event, UUID userId) {
//        boolean isOwner = event.getOwner() != null && event.getOwner().getId().equals(userId);
//        if (isOwner) {
//            return;
//        }
//
//        CommunityMember member = communityMemberRepository.findMemberWithRoleByCommunitySlug(event.getCommunity().getSlug(), userId)
//                .orElse(null);
//
//        boolean isCommunityAdminOrOwner = member != null && member.getRole() != null &&
//                ("COMMUNITY_OWNER".equals(member.getRole().getName()) || "COMMUNITY_ADMIN".equals(member.getRole().getName()));
//
//        if (!isCommunityAdminOrOwner) {
//            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You do not have permission to modify this event");
//        }
//    }
//
//    @Transactional
//    public EventReminderResponseDto createReminder(UUID userId, UUID eventId, CreateEventReminderRequestDto requestDto) {
//        int offsetMinutes = (requestDto != null && requestDto.offsetMinutes() != null)
//                ? requestDto.offsetMinutes()
//                : 15;
//
//        if (offsetMinutes < 0) {
//            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "offsetMinutes must be non-negative");
//        }
//
//        Event event = eventRepository.findEventByIdWithDetails(eventId)
//                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Event not found"));
//
//        boolean isMember = communityMemberRepository.isMemberOfCommunity(event.getCommunity().getSlug(), userId);
//        if (!isMember) {
//            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "User is not a member of this community");
//        }
//
//        OffsetDateTime remindAt = event.getStartTime().minusMinutes(offsetMinutes);
//        if (!remindAt.isAfter(OffsetDateTime.now())) {
//            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot set a reminder for the past");
//        }
//
//        if (reminderRepository.existsByUserIdAndEventIdAndOffsetMinutes(userId, eventId, offsetMinutes)) {
//            throw new ResponseStatusException(HttpStatus.CONFLICT, "A reminder with this offset already exists for this event");
//        }
//
//        User user = userRepository.findById(userId)
//                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
//
//        EventReminder reminder = EventReminder.builder()
//                .user(user)
//                .event(event)
//                .offsetMinutes(offsetMinutes)
//                .remindAt(remindAt)
//                .status(ReminderStatus.PENDING)
//                .build();
//
//        EventReminder saved = reminderRepository.save(reminder);
//        return contentMapper.toEventReminderResponseDto(saved);
//    }
//
//    @Transactional(readOnly = true)
//    public List<EventReminderResponseDto> getUserReminders(UUID userId, UUID eventId) {
//        Event event = eventRepository.findEventByIdWithDetails(eventId)
//                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Event not found"));
//
//        boolean isMember = communityMemberRepository.isMemberOfCommunity(event.getCommunity().getSlug(), userId);
//        if (!isMember) {
//            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "User is not a member of this community");
//        }
//
//        return reminderRepository.findByUserIdAndEventId(userId, eventId).stream()
//                .map(contentMapper::toEventReminderResponseDto)
//                .toList();
//    }
//
//    @Transactional
//    public void deleteReminder(UUID userId, UUID eventId, UUID reminderId) {
//        EventReminder reminder = reminderRepository.findByIdAndUserId(reminderId, userId)
//                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Reminder not found"));
//
//        if (!reminder.getEvent().getId().equals(eventId)) {
//            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Reminder does not belong to this event");
//        }
//
//        reminderRepository.delete(reminder);
//    }
//
//    @Transactional
//    public void deleteAllReminders(UUID userId, UUID eventId) {
//        if (!eventRepository.existsById(eventId)) {
//            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Event not found");
//        }
//
//        reminderRepository.deleteByUserIdAndEventId(userId, eventId);
//    }
}
