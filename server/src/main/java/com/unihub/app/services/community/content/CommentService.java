package com.unihub.app.services.community.content;

import com.unihub.app.domain.PermissionType;

import com.unihub.app.dto.PageDto;
import com.unihub.app.dto.UserDto;
import com.unihub.app.dto.community.content.request.CreateCommentRequestDto;
import com.unihub.app.dto.community.content.request.UpdateCommentRequestDto;
import com.unihub.app.dto.community.content.response.CommentResponseDto;
import com.unihub.app.entities.authentication.User;
import com.unihub.app.entities.community.content.Comment;
import com.unihub.app.entities.community.content.Post;
import com.unihub.app.events.notification.CommentCreatedNotificationEvent;
import com.unihub.app.mappers.PageMapper;
import com.unihub.app.mappers.UserMapper;
import com.unihub.app.mappers.community.CommunityContentMapper;
import com.unihub.app.repositories.community.content.CommentRepository;
import com.unihub.app.repositories.community.content.PostRepository;
import com.unihub.app.security.policies.CommentPolicy;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CommentService {

    private final CommentRepository commentRepository;
    private final PostRepository postRepository;
    private final PostService postService;
    private final CommunityContentMapper contentMapper;
    private final UserMapper userMapper;
    private final PageMapper pageMapper;
    private final ApplicationEventPublisher eventPublisher;
    private final CommentPolicy commentPolicy;

    public String getCommunitySlugForComment(UUID commentId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Comment not found"));
        return postService.getCommunitySlugForPost(comment.getPost().getId());
    }

    @Transactional(readOnly = true)
    public PageDto<CommentResponseDto> getComments(UUID postId, Pageable pageable) {
        if (!postRepository.existsById(postId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found");
        }

        Page<Comment> commentsPage = commentRepository.findCommentsByPostId(postId, pageable);
        return pageMapper.toPageDto(commentsPage.map(contentMapper::toCommentResponseDto));
    }

    @Transactional
    public CommentResponseDto createComment(UUID postId, UserDto caller, CreateCommentRequestDto dto) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found"));

        User owner = userMapper.toEntity(caller);
        Comment comment = contentMapper.toCommentEntity(dto, post, owner);
        Comment savedComment = commentRepository.save(comment);

        postRepository.incrementCommentsCount(postId);

        eventPublisher.publishEvent(new CommentCreatedNotificationEvent(savedComment, post, owner));

        return contentMapper.toCommentResponseDto(savedComment);
    }

    @Transactional
    public CommentResponseDto updateComment(UUID commentId, UserDto caller, UpdateCommentRequestDto dto) {
        Comment comment = commentRepository.findByIdWithOwner(commentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Comment not found"));

        commentPolicy.check(caller, comment, PermissionType.UPDATE_COMMENT);

        comment.setContent(dto.content());
        Comment saved = commentRepository.save(comment);
        return contentMapper.toCommentResponseDto(saved);
    }

    @Transactional
    public void deleteComment(UUID commentId, UserDto caller) {
        Comment comment = commentRepository.findByIdWithOwner(commentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Comment not found"));

        commentPolicy.check(caller, comment, PermissionType.DELETE_COMMENT);

        postRepository.decrementCommentsCount(comment.getPost().getId());
        commentRepository.delete(comment);
    }
}
