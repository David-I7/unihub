package com.unihub.app.services.community.content;

import com.unihub.app.domain.PermissionType;

import com.unihub.app.dto.UserDto;
import com.unihub.app.dto.community.content.request.PinPostRequestDto;
import com.unihub.app.dto.community.content.request.UpdatePostRequestDto;
import com.unihub.app.dto.community.content.response.PostDetailResponseDto;
import com.unihub.app.dto.community.content.response.PostResponseDto;
import com.unihub.app.entities.authentication.User;
import com.unihub.app.entities.community.content.Post;
import com.unihub.app.entities.community.content.PostLike;
import com.unihub.app.entities.community.content.PostLikeId;
import com.unihub.app.events.notification.PostLikedNotificationEvent;
import com.unihub.app.mappers.UserMapper;
import com.unihub.app.mappers.community.CommunityContentMapper;
import com.unihub.app.repositories.community.content.CommunityPostRepository;
import com.unihub.app.repositories.community.content.CoursePostRepository;
import com.unihub.app.repositories.community.content.PostLikeRepository;
import com.unihub.app.repositories.community.content.PostRepository;
import com.unihub.app.security.policies.PostPolicy;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PostService {

    private final PostRepository postRepository;
    private final PostLikeRepository postLikeRepository;
    private final CommunityContentMapper contentMapper;
    private final UserMapper userMapper;
    private final ApplicationEventPublisher eventPublisher;
    private final PostPolicy postPolicy;

    @Transactional(readOnly = true)
    public PostDetailResponseDto getPostById(UUID postId, UserDto caller) {
        Post post = postRepository.findByIdWithOwnerAndPost(postId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found"));

        Boolean isLiked = caller != null ? postLikeRepository.existsByIdPostIdAndIdUserId(postId, caller.id()) : null;
        return contentMapper.toPostDetailResponseDto(post, isLiked);
    }

    @Transactional
    public PostResponseDto updatePost(UUID postId, UserDto caller, UpdatePostRequestDto dto) {
        if (dto.title().isUndefined() && dto.description().isUndefined()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "At least one field must be provided for update");
        }

        Optional<Post> existingPost = postRepository.findByIdWithOwnerAndPost(postId);
        if (existingPost.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found");
        }

        Post post = existingPost.get();
        postPolicy.check(caller, post, PermissionType.UPDATE_POST);

        dto.title().ifPresent(post::setTitle);
        dto.description().ifPresent(post::setDescription);

        Post saved = postRepository.save(post);
        Boolean isLiked = postLikeRepository.existsByIdPostIdAndIdUserId(postId, caller.id());
        return contentMapper.toPostResponseDto(saved, isLiked);
    }

    @Transactional
    public void deletePost(UUID postId, UserDto caller) {
        Optional<Post> existingPost = postRepository.findByIdWithOwnerAndPost(postId);
        if (existingPost.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found");
        }
        Post post = existingPost.get();
        postPolicy.check(caller, post, PermissionType.DELETE_POST);
        postRepository.delete(post);
    }

    @Transactional
    public PostResponseDto pinPost(UUID postId, UserDto caller, PinPostRequestDto dto) {
        Optional<Post> existingPost = postRepository.findByIdWithOwnerAndPost(postId);
        if (existingPost.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found");
        }

        Post post = existingPost.get();
        postPolicy.check(caller, post, PermissionType.PIN_POST);

        post.setPinned(dto.pinned());
        Post saved = postRepository.save(post);
        Boolean isLiked = postLikeRepository.existsByIdPostIdAndIdUserId(postId, caller.id());
        return contentMapper.toPostResponseDto(saved, isLiked);
    }

    @Transactional
    public void likePost(UUID postId, UserDto caller) {
        Optional<Post> existingPost = postRepository.findByIdWithOwnerAndPost(postId);
        if (existingPost.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found");
        }

        postPolicy.check(caller, existingPost.get(), PermissionType.LIKE_POST);

        User callerUser = userMapper.toEntity(caller);
        PostLike postLike = PostLike.builder()
                .id(new PostLikeId(postId, caller.id()))
                .post(existingPost.get())
                .user(callerUser)
                .build();

        postLikeRepository.save(postLike);
        postRepository.incrementLikesCount(postId);

        eventPublisher.publishEvent(new PostLikedNotificationEvent(existingPost.get(), callerUser));
    }

    @Transactional
    public void unlikePost(UUID postId, UserDto caller) {
        Optional<Post> existingPost = postRepository.findByIdWithOwnerAndPost(postId);
        if (existingPost.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found");
        }

        postPolicy.check(caller, existingPost.get(), PermissionType.LIKE_POST);

        if (postLikeRepository.existsByIdPostIdAndIdUserId(postId, caller.id())) {
            postLikeRepository.deleteByIdPostIdAndIdUserId(postId, caller.id());
            postRepository.decrementLikesCount(postId);
        }
    }
}
