package com.unihub.app.services.community.content;

import com.unihub.app.domain.PermissionType;
import com.unihub.app.dto.PageDto;
import com.unihub.app.dto.UserDto;
import com.unihub.app.dto.community.content.request.CreatePostRequestDto;
import com.unihub.app.dto.community.content.response.PostResponseDto;
import com.unihub.app.services.authorization.AuthorizationService;
import com.unihub.app.entities.authentication.User;
import com.unihub.app.entities.community.content.CommunicationChannel;
import com.unihub.app.entities.community.content.CommunityPost;
import com.unihub.app.entities.community.content.Post;
import com.unihub.app.entities.community.resources.Community;
import com.unihub.app.events.notification.CommunityPostCreatedNotificationEvent;
import com.unihub.app.mappers.PageMapper;
import com.unihub.app.mappers.UserMapper;
import com.unihub.app.mappers.community.CommunityContentMapper;
import com.unihub.app.repositories.community.content.CommunityPostRepository;
import com.unihub.app.repositories.community.content.PostLikeRepository;
import com.unihub.app.repositories.community.content.PostRepository;
import com.unihub.app.repositories.community.resources.CommunityRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.*;

@Service
@RequiredArgsConstructor
public class CommunityPostService {

    private final CommunityRepository communityRepository;
    private final PostRepository postRepository;
    private final CommunityPostRepository communityPostRepository;
    private final PostLikeRepository postLikeRepository;
    private final AuthorizationService authorizationService;
    private final CommunityContentMapper contentMapper;
    private final UserMapper userMapper;
    private final PageMapper pageMapper;
    private final ApplicationEventPublisher eventPublisher;

    @Transactional
    public PostResponseDto createCommunityPost(String slug, UserDto caller, CreatePostRequestDto dto) {
        Community community = communityRepository.findBySlug(slug)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Community not found"));

        if (!authorizationService.hasCommunityPermission(slug, caller.id(), PermissionType.CREATE_POST)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Permission denied to create post");
        }

        User owner = userMapper.toEntity(caller);
        Post post = contentMapper.toPostEntity(dto, CommunicationChannel.COMMUNITY, owner);
        Post savedPost = postRepository.save(post);

        CommunityPost communityPost = CommunityPost.builder()
                .post(savedPost)
                .community(community)
                .build();
        communityPostRepository.save(communityPost);

        eventPublisher.publishEvent(new CommunityPostCreatedNotificationEvent(savedPost, community, owner));

        return contentMapper.toPostResponseDto(savedPost, false);
    }

    @Transactional(readOnly = true)
    public PageDto<PostResponseDto> getCommunityPosts(String slug, UserDto caller, Pageable pageable) {
        Community community = communityRepository.findBySlugWithOwner(slug)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Community not found"));

        Page<Post> postsPage = communityPostRepository.findPostsByCommunityId(community.getId(), pageable);

        if (postsPage.isEmpty()) {
            return pageMapper.toPageDto(postsPage.map(contentMapper::toPostResponseDto));
        }

        List<UUID> postIds = postsPage.getContent().stream()
                .map(Post::getId)
                .toList();

        Set<UUID> likedPostIds = (caller != null)
                ? postLikeRepository.findLikedPostIdsByUserIdAndPostIdIn(caller.id(), postIds)
                : Collections.emptySet();

        List<PostResponseDto> postDtos = postsPage.getContent().stream()
                .map(post -> {
                    Boolean isLiked = (caller != null) ? likedPostIds.contains(post.getId()) : null;
                    return contentMapper.toPostResponseDto(post, isLiked);
                })
                .toList();

        Page<PostResponseDto> dtoPage = new PageImpl<>(postDtos, pageable, postsPage.getTotalElements());
        return pageMapper.toPageDto(dtoPage);
    }
}
