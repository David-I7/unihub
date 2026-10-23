package com.unihub.app.security.policies;

import com.unihub.app.domain.PermissionType;
import com.unihub.app.domain.RoleType;
import com.unihub.app.dto.UserDto;
import com.unihub.app.entities.community.resources.CommunityMember;
import com.unihub.app.repositories.community.resources.CommunityMemberRepository;
import com.unihub.app.services.authorization.RoleService;
import com.unihub.app.services.community.resources.CommunityMemberService;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Component;

import java.util.Optional;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class CommunityAccessHelper {

    private final CommunityMemberService communityMemberService;
    private final RoleService roleService;

    public boolean hasGlobalPermission(UserDto user, PermissionType permission) {
        if (user == null || user.role() == null || permission == null) {
            return false;
        }
        return roleService.getPermissionNamesByRoleType(user.role()).contains(permission.getValue());
    }

    public boolean hasCommunityPermission(String communitySlug, UUID userId, PermissionType permission) {
        if (permission == null) {
            return false;
        }
        RoleType role = communityMemberService.getCommunityRole(communitySlug, userId);
        if (role == null) return false;

        return roleService.getPermissionNamesByRoleType(role).contains(permission.getValue());
    }

    public boolean isGlobalAdmin(UserDto user) {
        if (user == null) {
            return false;
        }
        return user.role().equals(RoleType.ADMIN) || user.role().equals(RoleType.ROOT);
    }

    public boolean isCommunityAdmin(String communitySlug, UUID userId) {
        RoleType role = communityMemberService.getCommunityRole(communitySlug, userId);
        return role.equals(RoleType.COMMUNITY_ADMIN) || role.equals(RoleType.ROOT);
    }

    public boolean isCommunityMember(String communitySlug, UUID userId) {
        return communityMemberService.getCommunityRole(communitySlug, userId) != null;
    }
}
