package com.unihub.app.services.community.content;

import com.unihub.app.domain.PermissionType;
import com.unihub.app.domain.RoleType;
import com.unihub.app.dto.UserDto;
import com.unihub.app.dto.community.content.request.PinPostRequestDto;
import com.unihub.app.dto.community.content.request.UpdatePostRequestDto;
import com.unihub.app.dto.community.content.response.CommentResponseDto;
import com.unihub.app.dto.community.content.response.PostResponseDto;
import com.unihub.app.entities.authentication.User;
import com.unihub.app.entities.community.content.Comment;
import com.unihub.app.entities.community.content.Post;
import com.unihub.app.entities.community.content.PostLike;
import com.unihub.app.entities.community.content.PostLikeId;
import com.unihub.app.mappers.UserMapper;
import com.unihub.app.mappers.community.CommunityContentMapper;
import com.unihub.app.repositories.community.content.CommentRepository;
import com.unihub.app.repositories.community.content.CommunityPostRepository;
import com.unihub.app.repositories.community.content.CoursePostRepository;
import com.unihub.app.repositories.community.content.PostLikeRepository;
import com.unihub.app.repositories.community.content.PostRepository;
import com.unihub.app.services.authorization.AuthorizationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PostService {

    private final PostRepository postRepository;
    private final CommunityPostRepository communityPostRepository;
    private final CoursePostRepository coursePostRepository;
    private final CommentRepository commentRepository;
    private final PostLikeRepository postLikeRepository;
    private final AuthorizationService authorizationService;
    private final CommunityContentMapper contentMapper;
    private final UserMapper userMapper;

    public String getCommunitySlugForPost(UUID postId) {
        return communityPostRepository.findCommunitySlugByPostId(postId)
                .or(() -> coursePostRepository.findCommunitySlugByPostId(postId))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Post does not belong to any community"));
    }

    @Transactional(readOnly = true)
    public PostResponseDto getPostById(UUID postId, UserDto caller) {
        Post post = postRepository.findByIdWithOwner(postId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found"));

        List<Comment> comments = commentRepository.findByPostIdInOrderByCreatedAtAsc(List.of(postId));
        List<CommentResponseDto> commentDtos = comments.stream()
                .map(contentMapper::toCommentResponseDto)
                .toList();

        Boolean isLiked = caller != null ? postLikeRepository.existsByIdPostIdAndIdUserId(postId, caller.id()) : null;

        return contentMapper.toPostResponseDto(post, commentDtos, isLiked);
    }

    @Transactional
    public PostResponseDto updatePost(UUID postId, UserDto caller, UpdatePostRequestDto dto) {
        if (dto.title() == null && dto.description() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "At least one field must be provided for update");
        }

        Post post = postRepository.findByIdWithOwner(postId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found"));

        if (!post.getOwner().getId().equals(caller.id())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only edit your own posts");
        }

        String communitySlug = getCommunitySlugForPost(postId);
        if (!authorizationService.hasCommunityPermission(communitySlug, caller.id(), PermissionType.UPDATE_POST)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Permission denied to update post");
        }

        if (dto.title() != null) {
            post.setTitle(dto.title());
        }
        if (dto.description() != null) {
            post.setDescription(dto.description());
        }

        Post saved = postRepository.save(post);
        Boolean isLiked = postLikeRepository.existsByIdPostIdAndIdUserId(postId, caller.id());
        return contentMapper.toPostResponseDto(saved, isLiked);
    }

    @Transactional
    public void deletePost(UUID postId, UserDto caller) {
        Post post = postRepository.findByIdWithOwner(postId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found"));

        String communitySlug = getCommunitySlugForPost(postId);
        boolean isAuthor = post.getOwner().getId().equals(caller.id());

        if (isAuthor) {
            if (!authorizationService.hasCommunityPermission(communitySlug, caller.id(), PermissionType.DELETE_POST)) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Permission denied to delete post");
            }
        } else {
            if (!authorizationService.hasCommunityPermission(communitySlug, caller.id(), PermissionType.MODERATE_POST)) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Permission denied to moderate post");
            }
        }

        postRepository.delete(post);
    }

    @Transactional
    public PostResponseDto pinPost(UUID postId, UserDto caller, PinPostRequestDto dto) {
        Post post = postRepository.findByIdWithOwner(postId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found"));

        String communitySlug = getCommunitySlugForPost(postId);
        if (!authorizationService.hasCommunityPermission(communitySlug, caller.id(), PermissionType.PIN_POST)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Permission denied to pin post");
        }

        post.setPinned(dto.pinned());
        Post saved = postRepository.save(post);
        Boolean isLiked = postLikeRepository.existsByIdPostIdAndIdUserId(postId, caller.id());
        return contentMapper.toPostResponseDto(saved, isLiked);
    }

    @Transactional
    public void likePost(UUID postId, UserDto caller) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found"));

        String communitySlug = getCommunitySlugForPost(postId);
        boolean isMember = authorizationService.isCommunityMember(communitySlug, caller.id());
        RoleType globalRole = authorizationService.getGlobalRole();
        if (!isMember && globalRole != RoleType.ROOT && globalRole != RoleType.ADMIN) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only community members can like posts");
        }

        if (postLikeRepository.existsByIdPostIdAndIdUserId(postId, caller.id())) {
            return;
        }

        User callerUser = userMapper.toEntity(caller);
        PostLike postLike = PostLike.builder()
                .id(new PostLikeId(postId, caller.id()))
                .post(post)
                .user(callerUser)
                .build();

        postLikeRepository.save(postLike);
        postRepository.incrementLikesCount(postId);
    }

    @Transactional
    public void unlikePost(UUID postId, UserDto caller) {
        if (!postRepository.existsById(postId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found");
        }

        if (postLikeRepository.existsByIdPostIdAndIdUserId(postId, caller.id())) {
            postLikeRepository.deleteByIdPostIdAndIdUserId(postId, caller.id());
            postRepository.decrementLikesCount(postId);
        }
    }
}
