package com.unihub.app.controllers.user;

import com.unihub.app.dto.UserDto;
import com.unihub.app.dto.user.UserCommunitiesResponseDto;
import com.unihub.app.dto.user.UserProfileResponseDto;
import com.unihub.app.dto.user.request.UpdateUserProfileRequestDto;
import com.unihub.app.dto.user.request.UpdateUserRoleRequestDto;
import com.unihub.app.services.authentication.UserService;
import com.unihub.app.services.authorization.AuthorizationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final AuthorizationService authorizationService;
    private final UserService userService;

    @GetMapping("/me")
    public ResponseEntity<UserProfileResponseDto> getMyProfile() {
        UserDto currentUser = authorizationService.requireAuthentication().getUserDto();
        UserProfileResponseDto profile = userService.getUserProfile(currentUser.id());
        return ResponseEntity.ok(profile);
    }

    @GetMapping("/me/communities")
    public ResponseEntity<UserCommunitiesResponseDto> getMyCommunities() {
        UserDto currentUser = authorizationService.requireAuthentication().getUserDto();
        UserCommunitiesResponseDto response = userService.getUserEnrolledCommunities(currentUser.id());
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/me")
    public ResponseEntity<UserProfileResponseDto> updateProfile(
            @Valid @RequestBody UpdateUserProfileRequestDto requestDto
    ) {
        UserDto currentUser = authorizationService.requireAuthentication().getUserDto();
        UserProfileResponseDto profile = userService.updateProfile(currentUser.id(), requestDto);
        return ResponseEntity.ok(profile);
    }

    @DeleteMapping("/me")
    public ResponseEntity<Void> deleteMyAccount() {
        UserDto currentUser = authorizationService.requireAuthentication().getUserDto();
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
            @PathVariable String username
    ) {
        userService.adminDeleteUser(username);
        return ResponseEntity.noContent().build();
    }
}
