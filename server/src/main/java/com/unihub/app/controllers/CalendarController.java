package com.unihub.app.controllers;

import com.unihub.app.dto.PageDto;
import com.unihub.app.dto.UserDto;
import com.unihub.app.dto.community.content.request.CreateEventReminderRequestDto;
import com.unihub.app.dto.community.content.request.CreateEventRequestDto;
import com.unihub.app.dto.community.content.request.UpdateEventRequestDto;
import com.unihub.app.dto.community.content.response.CalendarEventResponseDto;
import com.unihub.app.dto.community.content.response.EventReminderResponseDto;
import com.unihub.app.dto.community.content.response.EventResponseDto;
import com.unihub.app.dto.community.content.response.UserReminderResponseDto;
import com.unihub.app.entities.community.content.ReminderStatus;
import com.unihub.app.entities.community.resources.StudyYearName;
import com.unihub.app.services.community.content.CalendarService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/calendar")
@RequiredArgsConstructor
public class CalendarController {

    private final CalendarService calendarService;

    @GetMapping("/upcoming")
    public ResponseEntity<PageDto<CalendarEventResponseDto>> getUpcomingEvents(
            @AuthenticationPrincipal UserDto user,
            @RequestParam(required = false, defaultValue = "7") Integer days,
            @PageableDefault(page = 0, size = 5) Pageable pageable
    ) {
        PageDto<CalendarEventResponseDto> upcoming = calendarService.getUpcomingEvents(user.id(), days, pageable);
        return ResponseEntity.ok(upcoming);
    }

    @GetMapping("/reminders")
    public ResponseEntity<PageDto<UserReminderResponseDto>> getUserReminders(
            @AuthenticationPrincipal UserDto user,
            @RequestParam(required = false, defaultValue = "PENDING") ReminderStatus status,
            @PageableDefault(page = 0, size = 5) Pageable pageable
    ) {
        PageDto<UserReminderResponseDto> reminders = calendarService.getUserReminders(user.id(), status, pageable);
        return ResponseEntity.ok(reminders);
    }

    @GetMapping
    public ResponseEntity<List<CalendarEventResponseDto>> getEvents(
            @AuthenticationPrincipal UserDto user,
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer month,
            @RequestParam String communitySlug,
            @RequestParam(required = false) StudyYearName studyYear,
            @RequestParam(required = false) String courseSlug
    ) {
        List<CalendarEventResponseDto> events = calendarService.getEvents(
                user.id(),
                year,
                month,
                communitySlug,
                studyYear,
                courseSlug
        );
        return ResponseEntity.ok(events);
    }

    @PostMapping("/events")
    public ResponseEntity<CalendarEventResponseDto> createEvent(
            @AuthenticationPrincipal UserDto user,
            @RequestBody @Valid CreateEventRequestDto requestDto
    ) {
        CalendarEventResponseDto event = calendarService.createEvent(user, requestDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(event);
    }

    @GetMapping("/events/{eventId}")
    public ResponseEntity<EventResponseDto> getEventById(
            @AuthenticationPrincipal UserDto user,
            @PathVariable UUID eventId
    ) {
        EventResponseDto event = calendarService.getEventById(user.id(), eventId);
        return ResponseEntity.ok(event);
    }

    @PatchMapping("/events/{eventId}")
    public ResponseEntity<CalendarEventResponseDto> updateEvent(
            @AuthenticationPrincipal UserDto user,
            @PathVariable UUID eventId,
            @RequestBody @Valid UpdateEventRequestDto requestDto
    ) {
        CalendarEventResponseDto event = calendarService.updateEvent(eventId, user, requestDto);
        return ResponseEntity.ok(event);
    }

    @DeleteMapping("/events/{eventId}")
    public ResponseEntity<Void> deleteEvent(
            @AuthenticationPrincipal UserDto user,
            @PathVariable UUID eventId
    ) {
        calendarService.deleteEvent(eventId, user);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/events/{eventId}/reminders")
    public ResponseEntity<EventReminderResponseDto> createReminder(
            @AuthenticationPrincipal UserDto user,
            @PathVariable UUID eventId,
            @RequestBody(required = false) @Valid CreateEventReminderRequestDto requestDto
    ) {
        CreateEventReminderRequestDto dto = requestDto != null ? requestDto : new CreateEventReminderRequestDto(null);
        EventReminderResponseDto reminder = calendarService.createReminder(eventId, user, dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(reminder);
    }

    @DeleteMapping("/events/{eventId}/reminders")
    public ResponseEntity<Void> deleteReminder(
            @AuthenticationPrincipal UserDto user,
            @PathVariable UUID eventId
    ) {
        calendarService.deleteReminder(eventId, user);
        return ResponseEntity.noContent().build();
    }
}
