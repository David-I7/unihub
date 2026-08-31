package com.unihub.app.services;

import com.unihub.app.domain.PermissionType;
import com.unihub.app.domain.RoleType;
import com.unihub.app.dto.UserDto;
import com.unihub.app.dto.community.content.request.PinPostRequestDto;
import com.unihub.app.dto.community.content.request.UpdatePostRequestDto;
import com.unihub.app.dto.community.content.response.PostResponseDto;
import com.unihub.app.entities.authentication.User;
import com.unihub.app.entities.community.content.CommunicationChannel;
import com.unihub.app.entities.community.content.Post;
import com.unihub.app.entities.community.content.PostLike;
import com.unihub.app.entities.community.content.PostLikeId;
import com.unihub.app.mappers.UserMapper;
import com.unihub.app.mappers.community.CommunityContentMapper;
import com.unihub.app.repositories.community.content.*;
import com.unihub.app.services.authorization.AuthorizationService;
import com.unihub.app.services.community.content.PostService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import java.time.OffsetDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class PostServiceTests {

    @Mock
    private PostRepository postRepository;

    @Mock
    private CommunityPostRepository communityPostRepository;

    @Mock
    private CoursePostRepository coursePostRepository;

    @Mock
    private PostLikeRepository postLikeRepository;

    @Mock
    private AuthorizationService authorizationService;

    @Spy
    private CommunityContentMapper contentMapper = new CommunityContentMapper();

    @Spy
    private UserMapper userMapper = new UserMapper(null);

    @Mock
    private org.springframework.context.ApplicationEventPublisher eventPublisher;

    @InjectMocks
    private PostService postService;

    @Test
    @DisplayName("getPostById returns post response dto with like status")
    public void testGetPostById_Success() {
        UUID postId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        UserDto userDto = new UserDto(userId, "david@example.com", "david", true, RoleType.USER);
        User owner = User.builder().id(userId).username("david").build();

        Post post = Post.builder()
                .id(postId)
                .title("Post Title")
                .description("Post Desc")
                .channel(CommunicationChannel.COMMUNITY)
                .owner(owner)
                .likesCount(3)
                .commentsCount(0)
                .createdAt(OffsetDateTime.now())
                .updatedAt(OffsetDateTime.now())
                .build();

        when(postRepository.findByIdWithOwner(postId)).thenReturn(Optional.of(post));
        when(postLikeRepository.existsByIdPostIdAndIdUserId(postId, userId)).thenReturn(true);

        PostResponseDto result = postService.getPostById(postId, userDto);

        assertNotNull(result);
        assertEquals(postId, result.id());
        assertEquals("Post Title", result.title());
        assertTrue(result.isLiked());
    }

    @Test
    @DisplayName("updatePost successfully updates title and description when caller is author and has permission")
    public void testUpdatePost_Success() {
        UUID postId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        UserDto userDto = new UserDto(userId, "david@example.com", "david", true, RoleType.USER);
        User owner = User.builder().id(userId).username("david").build();

        Post post = Post.builder()
                .id(postId)
                .title("Old Title")
                .description("Old Desc")
                .channel(CommunicationChannel.COMMUNITY)
                .owner(owner)
                .createdAt(OffsetDateTime.now())
                .updatedAt(OffsetDateTime.now())
                .build();

        UpdatePostRequestDto dto = new UpdatePostRequestDto("New Title", "New Desc");

        when(postRepository.findByIdWithOwner(postId)).thenReturn(Optional.of(post));
        when(communityPostRepository.findCommunitySlugByPostId(postId)).thenReturn(Optional.of("fmi-info"));
        when(authorizationService.hasCommunityPermission("fmi-info", userId, PermissionType.UPDATE_POST)).thenReturn(true);
        when(postRepository.save(any(Post.class))).thenAnswer(i -> i.getArgument(0));

        PostResponseDto result = postService.updatePost(postId, userDto, dto);

        assertNotNull(result);
        assertEquals("New Title", result.title());
        assertEquals("New Desc", result.description());
        verify(postRepository).save(post);
    }

    @Test
    @DisplayName("updatePost throws 403 when caller is not author")
    public void testUpdatePost_ForbiddenNotAuthor() {
        UUID postId = UUID.randomUUID();
        UUID authorId = UUID.randomUUID();
        UUID callerId = UUID.randomUUID();
        UserDto caller = new UserDto(callerId, "caller@example.com", "caller", true, RoleType.USER);
        User owner = User.builder().id(authorId).username("author").build();

        Post post = Post.builder().id(postId).owner(owner).build();
        UpdatePostRequestDto dto = new UpdatePostRequestDto("New Title", "New Desc");

        when(postRepository.findByIdWithOwner(postId)).thenReturn(Optional.of(post));

        assertThrows(ResponseStatusException.class, () -> postService.updatePost(postId, caller, dto));
        verify(postRepository, never()).save(any());
    }

    @Test
    @DisplayName("deletePost deletes post when caller is author with DELETE_POST permission")
    public void testDeletePost_AuthorSuccess() {
        UUID postId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        UserDto caller = new UserDto(userId, "david@example.com", "david", true, RoleType.USER);
        User owner = User.builder().id(userId).username("david").build();

        Post post = Post.builder().id(postId).owner(owner).build();

        when(postRepository.findByIdWithOwner(postId)).thenReturn(Optional.of(post));
        when(communityPostRepository.findCommunitySlugByPostId(postId)).thenReturn(Optional.of("fmi-info"));
        when(authorizationService.hasCommunityPermission("fmi-info", userId, PermissionType.DELETE_POST)).thenReturn(true);

        postService.deletePost(postId, caller);

        verify(postRepository).delete(post);
    }

    @Test
    @DisplayName("deletePost deletes post when caller is moderator with MODERATE_POST permission")
    public void testDeletePost_ModeratorSuccess() {
        UUID postId = UUID.randomUUID();
        UUID authorId = UUID.randomUUID();
        UUID moderatorId = UUID.randomUUID();
        UserDto moderator = new UserDto(moderatorId, "mod@example.com", "mod", true, RoleType.USER);
        User owner = User.builder().id(authorId).username("author").build();

        Post post = Post.builder().id(postId).owner(owner).build();

        when(postRepository.findByIdWithOwner(postId)).thenReturn(Optional.of(post));
        when(communityPostRepository.findCommunitySlugByPostId(postId)).thenReturn(Optional.of("fmi-info"));
        when(authorizationService.hasCommunityPermission("fmi-info", moderatorId, PermissionType.MODERATE_POST)).thenReturn(true);

        postService.deletePost(postId, moderator);

        verify(postRepository).delete(post);
    }

    @Test
    @DisplayName("deletePost throws 403 when non-author lacks MODERATE_POST permission")
    public void testDeletePost_ForbiddenNonAuthor() {
        UUID postId = UUID.randomUUID();
        UUID authorId = UUID.randomUUID();
        UUID callerId = UUID.randomUUID();
        UserDto caller = new UserDto(callerId, "caller@example.com", "caller", true, RoleType.USER);
        User owner = User.builder().id(authorId).username("author").build();

        Post post = Post.builder().id(postId).owner(owner).build();

        when(postRepository.findByIdWithOwner(postId)).thenReturn(Optional.of(post));
        when(communityPostRepository.findCommunitySlugByPostId(postId)).thenReturn(Optional.of("fmi-info"));
        when(authorizationService.hasCommunityPermission("fmi-info", callerId, PermissionType.MODERATE_POST)).thenReturn(false);

        assertThrows(ResponseStatusException.class, () -> postService.deletePost(postId, caller));
        verify(postRepository, never()).delete(any());
    }

    @Test
    @DisplayName("pinPost pins post when caller has PIN_POST permission")
    public void testPinPost_Success() {
        UUID postId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        UserDto caller = new UserDto(userId, "admin@example.com", "admin", true, RoleType.USER);
        User owner = User.builder().id(userId).username("admin").build();

        Post post = Post.builder()
                .id(postId)
                .pinned(false)
                .owner(owner)
                .createdAt(OffsetDateTime.now())
                .updatedAt(OffsetDateTime.now())
                .build();
        PinPostRequestDto dto = new PinPostRequestDto(true);

        when(postRepository.findByIdWithOwner(postId)).thenReturn(Optional.of(post));
        when(communityPostRepository.findCommunitySlugByPostId(postId)).thenReturn(Optional.of("fmi-info"));
        when(authorizationService.hasCommunityPermission("fmi-info", userId, PermissionType.PIN_POST)).thenReturn(true);
        when(postRepository.save(any(Post.class))).thenAnswer(i -> i.getArgument(0));

        PostResponseDto result = postService.pinPost(postId, caller, dto);

        assertNotNull(result);
        assertTrue(result.pinned());
        verify(postRepository).save(post);
    }

    @Test
    @DisplayName("likePost saves PostLike and increments likesCount when not already liked")
    public void testLikePost_Success() {
        UUID postId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        UserDto caller = new UserDto(userId, "user@example.com", "user", true, RoleType.USER);
        Post post = Post.builder().id(postId).build();

        when(postRepository.findById(postId)).thenReturn(Optional.of(post));
        when(communityPostRepository.findCommunitySlugByPostId(postId)).thenReturn(Optional.of("fmi-info"));
        when(authorizationService.hasCommunityPermission("fmi-info", userId, PermissionType.LIKE_POST)).thenReturn(true);
        when(postLikeRepository.existsByIdPostIdAndIdUserId(postId, userId)).thenReturn(false);

        postService.likePost(postId, caller);

        verify(postLikeRepository).save(any(PostLike.class));
        verify(postRepository).incrementLikesCount(postId);
    }

    @Test
    @DisplayName("unlikePost deletes PostLike and decrements likesCount when currently liked")
    public void testUnlikePost_Success() {
        UUID postId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        UserDto caller = new UserDto(userId, "user@example.com", "user", true, RoleType.USER);

        when(postRepository.existsById(postId)).thenReturn(true);
        when(communityPostRepository.findCommunitySlugByPostId(postId)).thenReturn(Optional.of("fmi-info"));
        when(authorizationService.hasCommunityPermission("fmi-info", userId, PermissionType.LIKE_POST)).thenReturn(true);
        when(postLikeRepository.existsByIdPostIdAndIdUserId(postId, userId)).thenReturn(true);

        postService.unlikePost(postId, caller);

        verify(postLikeRepository).deleteByIdPostIdAndIdUserId(postId, userId);
        verify(postRepository).decrementLikesCount(postId);
    }
}
