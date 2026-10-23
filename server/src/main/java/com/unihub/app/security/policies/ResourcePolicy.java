package com.unihub.app.security.policies;

import com.unihub.app.domain.PermissionType;
import com.unihub.app.dto.UserDto;
import org.springframework.security.access.AccessDeniedException;

public interface ResourcePolicy<T> {
    boolean can(UserDto user, T resource, PermissionType permission);

    default void check(UserDto user, T resource, PermissionType permission) {
        if (!can(user, resource, permission)) {
            throw new AccessDeniedException("User is not authorized to perform " + (permission != null ? permission.name() : "action"));
        }
    }
}
