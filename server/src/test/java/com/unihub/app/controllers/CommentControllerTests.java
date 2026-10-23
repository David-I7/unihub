package com.unihub.app.controllers;

import com.unihub.app.BaseIntegrationTest;
import com.unihub.app.domain.RoleType;
import com.unihub.app.dto.UserDto;
import com.unihub.app.dto.community.OwnerDto;
import com.unihub.app.dto.community.content.request.UpdateCommentRequestDto;
import com.unihub.app.dto.community.content.response.CommentResponseDto;
import com.unihub.app.security.JwtAuthentication;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.web.servlet.MockMvc;
import tools.jackson.databind.ObjectMapper;

import java.time.OffsetDateTime;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

public class CommentControllerTests extends BaseIntegrationTest {

    private static final String BASE_URL = "/api/v1/comments";

    @Autowired
    private MockMvc mockMvc;

    private final ObjectMapper objectMapper = new ObjectMapper();

    private UUID userId;
    private UserDto userDto;

    @BeforeEach
    public void setUp() {
        userId = UUID.randomUUID();
        userDto = new UserDto(userId, "david@example.com", "david", true, RoleType.USER);
        JwtAuthentication auth = new JwtAuthentication(userDto);
        SecurityContextHolder.getContext().setAuthentication(auth);

    }

    @Test
    @DisplayName("PATCH /api/v1/comments/{commentId} updates comment")
    public void testUpdateComment_Success() throws Exception {
        UUID commentId = UUID.randomUUID();
        UUID postId = UUID.randomUUID();
        UpdateCommentRequestDto requestDto = new UpdateCommentRequestDto("Updated comment text");
        CommentResponseDto responseDto = CommentResponseDto.builder()
                .id(commentId)
                .postId(postId)
                .content("Updated comment text")
                .owner(new OwnerDto(userId, "david", true))
                .createdAt(OffsetDateTime.now())
                .updatedAt(OffsetDateTime.now())
                .build();

        when(commentService.updateComment(eq(commentId), any(UserDto.class), any(UpdateCommentRequestDto.class))).thenReturn(responseDto);

        mockMvc.perform(patch(BASE_URL + "/" + commentId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestDto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(commentId.toString()))
                .andExpect(jsonPath("$.content").value("Updated comment text"));
    }

    @Test
    @DisplayName("DELETE /api/v1/comments/{commentId} deletes comment")
    public void testDeleteComment_Success() throws Exception {
        UUID commentId = UUID.randomUUID();
        doNothing().when(commentService).deleteComment(eq(commentId), any(UserDto.class));

        mockMvc.perform(delete(BASE_URL + "/" + commentId)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNoContent());

        verify(commentService).deleteComment(eq(commentId), any(UserDto.class));
    }

    @Test
    @DisplayName("DELETE /api/v1/comments/{commentId} returns 403 when user not authorized")
    public void testDeleteComment_Forbidden() throws Exception {
        UUID commentId = UUID.randomUUID();
        org.mockito.Mockito.doThrow(new org.springframework.security.access.AccessDeniedException("Forbidden"))
                .when(commentService).deleteComment(eq(commentId), any(UserDto.class));

        mockMvc.perform(delete(BASE_URL + "/" + commentId)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isForbidden());
    }
}
