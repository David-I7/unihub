package com.unihub.app.services;

import com.unihub.app.domain.PermissionType;

import com.unihub.app.domain.RoleType;
import com.unihub.app.dto.UserDto;
import com.unihub.app.dto.community.content.request.PinPostRequestDto;
import com.unihub.app.dto.community.content.request.UpdatePostRequestDto;
import com.unihub.app.dto.community.content.response.PostDetailResponseDto;
import com.unihub.app.dto.community.content.response.PostResponseDto;
import com.unihub.app.entities.authentication.User;
import com.unihub.app.entities.community.content.CommunicationChannel;
import com.unihub.app.entities.community.content.Post;
import com.unihub.app.entities.community.content.PostLike;
import com.unihub.app.entities.community.content.PostLikeId;
import com.unihub.app.mappers.UserMapper;
import com.unihub.app.mappers.community.CommunityContentMapper;
import com.unihub.app.repositories.community.content.*;
import com.unihub.app.security.policies.PostPolicy;
import com.unihub.app.services.community.content.PostService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;

import java.time.OffsetDateTime;
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

    @Spy
    private CommunityContentMapper contentMapper = new CommunityContentMapper();

    @Spy
    private UserMapper userMapper = new UserMapper(null);

    @Mock
    private org.springframework.context.ApplicationEventPublisher eventPublisher;

    @Mock
    private PostPolicy postPolicy;

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
                .title("Title")
                .description("Desc")
                .channel(CommunicationChannel.COMMUNITY)
                .likesCount(10)
                .commentsCount(5)
                .pinned(false)
                .owner(owner)
                .createdAt(OffsetDateTime.now())
                .updatedAt(OffsetDateTime.now())
                .build();

        when(postRepository.findByIdWithOwner(postId)).thenReturn(Optional.of(post));
        when(postLikeRepository.existsByIdPostIdAndIdUserId(postId, userId)).thenReturn(true);

        PostDetailResponseDto result = postService.getPostById(postId, userDto);

        assertNotNull(result);
        assertEquals(postId, result.id());
        assertEquals("Title", result.title());
        assertEquals("Desc", result.description());
        assertEquals(10, result.likesCount());
        assertEquals(5, result.commentsCount());
        assertFalse(result.pinned());
        assertTrue(result.isLiked());
        assertNotNull(result.owner());
        assertEquals("david", result.owner().username());
    }

    @Test
    @DisplayName("updatePost updates title and description")
    public void testUpdatePost_AuthorSuccess() {
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
        when(postRepository.save(any(Post.class))).thenAnswer(i -> i.getArgument(0));

        PostResponseDto result = postService.updatePost(postId, userDto, dto);

        assertNotNull(result);
        assertEquals("New Title", result.title());
        assertEquals("New Desc", result.description());
        verify(postPolicy).check(userDto, post, PermissionType.UPDATE_POST);
        verify(postRepository).save(post);
    }

    @Test
    @DisplayName("updatePost throws AccessDeniedException when policy denies")
    public void testUpdatePost_AccessDenied() {
        UUID postId = UUID.randomUUID();
        UserDto userDto = new UserDto(UUID.randomUUID(), "david@example.com", "david", true, RoleType.USER);
        Post post = Post.builder().id(postId).build();
        UpdatePostRequestDto dto = new UpdatePostRequestDto("New", "Desc");

        when(postRepository.findByIdWithOwner(postId)).thenReturn(Optional.of(post));
        doThrow(new AccessDeniedException("Access denied")).when(postPolicy).check(userDto, post, PermissionType.UPDATE_POST);

        assertThrows(AccessDeniedException.class, () -> postService.updatePost(postId, userDto, dto));
        verify(postRepository, never()).save(any());
    }

    @Test
    @DisplayName("deletePost deletes post")
    public void testDeletePost_Success() {
        UUID postId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        UserDto userDto = new UserDto(userId, "david@example.com", "david", true, RoleType.USER);
        User owner = User.builder().id(userId).username("david").build();

        Post post = Post.builder().id(postId).owner(owner).build();

        when(postRepository.findByIdWithOwner(postId)).thenReturn(Optional.of(post));

        postService.deletePost(postId, userDto);

        verify(postPolicy).check(userDto, post, PermissionType.DELETE_POST);
        verify(postRepository).delete(post);
    }

    @Test
    @DisplayName("deletePost throws AccessDeniedException when policy denies")
    public void testDeletePost_AccessDenied() {
        UUID postId = UUID.randomUUID();
        UserDto userDto = new UserDto(UUID.randomUUID(), "david@example.com", "david", true, RoleType.USER);
        Post post = Post.builder().id(postId).build();

        when(postRepository.findByIdWithOwner(postId)).thenReturn(Optional.of(post));
        doThrow(new AccessDeniedException("Access denied")).when(postPolicy).check(userDto, post, PermissionType.DELETE_POST);

        assertThrows(AccessDeniedException.class, () -> postService.deletePost(postId, userDto));
        verify(postRepository, never()).delete(any());
    }

    @Test
    @DisplayName("pinPost pins post")
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
        when(postRepository.save(any(Post.class))).thenAnswer(i -> i.getArgument(0));

        PostResponseDto result = postService.pinPost(postId, caller, dto);

        assertNotNull(result);
        assertTrue(result.pinned());
        verify(postPolicy).check(caller, post, PermissionType.PIN_POST);
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
        when(postLikeRepository.existsByIdPostIdAndIdUserId(postId, userId)).thenReturn(true);

        postService.unlikePost(postId, caller);

        verify(postLikeRepository).deleteByIdPostIdAndIdUserId(postId, userId);
        verify(postRepository).decrementLikesCount(postId);
    }
}
