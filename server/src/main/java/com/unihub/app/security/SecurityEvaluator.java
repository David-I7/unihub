package com.unihub.app.security;

import com.unihub.app.domain.PermissionType;
import com.unihub.app.services.authorization.AuthorizationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component("security")
@RequiredArgsConstructor
public class SecurityEvaluator {

    private final AuthorizationService authorizationService;

    public boolean hasGlobalPermission(PermissionType permission) {
        return authorizationService.hasGlobalPermission(permission);
    }

    public boolean hasGlobalPermission(String permission) {
        PermissionType perm = PermissionType.from(permission);
        return perm != null && authorizationService.hasGlobalPermission(perm);
    }

    public boolean hasCommunityPermission(String communitySlug, PermissionType permission) {
        JwtAuthentication auth = authorizationService.safeRequireAuthentication();
        if (auth == null || communitySlug == null || permission == null) {
            return false;
        }
        return authorizationService.hasCommunityPermission(communitySlug, auth.getUserDto().id(), permission);
    }

    public boolean hasCommunityPermission(String communitySlug, String permission) {
        PermissionType perm = PermissionType.from(permission);
        return perm != null && hasCommunityPermission(communitySlug, perm);
    }

    public boolean isCommunityMember(String communitySlug) {
        JwtAuthentication auth = authorizationService.safeRequireAuthentication();
        if (auth == null || auth.getUserDto() == null || communitySlug == null) {
            return false;
        }
        return authorizationService.isCommunityMember(communitySlug, auth.getUserDto().id());
    }
}
