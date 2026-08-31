package com.unihub.app.services;

import com.unihub.app.domain.PermissionType;
import com.unihub.app.domain.RoleType;
import com.unihub.app.dto.PageDto;
import com.unihub.app.dto.UserDto;
import com.unihub.app.dto.community.content.request.CreatePostRequestDto;
import com.unihub.app.dto.community.content.response.PostResponseDto;
import com.unihub.app.entities.authentication.User;
import com.unihub.app.entities.community.content.CommunicationChannel;
import com.unihub.app.entities.community.content.CommunityPost;
import com.unihub.app.entities.community.content.Post;
import com.unihub.app.entities.community.resources.Community;
import com.unihub.app.mappers.PageMapper;
import com.unihub.app.mappers.UserMapper;
import com.unihub.app.mappers.community.CommunityContentMapper;
import com.unihub.app.repositories.community.content.CommunityPostRepository;
import com.unihub.app.repositories.community.content.PostLikeRepository;
import com.unihub.app.repositories.community.content.PostRepository;
import com.unihub.app.repositories.community.resources.CommunityRepository;
import com.unihub.app.services.authorization.AuthorizationService;
import com.unihub.app.services.authorization.RoleService;
import com.unihub.app.services.community.content.CommunityPostService;
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
import java.util.Set;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class CommunityPostServiceTests {

    @Mock
    private CommunityRepository communityRepository;

    @Mock
    private PostRepository postRepository;

    @Mock
    private CommunityPostRepository communityPostRepository;

    @Mock
    private PostLikeRepository postLikeRepository;

    @Mock
    private AuthorizationService authorizationService;

    @Mock
    private RoleService roleService;

    @Spy
    private CommunityContentMapper contentMapper = new CommunityContentMapper();

    @Spy
    private PageMapper pageMapper = new PageMapper();

    @Spy
    private UserMapper userMapper = new UserMapper(null);

    @Mock
    private org.springframework.context.ApplicationEventPublisher eventPublisher;

    @InjectMocks
    private CommunityPostService communityPostService;

    @Test
    @DisplayName("createCommunityPost successfully creates and returns community post")
    public void testCreateCommunityPost_Success() {
        UUID userId = UUID.randomUUID();
        UserDto userDto = new UserDto(userId, "david@example.com", "david", true, RoleType.USER);
        Community community = Community.builder().id(UUID.randomUUID()).slug("fmi-info").build();
        CreatePostRequestDto requestDto = new CreatePostRequestDto("Title", "Description");

        when(communityRepository.findBySlug("fmi-info")).thenReturn(Optional.of(community));
        when(authorizationService.hasCommunityPermission("fmi-info", userId, PermissionType.CREATE_POST)).thenReturn(true);
        when(postRepository.save(any(Post.class))).thenAnswer(i -> {
            Post p = i.getArgument(0);
            p.setId(UUID.randomUUID());
            p.setCreatedAt(OffsetDateTime.now());
            p.setUpdatedAt(OffsetDateTime.now());
            return p;
        });

        PostResponseDto result = communityPostService.createCommunityPost("fmi-info", userDto, requestDto);

        assertNotNull(result);
        assertEquals("Title", result.title());
        assertEquals("Description", result.description());
        assertEquals(CommunicationChannel.COMMUNITY, result.channel());
        assertFalse(result.isLiked());
        verify(communityPostRepository).save(any(CommunityPost.class));
    }

    @Test
    @DisplayName("createCommunityPost throws 403 when user lacks CREATE_POST permission")
    public void testCreateCommunityPost_Forbidden() {
        UUID userId = UUID.randomUUID();
        UserDto userDto = new UserDto(userId, "david@example.com", "david", true, RoleType.USER);
        Community community = Community.builder().id(UUID.randomUUID()).slug("fmi-info").build();
        CreatePostRequestDto requestDto = new CreatePostRequestDto("Title", "Description");

        when(communityRepository.findBySlug("fmi-info")).thenReturn(Optional.of(community));
        when(authorizationService.hasCommunityPermission("fmi-info", userId, PermissionType.CREATE_POST)).thenReturn(false);

        assertThrows(ResponseStatusException.class,
                () -> communityPostService.createCommunityPost("fmi-info", userDto, requestDto));
    }

    @Test
    @DisplayName("getCommunityPosts returns posts with non-null fields and isLiked true")
    public void testGetCommunityPosts_Success() {
        UUID communityId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        UserDto userDto = new UserDto(userId, "david@example.com", "david", true, RoleType.USER);
        User author = User.builder().id(userId).username("david").build();

        Community community = Community.builder()
                .id(communityId)
                .slug("fmi-info-id")
                .name("FMI")
                .description("Community description")
                .backgroundColor("#2563eb")
                .memberCount(10)
                .verified(true)
                .owner(author)
                .createdAt(OffsetDateTime.now())
                .build();

        UUID postId = UUID.randomUUID();
        OffsetDateTime postCreatedAt = OffsetDateTime.now().minusHours(2);
        OffsetDateTime postUpdatedAt = OffsetDateTime.now().minusHours(1);
        Post post = Post.builder()
                .id(postId)
                .title("Exam schedule")
                .description("Check your dates")
                .channel(CommunicationChannel.COMMUNITY)
                .pinned(true)
                .likesCount(5)
                .commentsCount(1)
                .createdAt(postCreatedAt)
                .updatedAt(postUpdatedAt)
                .owner(author)
                .build();

        PageRequest pageRequest = PageRequest.of(0, 10);

        when(communityRepository.findBySlugWithOwner("fmi-info-id")).thenReturn(Optional.of(community));
        when(communityPostRepository.findPostsByCommunityId(eq(communityId), eq(pageRequest)))
                .thenReturn(new PageImpl<>(List.of(post), pageRequest, 1));
        when(postLikeRepository.findLikedPostIdsByUserIdAndPostIdIn(userId, List.of(postId)))
                .thenReturn(Set.of(postId));

        PageDto<PostResponseDto> result = communityPostService.getCommunityPosts("fmi-info-id", userDto, pageRequest);

        assertNotNull(result);
        assertEquals(1, result.totalElements());
        assertEquals(1, result.content().size());

        PostResponseDto postDto = result.content().get(0);
        assertNotNull(postDto.id());
        assertEquals(postId, postDto.id());
        assertEquals("Exam schedule", postDto.title());
        assertEquals("Check your dates", postDto.description());
        assertEquals(CommunicationChannel.COMMUNITY, postDto.channel());
        assertTrue(postDto.pinned());
        assertTrue(postDto.isLiked());
        assertEquals(5, postDto.likesCount());
        assertEquals(1, postDto.commentsCount());
        assertEquals(postCreatedAt, postDto.createdAt());
        assertEquals(postUpdatedAt, postDto.updatedAt());
        assertNotNull(postDto.owner());
        assertEquals(author.getId(), postDto.owner().id());
        assertEquals("david", postDto.owner().username());

        verify(communityRepository).findBySlugWithOwner("fmi-info-id");
        verify(communityPostRepository).findPostsByCommunityId(eq(communityId), eq(pageRequest));
    }

    @Test
    @DisplayName("getCommunityPosts returns empty page when no posts exist")
    public void testGetCommunityPosts_Empty() {
        UUID communityId = UUID.randomUUID();
        User author = User.builder().id(UUID.randomUUID()).username("david").build();
        Community community = Community.builder()
                .id(communityId)
                .slug("fmi-info-id")
                .name("FMI")
                .description("Community description")
                .backgroundColor("#2563eb")
                .memberCount(10)
                .verified(true)
                .owner(author)
                .createdAt(OffsetDateTime.now())
                .build();

        PageRequest pageRequest = PageRequest.of(0, 10);
        when(communityRepository.findBySlugWithOwner("fmi-info-id")).thenReturn(Optional.of(community));
        when(communityPostRepository.findPostsByCommunityId(eq(communityId), eq(pageRequest)))
                .thenReturn(new PageImpl<>(List.of(), pageRequest, 0));

        PageDto<PostResponseDto> result = communityPostService.getCommunityPosts("fmi-info-id", null, pageRequest);

        assertNotNull(result);
        assertEquals(0, result.totalElements());
        assertTrue(result.content().isEmpty());
    }

    @Test
    @DisplayName("getCommunityPosts throws 404 when community does not exist")
    public void testGetCommunityPosts_NotFound() {
        when(communityRepository.findBySlugWithOwner("unknown")).thenReturn(Optional.empty());

        assertThrows(ResponseStatusException.class,
                () -> communityPostService.getCommunityPosts("unknown", null, PageRequest.of(0, 10)));
    }
}
