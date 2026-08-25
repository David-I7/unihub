package com.unihub.app.mappers.community;

import com.unihub.app.dto.community.OwnerDto;
import com.unihub.app.dto.community.content.CommentResponseDto;
import com.unihub.app.entities.community.content.Comment;
import org.springframework.stereotype.Component;

@Component
public class CommentMapper {

    public CommentResponseDto toDto(Comment comment) {
        return CommentResponseDto.builder()
                .id(comment.getId())
                .postId(comment.getPost().getId())
                .content(comment.getContent())
                .createdAt(comment.getCreatedAt())
                .updatedAt(comment.getUpdatedAt())
                .owner(new OwnerDto(comment.getOwner().getId(), comment.getOwner().getUsername()))
                .build();
    }
}
