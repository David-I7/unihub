package com.unihub.app.mappers;

import com.unihub.app.dto.UserDto;
import com.unihub.app.dto.user.UserEnrolledCommunityDto;
import com.unihub.app.dto.user.UserProfileResponseDto;
import com.unihub.app.entities.authentication.User;
import com.unihub.app.entities.community.resources.Community;
import com.unihub.app.services.authorization.RoleService;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.OffsetDateTime;
import java.util.List;

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

    public UserProfileResponseDto toUserProfile(User user) {
        String roleName = roleService.getRoleById(user.getRoleId()).getName();
        List<String> permissions = roleService.getPermissionNamesByRoleName(roleName);
        return UserProfileResponseDto.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .role(roleName)
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

}
