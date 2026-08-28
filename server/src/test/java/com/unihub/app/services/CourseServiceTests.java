package com.unihub.app.services;

import com.unihub.app.dto.community.content.response.CourseMaterialsResponseDto;
import com.unihub.app.dto.community.resources.response.CourseResponseDto;
import com.unihub.app.dto.community.resources.response.CourseHomeResponseDto;
import com.unihub.app.entities.authentication.User;
import com.unihub.app.entities.community.content.*;
import com.unihub.app.entities.community.resources.Course;
import com.unihub.app.entities.community.resources.StudyYearName;
import com.unihub.app.entities.globalResources.Teacher;
import com.unihub.app.mappers.GlobalResourceMapper;
import com.unihub.app.mappers.community.CommunityContentMapper;
import com.unihub.app.mappers.community.CommunityResourceMapper;
import com.unihub.app.repositories.community.content.FolderRepository;
import com.unihub.app.repositories.community.content.ResourceRepository;
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
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class CourseServiceTests {

    @Mock
    private CourseRepository courseRepository;

    @Mock
    private FolderRepository folderRepository;

    @Mock
    private ResourceRepository resourceRepository;

    @Spy
    private CommunityContentMapper contentMapper = new CommunityContentMapper();

    @Spy
    private GlobalResourceMapper globalResourceMapper = new GlobalResourceMapper();

    @Spy
    private CommunityResourceMapper resourceMapper = new CommunityResourceMapper(new GlobalResourceMapper());

    @InjectMocks
    private CourseService courseService;

    @Test
    @DisplayName("getMaterials at root level returns root folders, files, and links")
    public void testGetMaterials_Root_Success() {
        Course course = Course.builder().id(1L).slug("asc").build();
        User owner = User.builder().id(UUID.randomUUID()).username("david").build();
        OffsetDateTime now = OffsetDateTime.now();

        Folder rootFolder = Folder.builder()
                .id(UUID.randomUUID())
                .name("Materiale")
                .owner(owner)
                .createdAt(now)
                .build();

        MaterialFile materialFile = MaterialFile.builder()
                .id(UUID.randomUUID())
                .title("Curs 1.pdf")
                .description("Intro")
                .owner(owner)
                .storageKey("key/curs1.pdf")
                .mediaType(MediaType.APPLICATION_PDF)
                .size(2048)
                .createdAt(now)
                .build();

        MaterialLink materialLink = MaterialLink.builder()
                .id(UUID.randomUUID())
                .title("Repo GitHub")
                .description("Source code")
                .owner(owner)
                .url("https://github.com/test")
                .linkType(MaterialLinkType.GITHUB)
                .createdAt(now)
                .build();

        when(courseRepository.findBySlugAndCommunitySlugAndStudyYearName("asc", "fmi-info-id", StudyYearName.YEAR_1))
                .thenReturn(Optional.of(course));
        when(folderRepository.findRootFoldersByCourseId(1L))
                .thenReturn(List.of(rootFolder));
        when(resourceRepository.findRootResourcesByCourseId(1L))
                .thenReturn(List.of(materialFile, materialLink));

        CourseMaterialsResponseDto result = courseService.getMaterials(
                "fmi-info-id",
                StudyYearName.YEAR_1,
                "asc",
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
        Course course = Course.builder().id(1L).slug("asc").build();
        User owner = User.builder().id(UUID.randomUUID()).username("david").build();
        OffsetDateTime now = OffsetDateTime.now();
        UUID subFolderId = UUID.randomUUID();

        Folder childFolder = Folder.builder()
                .id(UUID.randomUUID())
                .name("Examene")
                .owner(owner)
                .createdAt(now)
                .build();

        when(courseRepository.findBySlugAndCommunitySlugAndStudyYearName("asc", "fmi-info-id", StudyYearName.YEAR_1))
                .thenReturn(Optional.of(course));
        when(folderRepository.existsByIdAndCourseId(subFolderId, 1L))
                .thenReturn(true);
        when(folderRepository.findByCourseIdAndParentFolderId(1L, subFolderId))
                .thenReturn(List.of(childFolder));
        when(resourceRepository.findByCourseIdAndFolderId(1L, subFolderId))
                .thenReturn(List.of());

        CourseMaterialsResponseDto result = courseService.getMaterials(
                "fmi-info-id",
                StudyYearName.YEAR_1,
                "asc",
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
        when(courseRepository.findBySlugAndCommunitySlugAndStudyYearName("unknown", "fmi-info-id", StudyYearName.YEAR_1))
                .thenReturn(Optional.empty());

        assertThrows(ResponseStatusException.class, () ->
                courseService.getMaterials("fmi-info-id", StudyYearName.YEAR_1, "unknown", null));
    }

    @Test
    @DisplayName("getMaterials throws 404 when folder not found")
    public void testGetMaterials_FolderNotFound() {
        Course course = Course.builder().id(1L).slug("asc").build();
        UUID folderId = UUID.randomUUID();

        when(courseRepository.findBySlugAndCommunitySlugAndStudyYearName("asc", "fmi-info-id", StudyYearName.YEAR_1))
                .thenReturn(Optional.of(course));
        when(folderRepository.existsByIdAndCourseId(folderId, 1L))
                .thenReturn(false);

        assertThrows(ResponseStatusException.class, () ->
                courseService.getMaterials("fmi-info-id", StudyYearName.YEAR_1, "asc", folderId));
    }

    @Test
    @DisplayName("findBySlug returns CourseResponseDto when course exists")
    public void testFindBySlug_Success() {
        Course course = Course.builder()
                .id(1L)
                .slug("asc")
                .name("Arhitectura sistemelor de calcul")
                .abbreviation("ASC")
                .semester(1)
                .creditPoints(5)
                .archived(false)
                .description("Course description")
                .build();

        when(courseRepository.findBySlugAndCommunitySlugAndStudyYearName("asc", "fmi-info-id", StudyYearName.YEAR_1))
                .thenReturn(Optional.of(course));

        CourseResponseDto result = courseService.findBySlug("fmi-info-id", StudyYearName.YEAR_1, "asc");

        assertNotNull(result);
        assertEquals(1L, result.id());
        assertEquals("asc", result.slug());
        assertEquals("Arhitectura sistemelor de calcul", result.name());
        assertEquals("ASC", result.abbreviation());
        assertEquals(1, result.semester());
        assertEquals(5, result.creditPoints());
        assertFalse(result.archived());
        assertEquals("Course description", result.description());
    }

    @Test
    @DisplayName("getCourseHome returns CourseHomeResponseDto")
    public void testGetCourseTeachers_Success() {
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
                .slug("asc")
                .name("Arhitectura sistemelor de calcul")
                .abbreviation("ASC")
                .semester(1)
                .creditPoints(5)
                .archived(false)
                .description("Course description")
                .teachers(List.of(teacher))
                .build();

        when(courseRepository.findBySlugAndCommunitySlugAndStudyYearNameWithTeachers("asc", "fmi-info-id", StudyYearName.YEAR_1))
                .thenReturn(Optional.of(course));

        CourseHomeResponseDto result = courseService.getCourseHome("fmi-info-id", StudyYearName.YEAR_1, "asc");

        assertNotNull(result);
        assertEquals(1L, result.course().id());
        assertEquals("asc", result.course().slug());
        assertEquals(1, result.teachers().size());
        assertEquals(teacherId, result.teachers().get(0).id());
        assertEquals("Daniel", result.teachers().get(0).firstName());
        assertEquals("Dragulici", result.teachers().get(0).lastName());
        assertEquals(4.8f, result.teachers().get(0).averageRating());
        assertEquals(15, result.teachers().get(0).ratingsCount());
    }
}
