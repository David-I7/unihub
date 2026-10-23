package com.unihub.app.security;

import com.unihub.app.domain.PermissionType;
import com.unihub.app.dto.UserDto;
import com.unihub.app.security.policies.CommunityAccessHelper;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.PermissionEvaluator;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

import java.io.Serializable;

@Component
@RequiredArgsConstructor
public class UnifiedPermissionEvaluator implements PermissionEvaluator {

    private final CommunityAccessHelper helper;

    @Override
    public boolean hasPermission(Authentication auth, Object targetDomainObject, Object permission) {
        if (auth == null || targetDomainObject == null || permission == null || !(auth.getPrincipal() instanceof UserDto user)) {
            return false;
        }

        PermissionType perm = resolvePermission(targetDomainObject.toString(), permission.toString());
        return perm != null && helper.hasGlobalPermission(user, perm);
    }

    @Override
    public boolean hasPermission(Authentication auth, Serializable targetId, String targetType, Object permission) {
        if (auth == null || targetId == null || targetType == null || !(permission instanceof String strPermission) || !(auth.getPrincipal() instanceof UserDto user)) {
            return false;
        }
        String communitySlug = targetId.toString();
        PermissionType perm = resolvePermission(targetType, strPermission);
        return perm != null && (helper.hasGlobalPermission(user, perm) || helper.hasCommunityPermission(communitySlug, user.id(), perm));
    }

    private PermissionType resolvePermission(String targetType, String action) {
        if (targetType == null || action == null) {
            return null;
        }

        try {
            return PermissionType.valueOf(action.toUpperCase() + "_" + targetType.toUpperCase());
        } catch (IllegalArgumentException ignored) {}
        return null;
    }
}
