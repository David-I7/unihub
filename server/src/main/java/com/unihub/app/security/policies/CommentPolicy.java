package com.unihub.app.security.policies;

import com.unihub.app.domain.PermissionType;
import com.unihub.app.dto.UserDto;
import com.unihub.app.entities.community.content.Comment;
import com.unihub.app.entities.community.content.CommunicationChannel;
import com.unihub.app.entities.community.content.Post;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.time.OffsetDateTime;

@Component
@RequiredArgsConstructor
public class CommentPolicy implements ResourcePolicy {

    private final CommunityAccessHelper helper;

    @Override
    public boolean can(UserDto user, Object resource, PermissionType permission) {
        if (user == null || resource == null || permission == null) {
            return false;
        }


        if (!(resource instanceof Comment comment)) {
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
        boolean isArchived = false;
        String communitySlug = switch (post.getChannel()) {
            case COMMUNITY -> post.getCommunityPost().getCommunity().getSlug();
            case COURSE -> {
                isArchived = post.getCoursePost().getCourse().isArchived();
                yield post.getCoursePost().getCourse().getStudyYear().getCommunity().getSlug() ;
            }
            default -> null;
        };

        boolean hasPermission = switch (post.getChannel()) {
            case COMMUNITY, COURSE -> helper.hasCommunityPermission(communitySlug, user.id(), permission);
            case GENERAL -> helper.isGlobalAdmin(user);
            default -> false;
        };

        return switch (permission) {
            case CREATE_COMMENT -> hasPermission;
            case UPDATE_COMMENT -> isAuthor && comment.getCreatedAt().isBefore(OffsetDateTime.now().plusMinutes(30));
            case DELETE_COMMENT -> isAuthor ||
                    (!post.getChannel().equals(CommunicationChannel.GENERAL) && helper.hasCommunityPermission(communitySlug, user.id(), PermissionType.MODERATE_COMMENT));
            default -> false;
        };
    }

    @Override
    public void check(UserDto user, Object resource, PermissionType permission) {
        if (!can(user, resource, permission)) {
            throw new AccessDeniedException("User is not authorized to perform " + permission.name() + " on comment");
        }
    }
}
