package com.unihub.app.controllers;

import com.unihub.app.BaseIntegrationTest;
import com.unihub.app.domain.RoleType;
import com.unihub.app.dto.PageDto;
import com.unihub.app.dto.UserDto;
import com.unihub.app.dto.community.OwnerDto;
import com.unihub.app.dto.community.content.request.CreateCommentRequestDto;
import com.unihub.app.dto.community.content.request.PinPostRequestDto;
import com.unihub.app.dto.community.content.request.UpdatePostRequestDto;
import com.unihub.app.dto.community.content.response.CommentResponseDto;
import com.unihub.app.dto.community.content.response.PostDetailResponseDto;
import com.unihub.app.dto.community.content.response.PostResponseDto;
import com.unihub.app.entities.community.content.CommunicationChannel;
import com.unihub.app.security.JwtAuthentication;
import com.unihub.app.services.authorization.AuthorizationService;
import com.unihub.app.services.community.content.CommentService;
import com.unihub.app.services.community.content.PostService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import tools.jackson.databind.ObjectMapper;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@AutoConfigureMockMvc
public class PostControllerTests extends BaseIntegrationTest {

    private static final String BASE_URL = "/api/v1/posts";

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private PostService postService;

    @MockitoBean
    private CommentService commentService;

    @MockitoBean
    private AuthorizationService authorizationService;

    private UUID userId;
    private UserDto userDto;

    @BeforeEach
    public void setUp() {
        userId = UUID.randomUUID();
        userDto = new UserDto(userId, "david@example.com", "david", true, RoleType.USER);
        JwtAuthentication auth = new JwtAuthentication(userDto);
        SecurityContextHolder.getContext().setAuthentication(auth);
        when(authorizationService.safeRequireAuthentication()).thenReturn(auth);
    }

    @Test
    @DisplayName("GET /api/v1/posts/{postId} returns post")
    public void testGetPost_Success() throws Exception {
        UUID postId = UUID.randomUUID();
        PostDetailResponseDto postDto = PostDetailResponseDto.builder()
                .id(postId)
                .title("Post Title")
                .description("Post Description")
                .channel(CommunicationChannel.COMMUNITY)
                .pinned(false)
                .isLiked(true)
                .likesCount(5)
                .commentsCount(0)
                .owner(new OwnerDto(userId, "david", true))
                .createdAt(OffsetDateTime.now())
                .updatedAt(OffsetDateTime.now())
                .build();

        when(postService.getPostById(eq(postId), any())).thenReturn(postDto);

        mockMvc.perform(get(BASE_URL + "/" + postId)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(postId.toString()))
                .andExpect(jsonPath("$.title").value("Post Title"))
                .andExpect(jsonPath("$.isLiked").value(true));
    }

    @Test
    @DisplayName("PATCH /api/v1/posts/{postId} updates post")
    public void testUpdatePost_Success() throws Exception {
        UUID postId = UUID.randomUUID();
        UpdatePostRequestDto requestDto = new UpdatePostRequestDto("Updated Title", "Updated Description");
        PostResponseDto postDto = PostResponseDto.builder()
                .id(postId)
                .title("Updated Title")
                .description("Updated Description")
                .channel(CommunicationChannel.COMMUNITY)
                .pinned(false)
                .likesCount(5)
                .commentsCount(0)
                .owner(new OwnerDto(userId, "david", true))
                .createdAt(OffsetDateTime.now())
                .updatedAt(OffsetDateTime.now())
                .build();

        when(postService.updatePost(eq(postId), any(), any(UpdatePostRequestDto.class))).thenReturn(postDto);

        mockMvc.perform(patch(BASE_URL + "/" + postId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestDto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Updated Title"))
                .andExpect(jsonPath("$.description").value("Updated Description"));
    }

    @Test
    @DisplayName("DELETE /api/v1/posts/{postId} deletes post")
    public void testDeletePost_Success() throws Exception {
        UUID postId = UUID.randomUUID();
        doNothing().when(postService).deletePost(eq(postId), any());

        mockMvc.perform(delete(BASE_URL + "/" + postId)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNoContent());

        verify(postService).deletePost(eq(postId), any());
    }

    @Test
    @DisplayName("PATCH /api/v1/posts/{postId}/pin pins/unpins post")
    public void testPinPost_Success() throws Exception {
        UUID postId = UUID.randomUUID();
        PinPostRequestDto requestDto = new PinPostRequestDto(true);
        PostResponseDto postDto = PostResponseDto.builder()
                .id(postId)
                .title("Post Title")
                .pinned(true)
                .build();

        when(postService.pinPost(eq(postId), any(), any(PinPostRequestDto.class))).thenReturn(postDto);

        mockMvc.perform(patch(BASE_URL + "/" + postId + "/pin")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestDto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.pinned").value(true));
    }

    @Test
    @DisplayName("POST /api/v1/posts/{postId}/likes likes post")
    public void testLikePost_Success() throws Exception {
        UUID postId = UUID.randomUUID();
        doNothing().when(postService).likePost(eq(postId), any());

        mockMvc.perform(post(BASE_URL + "/" + postId + "/likes")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNoContent());

        verify(postService).likePost(eq(postId), any());
    }

    @Test
    @DisplayName("DELETE /api/v1/posts/{postId}/likes unlikes post")
    public void testUnlikePost_Success() throws Exception {
        UUID postId = UUID.randomUUID();
        doNothing().when(postService).unlikePost(eq(postId), any());

        mockMvc.perform(delete(BASE_URL + "/" + postId + "/likes")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNoContent());

        verify(postService).unlikePost(eq(postId), any());
    }

    @Test
    @DisplayName("GET /api/v1/posts/{postId}/comments returns comments")
    public void testGetComments_Success() throws Exception {
        UUID postId = UUID.randomUUID();
        UUID commentId = UUID.randomUUID();
        CommentResponseDto commentDto = CommentResponseDto.builder()
                .id(commentId)
                .postId(postId)
                .content("Comment text")
                .owner(new OwnerDto(userId, "david", true))
                .createdAt(OffsetDateTime.now())
                .updatedAt(OffsetDateTime.now())
                .build();

        PageDto<CommentResponseDto> pageDto = PageDto.<CommentResponseDto>builder()
                .content(List.of(commentDto))
                .number(0)
                .size(20)
                .totalElements(1)
                .totalPages(1)
                .first(true)
                .last(true)
                .build();

        when(commentService.getComments(eq(postId), any(Pageable.class))).thenReturn(pageDto);

        mockMvc.perform(get(BASE_URL + "/" + postId + "/comments")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray())
                .andExpect(jsonPath("$.content[0].id").value(commentId.toString()))
                .andExpect(jsonPath("$.content[0].content").value("Comment text"));
    }

    @Test
    @DisplayName("POST /api/v1/posts/{postId}/comments creates comment")
    public void testCreateComment_Success() throws Exception {
        UUID postId = UUID.randomUUID();
        UUID commentId = UUID.randomUUID();
        CreateCommentRequestDto requestDto = new CreateCommentRequestDto("Nice post!");
        CommentResponseDto commentDto = CommentResponseDto.builder()
                .id(commentId)
                .postId(postId)
                .content("Nice post!")
                .owner(new OwnerDto(userId, "david", true))
                .createdAt(OffsetDateTime.now())
                .updatedAt(OffsetDateTime.now())
                .build();

        when(commentService.createComment(eq(postId), any(), any(CreateCommentRequestDto.class))).thenReturn(commentDto);

        mockMvc.perform(post(BASE_URL + "/" + postId + "/comments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestDto)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(commentId.toString()))
                .andExpect(jsonPath("$.content").value("Nice post!"));
    }
}
