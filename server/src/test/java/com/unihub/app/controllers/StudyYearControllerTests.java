package com.unihub.app.controllers;

import com.unihub.app.dto.community.resources.response.CourseHomeResponseDto;
import com.unihub.app.dto.community.resources.response.CourseResponseDto;
import com.unihub.app.dto.community.resources.response.StudyYearHomeResponseDto;
import com.unihub.app.dto.community.resources.response.StudyYearResponseDto;
import com.unihub.app.dto.globalResources.TeacherResponseDto;
import com.unihub.app.entities.community.resources.StudyYearName;
import com.unihub.app.repositories.authentication.SessionRepository;
import com.unihub.app.repositories.authentication.UserIdentityRepository;
import com.unihub.app.repositories.authentication.UserRepository;
import com.unihub.app.repositories.authorization.PermissionRepository;
import com.unihub.app.repositories.authorization.RoleRepository;
import com.unihub.app.repositories.community.resources.CommunityMemberRepository;
import com.unihub.app.services.community.resources.StudyYearService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.server.ResponseStatusException;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.unihub.app.BaseIntegrationTest;

@AutoConfigureMockMvc
public class StudyYearControllerTests extends BaseIntegrationTest {

    private static final String BASE_URL = "/api/v1/communities/fmi-info-id/study-years";

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private StudyYearService studyYearService;

    @Test
    @DisplayName("""
            Given: valid community slug and study year name
            When: GET /api/v1/communities/{communitySlug}/study-years/{studyYearName}/home is called
            Then: 200 OK is returned with study year details, courses, and associated teachers
            """)
    public void testGetStudyYearCourses_Success() throws Exception {
        UUID teacherId = UUID.randomUUID();

        TeacherResponseDto teacherDto = TeacherResponseDto.builder()
                .id(teacherId)
                .firstName("Daniel")
                .lastName("Dragulici")
                .averageRating(4.5f)
                .ratingsCount(10)
                .createdAt(OffsetDateTime.now())
                .build();

        CourseResponseDto courseDto = CourseResponseDto.builder()
                .id(1L)
                .name("Arhitectura sistemelor de calcul")
                .slug("asc")
                .abbreviation("ASC")
                .semester(1)
                .creditPoints(5)
                .archived(false)
                .description("Course description")
                .build();

        CourseHomeResponseDto courseTeachersDto = CourseHomeResponseDto.builder()
                .course(courseDto)
                .teachers(List.of(teacherDto))
                .build();

        StudyYearHomeResponseDto responseDto = StudyYearHomeResponseDto.builder()
                .studyYear(new StudyYearResponseDto(1, StudyYearName.YEAR_1, OffsetDateTime.now()))
                .courses(List.of(courseTeachersDto))
                .build();

        when(studyYearService.getStudyYearHome("fmi-info-id", StudyYearName.YEAR_1, false)).thenReturn(responseDto);

        mockMvc.perform(get(BASE_URL + "/year-1/home")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.studyYear.id").value(1))
                .andExpect(jsonPath("$.studyYear.name").value("Year 1"))
                .andExpect(jsonPath("$.courses").isArray())
                .andExpect(jsonPath("$.courses[0].course.id").value(1))
                .andExpect(jsonPath("$.courses[0].course.name").value("Arhitectura sistemelor de calcul"))
                .andExpect(jsonPath("$.courses[0].course.slug").value("asc"))
                .andExpect(jsonPath("$.courses[0].course.abbreviation").value("ASC"))
                .andExpect(jsonPath("$.courses[0].course.semester").value(1))
                .andExpect(jsonPath("$.courses[0].course.creditPoints").value(5))
                .andExpect(jsonPath("$.courses[0].course.archived").value(false))
                .andExpect(jsonPath("$.courses[0].course.description").value("Course description"))
                .andExpect(jsonPath("$.courses[0].teachers").isArray())
                .andExpect(jsonPath("$.courses[0].teachers[0].id").value(teacherId.toString()))
                .andExpect(jsonPath("$.courses[0].teachers[0].firstName").value("Daniel"))
                .andExpect(jsonPath("$.courses[0].teachers[0].lastName").value("Dragulici"))
                .andExpect(jsonPath("$.courses[0].teachers[0].averageRating").value(4.5))
                .andExpect(jsonPath("$.courses[0].teachers[0].ratingsCount").value(10));
    }

    @Test
    @DisplayName("""
            Given: non-existent study year
            When: GET /api/v1/communities/{communitySlug}/study-years/{studyYearName}/home is called
            Then: 404 Not Found is returned
            """)
    public void testGetStudyYearCourses_NotFound() throws Exception {
        when(studyYearService.getStudyYearHome("fmi-info-id", StudyYearName.YEAR_4, false))
                .thenThrow(new ResponseStatusException(HttpStatus.NOT_FOUND, "Study year not found"));

        mockMvc.perform(get(BASE_URL + "/YEAR_4/home")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.detail").value("Study year not found"));
    }
}
