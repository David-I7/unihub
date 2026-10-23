package com.unihub.app.security.policies;

import com.unihub.app.domain.PermissionType;
import com.unihub.app.dto.UserDto;
import com.unihub.app.entities.community.content.Comment;
import com.unihub.app.entities.community.content.CommunicationChannel;
import com.unihub.app.entities.community.content.Post;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class CommentPolicy implements ResourcePolicy<Comment> {

    private final CommunityAccessHelper helper;

    @Override
    public boolean can(UserDto user, Comment comment, PermissionType permission) {
        if (user == null || comment == null || permission == null) {
            return false;
        }

        if (helper.hasGlobalPermission(user, permission)) {
            return true;
        }

        Post post = comment.getPost();
        if (post == null) {
            return false;
        }

        boolean isAuthor = comment.getOwner() != null && user.id().equals(comment.getOwner().getId());
        String communitySlug = switch (post.getChannel()) {
            case COMMUNITY -> post.getCommunityPost().getCommunity().getSlug();
            case COURSE -> post.getCoursePost().getCourse().getStudyYear().getCommunity().getSlug() ;
            default -> null;
        };

        boolean hasPermission = switch (post.getChannel()) {
            case COMMUNITY, COURSE -> helper.hasCommunityPermission(communitySlug, user.id(), permission);
            case GENERAL -> helper.isGlobalAdmin(user);
            default -> false;
        };

        return switch (permission) {
            case CREATE_COMMENT -> hasPermission;
            case UPDATE_COMMENT -> isAuthor;
            case DELETE_COMMENT -> isAuthor ||
                    (!post.getChannel().equals(CommunicationChannel.GENERAL) && helper.hasCommunityPermission(communitySlug, user.id(), PermissionType.MODERATE_COMMENT));
            default -> false;
        };
    }

    @Override
    public void check(UserDto user, Comment resource, PermissionType permission) {
        if (!can(user, resource, permission)) {
            throw new AccessDeniedException("User is not authorized to perform " + permission.name() + " on comment");
        }
    }
}
