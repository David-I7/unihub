package com.unihub.app.controllers.community.content;

import com.unihub.app.dto.PageDto;
import com.unihub.app.dto.UserDto;
import com.unihub.app.dto.community.content.request.CreateCommentRequestDto;
import com.unihub.app.dto.community.content.request.PinPostRequestDto;
import com.unihub.app.dto.community.content.request.UpdatePostRequestDto;
import com.unihub.app.dto.community.content.response.CommentResponseDto;
import com.unihub.app.dto.community.content.response.PostResponseDto;
import com.unihub.app.services.community.content.CommentService;
import com.unihub.app.services.community.content.PostService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/posts")
@RequiredArgsConstructor
public class PostController {

    private final PostService postService;
    private final CommentService commentService;

    @GetMapping("/{postId}")
    public ResponseEntity<PostResponseDto> getPost(
            @PathVariable UUID postId,
            @AuthenticationPrincipal UserDto user
    ) {
        PostResponseDto post = postService.getPostById(postId, user);
        return ResponseEntity.ok(post);
    }

    @PatchMapping("/{postId}")
    public ResponseEntity<PostResponseDto> updatePost(
            @PathVariable UUID postId,
            @AuthenticationPrincipal UserDto user,
            @Valid @RequestBody UpdatePostRequestDto requestDto
    ) {
        PostResponseDto updated = postService.updatePost(postId, user, requestDto);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{postId}")
    public ResponseEntity<Void> deletePost(
            @PathVariable UUID postId,
            @AuthenticationPrincipal UserDto user
    ) {
        postService.deletePost(postId, user);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{postId}/pin")
    public ResponseEntity<PostResponseDto> pinPost(
            @PathVariable UUID postId,
            @AuthenticationPrincipal UserDto user,
            @Valid @RequestBody PinPostRequestDto requestDto
    ) {
        PostResponseDto updated = postService.pinPost(postId, user, requestDto);
        return ResponseEntity.ok(updated);
    }

    @PostMapping("/{postId}/likes")
    public ResponseEntity<Void> likePost(
            @PathVariable UUID postId,
            @AuthenticationPrincipal UserDto user
    ) {
        postService.likePost(postId, user);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{postId}/likes")
    public ResponseEntity<Void> unlikePost(
            @PathVariable UUID postId,
            @AuthenticationPrincipal UserDto user
    ) {
        postService.unlikePost(postId, user);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{postId}/comments")
    public ResponseEntity<PageDto<CommentResponseDto>> getPostComments(
            @PathVariable UUID postId,
            @PageableDefault(page = 0, size = 20, sort = "createdAt", direction = Sort.Direction.ASC) Pageable pageable
    ) {
        PageDto<CommentResponseDto> comments = commentService.getComments(postId, pageable);
        return ResponseEntity.ok(comments);
    }

    @PostMapping("/{postId}/comments")
    public ResponseEntity<CommentResponseDto> createComment(
            @PathVariable UUID postId,
            @AuthenticationPrincipal UserDto user,
            @Valid @RequestBody CreateCommentRequestDto requestDto
    ) {
        CommentResponseDto created = commentService.createComment(postId, user, requestDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
}
