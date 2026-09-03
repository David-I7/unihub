package com.unihub.app.services.community.content;

import com.unihub.app.domain.PermissionType;
import com.unihub.app.dto.PageDto;
import com.unihub.app.dto.UserDto;
import com.unihub.app.dto.community.content.request.CreateEventReminderRequestDto;
import com.unihub.app.dto.community.content.request.CreateEventRequestDto;
import com.unihub.app.dto.community.content.request.UpdateEventRequestDto;
import com.unihub.app.dto.community.content.response.CalendarEventResponseDto;
import com.unihub.app.dto.community.content.response.EventReminderResponseDto;
import com.unihub.app.dto.community.content.response.EventResponseDto;
import com.unihub.app.dto.community.content.response.UserReminderResponseDto;
import com.unihub.app.entities.authentication.User;
import com.unihub.app.entities.community.content.Event;
import com.unihub.app.entities.community.content.EventReminder;
import com.unihub.app.entities.community.content.ReminderStatus;
import com.unihub.app.entities.community.resources.Community;
import com.unihub.app.entities.community.resources.Course;
import com.unihub.app.entities.community.resources.StudyYearName;
import com.unihub.app.events.notification.EventCancelledDomainNotificationEvent;
import com.unihub.app.events.notification.EventUpdatedDomainNotificationEvent;
import com.unihub.app.mappers.PageMapper;
import com.unihub.app.mappers.UserMapper;
import com.unihub.app.mappers.community.CommunityContentMapper;
import com.unihub.app.repositories.community.content.EventReminderRepository;
import com.unihub.app.repositories.community.content.EventRepository;
import com.unihub.app.repositories.community.resources.CommunityMemberRepository;
import com.unihub.app.repositories.community.resources.CommunityRepository;
import com.unihub.app.repositories.community.resources.CourseRepository;
import com.unihub.app.services.authorization.AuthorizationService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.OffsetDateTime;
import java.time.YearMonth;
import java.time.ZoneOffset;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CalendarService {

    private final EventRepository eventRepository;
    private final EventReminderRepository reminderRepository;
    private final CommunityRepository communityRepository;
    private final CommunityMemberRepository communityMemberRepository;
    private final CourseRepository courseRepository;
    private final AuthorizationService authorizationService;
    private final UserMapper userMapper;
    private final CommunityContentMapper contentMapper;
    private final PageMapper pageMapper;
    private final ApplicationEventPublisher eventPublisher;

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
        } else {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Community slug is required");
        }

        if (studyYear != null) {
            return eventRepository.findEventsByCommunityIdsAndStudyYear(communityIds, courseSlug, studyYear, from, to, userId);
        }

        return eventRepository.findEventsByCommunityIds(communityIds, courseSlug, from, to, userId);
    }

    @Transactional(readOnly = true)
    public EventResponseDto getEventById(UUID userId, UUID eventId) {
        EventResponseDto event = eventRepository.findEventById(eventId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Event not found"));

        boolean isMember = communityMemberRepository.isMemberOfCommunity(event.getCommunitySlug(), userId);
        if (!isMember) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "User is not a member of this community");
        }

        List<EventReminder> reminders = reminderRepository.findByUserIdAndEventId(userId, eventId);
        List<EventReminderResponseDto> reminderDtos = reminders.stream()
                .map(contentMapper::toEventReminderResponseDto)
                .toList();

        event.setReminders(reminderDtos);
        return event;
    }

    @Transactional
    public CalendarEventResponseDto createEvent(UserDto user, CreateEventRequestDto requestDto) {
        if(requestDto.startTime().isBefore(OffsetDateTime.now(ZoneOffset.UTC))) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Event start time cannot be in the past");
        }

        Community community = communityRepository.findBySlug(requestDto.communitySlug())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Community not found"));

        if (!authorizationService.hasCommunityPermission(requestDto.communitySlug(), user.id(), PermissionType.CREATE_EVENT)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Permission denied to create event");
        }

        Course course = courseRepository.findByIdWithStudyYearAndCommunity(requestDto.courseId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Course not found"));

        if (!course.getStudyYear().getCommunity().getId().equals(community.getId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Course does not belong to the specified community");
        }

        User owner = userMapper.toEntity(user);

        Event event = contentMapper.toEventEntity(requestDto, course, community, owner);
        Event saved = eventRepository.save(event);
        return contentMapper.toCalendarEventResponseDto(saved, false);
    }

    @Transactional
    public CalendarEventResponseDto updateEvent(UUID eventId, UserDto user, UpdateEventRequestDto dto) {
        Event event = eventRepository.findByIdWithOwnerAndCommunity(eventId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Event not found"));

        String communitySlug = event.getCommunity().getSlug();
        boolean isOwner = event.getOwner() != null && event.getOwner().getId().equals(user.id());

        if (!isOwner) {
            if (!authorizationService.hasCommunityPermission(communitySlug, user.id(), PermissionType.MODERATE_EVENT)) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Permission denied to moderate event");
            }
        }

        dto.title().ifPresent(event::setTitle);
        dto.description().ifPresent(event::setDescription);
        dto.type().ifPresent(event::setType);
        dto.durationHours().ifPresent(event::setDurationHours);
        dto.location().ifPresent(event::setLocation);
        dto.locationDetails().ifPresent(event::setLocationDetails);

        Event saved = eventRepository.save(event);

        List<EventReminder> reminders = reminderRepository.findByEventIdWithUser(eventId);
        List<UUID> reminderUserIds = reminders.stream().map(r -> r.getUser().getId()).toList();

        User updater = userMapper.toEntity(user);
        eventPublisher.publishEvent(new EventUpdatedDomainNotificationEvent(saved, updater, reminderUserIds));

        boolean hasReminder = reminderUserIds.stream().anyMatch(id -> id.equals(user.id()));
        return contentMapper.toCalendarEventResponseDto(saved, hasReminder);
    }

    @Transactional
    public void deleteEvent(UUID eventId, UserDto user) {
        Event event = eventRepository.findByIdWithOwnerAndCommunity(eventId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Event not found"));

        String communitySlug = event.getCommunity().getSlug();
        boolean isOwner = event.getOwner() != null && event.getOwner().getId().equals(user.id());

        if (!isOwner) {
            if (!authorizationService.hasCommunityPermission(communitySlug, user.id(), PermissionType.MODERATE_EVENT)) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Permission denied to moderate event");
            }
        }

        List<EventReminder> reminders = reminderRepository.findByEventIdWithUser(eventId);
        List<UUID> reminderUserIds = reminders.stream().map(r -> r.getUser().getId()).toList();
        String title = event.getTitle();

        eventRepository.delete(event);

        User canceller = userMapper.toEntity(user);
        eventPublisher.publishEvent(new EventCancelledDomainNotificationEvent(title, communitySlug, canceller, reminderUserIds));
    }

    @Transactional
    public EventReminderResponseDto createReminder(UUID eventId, UserDto user, CreateEventReminderRequestDto dto) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Event not found"));

        String communitySlug = event.getCommunity().getSlug();
        if (!communityMemberRepository.isMemberOfCommunity(communitySlug, user.id())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "User is not a member of this community");
        }

        if (reminderRepository.existsByUserIdAndEventId(user.id(), eventId)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "A reminder is already set for this event");
        }

        int offsetMinutes = dto.offsetMinutes();
        OffsetDateTime remindAt = event.getStartTime().minusMinutes(offsetMinutes);

        User userEntity = userMapper.toEntity(user);
        EventReminder reminder = EventReminder.builder()
                .user(userEntity)
                .event(event)
                .offsetMinutes(offsetMinutes)
                .remindAt(remindAt)
                .status(ReminderStatus.PENDING)
                .build();

        EventReminder saved = reminderRepository.save(reminder);
        return contentMapper.toEventReminderResponseDto(saved);
    }

    @Transactional
    public void deleteReminder(UUID eventId, UserDto user) {
        if (!eventRepository.existsById(eventId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Event not found");
        }

        reminderRepository.deleteByUserIdAndEventId(user.id(), eventId);
    }

    @Transactional(readOnly = true)
    public PageDto<CalendarEventResponseDto> getUpcomingEvents(UUID userId, Integer days, Pageable pageable) {
        List<UUID> enrolledCommunityIds = communityMemberRepository.findCommunityIdsByUserId(userId);
        if (enrolledCommunityIds == null || enrolledCommunityIds.isEmpty()) {
            return PageDto.<CalendarEventResponseDto>builder()
                    .content(Collections.emptyList())
                    .number(pageable.getPageNumber())
                    .size(pageable.getPageSize())
                    .totalElements(0)
                    .totalPages(0)
                    .first(true)
                    .last(true)
                    .build();
        }

        OffsetDateTime from = OffsetDateTime.now(ZoneOffset.UTC);
        int windowDays = (days != null && days > 0) ? days : 7;
        OffsetDateTime to = from.plusDays(windowDays);

        Page<CalendarEventResponseDto> page = eventRepository.findUpcomingEventsByCommunityIds(
                enrolledCommunityIds, from, to, userId, pageable
        );
        return pageMapper.toPageDto(page);
    }

    @Transactional(readOnly = true)
    public PageDto<UserReminderResponseDto> getUserReminders(UUID userId, ReminderStatus status, Pageable pageable) {
        Page<EventReminder> page = (status != null)
                ? reminderRepository.findUserRemindersByStatus(userId, status, pageable)
                : reminderRepository.findAllUserReminders(userId, pageable);
        return pageMapper.toPageDto(page.map(contentMapper::toUserReminderResponseDto));
    }
}
