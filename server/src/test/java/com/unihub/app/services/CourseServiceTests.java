package com.unihub.app.services;

import com.unihub.app.dto.community.content.CourseMaterialsResponseDto;
import com.unihub.app.entities.authentication.User;
import com.unihub.app.entities.community.content.*;
import com.unihub.app.entities.community.resources.Course;
import com.unihub.app.entities.community.resources.StudyYearName;
import com.unihub.app.mappers.community.ResourceContentMapper;
import com.unihub.app.repositories.community.content.FolderRepository;
import com.unihub.app.repositories.community.content.MaterialFileRepository;
import com.unihub.app.repositories.community.content.MaterialLinkRepository;
import com.unihub.app.repositories.community.resources.CourseRepository;
import com.unihub.app.services.community.resources.CourseService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.web.server.ResponseStatusException;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class CourseServiceTests {

    @Mock
    private CourseRepository courseRepository;

    @Mock
    private FolderRepository folderRepository;

    @Mock
    private MaterialFileRepository materialFileRepository;

    @Mock
    private MaterialLinkRepository materialLinkRepository;

    @Spy
    private ResourceContentMapper resourceContentMapper = new ResourceContentMapper();

    @InjectMocks
    private CourseService courseService;

    @Test
    @DisplayName("getMaterials at root level returns root folders, files, and links")
    public void testGetMaterials_Root_Success() {
        Course course = Course.builder().id(1).build();
        User owner = User.builder().id(UUID.randomUUID()).username("david").build();
        OffsetDateTime now = OffsetDateTime.now();

        Folder rootFolder = Folder.builder()
                .id(UUID.randomUUID())
                .name("Materiale")
                .owner(owner)
                .createdAt(now)
                .build();

        Resource fileResource = Resource.builder()
                .id(UUID.randomUUID())
                .title("Curs 1.pdf")
                .description("Intro")
                .type(ResourceType.MATERIAL_FILE)
                .owner(owner)
                .createdAt(now)
                .build();

        MaterialFile materialFile = MaterialFile.builder()
                .id(fileResource.getId())
                .resource(fileResource)
                .storageKey("key/curs1.pdf")
                .mediaType(MediaType.APPLICATION_PDF)
                .size(2048)
                .build();

        Resource linkResource = Resource.builder()
                .id(UUID.randomUUID())
                .title("Repo GitHub")
                .description("Source code")
                .type(ResourceType.MATERIAL_LINK)
                .owner(owner)
                .createdAt(now)
                .build();

        MaterialLink materialLink = MaterialLink.builder()
                .ID(linkResource.getId())
                .resource(linkResource)
                .url("https://github.com/test")
                .linkType(MaterialLinkType.GITHUB)
                .build();

        when(courseRepository.findByIdAndCommunitySlugAndStudyYearName(1, "fmi-info-id", StudyYearName.YEAR_1))
                .thenReturn(Optional.of(course));
        when(folderRepository.findRootFoldersByCourseId(1))
                .thenReturn(List.of(rootFolder));
        when(materialFileRepository.findRootFilesByCourseId(1))
                .thenReturn(List.of(materialFile));
        when(materialLinkRepository.findRootLinksByCourseId(1))
                .thenReturn(List.of(materialLink));

        CourseMaterialsResponseDto result = courseService.getMaterials(
                "fmi-info-id",
                StudyYearName.YEAR_1,
                1,
                null
        );

        assertNotNull(result);
        assertEquals(1, result.folders().size());
        assertEquals("Materiale", result.folders().get(0).name());
        assertEquals(1, result.files().size());
        assertEquals("Curs 1.pdf", result.files().get(0).title());
        assertEquals(1, result.links().size());
        assertEquals("Repo GitHub", result.links().get(0).title());
    }

    @Test
    @DisplayName("getMaterials in subfolder returns items inside folder")
    public void testGetMaterials_Subfolder_Success() {
        Course course = Course.builder().id(1).build();
        User owner = User.builder().id(UUID.randomUUID()).username("david").build();
        OffsetDateTime now = OffsetDateTime.now();
        UUID subFolderId = UUID.randomUUID();

        Folder childFolder = Folder.builder()
                .id(UUID.randomUUID())
                .name("Examene")
                .owner(owner)
                .createdAt(now)
                .build();

        when(courseRepository.findByIdAndCommunitySlugAndStudyYearName(1, "fmi-info-id", StudyYearName.YEAR_1))
                .thenReturn(Optional.of(course));
        when(folderRepository.existsByIdAndCourseId(subFolderId, 1))
                .thenReturn(true);
        when(folderRepository.findByCourseIdAndParentFolderId(1, subFolderId))
                .thenReturn(List.of(childFolder));
        when(materialFileRepository.findByCourseIdAndFolderId(1, subFolderId))
                .thenReturn(List.of());
        when(materialLinkRepository.findByCourseIdAndFolderId(1, subFolderId))
                .thenReturn(List.of());

        CourseMaterialsResponseDto result = courseService.getMaterials(
                "fmi-info-id",
                StudyYearName.YEAR_1,
                1,
                subFolderId
        );

        assertNotNull(result);
        assertEquals(1, result.folders().size());
        assertEquals("Examene", result.folders().get(0).name());
        assertEquals(0, result.files().size());
        assertEquals(0, result.links().size());
    }

    @Test
    @DisplayName("getMaterials throws 404 when course not found")
    public void testGetMaterials_CourseNotFound() {
        when(courseRepository.findByIdAndCommunitySlugAndStudyYearName(999, "fmi-info-id", StudyYearName.YEAR_1))
                .thenReturn(Optional.empty());

        assertThrows(ResponseStatusException.class, () ->
                courseService.getMaterials("fmi-info-id", StudyYearName.YEAR_1, 999, null));
    }

    @Test
    @DisplayName("getMaterials throws 404 when folder not found")
    public void testGetMaterials_FolderNotFound() {
        Course course = Course.builder().id(1).build();
        UUID folderId = UUID.randomUUID();

        when(courseRepository.findByIdAndCommunitySlugAndStudyYearName(1, "fmi-info-id", StudyYearName.YEAR_1))
                .thenReturn(Optional.of(course));
        when(folderRepository.existsByIdAndCourseId(folderId, 1))
                .thenReturn(false);

        assertThrows(ResponseStatusException.class, () ->
                courseService.getMaterials("fmi-info-id", StudyYearName.YEAR_1, 1, folderId));
    }
}
