package com.unihub.app.services;

import com.unihub.app.domain.PermissionType;
import com.unihub.app.domain.RoleType;
import com.unihub.app.dto.PageDto;
import com.unihub.app.dto.UserDto;
import com.unihub.app.dto.community.resources.request.CreateTeacherRequestDto;
import com.unihub.app.dto.community.resources.request.UpdateTeacherRequestDto;
import com.unihub.app.dto.community.resources.response.TeacherDetailResponseDto;
import com.unihub.app.dto.community.resources.response.TeacherResponseDto;
import com.unihub.app.entities.authentication.User;
import com.unihub.app.entities.community.resources.Community;
import com.unihub.app.entities.community.resources.Teacher;
import com.unihub.app.entities.community.resources.TeacherRating;
import com.unihub.app.mappers.PageMapper;
import com.unihub.app.mappers.community.CommunityResourceMapper;
import com.unihub.app.repositories.community.resources.CommunityRepository;
import com.unihub.app.repositories.community.resources.TeacherRatingRepository;
import com.unihub.app.repositories.community.resources.TeacherRepository;
import com.unihub.app.services.authorization.AuthorizationService;
import com.unihub.app.services.community.resources.TeacherService;
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

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class TeacherServiceTests {

    @Mock
    private TeacherRepository teacherRepository;

    @Mock
    private TeacherRatingRepository teacherRatingRepository;

    @Mock
    private CommunityRepository communityRepository;

    @Mock
    private AuthorizationService authorizationService;

    @Spy
    private CommunityResourceMapper resourceMapper = new CommunityResourceMapper();

    @Spy
    private PageMapper pageMapper = new PageMapper();

    @InjectMocks
    private TeacherService teacherService;

    private UserDto memberUser;
    private Community community;

    @BeforeEach
    public void setup() {
        memberUser = new UserDto(UUID.randomUUID(), "john@example.com", "johndoe", true, RoleType.USER);
        community = Community.builder()
                .id(UUID.randomUUID())
                .name("FMI - Informatica ID")
                .slug("fmi-info-id")
                .description("Desc")
                .createdAt(OffsetDateTime.now())
                .build();
    }

    @Test
    @DisplayName("createTeacher succeeds when caller has permission and teacher is unique")
    public void testCreateTeacher_Success() {
        CreateTeacherRequestDto request = CreateTeacherRequestDto.builder()
                .firstName("Daniel")
                .lastName("Dragulici")
                .estimatedAge(42)
                .build();

        when(authorizationService.hasCommunityPermission("fmi-info-id", memberUser.id(), PermissionType.CREATE_TEACHER))
                .thenReturn(true);
        when(communityRepository.findBySlug("fmi-info-id")).thenReturn(Optional.of(community));
        when(teacherRepository.findByCommunityIdAndFirstNameAndLastName(community.getId(), "Daniel", "Dragulici"))
                .thenReturn(Optional.empty());

        UUID teacherId = UUID.randomUUID();
        when(teacherRepository.save(any(Teacher.class))).thenAnswer(invocation -> {
            Teacher t = invocation.getArgument(0);
            t.setId(teacherId);
            return t;
        });

        TeacherResponseDto result = teacherService.createTeacher("fmi-info-id", memberUser, request);

        assertNotNull(result);
        assertEquals(teacherId, result.id());
        assertEquals("Daniel", result.firstName());
        assertEquals("Dragulici", result.lastName());
        assertEquals(42, result.estimatedAge());
    }

    @Test
    @DisplayName("createTeacher throws Forbidden when caller lacks permission")
    public void testCreateTeacher_Forbidden() {
        CreateTeacherRequestDto request = CreateTeacherRequestDto.builder()
                .firstName("Daniel")
                .lastName("Dragulici")
                .build();

        when(authorizationService.hasCommunityPermission("fmi-info-id", memberUser.id(), PermissionType.CREATE_TEACHER))
                .thenReturn(false);

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () ->
                teacherService.createTeacher("fmi-info-id", memberUser, request));

        assertEquals(HttpStatus.FORBIDDEN, ex.getStatusCode());
    }

    @Test
    @DisplayName("createTeacher throws Conflict when teacher already exists in community")
    public void testCreateTeacher_Conflict() {
        CreateTeacherRequestDto request = CreateTeacherRequestDto.builder()
                .firstName("Daniel")
                .lastName("Dragulici")
                .build();

        when(authorizationService.hasCommunityPermission("fmi-info-id", memberUser.id(), PermissionType.CREATE_TEACHER))
                .thenReturn(true);
        when(communityRepository.findBySlug("fmi-info-id")).thenReturn(Optional.of(community));
        when(teacherRepository.findByCommunityIdAndFirstNameAndLastName(community.getId(), "Daniel", "Dragulici"))
                .thenReturn(Optional.of(Teacher.builder().id(UUID.randomUUID()).build()));

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () ->
                teacherService.createTeacher("fmi-info-id", memberUser, request));

        assertEquals(HttpStatus.CONFLICT, ex.getStatusCode());
    }

    @Test
    @DisplayName("updateTeacher updates firstName, lastName and estimatedAge")
    public void testUpdateTeacher_Success() {
        UUID teacherId = UUID.randomUUID();
        Teacher existingTeacher = Teacher.builder()
                .id(teacherId)
                .community(community)
                .firstName("Daniel")
                .lastName("Dragulici")
                .estimatedBirthDate(LocalDate.now().minusYears(40))
                .createdAt(OffsetDateTime.now())
                .build();

        UpdateTeacherRequestDto request = UpdateTeacherRequestDto.builder()
                .firstName("Dan")
                .lastName("Dragulici")
                .estimatedAge(45)
                .build();

        when(teacherRepository.findByIdWithCommunity(teacherId)).thenReturn(Optional.of(existingTeacher));
        when(authorizationService.hasCommunityPermission("fmi-info-id", memberUser.id(), PermissionType.UPDATE_TEACHER))
                .thenReturn(true);
        when(teacherRepository.findByCommunityIdAndFirstNameAndLastName(community.getId(), "Dan", "Dragulici"))
                .thenReturn(Optional.empty());
        when(teacherRepository.save(any(Teacher.class))).thenAnswer(inv -> inv.getArgument(0));

        TeacherResponseDto result = teacherService.updateTeacher(teacherId, memberUser, request);

        assertNotNull(result);
        assertEquals("Dan", result.firstName());
        assertEquals("Dragulici", result.lastName());
        assertEquals(45, result.estimatedAge());
    }

    @Test
    @DisplayName("deleteTeacher removes teacher from repository")
    public void testDeleteTeacher_Success() {
        UUID teacherId = UUID.randomUUID();
        Teacher existingTeacher = Teacher.builder()
                .id(teacherId)
                .community(community)
                .firstName("Daniel")
                .lastName("Dragulici")
                .build();

        when(teacherRepository.findByIdWithCommunity(teacherId)).thenReturn(Optional.of(existingTeacher));
        when(authorizationService.hasCommunityPermission("fmi-info-id", memberUser.id(), PermissionType.DELETE_TEACHER))
                .thenReturn(true);

        teacherService.deleteTeacher(teacherId, memberUser);

        verify(teacherRepository, times(1)).delete(existingTeacher);
    }

    @Test
    @DisplayName("getPaginatedTeachers returns list of teachers for community")
    public void testGetPaginatedTeachers_Success() {
        UUID teacherId = UUID.randomUUID();
        Teacher teacher = Teacher.builder()
                .id(teacherId)
                .community(community)
                .firstName("Daniel")
                .lastName("Dragulici")
                .averageRating(4.8f)
                .ratingsCount(12)
                .createdAt(OffsetDateTime.now())
                .build();

        PageRequest pageRequest = PageRequest.of(0, 10);
        when(communityRepository.existsBySlug("fmi-info-id")).thenReturn(true);
        when(teacherRepository.findByCommunitySlug("fmi-info-id", pageRequest))
                .thenReturn(new PageImpl<>(List.of(teacher), pageRequest, 1));

        PageDto<TeacherResponseDto> result = teacherService.getPaginatedTeachers("fmi-info-id", null, pageRequest);

        assertNotNull(result);
        assertEquals(1, result.totalElements());
        assertEquals("Daniel", result.content().get(0).firstName());
    }

    @Test
    @DisplayName("getTeacherDetail returns details with courses, metrics breakdown and ratings")
    public void testGetTeacherDetail_Success() {
        UUID teacherId = UUID.randomUUID();
        Teacher teacher = Teacher.builder()
                .id(teacherId)
                .community(community)
                .firstName("Daniel")
                .lastName("Dragulici")
                .averageRating(4.5f)
                .ratingsCount(1)
                .estimatedBirthDate(LocalDate.now().minusYears(43))
                .createdAt(OffsetDateTime.now())
                .coursesTaught(Collections.emptyList())
                .build();

        User ratingUser = User.builder()
                .id(UUID.randomUUID())
                .username("student1")
                .email("student1@example.com")
                .build();

        TeacherRating rating = TeacherRating.builder()
                .id(1L)
                .teacher(teacher)
                .user(ratingUser)
                .title("Great teacher")
                .description("Loved the lectures")
                .isAnonymous(false)
                .createdAt(OffsetDateTime.now())
                .values(Collections.emptySet())
                .build();

        PageRequest pageRequest = PageRequest.of(0, 10);
        when(teacherRepository.findByIdWithCommunityAndCourses(teacherId)).thenReturn(Optional.of(teacher));
        when(teacherRatingRepository.findMetricBreakdownByTeacherId(teacherId)).thenReturn(List.<Object[]>of(
                new Object[]{1, "Teaching ability", "Delivers content", 4.5, 1L}
        ));
        when(teacherRatingRepository.findByTeacherId(teacherId, pageRequest))
                .thenReturn(new PageImpl<>(List.of(rating), pageRequest, 1));

        TeacherDetailResponseDto result = teacherService.getTeacherDetail(teacherId, pageRequest);

        assertNotNull(result);
        assertEquals(teacherId, result.id());
        assertEquals("Daniel", result.firstName());
        assertEquals(43, result.estimatedAge());
        assertEquals(1, result.detailedRatings().size());
        assertEquals("Teaching ability", result.detailedRatings().get(0).metricName());
        assertEquals(1, result.ratings().totalElements());
        assertEquals("student1", result.ratings().content().get(0).author().username());
    }
}
