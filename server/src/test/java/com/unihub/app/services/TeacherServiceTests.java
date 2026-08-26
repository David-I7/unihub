package com.unihub.app.services;

import com.unihub.app.dto.globalResources.TeacherWithCoursesDto;
import com.unihub.app.entities.community.resources.Community;
import com.unihub.app.entities.community.resources.Course;
import com.unihub.app.entities.community.resources.StudyYear;
import com.unihub.app.entities.globalResources.Teacher;
import com.unihub.app.mappers.GlobalResourceMapper;
import com.unihub.app.mappers.PageMapper;
import com.unihub.app.mappers.community.CommunityResourceMapper;
import com.unihub.app.repositories.globalResources.TeacherRepository;
import com.unihub.app.services.globalResources.TeacherService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class TeacherServiceTests {

    @Mock
    private TeacherRepository teacherRepository;

    @Spy
    private GlobalResourceMapper globalResourceMapper = new GlobalResourceMapper();

    @Spy
    private CommunityResourceMapper communityResourceMapper = new CommunityResourceMapper(new GlobalResourceMapper());

    @Spy
    private PageMapper pageMapper = new PageMapper();

    @InjectMocks
    private TeacherService teacherService;

    @Test
    @DisplayName("getCommunityTeachers filters courses to specified community only")
    public void testGetCommunityTeachers_Success() {
        Community comm1 = Community.builder().slug("fmi-info-id").name("FMI").build();
        Community comm2 = Community.builder().slug("other-comm").name("Other").build();

        StudyYear sy1 = StudyYear.builder().community(comm1).build();
        StudyYear sy2 = StudyYear.builder().community(comm2).build();

        Course c1 = Course.builder().id(1L).slug("asc").name("ASC").studyYear(sy1).build();
        Course c2 = Course.builder().id(2L).slug("math").name("Math").studyYear(sy2).build();

        Teacher teacher = Teacher.builder()
                .id(UUID.randomUUID())
                .firstName("Daniel")
                .lastName("Dragulici")
                .averageRating(4.5f)
                .ratingsCount(10)
                .createdAt(OffsetDateTime.now())
                .coursesTaught(List.of(c1, c2))
                .build();

        when(teacherRepository.findByCommunitySlugWithCourses("fmi-info-id"))
                .thenReturn(List.of(teacher));

        List<TeacherWithCoursesDto> result = teacherService.getCommunityTeachers("fmi-info-id");

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(1, result.get(0).courses().size());
        assertEquals("asc", result.get(0).courses().get(0).slug());
    }
}
