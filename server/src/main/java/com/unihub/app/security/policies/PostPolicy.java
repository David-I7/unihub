package com.unihub.app.security.policies;

import com.unihub.app.domain.PermissionType;
import com.unihub.app.dto.UserDto;
import com.unihub.app.entities.community.content.CommunicationChannel;
import com.unihub.app.entities.community.content.Post;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class PostPolicy implements ResourcePolicy<Post> {

    private final CommunityAccessHelper helper;

    @Override
    public boolean can(UserDto user, Post post, PermissionType permission) {
        if (user == null || post == null || permission == null) {
            return false;
        }

        if (helper.hasGlobalPermission(user, permission)) {
            return true;
        }

        boolean isAuthor = post.getOwner() != null && user.id().equals(post.getOwner().getId());
        String communitySlug = switch (post.getChannel()) {
            case COMMUNITY -> post.getCommunityPost().getCommunity().getSlug() ;
            case COURSE -> post.getCoursePost().getCourse().getStudyYear().getCommunity().getSlug();
            default -> null;
        };
        boolean hasPermission = switch (post.getChannel()) {
            case COMMUNITY, COURSE -> helper.hasCommunityPermission(communitySlug, user.id(), permission);
            case GENERAL -> helper.isGlobalAdmin(user);
            default -> false;
        };

        return switch (permission) {
            case CREATE_POST -> hasPermission;
            case UPDATE_POST -> isAuthor;
            case DELETE_POST -> isAuthor ||
                    (!post.getChannel().equals(CommunicationChannel.GENERAL) && helper.hasCommunityPermission(communitySlug, user.id(), PermissionType.MODERATE_POST));
            case PIN_POST -> hasPermission;
            case LIKE_POST -> true;
            default -> false;
        };
    }

    @Override
    public void check(UserDto user, Post resource, PermissionType permission) {
        if (!can(user, resource, permission)) {
            throw new AccessDeniedException("User is not authorized to perform " + permission.name() + " on post");
        }
    }
}
