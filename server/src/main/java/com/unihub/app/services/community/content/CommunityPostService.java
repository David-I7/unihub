package com.unihub.app.services.community.content;

import com.unihub.app.dto.PageDto;
import com.unihub.app.dto.community.content.CommentResponseDto;
import com.unihub.app.dto.community.content.PostResponseDto;
import com.unihub.app.entities.community.content.Comment;
import com.unihub.app.entities.community.content.Post;
import com.unihub.app.entities.community.resources.Community;
import com.unihub.app.mappers.PageMapper;
import com.unihub.app.mappers.community.CommentMapper;
import com.unihub.app.mappers.community.PostMapper;
import com.unihub.app.repositories.community.content.CommentRepository;
import com.unihub.app.repositories.community.content.CommunityPostRepository;
import com.unihub.app.repositories.community.resources.CommunityRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CommunityPostService {

    private final CommunityRepository communityRepository;
    private final CommunityPostRepository communityPostRepository;
    private final CommentRepository commentRepository;
    private final PostMapper postMapper;
    private final CommentMapper commentMapper;
    private final PageMapper pageMapper;

    @Transactional(readOnly = true)
    public PageDto<PostResponseDto> getCommunityPosts(String slug, Pageable pageable) {
        Community community = communityRepository.findBySlug(slug)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Community not found"));

        Page<Post> postsPage = communityPostRepository.findPostsByCommunityId(community.getId(), pageable);

        if (postsPage.isEmpty()) {
            return pageMapper.toPageDto(postsPage.map(postMapper::toDto));
        }

        List<UUID> postIds = postsPage.getContent().stream()
                .map(Post::getId)
                .toList();

        List<Comment> comments = commentRepository.findByPostIdInOrderByCreatedAtAsc(postIds);

        Map<UUID, List<CommentResponseDto>> commentsByPostId = comments.stream()
                .map(commentMapper::toDto)
                .collect(Collectors.groupingBy(CommentResponseDto::postId));

        List<PostResponseDto> postDtos = postsPage.getContent().stream()
                .map(post -> postMapper.toDto(post, commentsByPostId.getOrDefault(post.getId(), Collections.emptyList())))
                .toList();

        Page<PostResponseDto> dtoPage = new PageImpl<>(postDtos, pageable, postsPage.getTotalElements());
        return pageMapper.toPageDto(dtoPage);
    }
}
