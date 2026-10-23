package com.unihub.app.security.policies;

import com.unihub.app.domain.PermissionType;
import com.unihub.app.dto.UserDto;
import com.unihub.app.entities.community.resources.TeacherRating;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class TeacherRatingPolicy implements ResourcePolicy<TeacherRating> {

    private final CommunityAccessHelper helper;

    @Override
    public boolean can(UserDto user, TeacherRating rating, PermissionType permission) {
        if (user == null || rating == null || permission == null) {
            return false;
        }

        if (helper.hasGlobalPermission(user, permission)) {
            return true;
        }

        String communitySlug = rating.getTeacher().getCommunity().getSlug();
        boolean isAuthor = rating.getUser() != null && user.id().equals(rating.getUser().getId());

        return switch (permission) {
            case CREATE_TEACHER_RATING -> helper.hasCommunityPermission(communitySlug, user.id(), permission);
            case UPDATE_TEACHER_RATING -> isAuthor;
            case DELETE_TEACHER_RATING -> isAuthor || helper.hasCommunityPermission(communitySlug, user.id(), PermissionType.MODERATE_TEACHER_RATING);
            default -> false;
        };
    }

    @Override
    public void check(UserDto user, TeacherRating resource, PermissionType permission) {
        if (!can(user, resource, permission)) {
            throw new AccessDeniedException("User is not authorized to perform " + permission.name() + " on teacher rating");
        }
    }
}
