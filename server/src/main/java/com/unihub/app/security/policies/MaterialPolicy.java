package com.unihub.app.security.policies;

import com.unihub.app.domain.PermissionType;
import com.unihub.app.dto.UserDto;
import com.unihub.app.entities.community.content.Resource;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class MaterialPolicy implements ResourcePolicy {

    private final CommunityAccessHelper helper;

    @Override
    public boolean can(UserDto user, Object resource, PermissionType permission) {
        if (user == null || resource == null || permission == null) {
            return false;
        }

        if (!(resource instanceof Resource material)) {
            return false;
        }

        if (helper.hasGlobalPermission(user, permission)) {
            return true;
        }

        String communitySlug = material.getCourse().getStudyYear().getCommunity().getSlug();
        boolean isAuthor = material.getOwner() != null && user.id().equals(material.getOwner().getId());

        return switch (permission) {
            case CREATE_MATERIAL -> helper.hasCommunityPermission(communitySlug, user.id(), permission);
            case UPDATE_MATERIAL -> isAuthor;
            case DELETE_MATERIAL -> isAuthor || helper.hasCommunityPermission(communitySlug, user.id(), PermissionType.MODERATE_MATERIAL);
            default -> false;
        };
    }

    @Override
    public void check(UserDto user, Object resource, PermissionType permission) {
        if (!can(user, resource, permission)) {
            throw new AccessDeniedException("User is not authorized to perform " + permission.name() + " on material");
        }
    }
}
