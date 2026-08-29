package com.unihub.app.mappers;

import com.unihub.app.dto.UserDto;
import com.unihub.app.dto.authentication.LocalRegisterRequestDto;
import com.unihub.app.dto.authentication.LocalUsernameOrEmailLoginRequestDto;
import com.unihub.app.dto.user.UserCommunitiesResponseDto;
import com.unihub.app.dto.user.UserEnrolledCommunityDto;
import com.unihub.app.dto.user.UserProfileResponseDto;
import com.unihub.app.entities.authentication.AuthProvider;
import com.unihub.app.entities.authentication.User;
import com.unihub.app.entities.authentication.UserIdentity;
import com.unihub.app.entities.community.resources.Community;
import com.unihub.app.services.authorization.RoleService;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Component
@AllArgsConstructor
public class UserMapper {

    private final RoleService roleService;

    public UserDto toDto(User user) {
        return new UserDto(user.getId(), user.getEmail(), user.getUsername());
    }

    public User toEntity(UserDto userDto){
        return User.builder()
                .id(userDto.id())
                .email(userDto.email())
                .username(userDto.username())
                .build();
    }

    public User toEntity(LocalUsernameOrEmailLoginRequestDto request) {
        return User.builder()
                .email(request.email())
                .username(request.username())
                .password(request.password())
                .build();
    }

    public User toEntity(LocalRegisterRequestDto request) {
        return User.builder()
                .email(request.getEmail())
                .username(request.getUsername())
                .password(request.getPassword())
                .build();
    }

    public User toEntity(String email, String username, UUID roleId, OffsetDateTime now, boolean emailVerified) {
        return User.builder()
                .email(email)
                .username(username)
                .password(null)
                .createdAt(now)
                .updatedAt(now)
                .roleId(roleId)
                .emailVerified(emailVerified)
                .build();
    }

    public UserIdentity toUserIdentity(User user, AuthProvider provider, String providerSubject, String providerEmail, OffsetDateTime createdAt) {
        return UserIdentity.builder()
                .user(user)
                .provider(provider)
                .providerSubject(providerSubject)
                .providerEmail(providerEmail)
                .createdAt(createdAt)
                .build();
    }

    public UserProfileResponseDto toUserProfile(User user) {
        String roleName = roleService.getRoleById(user.getRoleId()).getName();
        List<String> permissions = roleService.getPermissionNamesByRoleName(roleName);
        return UserProfileResponseDto.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .role(roleName)
                .emailVerified(user.isEmailVerified())
                .permissions(permissions)
                .createdAt(user.getCreatedAt())
                .build();
    }

    public UserEnrolledCommunityDto toUserEnrolledCommunityDto(Community community, String roleName, OffsetDateTime joinedAt) {
        return UserEnrolledCommunityDto.builder()
                .id(community.getId())
                .name(community.getName())
                .slug(community.getSlug())
                .role(roleName)
                .joinedAt(joinedAt)
                .build();
    }

    public UserCommunitiesResponseDto toUserCommunitiesResponseDto(List<UserEnrolledCommunityDto> communities, Map<String, List<String>> permissionsByRole) {
        return new UserCommunitiesResponseDto(communities, permissionsByRole);
    }
}
