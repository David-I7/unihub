package com.unihub.app.services.community.content;

import com.unihub.app.dto.community.content.request.CreateEventReminderRequestDto;
import com.unihub.app.dto.community.content.response.EventReminderResponseDto;
import com.unihub.app.dto.community.content.response.EventResponseDto;
import com.unihub.app.entities.authentication.User;
import com.unihub.app.entities.community.content.Event;
import com.unihub.app.entities.community.content.EventReminder;
import com.unihub.app.entities.community.content.EventType;
import com.unihub.app.entities.community.content.ReminderStatus;
import com.unihub.app.entities.community.resources.Community;
import com.unihub.app.entities.community.resources.StudyYearName;
import com.unihub.app.mappers.community.CommunityContentMapper;
import com.unihub.app.repositories.authentication.UserRepository;
import com.unihub.app.repositories.community.content.EventReminderRepository;
import com.unihub.app.repositories.community.content.EventRepository;
import com.unihub.app.repositories.community.resources.CommunityMemberRepository;
import com.unihub.app.repositories.community.resources.CommunityRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.OffsetDateTime;
import java.time.YearMonth;
import java.time.ZoneOffset;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CalendarService {

    private final EventRepository eventRepository;
    private final EventReminderRepository reminderRepository;
    private final CommunityRepository communityRepository;
    private final CommunityMemberRepository communityMemberRepository;
    private final UserRepository userRepository;
    private final CommunityContentMapper contentMapper;

    @Transactional(readOnly = true)
    public List<EventResponseDto> getEvents(
            UUID userId,
            Integer year,
            Integer month,
            String communitySlug,
            StudyYearName studyYear,
            String courseSlug,
            EventType type
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
            communityIds = communityMemberRepository.findCommunityIdsByUserId(userId);
            if (communityIds.isEmpty()) {
                return Collections.emptyList();
            }
        }

        List<Event> events = eventRepository.findEventsByCommunityIds(communityIds, courseSlug, studyYear, type, from, to);
        if (events.isEmpty()) {
            return Collections.emptyList();
        }

        List<UUID> eventIds = events.stream().map(Event::getId).toList();
        List<EventReminder> userReminders = reminderRepository.findByUserIdAndEventIdIn(userId, eventIds);

        Map<UUID, List<EventReminderResponseDto>> remindersByEventId = userReminders.stream()
                .map(contentMapper::toEventReminderResponseDto)
                .collect(Collectors.groupingBy(EventReminderResponseDto::eventId));

        return events.stream()
                .map(event -> {
                    List<EventReminderResponseDto> reminders = remindersByEventId.getOrDefault(event.getId(), Collections.emptyList());
                    boolean isSubscribed = !reminders.isEmpty();
                    return contentMapper.toEventResponseDto(event, isSubscribed, reminders);
                })
                .toList();
    }

    @Transactional(readOnly = true)
    public EventResponseDto getEventById(UUID userId, UUID eventId) {
        Event event = eventRepository.findEventByIdWithDetails(eventId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Event not found"));

        boolean isMember = communityMemberRepository.isMemberOfCommunity(event.getCommunity().getSlug(), userId);
        if (!isMember) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "User is not a member of this community");
        }

        List<EventReminder> reminders = reminderRepository.findByUserIdAndEventId(userId, eventId);
        List<EventReminderResponseDto> reminderDtos = reminders.stream()
                .map(contentMapper::toEventReminderResponseDto)
                .toList();

        return contentMapper.toEventResponseDto(event, !reminderDtos.isEmpty(), reminderDtos);
    }

    @Transactional
    public EventReminderResponseDto createReminder(UUID userId, UUID eventId, CreateEventReminderRequestDto requestDto) {
        int offsetMinutes = (requestDto != null && requestDto.offsetMinutes() != null)
                ? requestDto.offsetMinutes()
                : 15;

        if (offsetMinutes < 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "offsetMinutes must be non-negative");
        }

        Event event = eventRepository.findEventByIdWithDetails(eventId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Event not found"));

        boolean isMember = communityMemberRepository.isMemberOfCommunity(event.getCommunity().getSlug(), userId);
        if (!isMember) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "User is not a member of this community");
        }

        OffsetDateTime remindAt = event.getStartTime().minusMinutes(offsetMinutes);
        if (!remindAt.isAfter(OffsetDateTime.now())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot set a reminder for the past");
        }

        if (reminderRepository.existsByUserIdAndEventIdAndOffsetMinutes(userId, eventId, offsetMinutes)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "A reminder with this offset already exists for this event");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        EventReminder reminder = EventReminder.builder()
                .user(user)
                .event(event)
                .offsetMinutes(offsetMinutes)
                .remindAt(remindAt)
                .status(ReminderStatus.PENDING)
                .build();

        EventReminder saved = reminderRepository.save(reminder);
        return contentMapper.toEventReminderResponseDto(saved);
    }

    @Transactional(readOnly = true)
    public List<EventReminderResponseDto> getUserReminders(UUID userId, UUID eventId) {
        Event event = eventRepository.findEventByIdWithDetails(eventId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Event not found"));

        boolean isMember = communityMemberRepository.isMemberOfCommunity(event.getCommunity().getSlug(), userId);
        if (!isMember) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "User is not a member of this community");
        }

        return reminderRepository.findByUserIdAndEventId(userId, eventId).stream()
                .map(contentMapper::toEventReminderResponseDto)
                .toList();
    }

    @Transactional
    public void deleteReminder(UUID userId, UUID eventId, UUID reminderId) {
        EventReminder reminder = reminderRepository.findByIdAndUserId(reminderId, userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Reminder not found"));

        if (!reminder.getEvent().getId().equals(eventId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Reminder does not belong to this event");
        }

        reminderRepository.delete(reminder);
    }

    @Transactional
    public void deleteAllReminders(UUID userId, UUID eventId) {
        if (!eventRepository.existsById(eventId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Event not found");
        }

        reminderRepository.deleteByUserIdAndEventId(userId, eventId);
    }
}
