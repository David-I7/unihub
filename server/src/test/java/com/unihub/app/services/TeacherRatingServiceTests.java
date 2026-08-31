package com.unihub.app.services;

import com.unihub.app.domain.PermissionType;
import com.unihub.app.domain.RoleType;
import com.unihub.app.dto.PageDto;
import com.unihub.app.dto.UserDto;
import com.unihub.app.dto.community.resources.request.CreateTeacherRatingRequestDto;
import com.unihub.app.dto.community.resources.request.RatingValueRequestDto;
import com.unihub.app.dto.community.resources.request.UpdateTeacherRatingRequestDto;
import com.unihub.app.dto.community.resources.response.TeacherRatingResponseDto;
import com.unihub.app.entities.authentication.User;
import com.unihub.app.entities.community.resources.Community;
import com.unihub.app.entities.community.resources.RatingMetric;
import com.unihub.app.entities.community.resources.Teacher;
import com.unihub.app.entities.community.resources.TeacherRating;
import com.unihub.app.entities.community.resources.TeacherRatingValue;
import com.unihub.app.entities.community.resources.TeacherRatingValueId;
import com.unihub.app.mappers.PageMapper;
import com.unihub.app.mappers.UserMapper;
import com.unihub.app.mappers.community.CommunityResourceMapper;
import com.unihub.app.repositories.community.resources.RatingMetricRepository;
import com.unihub.app.repositories.community.resources.TeacherRatingRepository;
import com.unihub.app.repositories.community.resources.TeacherRepository;
import com.unihub.app.services.authorization.AuthorizationService;
import com.unihub.app.services.community.resources.TeacherRatingService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.time.OffsetDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class TeacherRatingServiceTests {

    @Mock
    private TeacherRatingRepository teacherRatingRepository;

    @Mock
    private TeacherRepository teacherRepository;

    @Mock
    private RatingMetricRepository ratingMetricRepository;

    @Mock
    private AuthorizationService authorizationService;

    @Mock
    private UserMapper userMapper;

    @Spy
    private CommunityResourceMapper resourceMapper = new CommunityResourceMapper();

    @Spy
    private PageMapper pageMapper = new PageMapper();

    @InjectMocks
    private TeacherRatingService teacherRatingService;

    private UserDto memberUser;
    private User userEntity;
    private Community community;
    private Teacher teacher;
    private List<RatingMetric> metrics;

    @BeforeEach
    public void setup() {
        UUID userId = UUID.randomUUID();
        memberUser = new UserDto(userId, "john@example.com", "johndoe", true, RoleType.USER);
        userEntity = User.builder().id(userId).username("johndoe").email("john@example.com").build();

        community = Community.builder()
                .id(UUID.randomUUID())
                .name("FMI")
                .slug("fmi-info")
                .build();

        teacher = Teacher.builder()
                .id(UUID.randomUUID())
                .firstName("Daniel")
                .lastName("Dragulici")
                .community(community)
                .averageRating(0.0f)
                .ratingsCount(0)
                .createdAt(OffsetDateTime.now())
                .build();

        metrics = List.of(
                RatingMetric.builder().id(1).name("Clarity").description("Clear explanation").build(),
                RatingMetric.builder().id(2).name("Fairness").description("Fair grading").build()
        );
    }

    @Test
    @DisplayName("getPaginatedRatings returns reviews page")
    public void testGetPaginatedRatings_Success() {
        PageRequest pageRequest = PageRequest.of(0, 10);
        TeacherRating rating = TeacherRating.builder()
                .id(1L)
                .teacher(teacher)
                .user(userEntity)
                .title("Good teacher")
                .createdAt(OffsetDateTime.now())
                .values(Set.of())
                .build();

        when(teacherRepository.existsById(teacher.getId())).thenReturn(true);
        when(teacherRatingRepository.findByTeacherIdWithAuthorAndValues(teacher.getId(), pageRequest))
                .thenReturn(new PageImpl<>(List.of(rating), pageRequest, 1));

        PageDto<TeacherRatingResponseDto> result = teacherRatingService.getPaginatedRatings(teacher.getId(), pageRequest);

        assertNotNull(result);
        assertEquals(1, result.totalElements());
        assertEquals("Good teacher", result.content().get(0).title());
    }

    @Test
    @DisplayName("getPaginatedRatings throws NotFound when teacher does not exist")
    public void testGetPaginatedRatings_TeacherNotFound() {
        UUID randomId = UUID.randomUUID();
        when(teacherRepository.existsById(randomId)).thenReturn(false);

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () ->
                teacherRatingService.getPaginatedRatings(randomId, PageRequest.of(0, 10)));

        assertEquals(HttpStatus.NOT_FOUND, ex.getStatusCode());
    }

    @Test
    @DisplayName("createRating persists review and updates teacher ratings count and average")
    public void testCreateRating_Success() {
        CreateTeacherRatingRequestDto request = CreateTeacherRatingRequestDto.builder()
                .title("Excellent")
                .description("Detailed explanations")
                .isAnonymous(false)
                .values(List.of(
                        new RatingValueRequestDto(1, 5),
                        new RatingValueRequestDto(2, 4)
                ))
                .build();

        when(teacherRepository.findByIdWithCommunity(teacher.getId())).thenReturn(Optional.of(teacher));
        when(authorizationService.hasCommunityPermission(community.getSlug(), memberUser.id(), PermissionType.CREATE_TEACHER_RATING))
                .thenReturn(true);
        when(teacherRatingRepository.existsByTeacherIdAndUserId(teacher.getId(), memberUser.id())).thenReturn(false);
        when(ratingMetricRepository.findAll()).thenReturn(metrics);
        when(userMapper.toEntity(memberUser)).thenReturn(userEntity);

        when(teacherRatingRepository.save(any(TeacherRating.class))).thenAnswer(inv -> {
            TeacherRating r = inv.getArgument(0);
            r.setId(10L);
            return r;
        });

        TeacherRatingResponseDto result = teacherRatingService.createRating(teacher.getId(), memberUser, request);

        assertNotNull(result);
        assertEquals(10L, result.id());
        assertEquals("Excellent", result.title());
        assertEquals("johndoe", result.author().username());
        assertEquals(1, teacher.getRatingsCount());
        assertEquals(4.5f, teacher.getAverageRating());
        verify(teacherRepository).save(teacher);
    }

    @Test
    @DisplayName("createRating throws Conflict when user already rated teacher")
    public void testCreateRating_DuplicateConflict() {
        CreateTeacherRatingRequestDto request = CreateTeacherRatingRequestDto.builder()
                .title("Duplicate")
                .values(List.of(new RatingValueRequestDto(1, 5), new RatingValueRequestDto(2, 4)))
                .build();

        when(teacherRepository.findByIdWithCommunity(teacher.getId())).thenReturn(Optional.of(teacher));
        when(authorizationService.hasCommunityPermission(community.getSlug(), memberUser.id(), PermissionType.CREATE_TEACHER_RATING))
                .thenReturn(true);
        when(teacherRatingRepository.existsByTeacherIdAndUserId(teacher.getId(), memberUser.id())).thenReturn(true);

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () ->
                teacherRatingService.createRating(teacher.getId(), memberUser, request));

        assertEquals(HttpStatus.CONFLICT, ex.getStatusCode());
    }

    @Test
    @DisplayName("createRating throws BadRequest when metrics are incomplete or contain duplicates")
    public void testCreateRating_IncompleteMetrics_BadRequest() {
        CreateTeacherRatingRequestDto request = CreateTeacherRatingRequestDto.builder()
                .title("Incomplete")
                .values(List.of(new RatingValueRequestDto(1, 5)))
                .build();

        when(teacherRepository.findByIdWithCommunity(teacher.getId())).thenReturn(Optional.of(teacher));
        when(authorizationService.hasCommunityPermission(community.getSlug(), memberUser.id(), PermissionType.CREATE_TEACHER_RATING))
                .thenReturn(true);
        when(teacherRatingRepository.existsByTeacherIdAndUserId(teacher.getId(), memberUser.id())).thenReturn(false);
        when(ratingMetricRepository.findAll()).thenReturn(metrics);

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () ->
                teacherRatingService.createRating(teacher.getId(), memberUser, request));

        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
    }

    @Test
    @DisplayName("updateRating updates review and recalculates teacher average rating")
    public void testUpdateRating_Success() {
        Long ratingId = 10L;
        teacher.setRatingsCount(1);
        teacher.setAverageRating(4.5f);

        TeacherRating existingRating = TeacherRating.builder()
                .id(ratingId)
                .teacher(teacher)
                .user(userEntity)
                .title("Good")
                .isAnonymous(false)
                .values(new HashSet<>(List.of(
                        TeacherRatingValue.builder()
                                .id(new TeacherRatingValueId(ratingId, 1))
                                .ratingMetric(metrics.get(0))
                                .value(5)
                                .build(),
                        TeacherRatingValue.builder()
                                .id(new TeacherRatingValueId(ratingId, 2))
                                .ratingMetric(metrics.get(1))
                                .value(4)
                                .build()
                )))
                .build();

        UpdateTeacherRatingRequestDto request = UpdateTeacherRatingRequestDto.builder()
                .title("Updated Review")
                .description("Better now")
                .isAnonymous(true)
                .values(List.of(
                        new RatingValueRequestDto(1, 5),
                        new RatingValueRequestDto(2, 5)
                ))
                .build();

        when(teacherRatingRepository.findByIdWithTeacherAndValues(ratingId)).thenReturn(Optional.of(existingRating));
        when(authorizationService.hasCommunityPermission(community.getSlug(), memberUser.id(), PermissionType.UPDATE_TEACHER_RATING))
                .thenReturn(true);
        when(ratingMetricRepository.findAll()).thenReturn(metrics);
        when(teacherRatingRepository.save(any(TeacherRating.class))).thenAnswer(inv -> inv.getArgument(0));

        TeacherRatingResponseDto result = teacherRatingService.updateRating(teacher.getId(), ratingId, memberUser, request);

        assertNotNull(result);
        assertEquals("Updated Review", result.title());
        assertTrue(result.isAnonymous());
        assertEquals(5.0f, teacher.getAverageRating());
        assertEquals(1, teacher.getRatingsCount());
        verify(teacherRepository).save(teacher);
    }

    @Test
    @DisplayName("updateRating throws Forbidden when non-author attempts update")
    public void testUpdateRating_NonAuthor_Forbidden() {
        Long ratingId = 10L;
        User otherUser = User.builder().id(UUID.randomUUID()).username("other").build();
        TeacherRating existingRating = TeacherRating.builder()
                .id(ratingId)
                .teacher(teacher)
                .user(otherUser)
                .title("Good")
                .build();

        when(teacherRatingRepository.findByIdWithTeacherAndValues(ratingId)).thenReturn(Optional.of(existingRating));

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () ->
                teacherRatingService.updateRating(teacher.getId(), ratingId, memberUser, UpdateTeacherRatingRequestDto.builder()
                        .title("Hacked")
                        .values(List.of(new RatingValueRequestDto(1, 5), new RatingValueRequestDto(2, 5)))
                        .build()));

        assertEquals(HttpStatus.FORBIDDEN, ex.getStatusCode());
    }

    @Test
    @DisplayName("deleteRating removes review and recalculates teacher average rating")
    public void testDeleteRating_Author_Success() {
        Long ratingId = 10L;
        teacher.setRatingsCount(2);
        teacher.setAverageRating(4.5f);

        TeacherRating existingRating = TeacherRating.builder()
                .id(ratingId)
                .teacher(teacher)
                .user(userEntity)
                .title("Review to delete")
                .values(Set.of(
                        TeacherRatingValue.builder().value(5).build(),
                        TeacherRatingValue.builder().value(5).build()
                ))
                .build();

        when(teacherRatingRepository.findByIdWithTeacherAndValues(ratingId)).thenReturn(Optional.of(existingRating));
        when(authorizationService.hasCommunityPermission(community.getSlug(), memberUser.id(), PermissionType.DELETE_TEACHER_RATING))
                .thenReturn(true);

        teacherRatingService.deleteRating(teacher.getId(), ratingId, memberUser);

        verify(teacherRatingRepository).delete(existingRating);
        assertEquals(1, teacher.getRatingsCount());
        assertEquals(4.0f, teacher.getAverageRating());
        verify(teacherRepository).save(teacher);
    }

    @Test
    @DisplayName("deleteRating by moderator succeeds with MODERATE_TEACHER_RATING permission")
    public void testDeleteRating_Moderator_Success() {
        Long ratingId = 10L;
        User otherUser = User.builder().id(UUID.randomUUID()).username("other").build();
        teacher.setRatingsCount(1);
        teacher.setAverageRating(5.0f);

        TeacherRating existingRating = TeacherRating.builder()
                .id(ratingId)
                .teacher(teacher)
                .user(otherUser)
                .title("Spam review")
                .values(Set.of(
                        TeacherRatingValue.builder().value(5).build()
                ))
                .build();

        when(teacherRatingRepository.findByIdWithTeacherAndValues(ratingId)).thenReturn(Optional.of(existingRating));
        when(authorizationService.hasCommunityPermission(community.getSlug(), memberUser.id(), PermissionType.MODERATE_TEACHER_RATING))
                .thenReturn(true);

        teacherRatingService.deleteRating(teacher.getId(), ratingId, memberUser);

        verify(teacherRatingRepository).delete(existingRating);
        assertEquals(0, teacher.getRatingsCount());
        assertEquals(0.0f, teacher.getAverageRating());
        verify(teacherRepository).save(teacher);
    }
}
