package com.unihub.app.services;

import com.unihub.app.dto.community.resources.request.CreateStudyYearRequestDto;
import com.unihub.app.dto.community.resources.response.StudyYearHomeResponseDto;
import com.unihub.app.dto.community.resources.response.StudyYearIdentifiersResponseDto;
import com.unihub.app.dto.community.resources.response.StudyYearMetricsResponseDto;
import com.unihub.app.dto.community.resources.response.StudyYearResponseDto;
import com.unihub.app.entities.community.resources.Community;
import com.unihub.app.entities.community.resources.Course;
import com.unihub.app.entities.community.resources.StudyYear;
import com.unihub.app.entities.community.resources.StudyYearName;
import com.unihub.app.entities.globalResources.Teacher;
import com.unihub.app.mappers.GlobalResourceMapper;
import com.unihub.app.mappers.PageMapper;
import com.unihub.app.mappers.community.CommunityResourceMapper;
import com.unihub.app.repositories.community.resources.CommunityRepository;
import com.unihub.app.repositories.community.resources.CourseRepository;
import com.unihub.app.repositories.community.resources.StudyYearRepository;
import com.unihub.app.services.community.resources.StudyYearService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.web.server.ResponseStatusException;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class StudyYearServiceTests {

    @Mock
    private StudyYearRepository studyYearRepository;

    @Mock
    private CourseRepository courseRepository;

    @Mock
    private CommunityRepository communityRepository;

    @Spy
    private GlobalResourceMapper globalResourceMapper = new GlobalResourceMapper();

    @Spy
    private CommunityResourceMapper communityMapper = new CommunityResourceMapper(new GlobalResourceMapper());

    @Spy
    private PageMapper pageMapper = new PageMapper();

    @InjectMocks
    private StudyYearService studyYearService;

    @Test
    @DisplayName("getStudyYearHome returns study year with courses and teachers")
    public void testGetStudyYearHome_Success() {
        StudyYear studyYear = StudyYear.builder()
                .id(1)
                .studyYearName(StudyYearName.YEAR_1)
                .build();

        UUID teacherId = UUID.randomUUID();
        Teacher teacher = Teacher.builder()
                .id(teacherId)
                .firstName("Daniel")
                .lastName("Dragulici")
                .averageRating(4.8f)
                .ratingsCount(15)
                .build();

        Course course = Course.builder()
                .id(1L)
                .name("Arhitectura sistemelor de calcul")
                .slug("asc")
                .abbreviation("ASC")
                .studyYear(studyYear)
                .semester(1)
                .creditPoints(5)
                .archived(false)
                .description("Course description")
                .teachers(List.of(teacher))
                .build();

        when(studyYearRepository.findByCommunitySlugAndStudyYearName("fmi-info-id", StudyYearName.YEAR_1))
                .thenReturn(Optional.of(studyYear));
        when(courseRepository.findAllByStudyYearIdWithFilters(eq(1), isNull(), eq(false), isNull(), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(course), PageRequest.of(0, 12), 1));

        StudyYearHomeResponseDto result = studyYearService.getStudyYearHome(
                "fmi-info-id",
                StudyYearName.YEAR_1,
                null,
                null,
                false,
                PageRequest.of(0, 12)
        );

        assertNotNull(result);
        assertEquals(1, result.studyYear().id());
        assertEquals(StudyYearName.YEAR_1, result.studyYear().name());
        assertEquals(1, result.courses().content().size());

        var courseTeacherDto = result.courses().content().get(0);
        var courseDto = courseTeacherDto.course();
        assertEquals(1L, courseDto.id());
        assertEquals("Arhitectura sistemelor de calcul", courseDto.name());
        assertEquals("asc", courseDto.slug());
        assertEquals("ASC", courseDto.abbreviation());
        assertEquals(1, courseDto.semester());
        assertEquals(5, courseDto.creditPoints());
        assertFalse(courseDto.archived());
        assertEquals(1, courseTeacherDto.teachers().size());
        assertEquals("Daniel", courseTeacherDto.teachers().get(0).firstName());

        verify(studyYearRepository).findByCommunitySlugAndStudyYearName("fmi-info-id", StudyYearName.YEAR_1);
        verify(courseRepository).findAllByStudyYearIdWithFilters(eq(1), isNull(), eq(false), isNull(), any(Pageable.class));
    }

    @Test
    @DisplayName("getStudyYearHome with archived true returns archived courses")
    public void testGetStudyYearHome_Archived() {
        StudyYear studyYear = StudyYear.builder()
                .id(1)
                .studyYearName(StudyYearName.YEAR_1)
                .build();

        Course archivedCourse = Course.builder()
                .id(2L)
                .name("Old Course")
                .slug("old-course")
                .abbreviation("OC")
                .archived(true)
                .creditPoints(5)
                .build();

        when(studyYearRepository.findByCommunitySlugAndStudyYearName("fmi-info-id", StudyYearName.YEAR_1))
                .thenReturn(Optional.of(studyYear));
        when(courseRepository.findAllByStudyYearIdWithFilters(eq(1), isNull(), eq(true), isNull(), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(archivedCourse), PageRequest.of(0, 12), 1));

        StudyYearHomeResponseDto result = studyYearService.getStudyYearHome(
                "fmi-info-id",
                StudyYearName.YEAR_1,
                null,
                null,
                true,
                PageRequest.of(0, 12)
        );

        assertNotNull(result);
        assertEquals(1, result.courses().content().size());
        assertTrue(result.courses().content().get(0).course().archived());

        verify(courseRepository).findAllByStudyYearIdWithFilters(eq(1), isNull(), eq(true), isNull(), any(Pageable.class));
    }

    @Test
    @DisplayName("getStudyYearHome throws 404 when study year does not exist")
    public void testGetStudyYearHome_NotFound() {
        when(studyYearRepository.findByCommunitySlugAndStudyYearName("fmi-info-id", StudyYearName.YEAR_4))
                .thenReturn(Optional.empty());

        assertThrows(ResponseStatusException.class, () ->
                studyYearService.getStudyYearHome("fmi-info-id", StudyYearName.YEAR_4, null, null, false, PageRequest.of(0, 12)));
    }

    @Test
    @DisplayName("getCommunityStudyYearMetrics returns list of StudyYearMetricsResponseDto")
    public void testGetCommunityStudyYearMetrics() {
        OffsetDateTime now = OffsetDateTime.now();
        List<StudyYearMetricsResponseDto> studyYears = List.of(
                new StudyYearMetricsResponseDto(1, StudyYearName.YEAR_1, now, 6, 0, 30),
                new StudyYearMetricsResponseDto(2, StudyYearName.YEAR_2, now, 6, 0, 30)
        );

        when(studyYearRepository.findStudyYearMetricsByCommunitySlug("fmi-info-id")).thenReturn(studyYears);

        List<StudyYearMetricsResponseDto> result = studyYearService.getCommunityStudyYearMetrics("fmi-info-id");

        assertNotNull(result);
        assertEquals(2, result.size());
        assertEquals(1, result.get(0).id());
        assertEquals(6, result.get(0).coursesCount());
        assertEquals(0, result.get(0).archivedCoursesCount());
        assertEquals(30, result.get(0).creditsCount());

        verify(studyYearRepository).findStudyYearMetricsByCommunitySlug("fmi-info-id");
    }

    @Test
    @DisplayName("getCommunityStudyYearIdentifiers returns list of StudyYearIdentifiersResponseDto")
    public void testGetCommunityStudyYearIdentifiers() {
        List<StudyYearIdentifiersResponseDto> identifiers = List.of(
                new StudyYearIdentifiersResponseDto(1, StudyYearName.YEAR_1),
                new StudyYearIdentifiersResponseDto(2, StudyYearName.YEAR_2)
        );

        when(studyYearRepository.findStudyYearIdentifiersByCommunitySlug("fmi-info-id")).thenReturn(identifiers);

        List<StudyYearIdentifiersResponseDto> result = studyYearService.getCommunityStudyYearIdentifiers("fmi-info-id");

        assertNotNull(result);
        assertEquals(2, result.size());
        assertEquals(1, result.get(0).id());
        assertEquals(StudyYearName.YEAR_1, result.get(0).studyYearName());

        verify(studyYearRepository).findStudyYearIdentifiersByCommunitySlug("fmi-info-id");
    }

    @Test
    @DisplayName("createStudyYear creates study year when community exists and study year name is unique")
    public void testCreateStudyYear_Success() {
        Community community = Community.builder().id(UUID.randomUUID()).slug("fmi-info-id").build();
        CreateStudyYearRequestDto dto = new CreateStudyYearRequestDto(StudyYearName.YEAR_1);

        when(communityRepository.findBySlug("fmi-info-id")).thenReturn(Optional.of(community));
        when(studyYearRepository.existsByCommunitySlugAndStudyYearName("fmi-info-id", StudyYearName.YEAR_1)).thenReturn(false);
        when(studyYearRepository.save(any(StudyYear.class))).thenAnswer(i -> {
            StudyYear sy = i.getArgument(0);
            sy.setId(1);
            return sy;
        });

        StudyYearResponseDto result = studyYearService.createStudyYear("fmi-info-id", dto);

        assertNotNull(result);
        assertEquals(1, result.id());
        assertEquals(StudyYearName.YEAR_1, result.name());
        verify(studyYearRepository).save(any(StudyYear.class));
    }

    @Test
    @DisplayName("createStudyYear throws 409 when study year already exists in community")
    public void testCreateStudyYear_Conflict() {
        Community community = Community.builder().id(UUID.randomUUID()).slug("fmi-info-id").build();
        CreateStudyYearRequestDto dto = new CreateStudyYearRequestDto(StudyYearName.YEAR_1);

        when(communityRepository.findBySlug("fmi-info-id")).thenReturn(Optional.of(community));
        when(studyYearRepository.existsByCommunitySlugAndStudyYearName("fmi-info-id", StudyYearName.YEAR_1)).thenReturn(true);

        assertThrows(ResponseStatusException.class, () -> studyYearService.createStudyYear("fmi-info-id", dto));
    }

    @Test
    @DisplayName("deleteStudyYear deletes study year when it exists")
    public void testDeleteStudyYear_Success() {
        StudyYear studyYear = StudyYear.builder().id(1).studyYearName(StudyYearName.YEAR_1).build();
        when(studyYearRepository.findByCommunitySlugAndStudyYearName("fmi-info-id", StudyYearName.YEAR_1))
                .thenReturn(Optional.of(studyYear));

        studyYearService.deleteStudyYear("fmi-info-id", StudyYearName.YEAR_1);

        verify(studyYearRepository).delete(studyYear);
    }

    @Test
    @DisplayName("getStudyYearHome with search and semester filters")
    public void testGetStudyYearHome_WithSearchAndSemester() {
        StudyYear studyYear = StudyYear.builder()
                .id(1)
                .studyYearName(StudyYearName.YEAR_1)
                .build();

        Course course = Course.builder()
                .id(1L)
                .name("Algoritmi")
                .slug("algoritmi")
                .abbreviation("ALG")
                .semester(1)
                .archived(false)
                .build();

        when(studyYearRepository.findByCommunitySlugAndStudyYearName("fmi-info-id", StudyYearName.YEAR_1))
                .thenReturn(Optional.of(studyYear));
        when(courseRepository.findAllByStudyYearIdWithFilters(eq(1), eq(1), eq(false), eq("algo"), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(course), PageRequest.of(0, 12), 1));

        StudyYearHomeResponseDto result = studyYearService.getStudyYearHome(
                "fmi-info-id",
                StudyYearName.YEAR_1,
                "  algo  ",
                1,
                false,
                PageRequest.of(0, 12)
        );

        assertNotNull(result);
        assertEquals(1, result.courses().content().size());
        assertEquals("Algoritmi", result.courses().content().get(0).course().name());

        verify(courseRepository).findAllByStudyYearIdWithFilters(eq(1), eq(1), eq(false), eq("algo"), any(Pageable.class));
    }

    @Test
    @DisplayName("deleteStudyYear throws 404 when study year does not exist")
    public void testDeleteStudyYear_NotFound() {
        when(studyYearRepository.findByCommunitySlugAndStudyYearName("fmi-info-id", StudyYearName.YEAR_1))
                .thenReturn(Optional.empty());

        assertThrows(ResponseStatusException.class, () -> studyYearService.deleteStudyYear("fmi-info-id", StudyYearName.YEAR_1));
    }
}
