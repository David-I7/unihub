package com.unihub.app.security;

import com.unihub.app.domain.PermissionType;
import com.unihub.app.domain.RoleType;
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

        String target = targetDomainObject.toString().trim();
        String permOrRole = permission.toString().trim();

        if (target.equalsIgnoreCase("ROLE")) {
            RoleType role = resolveRole(permOrRole);
            return role != null && helper.hasGlobalRole(user, role);
        }

        PermissionType perm = resolvePermission(target, permOrRole);
        return perm != null && helper.hasGlobalPermission(user, perm);
    }

    @Override
    public boolean hasPermission(Authentication auth, Serializable targetId, String targetType, Object permission) {
        if (auth == null || targetId == null || targetType == null || permission == null || !(auth.getPrincipal() instanceof UserDto user)) {
            return false;
        }

        String type = targetType.trim();
        String permOrRole = permission.toString().trim();
        String communitySlug = targetId.toString();

        if (type.equalsIgnoreCase("ROLE")) {
            RoleType role = resolveRole(permOrRole);
            return role != null && helper.hasCommunityRole(communitySlug, user, role);
        }

        PermissionType perm = resolvePermission(type, permOrRole);
        return perm != null && (helper.hasGlobalPermission(user, perm) || helper.hasCommunityPermission(communitySlug, user.id(), perm));
    }

    private RoleType resolveRole(String roleName) {
        if (roleName == null || roleName.isBlank()) {
            return null;
        }
        try {
            return RoleType.valueOf(roleName.toUpperCase());
        } catch (IllegalArgumentException ignored) {
            return null;
        }
    }

    private PermissionType resolvePermission(String resource, String action) {
        if (resource == null || action == null || resource.isBlank() || action.isBlank()) {
            return null;
        }

        String combined = action.trim().toLowerCase() + ":" + toCamelCase(resource);
        return PermissionType.from(combined);
    }

    private String toCamelCase(String text) {
        if (text == null || text.isBlank()) {
            return "";
        }
        String[] parts = text.trim().split("[_\\-\\s]+");
        if (parts.length == 1) {
            String part = parts[0];
            return part.toLowerCase();
        }
        StringBuilder sb = new StringBuilder();
        for (String part : parts) {
            if (part.isEmpty()) continue;
            if (sb.isEmpty()) {
                sb.append(part.toLowerCase());
            } else {
                sb.append(Character.toUpperCase(part.charAt(0)));
                if (part.length() > 1) {
                    sb.append(part.substring(1).toLowerCase());
                }
            }
        }
        return sb.toString();
    }
}
