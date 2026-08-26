package com.unihub.app.controllers;

import com.unihub.app.config.AppConfig;
import com.unihub.app.config.SecurityConfig;
import com.unihub.app.config.SessionProperties;
import com.unihub.app.controllers.community.resources.CourseController;
import com.unihub.app.dto.PageDto;
import com.unihub.app.dto.community.OwnerDto;
import com.unihub.app.dto.community.content.*;
import com.unihub.app.entities.community.content.LectureLocation;
import com.unihub.app.entities.community.content.MaterialLinkType;
import com.unihub.app.entities.community.resources.StudyYearName;
import com.unihub.app.exceptions.GlobalExceptionHandler;
import com.unihub.app.mappers.ObjectErrorMapper;
import com.unihub.app.mappers.PageMapper;
import com.unihub.app.mappers.UserMapper;
import com.unihub.app.repositories.authentication.SessionRepository;
import com.unihub.app.repositories.authentication.UserIdentityRepository;
import com.unihub.app.repositories.authentication.UserRepository;
import com.unihub.app.repositories.authorization.RoleRepository;
import com.unihub.app.security.JwtSessionManagementFilter;
import com.unihub.app.security.OAuth2AuthenticationFailureHandler;
import com.unihub.app.security.OAuth2AuthenticationSuccessHandler;
import com.unihub.app.security.OAuth2ProviderUserInfoExtractor;
import com.unihub.app.services.JwtService;
import com.unihub.app.services.authentication.SessionService;
import com.unihub.app.services.authentication.UserIdentityService;
import com.unihub.app.services.authentication.UserService;
import com.unihub.app.services.authorization.RoleService;
import com.unihub.app.services.community.content.AssignmentService;
import com.unihub.app.services.community.content.ExamService;
import com.unihub.app.services.community.content.LectureService;
import com.unihub.app.services.community.resources.CourseService;
import com.unihub.app.utils.ProblemDetailUtil;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import com.unihub.app.dto.community.resources.CourseResponseDto;
import com.unihub.app.dto.globalResources.TeacherResponseDto;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(CourseController.class)
@EnableConfigurationProperties(SessionProperties.class)
@Import({
        AppConfig.class,
        SecurityConfig.class,
        OAuth2AuthenticationFailureHandler.class,
        OAuth2AuthenticationSuccessHandler.class,
        OAuth2ProviderUserInfoExtractor.class,
        RoleService.class,
        JwtSessionManagementFilter.class,
        SessionService.class,
        UserService.class,
        JwtService.class,
        UserMapper.class,
        UserIdentityService.class,
        PageMapper.class,
        ObjectErrorMapper.class,
        ProblemDetailUtil.class,
        GlobalExceptionHandler.class,
        com.unihub.app.utils.StringToStudyYearNameConverter.class
})
public class CourseControllerTests {

    private static final String BASE_URL = "/api/v1/communities/fmi-info-id/study-years/year-1/courses/asc";

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private CourseService courseService;

    @MockitoBean
    private ExamService examService;

    @MockitoBean
    private LectureService lectureService;

    @MockitoBean
    private AssignmentService assignmentService;

    @MockitoBean
    private UserRepository userRepository;

    @MockitoBean
    private SessionRepository sessionRepository;

    @MockitoBean
    private UserIdentityRepository userIdentityRepository;

    @MockitoBean
    private RoleRepository roleRepository;

    // =========================================================================
    // GET / (getCourse)
    // =========================================================================

    @Test
    @DisplayName("""
            Given: course exists
            When: GET .../courses/asc is called
            Then: 200 OK is returned with CourseResponseDto
            """)
    public void testGetCourse_Success() throws Exception {
        CourseResponseDto courseResponse = CourseResponseDto.builder()
                .id(1L)
                .name("Arhitectura sistemelor de calcul")
                .slug("asc")
                .abbreviation("ASC")
                .semester(1)
                .creditPoints(5)
                .archived(false)
                .description("Course description")
                .build();

        when(courseService.findBySlug("fmi-info-id", StudyYearName.YEAR_1, "asc"))
                .thenReturn(courseResponse);

        mockMvc.perform(get(BASE_URL)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.name").value("Arhitectura sistemelor de calcul"))
                .andExpect(jsonPath("$.slug").value("asc"))
                .andExpect(jsonPath("$.abbreviation").value("ASC"))
                .andExpect(jsonPath("$.semester").value(1))
                .andExpect(jsonPath("$.creditPoints").value(5))
                .andExpect(jsonPath("$.archived").value(false))
                .andExpect(jsonPath("$.description").value("Course description"));
    }

    // =========================================================================
    // GET /teachers (getCourseTeachers)
    // =========================================================================

    @Test
    @DisplayName("""
            Given: course exists with teachers
            When: GET .../courses/asc/teachers is called
            Then: 200 OK is returned with teachers list
            """)
    public void testGetCourseTeachers_Success() throws Exception {
        UUID teacherId = UUID.randomUUID();
        TeacherResponseDto teacherDto = TeacherResponseDto.builder()
                .id(teacherId)
                .firstName("Daniel")
                .lastName("Dragulici")
                .averageRating(4.8f)
                .ratingsCount(15)
                .createdAt(OffsetDateTime.now())
                .build();

        when(courseService.findCourseTeachers("fmi-info-id", StudyYearName.YEAR_1, "asc"))
                .thenReturn(List.of(teacherDto));

        mockMvc.perform(get(BASE_URL + "/teachers")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].id").value(teacherId.toString()))
                .andExpect(jsonPath("$[0].firstName").value("Daniel"))
                .andExpect(jsonPath("$[0].lastName").value("Dragulici"))
                .andExpect(jsonPath("$[0].averageRating").value(4.8))
                .andExpect(jsonPath("$[0].ratingsCount").value(15));
    }

    // =========================================================================
    // GET /materials
    // =========================================================================

    @Test
    @DisplayName("""
            Given: course exists with root folders, files, and links
            When: GET .../materials is called without folderId
            Then: 200 OK is returned with root contents
            """)
    public void testGetMaterials_Root_Success() throws Exception {
        UUID folderId = UUID.randomUUID();
        UUID fileId = UUID.randomUUID();
        UUID linkId = UUID.randomUUID();
        UUID ownerId = UUID.randomUUID();
        OffsetDateTime now = OffsetDateTime.now();

        FolderSummaryDto folderDto = FolderSummaryDto.builder()
                .id(folderId)
                .name("Materiale")
                .parentFolderId(null)
                .createdAt(now)
                .owner(new OwnerDto(ownerId, "david"))
                .build();

        MaterialFileDto fileDto = MaterialFileDto.builder()
                .id(fileId)
                .title("Curs 1.pdf")
                .description("Intro slides")
                .storageKey("key/curs1.pdf")
                .mediaType("application/pdf")
                .size(1024)
                .createdAt(now)
                .owner(new OwnerDto(ownerId, "david"))
                .build();

        MaterialLinkDto linkDto = MaterialLinkDto.builder()
                .id(linkId)
                .title("Repo GitHub")
                .description("Course repo")
                .url("https://github.com/test/repo")
                .linkType(MaterialLinkType.GITHUB)
                .createdAt(now)
                .owner(new OwnerDto(ownerId, "david"))
                .build();

        CourseMaterialsResponseDto responseDto = CourseMaterialsResponseDto.builder()
                .folders(List.of(folderDto))
                .files(List.of(fileDto))
                .links(List.of(linkDto))
                .build();

        when(courseService.getMaterials("fmi-info-id", StudyYearName.YEAR_1, "asc", null))
                .thenReturn(responseDto);

        mockMvc.perform(get(BASE_URL + "/materials")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.folders").isArray())
                .andExpect(jsonPath("$.folders[0].id").value(folderId.toString()))
                .andExpect(jsonPath("$.folders[0].name").value("Materiale"))
                .andExpect(jsonPath("$.files").isArray())
                .andExpect(jsonPath("$.files[0].id").value(fileId.toString()))
                .andExpect(jsonPath("$.files[0].title").value("Curs 1.pdf"))
                .andExpect(jsonPath("$.files[0].mediaType").value("application/pdf"))
                .andExpect(jsonPath("$.links").isArray())
                .andExpect(jsonPath("$.links[0].id").value(linkId.toString()))
                .andExpect(jsonPath("$.links[0].url").value("https://github.com/test/repo"))
                .andExpect(jsonPath("$.links[0].linkType").value("GITHUB"));
    }

    @Test
    @DisplayName("""
            Given: course exists with subfolder items
            When: GET .../materials?folderId=... is called
            Then: 200 OK is returned with items inside folder
            """)
    public void testGetMaterials_Subfolder_Success() throws Exception {
        UUID subFolderId = UUID.randomUUID();
        UUID childFolderId = UUID.randomUUID();
        UUID ownerId = UUID.randomUUID();
        OffsetDateTime now = OffsetDateTime.now();

        FolderSummaryDto childFolderDto = FolderSummaryDto.builder()
                .id(childFolderId)
                .name("Sub-item")
                .parentFolderId(subFolderId)
                .createdAt(now)
                .owner(new OwnerDto(ownerId, "david"))
                .build();

        CourseMaterialsResponseDto responseDto = CourseMaterialsResponseDto.builder()
                .folders(List.of(childFolderDto))
                .files(List.of())
                .links(List.of())
                .build();

        when(courseService.getMaterials("fmi-info-id", StudyYearName.YEAR_1, "asc", subFolderId))
                .thenReturn(responseDto);

        mockMvc.perform(get(BASE_URL + "/materials")
                        .param("folderId", subFolderId.toString())
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.folders").isArray())
                .andExpect(jsonPath("$.folders[0].id").value(childFolderId.toString()))
                .andExpect(jsonPath("$.folders[0].name").value("Sub-item"));
    }

    // =========================================================================
    // GET /exams
    // =========================================================================

    @Test
    @DisplayName("""
            Given: course exists with exams
            When: GET .../exams is called
            Then: 200 OK is returned with paginated exams
            """)
    public void testGetExams_Success() throws Exception {
        UUID examId = UUID.randomUUID();
        UUID ownerId = UUID.randomUUID();
        OffsetDateTime scheduledDate = OffsetDateTime.now().plusDays(30);
        OffsetDateTime createdAt = OffsetDateTime.now();

        ExamResponseDto examDto = ExamResponseDto.builder()
                .id(examId)
                .title("Examen scris")
                .description("Examen de iarna")
                .scheduledDate(scheduledDate)
                .estimatedDurationMinutes(120)
                .createdAt(createdAt)
                .owner(new OwnerDto(ownerId, "david"))
                .build();

        PageDto<ExamResponseDto> pageDto = PageDto.<ExamResponseDto>builder()
                .content(List.of(examDto))
                .number(0)
                .size(10)
                .totalElements(1)
                .totalPages(1)
                .first(true)
                .last(true)
                .build();

        when(examService.getExamsByCourse(eq("fmi-info-id"), eq(StudyYearName.YEAR_1), eq("asc"), any(Pageable.class)))
                .thenReturn(pageDto);

        mockMvc.perform(get(BASE_URL + "/exams")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].id").value(examId.toString()))
                .andExpect(jsonPath("$.content[0].title").value("Examen scris"))
                .andExpect(jsonPath("$.content[0].estimatedDurationMinutes").value(120));
    }

    // =========================================================================
    // GET /lectures
    // =========================================================================

    @Test
    @DisplayName("""
            Given: course exists with lectures
            When: GET .../lectures is called
            Then: 200 OK is returned with paginated lectures
            """)
    public void testGetLectures_Success() throws Exception {
        UUID lectureId = UUID.randomUUID();
        UUID ownerId = UUID.randomUUID();
        OffsetDateTime startTime = OffsetDateTime.now().plusDays(1);
        OffsetDateTime endTime = startTime.plusHours(2);
        OffsetDateTime createdAt = OffsetDateTime.now();

        LectureResponseDto lectureDto = LectureResponseDto.builder()
                .id(lectureId)
                .title("Curs 1 - Introducere")
                .description("Prezentare introductiva")
                .startTime(startTime)
                .endTime(endTime)
                .location(LectureLocation.ONLINE)
                .createdAt(createdAt)
                .owner(new OwnerDto(ownerId, "david"))
                .build();

        PageDto<LectureResponseDto> pageDto = PageDto.<LectureResponseDto>builder()
                .content(List.of(lectureDto))
                .number(0)
                .size(10)
                .totalElements(1)
                .totalPages(1)
                .first(true)
                .last(true)
                .build();

        when(lectureService.getLecturesByCourse(eq("fmi-info-id"), eq(StudyYearName.YEAR_1), eq("asc"), any(Pageable.class)))
                .thenReturn(pageDto);

        mockMvc.perform(get(BASE_URL + "/lectures")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].id").value(lectureId.toString()))
                .andExpect(jsonPath("$.content[0].title").value("Curs 1 - Introducere"))
                .andExpect(jsonPath("$.content[0].location").value("ONLINE"));
    }

    // =========================================================================
    // GET /assignments
    // =========================================================================

    @Test
    @DisplayName("""
            Given: course exists with assignments
            When: GET .../assignments is called
            Then: 200 OK is returned with paginated assignments
            """)
    public void testGetAssignments_Success() throws Exception {
        UUID assignmentId = UUID.randomUUID();
        UUID ownerId = UUID.randomUUID();
        OffsetDateTime dueDate = OffsetDateTime.now().plusDays(14);
        OffsetDateTime createdAt = OffsetDateTime.now();

        AssignmentResponseDto assignmentDto = AssignmentResponseDto.builder()
                .id(assignmentId)
                .title("Proiect MIPS")
                .description("Proiect semestrial")
                .dueDate(dueDate)
                .estimatedDurationMinutes(300)
                .createdAt(createdAt)
                .owner(new OwnerDto(ownerId, "david"))
                .build();

        PageDto<AssignmentResponseDto> pageDto = PageDto.<AssignmentResponseDto>builder()
                .content(List.of(assignmentDto))
                .number(0)
                .size(10)
                .totalElements(1)
                .totalPages(1)
                .first(true)
                .last(true)
                .build();

        when(assignmentService.getAssignmentsByCourse(eq("fmi-info-id"), eq(StudyYearName.YEAR_1), eq("asc"), any(Pageable.class)))
                .thenReturn(pageDto);

        mockMvc.perform(get(BASE_URL + "/assignments")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].id").value(assignmentId.toString()))
                .andExpect(jsonPath("$.content[0].title").value("Proiect MIPS"))
                .andExpect(jsonPath("$.content[0].estimatedDurationMinutes").value(300));
    }
}
