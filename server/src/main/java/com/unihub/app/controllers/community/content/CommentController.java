package com.unihub.app.controllers.community.content;

import com.unihub.app.dto.UserDto;
import com.unihub.app.dto.community.content.request.UpdateCommentRequestDto;
import com.unihub.app.dto.community.content.response.CommentResponseDto;
import com.unihub.app.services.community.content.CommentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/comments")
@RequiredArgsConstructor
public class CommentController {

    private final CommentService commentService;

    @PatchMapping("/{commentId}")
    public ResponseEntity<CommentResponseDto> updateComment(
            @PathVariable UUID commentId,
            @AuthenticationPrincipal UserDto user,
            @Valid @RequestBody UpdateCommentRequestDto requestDto
    ) {
        CommentResponseDto updated = commentService.updateComment(commentId, user, requestDto);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{commentId}")
    public ResponseEntity<Void> deleteComment(
            @PathVariable UUID commentId,
            @AuthenticationPrincipal UserDto user
    ) {
        commentService.deleteComment(commentId, user);
        return ResponseEntity.noContent().build();
    }
}
