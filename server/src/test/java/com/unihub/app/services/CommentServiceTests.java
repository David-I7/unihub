package com.unihub.app.services;

import com.unihub.app.domain.PermissionType;
import com.unihub.app.domain.RoleType;
import com.unihub.app.dto.PageDto;
import com.unihub.app.dto.UserDto;
import com.unihub.app.dto.community.content.request.CreateCommentRequestDto;
import com.unihub.app.dto.community.content.request.UpdateCommentRequestDto;
import com.unihub.app.dto.community.content.response.CommentResponseDto;
import com.unihub.app.entities.authentication.User;
import com.unihub.app.entities.community.content.*;
import com.unihub.app.mappers.PageMapper;
import com.unihub.app.mappers.UserMapper;
import com.unihub.app.mappers.community.CommunityContentMapper;
import com.unihub.app.repositories.community.content.*;
import com.unihub.app.services.authorization.AuthorizationService;
import com.unihub.app.services.community.content.CommentService;
import com.unihub.app.services.community.content.PostService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.web.server.ResponseStatusException;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class CommentServiceTests {

    @Mock
    private CommentRepository commentRepository;

    @Mock
    private CommunityCommentRepository communityCommentRepository;

    @Mock
    private CourseCommentRepository courseCommentRepository;

    @Mock
    private CommunityPostRepository communityPostRepository;

    @Mock
    private CoursePostRepository coursePostRepository;

    @Mock
    private PostRepository postRepository;

    @Mock
    private PostService postService;

    @Mock
    private AuthorizationService authorizationService;

    @Spy
    private CommunityContentMapper contentMapper = new CommunityContentMapper();

    @Spy
    private PageMapper pageMapper = new PageMapper();

    @Spy
    private UserMapper userMapper = new UserMapper(null);

    @InjectMocks
    private CommentService commentService;

    @Test
    @DisplayName("getComments returns paginated comments for post")
    public void testGetComments_Success() {
        UUID postId = UUID.randomUUID();
        UUID commentId = UUID.randomUUID();
        User author = User.builder().id(UUID.randomUUID()).username("alice").build();
        Post post = Post.builder().id(postId).build();

        Comment comment = Comment.builder()
                .id(commentId)
                .post(post)
                .content("Comment text")
                .owner(author)
                .createdAt(OffsetDateTime.now())
                .updatedAt(OffsetDateTime.now())
                .build();

        PageRequest pageRequest = PageRequest.of(0, 10);
        when(postRepository.existsById(postId)).thenReturn(true);
        when(commentRepository.findCommentsByPostId(postId, pageRequest))
                .thenReturn(new PageImpl<>(List.of(comment), pageRequest, 1));

        PageDto<CommentResponseDto> result = commentService.getComments(postId, pageRequest);

        assertNotNull(result);
        assertEquals(1, result.totalElements());
        assertEquals("Comment text", result.content().get(0).content());
    }

    @Test
    @DisplayName("createComment creates comment on community post and increments post comment count")
    public void testCreateComment_CommunityPost_Success() {
        UUID postId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        UserDto caller = new UserDto(userId, "alice@example.com", "alice", true, RoleType.USER);
        Post post = Post.builder().id(postId).channel(CommunicationChannel.COMMUNITY).build();
        CommunityPost communityPost = CommunityPost.builder().id(postId).post(post).build();
        CreateCommentRequestDto dto = new CreateCommentRequestDto("Nice post!");

        when(postRepository.findById(postId)).thenReturn(Optional.of(post));
        when(postService.getCommunitySlugForPost(postId)).thenReturn("fmi-info");
        when(authorizationService.hasCommunityPermission("fmi-info", userId, PermissionType.CREATE_COMMENT)).thenReturn(true);
        when(commentRepository.save(any(Comment.class))).thenAnswer(i -> {
            Comment c = i.getArgument(0);
            c.setId(UUID.randomUUID());
            c.setCreatedAt(OffsetDateTime.now());
            c.setUpdatedAt(OffsetDateTime.now());
            return c;
        });
        when(communityPostRepository.findById(postId)).thenReturn(Optional.of(communityPost));

        CommentResponseDto result = commentService.createComment(postId, caller, dto);

        assertNotNull(result);
        assertEquals("Nice post!", result.content());
        verify(communityCommentRepository).save(any(CommunityComment.class));
        verify(postRepository).incrementCommentsCount(postId);
    }

    @Test
    @DisplayName("createComment creates comment on course post and increments post comment count")
    public void testCreateComment_CoursePost_Success() {
        UUID postId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        UserDto caller = new UserDto(userId, "alice@example.com", "alice", true, RoleType.USER);
        Post post = Post.builder().id(postId).channel(CommunicationChannel.COURSE).build();
        CoursePost coursePost = CoursePost.builder().id(postId).post(post).build();
        CreateCommentRequestDto dto = new CreateCommentRequestDto("Question about lab");

        when(postRepository.findById(postId)).thenReturn(Optional.of(post));
        when(postService.getCommunitySlugForPost(postId)).thenReturn("fmi-info");
        when(authorizationService.hasCommunityPermission("fmi-info", userId, PermissionType.CREATE_COMMENT)).thenReturn(true);
        when(commentRepository.save(any(Comment.class))).thenAnswer(i -> {
            Comment c = i.getArgument(0);
            c.setId(UUID.randomUUID());
            c.setCreatedAt(OffsetDateTime.now());
            c.setUpdatedAt(OffsetDateTime.now());
            return c;
        });
        when(coursePostRepository.findById(postId)).thenReturn(Optional.of(coursePost));

        CommentResponseDto result = commentService.createComment(postId, caller, dto);

        assertNotNull(result);
        assertEquals("Question about lab", result.content());
        verify(courseCommentRepository).save(any(CourseComment.class));
        verify(postRepository).incrementCommentsCount(postId);
    }

    @Test
    @DisplayName("updateComment updates content when caller is author with UPDATE_COMMENT permission")
    public void testUpdateComment_AuthorSuccess() {
        UUID commentId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        UserDto caller = new UserDto(userId, "alice@example.com", "alice", true, RoleType.USER);
        User owner = User.builder().id(userId).username("alice").build();
        Post post = Post.builder().id(UUID.randomUUID()).build();

        Comment comment = Comment.builder()
                .id(commentId)
                .post(post)
                .content("Old comment")
                .owner(owner)
                .createdAt(OffsetDateTime.now())
                .updatedAt(OffsetDateTime.now())
                .build();
        UpdateCommentRequestDto dto = new UpdateCommentRequestDto("Edited comment");

        when(commentRepository.findByIdWithOwner(commentId)).thenReturn(Optional.of(comment));
        when(communityCommentRepository.findCommunitySlugByCommentId(commentId)).thenReturn(Optional.of("fmi-info"));
        when(authorizationService.hasCommunityPermission("fmi-info", userId, PermissionType.UPDATE_COMMENT)).thenReturn(true);
        when(commentRepository.save(any(Comment.class))).thenAnswer(i -> i.getArgument(0));

        CommentResponseDto result = commentService.updateComment(commentId, caller, dto);

        assertNotNull(result);
        assertEquals("Edited comment", result.content());
        verify(commentRepository).save(comment);
    }

    @Test
    @DisplayName("updateComment throws 403 when caller is not author")
    public void testUpdateComment_ForbiddenNotAuthor() {
        UUID commentId = UUID.randomUUID();
        UUID authorId = UUID.randomUUID();
        UUID callerId = UUID.randomUUID();
        UserDto caller = new UserDto(callerId, "other@example.com", "other", true, RoleType.USER);
        User owner = User.builder().id(authorId).username("author").build();

        Comment comment = Comment.builder().id(commentId).owner(owner).build();
        UpdateCommentRequestDto dto = new UpdateCommentRequestDto("Edited");

        when(commentRepository.findByIdWithOwner(commentId)).thenReturn(Optional.of(comment));

        assertThrows(ResponseStatusException.class, () -> commentService.updateComment(commentId, caller, dto));
        verify(commentRepository, never()).save(any());
    }

    @Test
    @DisplayName("deleteComment deletes comment and decrements counter when caller is author with DELETE_COMMENT permission")
    public void testDeleteComment_AuthorSuccess() {
        UUID commentId = UUID.randomUUID();
        UUID postId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        UserDto caller = new UserDto(userId, "alice@example.com", "alice", true, RoleType.USER);
        User owner = User.builder().id(userId).username("alice").build();
        Post post = Post.builder().id(postId).build();

        Comment comment = Comment.builder().id(commentId).post(post).owner(owner).build();

        when(commentRepository.findByIdWithOwner(commentId)).thenReturn(Optional.of(comment));
        when(communityCommentRepository.findCommunitySlugByCommentId(commentId)).thenReturn(Optional.of("fmi-info"));
        when(authorizationService.hasCommunityPermission("fmi-info", userId, PermissionType.DELETE_COMMENT)).thenReturn(true);

        commentService.deleteComment(commentId, caller);

        verify(postRepository).decrementCommentsCount(postId);
        verify(commentRepository).delete(comment);
    }

    @Test
    @DisplayName("deleteComment deletes comment when caller is moderator with MODERATE_COMMENT permission")
    public void testDeleteComment_ModeratorSuccess() {
        UUID commentId = UUID.randomUUID();
        UUID postId = UUID.randomUUID();
        UUID authorId = UUID.randomUUID();
        UUID moderatorId = UUID.randomUUID();
        UserDto moderator = new UserDto(moderatorId, "mod@example.com", "mod", true, RoleType.USER);
        User owner = User.builder().id(authorId).username("author").build();
        Post post = Post.builder().id(postId).build();

        Comment comment = Comment.builder().id(commentId).post(post).owner(owner).build();

        when(commentRepository.findByIdWithOwner(commentId)).thenReturn(Optional.of(comment));
        when(communityCommentRepository.findCommunitySlugByCommentId(commentId)).thenReturn(Optional.of("fmi-info"));
        when(authorizationService.hasCommunityPermission("fmi-info", moderatorId, PermissionType.MODERATE_COMMENT)).thenReturn(true);

        commentService.deleteComment(commentId, moderator);

        verify(postRepository).decrementCommentsCount(postId);
        verify(commentRepository).delete(comment);
    }
}
