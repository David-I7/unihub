package com.unihub.app.controllers;

import com.unihub.app.dto.PageDto;
import com.unihub.app.dto.UserDto;
import com.unihub.app.dto.community.content.response.NotificationResponseDto;
import com.unihub.app.entities.community.content.NotificationCategory;
import com.unihub.app.entities.community.content.NotificationType;
import com.unihub.app.services.community.content.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    public ResponseEntity<PageDto<NotificationResponseDto>> getNotifications(
            @AuthenticationPrincipal UserDto userDto,
            @RequestParam(required = false) NotificationCategory category,
            @RequestParam(required = false) NotificationType type,
            @RequestParam(required = false) Boolean isRead,
            @PageableDefault(page = 0, size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        PageDto<NotificationResponseDto> notifications = notificationService.getUserNotifications(
                userDto.id(),
                category,
                type,
                isRead,
                pageable
        );
        return ResponseEntity.ok(notifications);
    }

    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Long>> getUnreadCount(
            @AuthenticationPrincipal UserDto userDto,
            @RequestParam(required = false) NotificationCategory category
    ) {
        long count = notificationService.getUnreadCount(userDto.id(), category);
        return ResponseEntity.ok(Map.of("unreadCount", count));
    }

    @PatchMapping("/{notificationId}/read")
    public ResponseEntity<Void> markAsRead(@AuthenticationPrincipal UserDto userDto, @PathVariable UUID notificationId) {
        notificationService.markAsRead(userDto.id(), notificationId);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/read-all")
    public ResponseEntity<Void> markAllAsRead(@AuthenticationPrincipal UserDto userDto) {
        notificationService.markAllAsRead(userDto.id());
        return ResponseEntity.noContent().build();
    }
}
