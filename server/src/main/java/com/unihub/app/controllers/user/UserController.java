package com.unihub.app.controllers.user;

import com.unihub.app.dto.UserDto;
import com.unihub.app.dto.user.UserCommunitiesResponseDto;
import com.unihub.app.dto.user.UserProfileResponseDto;
import com.unihub.app.services.authentication.UserService;
import com.unihub.app.services.authorization.AuthorizationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/users/me")
@RequiredArgsConstructor
public class UserController {

    private final AuthorizationService authorizationService;
    private final UserService userService;

    @GetMapping
    public ResponseEntity<UserProfileResponseDto> getMyProfile() {
        UserDto currentUser = authorizationService.requireAuthentication().getUserDto();
        UserProfileResponseDto profile = userService.getUserProfile(currentUser.id());
        return ResponseEntity.ok(profile);
    }

    @GetMapping("/communities")
    public ResponseEntity<UserCommunitiesResponseDto> getMyCommunities() {
        UserDto currentUser = authorizationService.requireAuthentication().getUserDto();
        UserCommunitiesResponseDto response = userService.getUserEnrolledCommunities(currentUser.id());
        return ResponseEntity.ok(response);
    }
}
