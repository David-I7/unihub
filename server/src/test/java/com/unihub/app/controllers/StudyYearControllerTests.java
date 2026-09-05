package com.unihub.app.controllers;

import com.unihub.app.domain.RoleType;
import com.unihub.app.dto.PageDto;
import com.unihub.app.dto.UserDto;
import org.springframework.data.domain.Pageable;
import com.unihub.app.dto.community.resources.request.CreateStudyYearRequestDto;
import com.unihub.app.dto.community.resources.response.CourseCardResponseDto;
import com.unihub.app.dto.community.resources.response.StudyYearHomeResponseDto;
import com.unihub.app.dto.community.resources.response.StudyYearResponseDto;
import com.unihub.app.dto.community.resources.response.TeacherSummaryResponseDto;
import com.unihub.app.entities.community.resources.StudyYearName;
import com.unihub.app.security.JwtAuthentication;
import com.unihub.app.services.authorization.AuthorizationService;
import com.unihub.app.services.community.resources.StudyYearService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.server.ResponseStatusException;
import tools.jackson.databind.ObjectMapper;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.unihub.app.BaseIntegrationTest;

@AutoConfigureMockMvc
public class StudyYearControllerTests extends BaseIntegrationTest {

    private static final String BASE_URL = "/api/v1/communities/fmi-info-id/study-years";

    @Autowired
    private MockMvc mockMvc;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @MockitoBean
    private StudyYearService studyYearService;

    @MockitoBean
    private AuthorizationService authorizationService;

    private UUID userId;
    private UserDto userDto;

    @BeforeEach
    public void setUp() {
        userId = UUID.randomUUID();
        userDto = new UserDto(userId, "david@example.com", "david", false, RoleType.ADMIN);
        JwtAuthentication auth = new JwtAuthentication(userDto);
        SecurityContextHolder.getContext().setAuthentication(auth);
        when(authorizationService.safeRequireAuthentication()).thenReturn(auth);
        when(authorizationService.hasGlobalPermission(any())).thenReturn(true);
        when(authorizationService.hasCommunityPermission(any(), any(), any())).thenReturn(true);
    }

    @Test
    @DisplayName("POST /study-years creates a study year")
    public void testCreateStudyYear_Success() throws Exception {
        CreateStudyYearRequestDto requestDto = new CreateStudyYearRequestDto(StudyYearName.YEAR_1);
        StudyYearResponseDto responseDto = new StudyYearResponseDto(1, StudyYearName.YEAR_1, OffsetDateTime.now());

        when(studyYearService.createStudyYear(eq("fmi-info-id"), any(CreateStudyYearRequestDto.class))).thenReturn(responseDto);

        mockMvc.perform(post(BASE_URL)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestDto)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.name").value("Year 1"));
    }

    @Test
    @DisplayName("DELETE /study-years/{studyYearName} deletes a study year")
    public void testDeleteStudyYear_Success() throws Exception {
        doNothing().when(studyYearService).deleteStudyYear("fmi-info-id", StudyYearName.YEAR_1);

        mockMvc.perform(delete(BASE_URL + "/YEAR_1")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNoContent());

        verify(studyYearService).deleteStudyYear("fmi-info-id", StudyYearName.YEAR_1);
    }

    @Test
    @DisplayName("""
            Given: valid community slug and study year name
            When: GET /api/v1/communities/{communitySlug}/study-years/{studyYearName}/home is called
            Then: 200 OK is returned with study year details, courses, and associated teachers
            """)
    public void testGetStudyYearCourses_Success() throws Exception {
        UUID teacherId = UUID.randomUUID();

        TeacherSummaryResponseDto teacherDto = new TeacherSummaryResponseDto(
                teacherId,
                "Daniel",
                "Dragulici"
        );

        CourseCardResponseDto courseCardDto = CourseCardResponseDto.builder()
                .id(1L)
                .name("Arhitectura sistemelor de calcul")
                .slug("asc")
                .abbreviation("ASC")
                .semester(1)
                .creditPoints(5)
                .archived(false)
                .description("Course description")
                .teachers(List.of(teacherDto))
                .build();

        PageDto<CourseCardResponseDto> coursePageDto = PageDto.<CourseCardResponseDto>builder()
                .content(List.of(courseCardDto))
                .number(0)
                .size(12)
                .totalElements(1)
                .totalPages(1)
                .first(true)
                .last(true)
                .build();

        StudyYearHomeResponseDto responseDto = StudyYearHomeResponseDto.builder()
                .studyYear(new StudyYearResponseDto(1, StudyYearName.YEAR_1, OffsetDateTime.now()))
                .courses(coursePageDto)
                .build();

        when(studyYearService.getStudyYearHome(eq("fmi-info-id"), eq(StudyYearName.YEAR_1), any(), any(), eq(false), any(Pageable.class)))
                .thenReturn(responseDto);

        mockMvc.perform(get(BASE_URL + "/year-1/home")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.studyYear.id").value(1))
                .andExpect(jsonPath("$.studyYear.name").value("Year 1"))
                .andExpect(jsonPath("$.courses.content").isArray())
                .andExpect(jsonPath("$.courses.content[0].id").value(1))
                .andExpect(jsonPath("$.courses.content[0].name").value("Arhitectura sistemelor de calcul"))
                .andExpect(jsonPath("$.courses.content[0].slug").value("asc"))
                .andExpect(jsonPath("$.courses.content[0].abbreviation").value("ASC"))
                .andExpect(jsonPath("$.courses.content[0].semester").value(1))
                .andExpect(jsonPath("$.courses.content[0].creditPoints").value(5))
                .andExpect(jsonPath("$.courses.content[0].archived").value(false))
                .andExpect(jsonPath("$.courses.content[0].description").value("Course description"))
                .andExpect(jsonPath("$.courses.content[0].teachers").isArray())
                .andExpect(jsonPath("$.courses.content[0].teachers[0].id").value(teacherId.toString()))
                .andExpect(jsonPath("$.courses.content[0].teachers[0].firstName").value("Daniel"))
                .andExpect(jsonPath("$.courses.content[0].teachers[0].lastName").value("Dragulici"));
    }

    @Test
    @DisplayName("""
            Given: non-existent study year
            When: GET /api/v1/communities/{communitySlug}/study-years/{studyYearName}/home is called
            Then: 404 Not Found is returned
            """)
    public void testGetStudyYearCourses_NotFound() throws Exception {
        when(studyYearService.getStudyYearHome(eq("fmi-info-id"), eq(StudyYearName.YEAR_4), any(), any(), eq(false), any(Pageable.class)))
                .thenThrow(new ResponseStatusException(HttpStatus.NOT_FOUND, "Study year not found"));

        mockMvc.perform(get(BASE_URL + "/YEAR_4/home")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.detail").value("Study year not found"));
    }
}
