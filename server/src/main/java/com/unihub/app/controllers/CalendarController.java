package com.unihub.app.controllers;

import com.unihub.app.dto.UserDto;
import com.unihub.app.dto.community.content.request.CreateEventReminderRequestDto;
import com.unihub.app.dto.community.content.request.CreateEventRequestDto;
import com.unihub.app.dto.community.content.request.UpdateEventRequestDto;
import com.unihub.app.dto.community.content.response.EventReminderResponseDto;
import com.unihub.app.dto.community.content.response.EventResponseDto;
import com.unihub.app.entities.community.content.EventType;
import com.unihub.app.entities.community.resources.StudyYearName;
import com.unihub.app.services.authorization.AuthorizationService;
import com.unihub.app.services.community.content.CalendarService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/calendar")
@RequiredArgsConstructor
public class CalendarController {

    private final CalendarService calendarService;
    private final AuthorizationService authorizationService;

    @GetMapping
    public ResponseEntity<List<EventResponseDto>> getEvents(
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer month,
            @RequestParam(required = false) String communitySlug,
            @RequestParam(required = false) StudyYearName studyYear,
            @RequestParam(required = false) String courseSlug,
            @RequestParam(required = false) EventType type
    ) {
        UserDto user = authorizationService.requireAuthentication().getUserDto();
        List<EventResponseDto> events = calendarService.getEvents(
                user.id(),
                year,
                month,
                communitySlug,
                studyYear,
                courseSlug,
                type
        );
        return ResponseEntity.ok(events);
    }

    @PostMapping("/events")
    public ResponseEntity<EventResponseDto> createEvent(
            @RequestBody @Valid CreateEventRequestDto requestDto
    ) {
        UserDto user = authorizationService.requireAuthentication().getUserDto();
        EventResponseDto event = calendarService.createEvent(user.id(), requestDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(event);
    }

    @GetMapping("/events/{eventId}")
    public ResponseEntity<EventResponseDto> getEventById(@PathVariable UUID eventId) {
        UserDto user = authorizationService.requireAuthentication().getUserDto();
        EventResponseDto event = calendarService.getEventById(user.id(), eventId);
        return ResponseEntity.ok(event);
    }

    @PatchMapping("/events/{eventId}")
    public ResponseEntity<EventResponseDto> updateEvent(
            @PathVariable UUID eventId,
            @RequestBody @Valid UpdateEventRequestDto requestDto
    ) {
        UserDto user = authorizationService.requireAuthentication().getUserDto();
        EventResponseDto event = calendarService.updateEvent(user.id(), eventId, requestDto);
        return ResponseEntity.ok(event);
    }

    @DeleteMapping("/events/{eventId}")
    public ResponseEntity<Void> deleteEvent(@PathVariable UUID eventId) {
        UserDto user = authorizationService.requireAuthentication().getUserDto();
        calendarService.deleteEvent(user.id(), eventId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/events/{eventId}/reminders")
    public ResponseEntity<EventReminderResponseDto> createReminder(
            @PathVariable UUID eventId,
            @RequestBody(required = false) @Valid CreateEventReminderRequestDto requestDto
    ) {
        UserDto user = authorizationService.requireAuthentication().getUserDto();
        EventReminderResponseDto reminder = calendarService.createReminder(user.id(), eventId, requestDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(reminder);
    }

    @GetMapping("/events/{eventId}/reminders")
    public ResponseEntity<List<EventReminderResponseDto>> getUserReminders(@PathVariable UUID eventId) {
        UserDto user = authorizationService.requireAuthentication().getUserDto();
        List<EventReminderResponseDto> reminders = calendarService.getUserReminders(user.id(), eventId);
        return ResponseEntity.ok(reminders);
    }

    @DeleteMapping("/events/{eventId}/reminders/{reminderId}")
    public ResponseEntity<Void> deleteReminder(
            @PathVariable UUID eventId,
            @PathVariable UUID reminderId
    ) {
        UserDto user = authorizationService.requireAuthentication().getUserDto();
        calendarService.deleteReminder(user.id(), eventId, reminderId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/events/{eventId}/reminders")
    public ResponseEntity<Void> deleteAllReminders(@PathVariable UUID eventId) {
        UserDto user = authorizationService.requireAuthentication().getUserDto();
        calendarService.deleteAllReminders(user.id(), eventId);
        return ResponseEntity.noContent().build();
    }
}
