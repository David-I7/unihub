package com.unihub.app.security.policies;

import com.unihub.app.domain.PermissionType;
import com.unihub.app.dto.UserDto;
import com.unihub.app.entities.community.resources.Teacher;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class TeacherPolicy implements ResourcePolicy {

    private final CommunityAccessHelper helper;

    @Override
    public boolean can(UserDto user, Object resource, PermissionType permission) {
        if (user == null || resource == null || permission == null) {
            return false;
        }

        if (helper.hasGlobalPermission(user, permission)) {
            return true;
        }

        String communitySlug = resource instanceof Teacher teacher ? teacher.getCommunity().getSlug()
                : resource instanceof String slug ? slug : null;

        return helper.hasCommunityPermission(communitySlug, user.id(), permission);
    }

    @Override
    public void check(UserDto user, Object resource, PermissionType permission) {
        if (!can(user, resource, permission)) {
            throw new AccessDeniedException("User is not authorized to perform " + permission.name() + " on teacher");
        }
    }
}
