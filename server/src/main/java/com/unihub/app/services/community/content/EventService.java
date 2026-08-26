package com.unihub.app.services.community.content;

import com.unihub.app.dto.community.content.EventRequestDto;
import com.unihub.app.dto.community.content.EventResponseDto;
import com.unihub.app.entities.authentication.User;
import com.unihub.app.entities.community.content.*;
import com.unihub.app.entities.community.resources.Course;
import com.unihub.app.entities.community.resources.StudyYearName;
import com.unihub.app.mappers.community.CommunityContentMapper;
import com.unihub.app.repositories.community.content.EventReminderRepository;
import com.unihub.app.repositories.community.content.EventRepository;
import com.unihub.app.repositories.community.content.EventSubscriptionRepository;
import com.unihub.app.services.community.resources.CommunityService;
import com.unihub.app.services.community.resources.CourseService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class EventService {

    private final EventRepository eventRepository;
    private final EventSubscriptionRepository eventSubscriptionRepository;
    private final EventReminderRepository eventReminderRepository;
    private final CourseService courseService;
    private final CommunityService communityService;
    private final CommunityContentMapper contentMapper;

    @Transactional(readOnly = true)
    public List<EventResponseDto> getEvents(
            String communitySlug,
            String courseSlug,
            StudyYearName studyYearName,
            EventType type,
            OffsetDateTime from,
            OffsetDateTime to,
            User currentUser
    ) {
        communityService.findBySlug(communitySlug);

        List<Event> events = eventRepository.findEvents(
                communitySlug,
                courseSlug,
                studyYearName,
                type,
                from,
                to
        );

        return events.stream()
                .map(event -> {
                    boolean isSubscribed = currentUser != null &&
                            eventSubscriptionRepository.existsByUserIdAndEventId(currentUser.getId(), event.getId());
                    return contentMapper.toEventResponseDto(event, isSubscribed);
                })
                .toList();
    }

    @Transactional(readOnly = true)
    public EventResponseDto getEvent(String communitySlug, UUID eventId, User currentUser) {
        Event event = eventRepository.findByCommunitySlugAndId(communitySlug, eventId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Event not found"));

        boolean isSubscribed = currentUser != null &&
                eventSubscriptionRepository.existsByUserIdAndEventId(currentUser.getId(), event.getId());

        return contentMapper.toEventResponseDto(event, isSubscribed);
    }

    @Transactional
    public EventResponseDto createEvent(
            String communitySlug,
            String courseSlug,
            StudyYearName studyYearName,
            EventRequestDto request,
            User user
    ) {
        Course course = courseService.verifyCourseExists(communitySlug, studyYearName, courseSlug);

        Event event = Event.builder()
                .title(request.title())
                .description(request.description())
                .type(request.type())
                .startTime(request.startTime())
                .endTime(request.endTime())
                .durationMinutes(request.durationMinutes())
                .location(request.location())
                .locationDetails(request.locationDetails())
                .course(course)
                .community(course.getStudyYear().getCommunity())
                .owner(user)
                .build();

        Event savedEvent = eventRepository.save(event);

        if (request.offsetMinutes() != null && !request.offsetMinutes().isEmpty()) {
            EventSubscription subscription = EventSubscription.builder()
                    .user(user)
                    .event(savedEvent)
                    .build();
            eventSubscriptionRepository.save(subscription);

            for (Integer offset : request.offsetMinutes()) {
                if (offset != null && offset > 0) {
                    EventReminder reminder = EventReminder.builder()
                            .user(user)
                            .event(savedEvent)
                            .offsetMinutes(offset)
                            .remindAt(savedEvent.getStartTime().minusMinutes(offset))
                            .status(ReminderStatus.PENDING)
                            .build();
                    eventReminderRepository.save(reminder);
                }
            }
        }

        return contentMapper.toEventResponseDto(savedEvent, request.offsetMinutes() != null && !request.offsetMinutes().isEmpty());
    }

    @Transactional
    public EventResponseDto updateEvent(
            String communitySlug,
            UUID eventId,
            EventRequestDto request,
            User user
    ) {
        Event event = eventRepository.findByCommunitySlugAndId(communitySlug, eventId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Event not found"));

        boolean timeChanged = !event.getStartTime().equals(request.startTime());

        event.setTitle(request.title());
        event.setDescription(request.description());
        event.setType(request.type());
        event.setStartTime(request.startTime());
        event.setEndTime(request.endTime());
        event.setDurationMinutes(request.durationMinutes());
        event.setLocation(request.location());
        event.setLocationDetails(request.locationDetails());

        Event updatedEvent = eventRepository.save(event);

        if (timeChanged) {
            List<EventReminder> pendingReminders = eventReminderRepository.findByEventIdAndStatus(eventId, ReminderStatus.PENDING);
            for (EventReminder reminder : pendingReminders) {
                reminder.setRemindAt(updatedEvent.getStartTime().minusMinutes(reminder.getOffsetMinutes()));
                eventReminderRepository.save(reminder);
            }
        }

        boolean isSubscribed = user != null &&
                eventSubscriptionRepository.existsByUserIdAndEventId(user.getId(), event.getId());

        return contentMapper.toEventResponseDto(updatedEvent, isSubscribed);
    }

    @Transactional
    public void deleteEvent(String communitySlug, UUID eventId, User user) {
        Event event = eventRepository.findByCommunitySlugAndId(communitySlug, eventId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Event not found"));

        eventRepository.delete(event);
    }
}
