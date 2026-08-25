package com.unihub.app.mappers.community;

import com.unihub.app.dto.community.OwnerDto;
import com.unihub.app.dto.community.content.CommentResponseDto;
import com.unihub.app.dto.community.content.PostResponseDto;
import com.unihub.app.entities.community.content.Post;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;

@Component
public class PostMapper {

    public PostResponseDto toDto(Post post) {
        return toDto(post, Collections.emptyList());
    }

    public PostResponseDto toDto(Post post, List<CommentResponseDto> comments) {
        return PostResponseDto.builder()
                .id(post.getId())
                .title(post.getTitle())
                .description(post.getDescription())
                .channel(post.getChannel())
                .pinned(post.isPinned())
                .likesCount(post.getLikesCount())
                .commentsCount(post.getCommentsCount())
                .createdAt(post.getCreatedAt())
                .updatedAt(post.getUpdatedAt())
                .owner(new OwnerDto(post.getOwner().getId(), post.getOwner().getUsername()))
                .comments(comments)
                .build();
    }
}
