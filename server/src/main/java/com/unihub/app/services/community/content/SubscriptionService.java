package com.unihub.app.services.community.content;

import com.unihub.app.dto.community.content.EventReminderResponseDto;
import com.unihub.app.entities.authentication.User;
import com.unihub.app.entities.community.content.Event;
import com.unihub.app.entities.community.content.EventReminder;
import com.unihub.app.entities.community.content.EventSubscription;
import com.unihub.app.entities.community.content.ReminderStatus;
import com.unihub.app.entities.community.resources.Course;
import com.unihub.app.entities.community.resources.StudyYearName;
import com.unihub.app.mappers.community.CommunityContentMapper;
import com.unihub.app.repositories.community.content.EventReminderRepository;
import com.unihub.app.repositories.community.content.EventRepository;
import com.unihub.app.repositories.community.content.EventSubscriptionRepository;
import com.unihub.app.services.community.resources.CourseService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SubscriptionService {

    private final EventRepository eventRepository;
    private final EventSubscriptionRepository subscriptionRepository;
    private final EventReminderRepository reminderRepository;
    private final CourseService courseService;
    private final CommunityContentMapper contentMapper;

    private static final List<Integer> DEFAULT_OFFSETS = List.of(1440, 60);

    @Transactional
    public void subscribeToEvent(User user, UUID eventId, List<Integer> offsetMinutes) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Event not found"));

        if (!subscriptionRepository.existsByUserIdAndEventId(user.getId(), eventId)) {
            EventSubscription subscription = EventSubscription.builder()
                    .user(user)
                    .event(event)
                    .build();
            subscriptionRepository.save(subscription);
        }

        reminderRepository.deleteByUserIdAndEventId(user.getId(), eventId);

        List<Integer> offsets = (offsetMinutes != null && !offsetMinutes.isEmpty())
                ? offsetMinutes
                : DEFAULT_OFFSETS;

        for (Integer offset : offsets) {
            if (offset != null && offset > 0) {
                EventReminder reminder = EventReminder.builder()
                        .user(user)
                        .event(event)
                        .offsetMinutes(offset)
                        .remindAt(event.getStartTime().minusMinutes(offset))
                        .status(ReminderStatus.PENDING)
                        .build();
                reminderRepository.save(reminder);
            }
        }
    }

    @Transactional
    public void unsubscribeFromEvent(User user, UUID eventId) {
        reminderRepository.deleteByUserIdAndEventId(user.getId(), eventId);
        subscriptionRepository.deleteByUserIdAndEventId(user.getId(), eventId);
    }

    @Transactional
    public int subscribeToCourseEvents(User user, String communitySlug, StudyYearName studyYearName, String courseSlug, List<Integer> offsetMinutes) {
        Course course = courseService.verifyCourseExists(communitySlug, studyYearName, courseSlug);
        List<Event> events = eventRepository.findByCourseId(course.getId());

        for (Event event : events) {
            subscribeToEvent(user, event.getId(), offsetMinutes);
        }

        return events.size();
    }

    @Transactional
    public void setCustomReminders(User user, UUID eventId, List<Integer> offsetMinutes) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Event not found"));

        if (!subscriptionRepository.existsByUserIdAndEventId(user.getId(), eventId)) {
            EventSubscription subscription = EventSubscription.builder()
                    .user(user)
                    .event(event)
                    .build();
            subscriptionRepository.save(subscription);
        }

        reminderRepository.deleteByUserIdAndEventId(user.getId(), eventId);

        if (offsetMinutes != null) {
            for (Integer offset : offsetMinutes) {
                if (offset != null && offset > 0) {
                    EventReminder reminder = EventReminder.builder()
                            .user(user)
                            .event(event)
                            .offsetMinutes(offset)
                            .remindAt(event.getStartTime().minusMinutes(offset))
                            .status(ReminderStatus.PENDING)
                            .build();
                    reminderRepository.save(reminder);
                }
            }
        }
    }

    @Transactional(readOnly = true)
    public List<EventReminderResponseDto> getEventReminders(User user, UUID eventId) {
        List<EventReminder> reminders = reminderRepository.findByUserIdAndEventId(user.getId(), eventId);
        return reminders.stream()
                .map(contentMapper::toEventReminderResponseDto)
                .toList();
    }
}
