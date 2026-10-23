package com.unihub.app.security.policies;

import com.unihub.app.domain.PermissionType;
import com.unihub.app.dto.UserDto;
import com.unihub.app.entities.community.content.Folder;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class FolderPolicy implements ResourcePolicy<Folder> {

    private final CommunityAccessHelper helper;

    @Override
    public boolean can(UserDto user, Folder folder, PermissionType permission) {
        if (user == null || folder == null || permission == null) {
            return false;
        }

        if (helper.hasGlobalPermission(user, permission)) {
            return true;
        }

        String communitySlug = folder.getCourse().getStudyYear().getCommunity().getSlug();
        boolean isAuthor = folder.getOwner() != null && user.id().equals(folder.getOwner().getId());

        return switch (permission) {
            case CREATE_FOLDER -> helper.hasCommunityPermission(communitySlug, user.id(), permission);
            case UPDATE_FOLDER -> isAuthor;
            case DELETE_FOLDER -> isAuthor || helper.hasCommunityPermission(communitySlug, user.id(), PermissionType.MODERATE_FOLDER);
            default -> false;
        };
    }

    @Override
    public void check(UserDto user, Folder resource, PermissionType permission) {
        if (!can(user, resource, permission)) {
            throw new AccessDeniedException("User is not authorized to perform " + permission.name() + " on folder");
        }
    }
}
