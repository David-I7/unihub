package com.unihub.app.security.policies;

import com.unihub.app.domain.PermissionType;
import com.unihub.app.dto.UserDto;
import org.springframework.security.access.AccessDeniedException;

public interface ResourcePolicy {
    boolean can(UserDto user, Object resource, PermissionType permission);

    default void check(UserDto user, Object resource, PermissionType permission) {
        if (!can(user, resource, permission)) {
            throw new AccessDeniedException("User is not authorized to perform " + (permission != null ? permission.name() : "action"));
        }
    }
}
