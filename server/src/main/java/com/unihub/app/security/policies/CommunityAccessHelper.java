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

    public boolean hasGlobalRole(UserDto user, RoleType requiredRole) {
        if (user == null || user.role() == null || requiredRole == null) {
            return false;
        }
        if (user.role().equals(RoleType.ROOT)) {
            return true;
        }
        return user.role().equals(requiredRole);
    }

    public boolean hasCommunityRole(String communitySlug, UserDto user, RoleType requiredRole) {
        if (user == null || communitySlug == null || requiredRole == null) {
            return false;
        }
        if (isGlobalAdmin(user)) {
            return true;
        }
        RoleType role = communityMemberService.getCommunityRole(communitySlug, user.id());
        if (role == null) {
            return false;
        }
        if (role.equals(requiredRole)) {
            return true;
        }
        if (requiredRole.equals(RoleType.COMMUNITY_MEMBER)) {
            return role.equals(RoleType.COMMUNITY_ADMIN) || role.equals(RoleType.COMMUNITY_OWNER);
        }
        if (requiredRole.equals(RoleType.COMMUNITY_ADMIN)) {
            return role.equals(RoleType.COMMUNITY_OWNER);
        }
        return false;
    }

    public boolean isGlobalAdmin(UserDto user) {
        if (user == null) {
            return false;
        }
        return user.role().equals(RoleType.ADMIN) || user.role().equals(RoleType.ROOT);
    }

}
