package com.unihub.app.controllers;

import com.unihub.app.dto.PageDto;
import com.unihub.app.dto.UserDto;
import com.unihub.app.dto.community.content.NotificationResponseDto;
import com.unihub.app.services.authorization.AuthorizationService;
import com.unihub.app.services.community.content.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;
    private final AuthorizationService authorizationService;

    @GetMapping
    public ResponseEntity<PageDto<NotificationResponseDto>> getNotifications(
            @PageableDefault(page = 0, size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        UserDto userDto = authorizationService.requireAuthentication().getUserDto();
        PageDto<NotificationResponseDto> notifications = notificationService.getUserNotifications(userDto.id(), pageable);
        return ResponseEntity.ok(notifications);
    }

    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Long>> getUnreadCount() {
        UserDto userDto = authorizationService.requireAuthentication().getUserDto();
        long count = notificationService.getUnreadCount(userDto.id());
        return ResponseEntity.ok(Map.of("unreadCount", count));
    }

    @PatchMapping("/{notificationId}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable UUID notificationId) {
        UserDto userDto = authorizationService.requireAuthentication().getUserDto();
        notificationService.markAsRead(userDto.id(), notificationId);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/read-all")
    public ResponseEntity<Void> markAllAsRead() {
        UserDto userDto = authorizationService.requireAuthentication().getUserDto();
        notificationService.markAllAsRead(userDto.id());
        return ResponseEntity.noContent().build();
    }
}
