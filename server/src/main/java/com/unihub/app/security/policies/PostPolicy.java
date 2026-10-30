package com.unihub.app.security.policies;

import com.unihub.app.domain.PermissionType;
import com.unihub.app.dto.UserDto;
import com.unihub.app.entities.community.content.CommunicationChannel;
import com.unihub.app.entities.community.content.Post;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Component;

import java.time.OffsetDateTime;

@Component
@RequiredArgsConstructor
public class PostPolicy implements ResourcePolicy {

    private final CommunityAccessHelper helper;

    @Override
    public boolean can(UserDto user, Object resource, PermissionType permission) {
        if (user == null || resource == null || permission == null) {
            return false;
        }

        if (!(resource instanceof Post post)) {
            return false;
        }

        if (helper.hasGlobalPermission(user, permission)) {
            return true;
        }

        boolean isAuthor = post.getOwner() != null && user.id().equals(post.getOwner().getId());
        boolean isArchived = false;
        String communitySlug = switch (post.getChannel()) {
            case COMMUNITY -> post.getCommunityPost().getCommunity().getSlug() ;
            case COURSE -> {
                isArchived = post.getCoursePost().getCourse().isArchived();
                yield post.getCoursePost().getCourse().getStudyYear().getCommunity().getSlug();
            }
            default -> null;
        };

        if (isArchived){
            return false;
        }

        boolean hasPermission = switch (post.getChannel()) {
            case COMMUNITY, COURSE -> helper.hasCommunityPermission(communitySlug, user.id(), permission);
            case GENERAL -> helper.isGlobalAdmin(user);
            default -> false;
        };

        return switch (permission) {
            case CREATE_POST -> hasPermission;
            case UPDATE_POST -> isAuthor && post.getCreatedAt() != null && OffsetDateTime.now().isBefore(post.getCreatedAt().plusMinutes(30));
            case DELETE_POST -> isAuthor ||
                    (!post.getChannel().equals(CommunicationChannel.GENERAL) && helper.hasCommunityPermission(communitySlug, user.id(), PermissionType.MODERATE_POST));
            case PIN_POST -> hasPermission;
            case LIKE_POST -> true;
            default -> false;
        };
    }

    @Override
    public void check(UserDto user, Object resource, PermissionType permission) {
        if (!can(user, resource, permission)) {
            throw new AccessDeniedException("User is not authorized to perform " + permission.name() + " on post");
        }
    }
}
