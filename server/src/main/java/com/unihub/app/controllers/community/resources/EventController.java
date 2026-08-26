package com.unihub.app.controllers.community.resources;

import com.unihub.app.dto.UserDto;
import com.unihub.app.dto.community.content.EventReminderRequestDto;
import com.unihub.app.dto.community.content.EventReminderResponseDto;
import com.unihub.app.dto.community.content.EventRequestDto;
import com.unihub.app.dto.community.content.EventResponseDto;
import com.unihub.app.entities.authentication.User;
import com.unihub.app.entities.community.content.EventType;
import com.unihub.app.entities.community.resources.StudyYearName;
import com.unihub.app.services.authentication.UserService;
import com.unihub.app.services.community.content.EventService;
import com.unihub.app.services.community.content.SubscriptionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/communities/{communitySlug}")
@RequiredArgsConstructor
public class EventController {

    private final EventService eventService;
    private final SubscriptionService subscriptionService;
    private final UserService userService;

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof UserDto userDto) {
            return userService.findById(userDto.id());
        }
        return null;
    }

    private User requireCurrentUser() {
        User user = getCurrentUser();
        if (user == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authentication required");
        }
        return user;
    }

    @GetMapping("/events")
    public ResponseEntity<List<EventResponseDto>> getEvents(
            @PathVariable String communitySlug,
            @RequestParam(required = false) String courseSlug,
            @RequestParam(required = false) StudyYearName studyYearName,
            @RequestParam(required = false) EventType type,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime to
    ) {
        User currentUser = getCurrentUser();
        List<EventResponseDto> events = eventService.getEvents(
                communitySlug,
                courseSlug,
                studyYearName,
                type,
                from,
                to,
                currentUser
        );
        return ResponseEntity.ok(events);
    }

    @GetMapping("/events/{eventId}")
    public ResponseEntity<EventResponseDto> getEvent(
            @PathVariable String communitySlug,
            @PathVariable UUID eventId
    ) {
        User currentUser = getCurrentUser();
        EventResponseDto event = eventService.getEvent(communitySlug, eventId, currentUser);
        return ResponseEntity.ok(event);
    }

    @PostMapping("/study-years/{studyYearName}/courses/{courseSlug}/events")
    public ResponseEntity<EventResponseDto> createEvent(
            @PathVariable String communitySlug,
            @PathVariable StudyYearName studyYearName,
            @PathVariable String courseSlug,
            @Valid @RequestBody EventRequestDto request
    ) {
        User user = requireCurrentUser();
        EventResponseDto created = eventService.createEvent(communitySlug, courseSlug, studyYearName, request, user);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/events/{eventId}")
    public ResponseEntity<EventResponseDto> updateEvent(
            @PathVariable String communitySlug,
            @PathVariable UUID eventId,
            @Valid @RequestBody EventRequestDto request
    ) {
        User user = requireCurrentUser();
        EventResponseDto updated = eventService.updateEvent(communitySlug, eventId, request, user);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/events/{eventId}")
    public ResponseEntity<Void> deleteEvent(
            @PathVariable String communitySlug,
            @PathVariable UUID eventId
    ) {
        User user = requireCurrentUser();
        eventService.deleteEvent(communitySlug, eventId, user);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/events/{eventId}/subscribe")
    public ResponseEntity<Void> subscribeToEvent(
            @PathVariable String communitySlug,
            @PathVariable UUID eventId,
            @RequestBody(required = false) EventReminderRequestDto request
    ) {
        User user = requireCurrentUser();
        List<Integer> offsets = request != null ? request.offsetMinutes() : null;
        subscriptionService.subscribeToEvent(user, eventId, offsets);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/events/{eventId}/subscribe")
    public ResponseEntity<Void> unsubscribeFromEvent(
            @PathVariable String communitySlug,
            @PathVariable UUID eventId
    ) {
        User user = requireCurrentUser();
        subscriptionService.unsubscribeFromEvent(user, eventId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/study-years/{studyYearName}/courses/{courseSlug}/subscribe")
    public ResponseEntity<Integer> subscribeToCourseEvents(
            @PathVariable String communitySlug,
            @PathVariable StudyYearName studyYearName,
            @PathVariable String courseSlug,
            @RequestBody(required = false) EventReminderRequestDto request
    ) {
        User user = requireCurrentUser();
        List<Integer> offsets = request != null ? request.offsetMinutes() : null;
        int count = subscriptionService.subscribeToCourseEvents(user, communitySlug, studyYearName, courseSlug, offsets);
        return ResponseEntity.ok(count);
    }

    @PutMapping("/events/{eventId}/reminders")
    public ResponseEntity<Void> setCustomReminders(
            @PathVariable String communitySlug,
            @PathVariable UUID eventId,
            @Valid @RequestBody EventReminderRequestDto request
    ) {
        User user = requireCurrentUser();
        subscriptionService.setCustomReminders(user, eventId, request.offsetMinutes());
        return ResponseEntity.ok().build();
    }

    @GetMapping("/events/{eventId}/reminders")
    public ResponseEntity<List<EventReminderResponseDto>> getEventReminders(
            @PathVariable String communitySlug,
            @PathVariable UUID eventId
    ) {
        User user = requireCurrentUser();
        List<EventReminderResponseDto> reminders = subscriptionService.getEventReminders(user, eventId);
        return ResponseEntity.ok(reminders);
    }
}
