package com.unihub.app.services;

import com.unihub.app.dto.community.resources.StudyYearDetailResponseDto;
import com.unihub.app.dto.community.resources.StudyYearSummaryDto;
import com.unihub.app.entities.community.resources.Course;
import com.unihub.app.entities.community.resources.StudyYear;
import com.unihub.app.entities.community.resources.StudyYearName;
import com.unihub.app.entities.globalResources.Teacher;
import com.unihub.app.mappers.community.CourseMapper;
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
    private CourseMapper courseMapper = new CourseMapper();

    @InjectMocks
    private StudyYearService studyYearService;

    @Test
    @DisplayName("getStudyYearDetail returns study year with courses and teachers")
    public void testGetStudyYearDetail_Success() {
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
                .id(1)
                .name("Arhitectura sistemelor de calcul")
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
        when(courseRepository.findActiveByStudyYearIdWithTeachers(1))
                .thenReturn(List.of(course));

        StudyYearDetailResponseDto result = studyYearService.getStudyYearDetail("fmi-info-id", StudyYearName.YEAR_1, false);

        assertNotNull(result);
        assertEquals(1, result.id());
        assertEquals(StudyYearName.YEAR_1, result.studyYearName());
        assertEquals(1, result.courses().size());

        var courseDto = result.courses().get(0);
        assertEquals(1, courseDto.id());
        assertEquals("Arhitectura sistemelor de calcul", courseDto.name());
        assertEquals("ASC", courseDto.abbreviation());
        assertEquals(1, courseDto.semester());
        assertEquals(5, courseDto.creditPoints());
        assertFalse(courseDto.archived());
        assertEquals(1, courseDto.teachers().size());
        assertEquals("Daniel", courseDto.teachers().get(0).firstName());

        verify(studyYearRepository).findByCommunitySlugAndStudyYearName("fmi-info-id", StudyYearName.YEAR_1);
        verify(courseRepository).findActiveByStudyYearIdWithTeachers(1);
    }

    @Test
    @DisplayName("getStudyYearDetail with includeArchived true returns all courses")
    public void testGetStudyYearDetail_IncludeArchived() {
        StudyYear studyYear = StudyYear.builder()
                .id(1)
                .studyYearName(StudyYearName.YEAR_1)
                .build();

        Course activeCourse = Course.builder()
                .id(1)
                .name("ASC")
                .abbreviation("ASC")
                .archived(false)
                .creditPoints(5)
                .build();

        Course archivedCourse = Course.builder()
                .id(2)
                .name("Old Course")
                .abbreviation("OC")
                .archived(true)
                .creditPoints(5)
                .build();

        when(studyYearRepository.findByCommunitySlugAndStudyYearName("fmi-info-id", StudyYearName.YEAR_1))
                .thenReturn(Optional.of(studyYear));
        when(courseRepository.findAllByStudyYearIdWithTeachers(1))
                .thenReturn(List.of(activeCourse, archivedCourse));

        StudyYearDetailResponseDto result = studyYearService.getStudyYearDetail("fmi-info-id", StudyYearName.YEAR_1, true);

        assertNotNull(result);
        assertEquals(2, result.courses().size());
        assertFalse(result.courses().get(0).archived());
        assertTrue(result.courses().get(1).archived());

        verify(courseRepository).findAllByStudyYearIdWithTeachers(1);
    }

    @Test
    @DisplayName("getStudyYearDetail throws 404 when study year does not exist")
    public void testGetStudyYearDetail_NotFound() {
        when(studyYearRepository.findByCommunitySlugAndStudyYearName("fmi-info-id", StudyYearName.YEAR_4))
                .thenReturn(Optional.empty());

        assertThrows(ResponseStatusException.class, () ->
                studyYearService.getStudyYearDetail("fmi-info-id", StudyYearName.YEAR_4, false));
    }

    @Test
    @DisplayName("getStudyYearSummary returns list of StudyYearSummaryDto")
    public void testGetStudyYearSummary() {
        List<StudyYearSummaryDto> summaries = List.of(
                new StudyYearSummaryDto(1, StudyYearName.YEAR_1, 6, 0, 30),
                new StudyYearSummaryDto(2, StudyYearName.YEAR_2, 6, 0, 30)
        );

        when(studyYearRepository.findSummariesByCommunitySlug("fmi-info-id")).thenReturn(summaries);

        List<StudyYearSummaryDto> result = studyYearService.getStudyYearSummary("fmi-info-id");

        assertNotNull(result);
        assertEquals(2, result.size());
        assertEquals(1, result.get(0).id());
        assertEquals(6, result.get(0).coursesCount());

        verify(studyYearRepository).findSummariesByCommunitySlug("fmi-info-id");
    }
}
