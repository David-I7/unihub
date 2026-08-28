package com.unihub.app.services;

import com.unihub.app.dto.community.resources.response.StudyYearHomeResponseDto;
import com.unihub.app.dto.community.resources.response.StudyYearIdentifiersResponseDto;
import com.unihub.app.dto.community.resources.response.StudyYearMetricsResponseDto;
import com.unihub.app.entities.community.resources.Course;
import com.unihub.app.entities.community.resources.StudyYear;
import com.unihub.app.entities.community.resources.StudyYearName;
import com.unihub.app.entities.globalResources.Teacher;
import com.unihub.app.mappers.GlobalResourceMapper;
import com.unihub.app.mappers.community.CommunityResourceMapper;
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
import org.springframework.web.server.ResponseStatusException;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class StudyYearServiceTests {

    @Mock
    private StudyYearRepository studyYearRepository;

    @Mock
    private CourseRepository courseRepository;

    @Spy
    private GlobalResourceMapper globalResourceMapper = new GlobalResourceMapper();

    @Spy
    private CommunityResourceMapper communityMapper = new CommunityResourceMapper(new GlobalResourceMapper());

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
        when(courseRepository.findAllActiveByStudyYearIdWithTeachers(1))
                .thenReturn(List.of(course));

        StudyYearHomeResponseDto result = studyYearService.getStudyYearHome("fmi-info-id", StudyYearName.YEAR_1, false);

        assertNotNull(result);
        assertEquals(1, result.studyYear().id());
        assertEquals(StudyYearName.YEAR_1, result.studyYear().name());
        assertEquals(1, result.courses().size());

        var courseTeacherDto = result.courses().get(0);
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
        verify(courseRepository).findAllActiveByStudyYearIdWithTeachers(1);
    }

    @Test
    @DisplayName("getStudyYearHome with includeArchived true returns all courses")
    public void testGetStudyYearHome_IncludeArchived() {
        StudyYear studyYear = StudyYear.builder()
                .id(1)
                .studyYearName(StudyYearName.YEAR_1)
                .build();

        Course activeCourse = Course.builder()
                .id(1L)
                .name("ASC")
                .slug("asc")
                .abbreviation("ASC")
                .archived(false)
                .creditPoints(5)
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
        when(courseRepository.findAllByStudyYearIdWithTeachers(1))
                .thenReturn(List.of(activeCourse, archivedCourse));

        StudyYearHomeResponseDto result = studyYearService.getStudyYearHome("fmi-info-id", StudyYearName.YEAR_1, true);

        assertNotNull(result);
        assertEquals(2, result.courses().size());
        assertFalse(result.courses().get(0).course().archived());
        assertTrue(result.courses().get(1).course().archived());

        verify(courseRepository).findAllByStudyYearIdWithTeachers(1);
    }

    @Test
    @DisplayName("getStudyYearHome throws 404 when study year does not exist")
    public void testGetStudyYearHome_NotFound() {
        when(studyYearRepository.findByCommunitySlugAndStudyYearName("fmi-info-id", StudyYearName.YEAR_4))
                .thenReturn(Optional.empty());

        assertThrows(ResponseStatusException.class, () ->
                studyYearService.getStudyYearHome("fmi-info-id", StudyYearName.YEAR_4, false));
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
}
