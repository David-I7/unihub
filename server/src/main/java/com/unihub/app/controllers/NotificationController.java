package com.unihub.app.controllers;

import com.unihub.app.dto.PageDto;
import com.unihub.app.dto.UserDto;
import com.unihub.app.dto.community.content.NotificationResponseDto;
import com.unihub.app.entities.authentication.User;
import com.unihub.app.services.authentication.UserService;
import com.unihub.app.services.community.content.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;
    private final UserService userService;

    private User requireCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof UserDto userDto) {
            return userService.findById(userDto.id());
        }
        throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authentication required");
    }

    @GetMapping
    public ResponseEntity<PageDto<NotificationResponseDto>> getNotifications(
            @PageableDefault(page = 0, size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        User user = requireCurrentUser();
        PageDto<NotificationResponseDto> notifications = notificationService.getUserNotifications(user, pageable);
        return ResponseEntity.ok(notifications);
    }

    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Long>> getUnreadCount() {
        User user = requireCurrentUser();
        long count = notificationService.getUnreadCount(user);
        return ResponseEntity.ok(Map.of("unreadCount", count));
    }

    @PatchMapping("/{notificationId}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable UUID notificationId) {
        User user = requireCurrentUser();
        notificationService.markAsRead(user, notificationId);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/read-all")
    public ResponseEntity<Void> markAllAsRead() {
        User user = requireCurrentUser();
        notificationService.markAllAsRead(user);
        return ResponseEntity.noContent().build();
    }
}
