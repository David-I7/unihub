package com.unihub.app.controllers;

import com.unihub.app.dto.UserDto;
import com.unihub.app.dto.community.content.request.CreateEventRequestDto;
import com.unihub.app.dto.community.content.response.CalendarEventResponseDto;
import com.unihub.app.dto.community.content.response.EventResponseDto;
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
    public ResponseEntity<List<CalendarEventResponseDto>> getEvents(
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer month,
            @RequestParam String communitySlug,
            @RequestParam(required = false) StudyYearName studyYear,
            @RequestParam(required = false) String courseSlug
    ) {
        UserDto user = authorizationService.requireAuthentication().getUserDto();
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
//
    @PostMapping("/events")
    public ResponseEntity<CalendarEventResponseDto> createEvent(
            @RequestBody @Valid CreateEventRequestDto requestDto
    ) {
        UserDto user = authorizationService.requireAuthentication().getUserDto();
        CalendarEventResponseDto event = calendarService.createEvent(user.id(), requestDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(event);
    }
//
    @GetMapping("/events/{eventId}")
    public ResponseEntity<EventResponseDto> getEventById(@PathVariable UUID eventId) {
        UserDto user = authorizationService.requireAuthentication().getUserDto();
        EventResponseDto event = calendarService.getEventById(user.id(), eventId);
        return ResponseEntity.ok(event);
    }
}
