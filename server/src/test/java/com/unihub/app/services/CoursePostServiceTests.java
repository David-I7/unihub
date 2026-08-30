package com.unihub.app.services;

import com.unihub.app.domain.PermissionType;
import com.unihub.app.domain.RoleType;
import com.unihub.app.dto.PageDto;
import com.unihub.app.dto.UserDto;
import com.unihub.app.dto.community.content.request.CreatePostRequestDto;
import com.unihub.app.dto.community.content.response.PostResponseDto;
import com.unihub.app.entities.authentication.User;
import com.unihub.app.entities.community.content.CommunicationChannel;
import com.unihub.app.entities.community.content.CoursePost;
import com.unihub.app.entities.community.content.Post;
import com.unihub.app.entities.community.resources.Course;
import com.unihub.app.entities.community.resources.StudyYearName;
import com.unihub.app.mappers.PageMapper;
import com.unihub.app.mappers.UserMapper;
import com.unihub.app.mappers.community.CommunityContentMapper;
import com.unihub.app.repositories.community.content.CoursePostRepository;
import com.unihub.app.repositories.community.content.PostLikeRepository;
import com.unihub.app.repositories.community.content.PostRepository;
import com.unihub.app.repositories.community.resources.CourseRepository;
import com.unihub.app.services.authorization.AuthorizationService;
import com.unihub.app.services.community.content.CoursePostService;
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
public class CoursePostServiceTests {

    @Mock
    private CourseRepository courseRepository;

    @Mock
    private PostRepository postRepository;

    @Mock
    private CoursePostRepository coursePostRepository;

    @Mock
    private PostLikeRepository postLikeRepository;

    @Mock
    private AuthorizationService authorizationService;

    @Spy
    private CommunityContentMapper contentMapper = new CommunityContentMapper();

    @Spy
    private PageMapper pageMapper = new PageMapper();

    @Spy
    private UserMapper userMapper = new UserMapper(null);

    @InjectMocks
    private CoursePostService coursePostService;

    @Test
    @DisplayName("createCoursePost creates course post successfully")
    public void testCreateCoursePost_Success() {
        UUID userId = UUID.randomUUID();
        UserDto userDto = new UserDto(userId, "user@example.com", "user", true, RoleType.USER);
        Course course = Course.builder().id(10L).slug("asc").build();
        CreatePostRequestDto dto = new CreatePostRequestDto("ASC Lab 1", "Discussion for ASC Lab 1");

        when(courseRepository.findBySlugAndCommunitySlugAndStudyYearName("asc", "fmi-info", StudyYearName.YEAR_1))
                .thenReturn(Optional.of(course));
        when(postRepository.save(any(Post.class))).thenAnswer(i -> {
            Post p = i.getArgument(0);
            p.setId(UUID.randomUUID());
            p.setCreatedAt(OffsetDateTime.now());
            p.setUpdatedAt(OffsetDateTime.now());
            return p;
        });

        PostResponseDto result = coursePostService.createCoursePost("fmi-info", StudyYearName.YEAR_1, "asc", userDto, dto);

        assertNotNull(result);
        assertEquals("ASC Lab 1", result.title());
        assertEquals(CommunicationChannel.COURSE, result.channel());
        verify(coursePostRepository).save(any(CoursePost.class));
    }

    @Test
    @DisplayName("getCoursePosts returns posts with like status")
    public void testGetCoursePosts_Success() {
        UUID userId = UUID.randomUUID();
        UUID postId = UUID.randomUUID();
        UserDto userDto = new UserDto(userId, "user@example.com", "user", true, RoleType.USER);
        User owner = User.builder().id(userId).username("user").build();
        Course course = Course.builder().id(10L).slug("asc").build();

        Post post = Post.builder()
                .id(postId)
                .title("ASC Assignment")
                .description("Desc")
                .channel(CommunicationChannel.COURSE)
                .owner(owner)
                .createdAt(OffsetDateTime.now())
                .updatedAt(OffsetDateTime.now())
                .build();

        PageRequest pageRequest = PageRequest.of(0, 10);

        when(courseRepository.findBySlugAndCommunitySlugAndStudyYearName("asc", "fmi-info", StudyYearName.YEAR_1))
                .thenReturn(Optional.of(course));
        when(coursePostRepository.findPostsByCourseId(eq(10L), eq(pageRequest)))
                .thenReturn(new PageImpl<>(List.of(post), pageRequest, 1));
        when(postLikeRepository.findLikedPostIdsByUserIdAndPostIdIn(userId, List.of(postId)))
                .thenReturn(Set.of(postId));

        PageDto<PostResponseDto> result = coursePostService.getCoursePosts("fmi-info", StudyYearName.YEAR_1, "asc", userDto, pageRequest);

        assertNotNull(result);
        assertEquals(1, result.totalElements());
        PostResponseDto postDto = result.content().get(0);
        assertEquals(postId, postDto.id());
        assertTrue(postDto.isLiked());
    }

    @Test
    @DisplayName("getCoursePosts throws 404 when course does not exist")
    public void testGetCoursePosts_NotFound() {
        when(courseRepository.findBySlugAndCommunitySlugAndStudyYearName("unknown", "fmi-info", StudyYearName.YEAR_1))
                .thenReturn(Optional.empty());

        assertThrows(ResponseStatusException.class,
                () -> coursePostService.getCoursePosts("fmi-info", StudyYearName.YEAR_1, "unknown", null, PageRequest.of(0, 10)));
    }
}
