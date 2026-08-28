package com.unihub.app.security;

import com.unihub.app.domain.PermissionType;
import com.unihub.app.dto.UserDto;
import com.unihub.app.services.authorization.AuthorizationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component("security")
@RequiredArgsConstructor
public class SecurityEvaluator {

    private final AuthorizationService authorizationService;

    public boolean hasGlobalPermission(String permission) {
        JwtAuthentication auth = authorizationService.safeRequireAuthentication();
        if (auth == null || auth.getUserDto() == null) {
            return false;
        }
        return authorizationService.hasGlobalPermission(auth.getUserDto().id(), permission);
    }

    public boolean hasGlobalPermission(PermissionType permission) {
        return hasGlobalPermission(permission.getValue());
    }

    public boolean hasCommunityPermission(String communitySlug, String permission) {
        JwtAuthentication auth = authorizationService.safeRequireAuthentication();
        if (auth == null || auth.getUserDto() == null || communitySlug == null) {
            return false;
        }
        return authorizationService.hasCommunityPermission(communitySlug, auth.getUserDto().id(), permission);
    }

    public boolean hasCommunityPermission(String communitySlug, PermissionType permission) {
        return hasCommunityPermission(communitySlug, permission.getValue());
    }

    public boolean isCommunityMember(String communitySlug) {
        JwtAuthentication auth = authorizationService.safeRequireAuthentication();
        if (auth == null || auth.getUserDto() == null || communitySlug == null) {
            return false;
        }
        return authorizationService.isCommunityMember(communitySlug, auth.getUserDto().id());
    }
}
