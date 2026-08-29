package com.unihub.app.controllers.user;

import com.unihub.app.dto.UserDto;
import com.unihub.app.dto.user.UserCommunitiesResponseDto;
import com.unihub.app.dto.user.UserProfileResponseDto;
import com.unihub.app.dto.user.request.AdminDeleteUserRequestDto;
import com.unihub.app.dto.user.request.UpdateUserProfileRequestDto;
import com.unihub.app.dto.user.request.UpdateUserRoleRequestDto;
import com.unihub.app.services.authentication.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    public ResponseEntity<UserProfileResponseDto> getMyProfile(@AuthenticationPrincipal UserDto currentUser) {
        UserProfileResponseDto profile = userService.getUserProfile(currentUser.id());
        return ResponseEntity.ok(profile);
    }

    @GetMapping("/me/communities")
    public ResponseEntity<UserCommunitiesResponseDto> getMyCommunities(@AuthenticationPrincipal UserDto currentUser) {
        UserCommunitiesResponseDto response = userService.getUserEnrolledCommunities(currentUser.id());
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/me")
    public ResponseEntity<UserProfileResponseDto> updateProfile(
            @AuthenticationPrincipal UserDto currentUser,
            @Valid @RequestBody UpdateUserProfileRequestDto requestDto
    ) {
        UserProfileResponseDto profile = userService.updateProfile(currentUser.id(), requestDto);
        return ResponseEntity.ok(profile);
    }

    @DeleteMapping("/me")
    public ResponseEntity<Void> deleteMyAccount(@AuthenticationPrincipal UserDto currentUser) {
        userService.selfDelete(currentUser.id());
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{username}/role")
    @PreAuthorize("@security.hasGlobalPermission('update:userRole')")
    public ResponseEntity<UserProfileResponseDto> updateUserRole(
            @PathVariable String username,
            @Valid @RequestBody UpdateUserRoleRequestDto requestDto
    ) {
        UserProfileResponseDto profile = userService.updateUserRole(username, requestDto);
        return ResponseEntity.ok(profile);
    }

    @DeleteMapping("/{username}")
    @PreAuthorize("@security.hasGlobalPermission('delete:user')")
    public ResponseEntity<Void> adminDeleteUser(
            @PathVariable String username,
            @Valid @RequestBody AdminDeleteUserRequestDto requestDto
    ) {
        userService.adminDeleteUser(username, requestDto.reason());
        return ResponseEntity.noContent().build();
    }
}
