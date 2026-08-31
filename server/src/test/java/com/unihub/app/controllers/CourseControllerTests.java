package com.unihub.app.controllers;

import com.unihub.app.BaseIntegrationTest;
import com.unihub.app.domain.RoleType;
import com.unihub.app.dto.PageDto;
import com.unihub.app.dto.UserDto;
import com.unihub.app.dto.community.OwnerDto;
import com.unihub.app.dto.community.content.request.CreateFolderRequestDto;
import com.unihub.app.dto.community.content.request.CreateMaterialFileRequestDto;
import com.unihub.app.dto.community.content.request.CreateMaterialLinkRequestDto;
import com.unihub.app.dto.community.content.request.CreatePostRequestDto;
import com.unihub.app.dto.community.content.request.PresignedUploadUrlRequestDto;
import com.unihub.app.dto.community.content.response.CourseMaterialsResponseDto;
import com.unihub.app.dto.community.content.response.FolderSummaryDto;
import com.unihub.app.dto.community.content.response.MaterialFileDto;
import com.unihub.app.dto.community.content.response.MaterialLinkDto;
import com.unihub.app.dto.community.content.response.PostResponseDto;
import com.unihub.app.dto.community.content.response.PresignedUploadUrlResponseDto;
import com.unihub.app.dto.community.resources.request.CreateCourseRequestDto;
import com.unihub.app.dto.community.resources.request.UpdateCourseRequestDto;
import com.unihub.app.dto.community.resources.response.CourseHomeResponseDto;
import com.unihub.app.dto.community.resources.response.CourseResponseDto;
import com.unihub.app.dto.community.resources.response.TeacherResponseDto;
import com.unihub.app.entities.community.content.CommunicationChannel;
import com.unihub.app.entities.community.content.MaterialLinkType;
import com.unihub.app.entities.community.resources.StudyYearName;
import com.unihub.app.security.JwtAuthentication;
import com.unihub.app.services.authorization.AuthorizationService;
import com.unihub.app.services.community.content.CoursePostService;
import com.unihub.app.services.community.content.FolderService;
import com.unihub.app.services.community.content.MaterialFileService;
import com.unihub.app.services.community.content.MaterialLinkService;
import com.unihub.app.services.community.resources.CourseService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import tools.jackson.databind.ObjectMapper;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@AutoConfigureMockMvc
public class CourseControllerTests extends BaseIntegrationTest {

    private static final String COURSES_BASE_URL = "/api/v1/communities/fmi-info-id/study-years/year-1/courses";
    private static final String COURSE_URL = "/api/v1/communities/fmi-info-id/study-years/year-1/courses/asc";

    @Autowired
    private MockMvc mockMvc;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @MockitoBean
    private CourseService courseService;

    @MockitoBean
    private CoursePostService coursePostService;

    @MockitoBean
    private FolderService folderService;

    @MockitoBean
    private MaterialFileService materialFileService;

    @MockitoBean
    private MaterialLinkService materialLinkService;

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

    // =========================================================================
    // POST / (createCourse)
    // =========================================================================

    @Test
    @DisplayName("POST .../courses creates a new course")
    public void testCreateCourse_Success() throws Exception {
        CreateCourseRequestDto requestDto = CreateCourseRequestDto.builder()
                .name("Arhitectura sistemelor de calcul")
                .slug("asc")
                .abbreviation("ASC")
                .semester(1)
                .creditPoints(5)
                .description("Course description")
                .build();

        CourseResponseDto responseDto = CourseResponseDto.builder()
                .id(1L)
                .name("Arhitectura sistemelor de calcul")
                .slug("asc")
                .abbreviation("ASC")
                .semester(1)
                .creditPoints(5)
                .archived(false)
                .description("Course description")
                .build();

        when(courseService.createCourse(eq("fmi-info-id"), eq(StudyYearName.YEAR_1), any(CreateCourseRequestDto.class)))
                .thenReturn(responseDto);

        mockMvc.perform(post(COURSES_BASE_URL)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestDto)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.name").value("Arhitectura sistemelor de calcul"))
                .andExpect(jsonPath("$.slug").value("asc"))
                .andExpect(jsonPath("$.abbreviation").value("ASC"))
                .andExpect(jsonPath("$.semester").value(1))
                .andExpect(jsonPath("$.creditPoints").value(5))
                .andExpect(jsonPath("$.archived").value(false));
    }

    // =========================================================================
    // PATCH /{courseSlug} (updateCourse)
    // =========================================================================

    @Test
    @DisplayName("PATCH .../courses/asc partially updates course")
    public void testUpdateCourse_Success() throws Exception {
        UpdateCourseRequestDto requestDto = UpdateCourseRequestDto.builder()
                .name("ASC Avansat")
                .creditPoints(6)
                .build();

        CourseResponseDto responseDto = CourseResponseDto.builder()
                .id(1L)
                .name("ASC Avansat")
                .slug("asc")
                .abbreviation("ASC")
                .semester(1)
                .creditPoints(6)
                .archived(false)
                .build();

        when(courseService.updateCourse(eq("fmi-info-id"), eq(StudyYearName.YEAR_1), eq("asc"), any(UpdateCourseRequestDto.class)))
                .thenReturn(responseDto);

        mockMvc.perform(patch(COURSE_URL)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestDto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.name").value("ASC Avansat"))
                .andExpect(jsonPath("$.creditPoints").value(6));
    }

    // =========================================================================
    // DELETE /{courseSlug} (deleteCourse)
    // =========================================================================

    @Test
    @DisplayName("DELETE .../courses/asc deletes course")
    public void testDeleteCourse_Success() throws Exception {
        mockMvc.perform(delete(COURSE_URL))
                .andExpect(status().isNoContent());

        verify(courseService).deleteCourse("fmi-info-id", StudyYearName.YEAR_1, "asc");
    }

    // =========================================================================
    // PATCH /{courseSlug}/archive (archiveCourse)
    // =========================================================================

    @Test
    @DisplayName("PATCH .../courses/asc/archive archives course")
    public void testArchiveCourse_Success() throws Exception {
        CourseResponseDto responseDto = CourseResponseDto.builder()
                .id(1L)
                .slug("asc")
                .archived(true)
                .build();

        when(courseService.archiveCourse("fmi-info-id", StudyYearName.YEAR_1, "asc", true))
                .thenReturn(responseDto);

        mockMvc.perform(patch(COURSE_URL + "/archive")
                        .param("archived", "true"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.archived").value(true));
    }

    // =========================================================================
    // POST & DELETE /{courseSlug}/teachers/{teacherId}
    // =========================================================================

    @Test
    @DisplayName("POST .../courses/asc/teachers/{teacherId} adds teacher to course")
    public void testAddTeacher_Success() throws Exception {
        UUID teacherId = UUID.randomUUID();
        TeacherResponseDto teacherDto = TeacherResponseDto.builder()
                .id(teacherId)
                .firstName("Daniel")
                .lastName("Dragulici")
                .build();

        CourseHomeResponseDto responseDto = CourseHomeResponseDto.builder()
                .course(CourseResponseDto.builder().id(1L).slug("asc").build())
                .teachers(List.of(teacherDto))
                .build();

        when(courseService.addTeacher("fmi-info-id", StudyYearName.YEAR_1, "asc", teacherId))
                .thenReturn(responseDto);

        mockMvc.perform(post(COURSE_URL + "/teachers/" + teacherId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.teachers[0].id").value(teacherId.toString()))
                .andExpect(jsonPath("$.teachers[0].firstName").value("Daniel"));
    }

    @Test
    @DisplayName("DELETE .../courses/asc/teachers/{teacherId} removes teacher from course")
    public void testRemoveTeacher_Success() throws Exception {
        UUID teacherId = UUID.randomUUID();
        CourseHomeResponseDto responseDto = CourseHomeResponseDto.builder()
                .course(CourseResponseDto.builder().id(1L).slug("asc").build())
                .teachers(List.of())
                .build();

        when(courseService.removeTeacher("fmi-info-id", StudyYearName.YEAR_1, "asc", teacherId))
                .thenReturn(responseDto);

        mockMvc.perform(delete(COURSE_URL + "/teachers/" + teacherId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.teachers").isEmpty());
    }

    // =========================================================================
    // GET /home (getCourseHome)
    // =========================================================================

    @Test
    @DisplayName("""
            Given: course exists
            When: GET .../courses/asc/home is called
            Then: 200 OK is returned with CourseHomeResponseDto
            """)
    public void testGetCourse_Success() throws Exception {
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

        TeacherResponseDto teacherDto = TeacherResponseDto.builder()
                .id(UUID.randomUUID())
                .firstName("Daniel")
                .lastName("Dragulici")
                .estimatedAge(42)
                .averageRating(4.8f)
                .ratingsCount(15)
                .createdAt(OffsetDateTime.now())
                .build();

        CourseHomeResponseDto courseResponse = CourseHomeResponseDto.builder()
                .course(courseDto)
                .teachers(List.of(teacherDto))
                .build();

        when(courseService.getCourseHome("fmi-info-id", StudyYearName.YEAR_1, "asc"))
                .thenReturn(courseResponse);

        mockMvc.perform(get(COURSE_URL + "/home")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.course.id").value(1))
                .andExpect(jsonPath("$.course.name").value("Arhitectura sistemelor de calcul"))
                .andExpect(jsonPath("$.course.slug").value("asc"))
                .andExpect(jsonPath("$.course.abbreviation").value("ASC"))
                .andExpect(jsonPath("$.course.semester").value(1))
                .andExpect(jsonPath("$.course.creditPoints").value(5))
                .andExpect(jsonPath("$.course.archived").value(false))
                .andExpect(jsonPath("$.course.description").value("Course description"))
                .andExpect(jsonPath("$.teachers[0].firstName").value("Daniel"));
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
                .owner(new OwnerDto(ownerId, "david", true))
                .build();

        MaterialFileDto fileDto = MaterialFileDto.builder()
                .id(fileId)
                .title("Curs 1.pdf")
                .description("Intro slides")
                .storageKey("key/curs1.pdf")
                .mediaType("application/pdf")
                .size(1024)
                .createdAt(now)
                .owner(new OwnerDto(ownerId, "david", true))
                .build();

        MaterialLinkDto linkDto = MaterialLinkDto.builder()
                .id(linkId)
                .title("Repo GitHub")
                .description("Course repo")
                .url("https://github.com/test/repo")
                .linkType(MaterialLinkType.GITHUB)
                .createdAt(now)
                .owner(new OwnerDto(ownerId, "david", true))
                .build();

        CourseMaterialsResponseDto responseDto = CourseMaterialsResponseDto.builder()
                .folders(List.of(folderDto))
                .files(List.of(fileDto))
                .links(List.of(linkDto))
                .build();

        when(courseService.getMaterials("fmi-info-id", StudyYearName.YEAR_1, "asc", null))
                .thenReturn(responseDto);

        mockMvc.perform(get(COURSE_URL + "/materials")
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
                .owner(new OwnerDto(ownerId, "david", true))
                .build();

        CourseMaterialsResponseDto responseDto = CourseMaterialsResponseDto.builder()
                .folders(List.of(childFolderDto))
                .files(List.of())
                .links(List.of())
                .build();

        when(courseService.getMaterials("fmi-info-id", StudyYearName.YEAR_1, "asc", subFolderId))
                .thenReturn(responseDto);

        mockMvc.perform(get(COURSE_URL + "/materials")
                        .param("folderId", subFolderId.toString())
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.folders").isArray())
                .andExpect(jsonPath("$.folders[0].id").value(childFolderId.toString()))
                .andExpect(jsonPath("$.folders[0].name").value("Sub-item"));
    }

    // =========================================================================
    // POST /folders
    // =========================================================================

    @Test
    @DisplayName("POST .../folders creates a folder in course")
    public void testCreateFolder_Success() throws Exception {
        UUID folderId = UUID.randomUUID();
        CreateFolderRequestDto requestDto = new CreateFolderRequestDto("New Folder", null);
        FolderSummaryDto responseDto = FolderSummaryDto.builder()
                .id(folderId)
                .name("New Folder")
                .createdAt(OffsetDateTime.now())
                .build();

        when(folderService.createFolder(eq("fmi-info-id"), eq(StudyYearName.YEAR_1), eq("asc"), any(), any(CreateFolderRequestDto.class)))
                .thenReturn(responseDto);

        mockMvc.perform(post(COURSE_URL + "/folders")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestDto)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(folderId.toString()))
                .andExpect(jsonPath("$.name").value("New Folder"));
    }

    // =========================================================================
    // POST /materials/upload-url
    // =========================================================================

    @Test
    @DisplayName("POST .../materials/upload-url generates presigned upload url")
    public void testRequestUploadUrl_Success() throws Exception {
        PresignedUploadUrlRequestDto requestDto = new PresignedUploadUrlRequestDto("slides.pdf", "application/pdf", 1024L);
        PresignedUploadUrlResponseDto responseDto = PresignedUploadUrlResponseDto.builder()
                .uploadUrl("http://localhost:8080/upload")
                .storageKey("key/slides.pdf")
                .build();

        when(materialFileService.requestPresignedUploadUrl(eq("fmi-info-id"), eq(StudyYearName.YEAR_1), eq("asc"), any(), any(PresignedUploadUrlRequestDto.class)))
                .thenReturn(responseDto);

        mockMvc.perform(post(COURSE_URL + "/materials/upload-url")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestDto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.uploadUrl").value("http://localhost:8080/upload"))
                .andExpect(jsonPath("$.storageKey").value("key/slides.pdf"));
    }

    // =========================================================================
    // POST /materials/files
    // =========================================================================

    @Test
    @DisplayName("POST .../materials/files creates a material file")
    public void testCreateMaterialFile_Success() throws Exception {
        UUID materialId = UUID.randomUUID();
        CreateMaterialFileRequestDto requestDto = new CreateMaterialFileRequestDto(
                "Slides", "Intro", null, "key/slides.pdf", "application/pdf", 1024L
        );
        MaterialFileDto responseDto = MaterialFileDto.builder()
                .id(materialId)
                .title("Slides")
                .mediaType("application/pdf")
                .size(1024L)
                .createdAt(OffsetDateTime.now())
                .build();

        when(materialFileService.createMaterialFile(eq("fmi-info-id"), eq(StudyYearName.YEAR_1), eq("asc"), any(), any(CreateMaterialFileRequestDto.class)))
                .thenReturn(responseDto);

        mockMvc.perform(post(COURSE_URL + "/materials/files")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestDto)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(materialId.toString()))
                .andExpect(jsonPath("$.title").value("Slides"));
    }

    // =========================================================================
    // POST /materials/links
    // =========================================================================

    @Test
    @DisplayName("POST .../materials/links creates a material link")
    public void testCreateMaterialLink_Success() throws Exception {
        UUID materialId = UUID.randomUUID();
        CreateMaterialLinkRequestDto requestDto = new CreateMaterialLinkRequestDto(
                "GitHub", "Repo", null, "https://github.com/test/repo", MaterialLinkType.GITHUB
        );
        MaterialLinkDto responseDto = MaterialLinkDto.builder()
                .id(materialId)
                .title("GitHub")
                .url("https://github.com/test/repo")
                .linkType(MaterialLinkType.GITHUB)
                .createdAt(OffsetDateTime.now())
                .build();

        when(materialLinkService.createMaterialLink(eq("fmi-info-id"), eq(StudyYearName.YEAR_1), eq("asc"), any(), any(CreateMaterialLinkRequestDto.class)))
                .thenReturn(responseDto);

        mockMvc.perform(post(COURSE_URL + "/materials/links")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestDto)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(materialId.toString()))
                .andExpect(jsonPath("$.title").value("GitHub"));
    }

    // =========================================================================
    // GET /posts
    // =========================================================================

    @Test
    @DisplayName("GET .../posts returns paginated course posts")
    public void testGetCoursePosts_Success() throws Exception {
        UUID postId = UUID.randomUUID();
        PostResponseDto postDto = PostResponseDto.builder()
                .id(postId)
                .title("Course Post Title")
                .description("Course Post Desc")
                .channel(CommunicationChannel.COURSE)
                .isLiked(false)
                .likesCount(0)
                .commentsCount(0)
                .build();

        PageDto<PostResponseDto> pageDto = PageDto.<PostResponseDto>builder()
                .content(List.of(postDto))
                .number(0)
                .size(10)
                .totalElements(1)
                .totalPages(1)
                .build();

        when(coursePostService.getCoursePosts(eq("fmi-info-id"), eq(StudyYearName.YEAR_1), eq("asc"), any(), any(Pageable.class)))
                .thenReturn(pageDto);

        mockMvc.perform(get(COURSE_URL + "/posts")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray())
                .andExpect(jsonPath("$.content[0].id").value(postId.toString()))
                .andExpect(jsonPath("$.content[0].title").value("Course Post Title"));
    }

    // =========================================================================
    // POST /posts
    // =========================================================================

    @Test
    @DisplayName("POST .../posts creates a course post")
    public void testCreateCoursePost_Success() throws Exception {
        UUID postId = UUID.randomUUID();
        CreatePostRequestDto requestDto = new CreatePostRequestDto("New Course Post", "Description text");
        PostResponseDto responseDto = PostResponseDto.builder()
                .id(postId)
                .title("New Course Post")
                .description("Description text")
                .channel(CommunicationChannel.COURSE)
                .build();

        when(coursePostService.createCoursePost(eq("fmi-info-id"), eq(StudyYearName.YEAR_1), eq("asc"), any(), any(CreatePostRequestDto.class)))
                .thenReturn(responseDto);

        mockMvc.perform(post(COURSE_URL + "/posts")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestDto)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(postId.toString()))
                .andExpect(jsonPath("$.title").value("New Course Post"));
    }
}
