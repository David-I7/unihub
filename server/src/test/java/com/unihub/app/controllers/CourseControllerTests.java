package com.unihub.app.controllers;

import com.unihub.app.dto.community.OwnerDto;
import com.unihub.app.dto.community.content.response.CourseMaterialsResponseDto;
import com.unihub.app.dto.community.content.response.FolderSummaryDto;
import com.unihub.app.dto.community.content.response.MaterialFileDto;
import com.unihub.app.dto.community.content.response.MaterialLinkDto;
import com.unihub.app.dto.community.resources.response.CourseResponseDto;
import com.unihub.app.dto.community.resources.response.CourseHomeResponseDto;
import com.unihub.app.dto.globalResources.TeacherResponseDto;
import com.unihub.app.entities.community.content.MaterialLinkType;
import com.unihub.app.entities.community.resources.StudyYearName;
import com.unihub.app.repositories.authentication.SessionRepository;
import com.unihub.app.repositories.authentication.UserIdentityRepository;
import com.unihub.app.repositories.authentication.UserRepository;
import com.unihub.app.repositories.authorization.PermissionRepository;
import com.unihub.app.repositories.authorization.RoleRepository;
import com.unihub.app.repositories.community.resources.CommunityMemberRepository;
import com.unihub.app.services.community.resources.CourseService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.unihub.app.BaseIntegrationTest;

@AutoConfigureMockMvc
public class CourseControllerTests extends BaseIntegrationTest {

    private static final String BASE_URL = "/api/v1/communities/fmi-info-id/study-years/year-1/courses/asc";

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private CourseService courseService;

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

        TeacherResponseDto teacherDto = new TeacherResponseDto(UUID.randomUUID(), "Daniel", "Dragulici", 4.8f, 15, OffsetDateTime.now());

        CourseHomeResponseDto courseResponse = CourseHomeResponseDto.builder()
                .course(courseDto)
                .teachers(List.of(teacherDto))
                .build();

        when(courseService.getCourseHome("fmi-info-id", StudyYearName.YEAR_1, "asc"))
                .thenReturn(courseResponse);

        mockMvc.perform(get(BASE_URL + "/home")
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
}
