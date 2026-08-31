package com.unihub.app.services;

import com.unihub.app.dto.community.content.response.CourseMaterialsResponseDto;
import com.unihub.app.dto.community.resources.request.CreateCourseRequestDto;
import com.unihub.app.dto.community.resources.request.UpdateCourseRequestDto;
import com.unihub.app.dto.community.resources.response.CourseHomeResponseDto;
import com.unihub.app.dto.community.resources.response.CourseResponseDto;
import com.unihub.app.entities.authentication.User;
import com.unihub.app.entities.community.content.Folder;
import com.unihub.app.entities.community.content.MaterialFile;
import com.unihub.app.entities.community.content.MaterialLink;
import com.unihub.app.entities.community.content.MaterialLinkType;
import com.unihub.app.entities.community.resources.Community;
import com.unihub.app.entities.community.resources.Course;
import com.unihub.app.entities.community.resources.StudyYear;
import com.unihub.app.entities.community.resources.StudyYearName;
import com.unihub.app.entities.community.resources.Teacher;
import com.unihub.app.mappers.community.CommunityContentMapper;
import com.unihub.app.mappers.community.CommunityResourceMapper;
import com.unihub.app.repositories.community.content.FolderRepository;
import com.unihub.app.repositories.community.content.ResourceRepository;
import com.unihub.app.repositories.community.resources.CourseRepository;
import com.unihub.app.repositories.community.resources.StudyYearRepository;
import com.unihub.app.repositories.community.resources.TeacherRepository;
import com.unihub.app.services.community.resources.CourseService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.server.ResponseStatusException;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class CourseServiceTests {

    @Mock
    private CourseRepository courseRepository;

    @Mock
    private StudyYearRepository studyYearRepository;

    @Mock
    private TeacherRepository teacherRepository;

    @Mock
    private FolderRepository folderRepository;

    @Mock
    private ResourceRepository resourceRepository;

    @Spy
    private CommunityContentMapper contentMapper = new CommunityContentMapper();

    @Spy
    private CommunityResourceMapper resourceMapper = new CommunityResourceMapper();

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
    public void testGetCourseHome_Success() {
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

    // =========================================================================
    // createCourse Tests
    // =========================================================================

    @Test
    @DisplayName("createCourse successfully creates course without teachers")
    public void testCreateCourse_Success_NoTeachers() {
        Community community = Community.builder().id(UUID.randomUUID()).slug("fmi-info-id").build();
        StudyYear studyYear = StudyYear.builder().id(1).studyYearName(StudyYearName.YEAR_1).community(community).build();

        CreateCourseRequestDto request = CreateCourseRequestDto.builder()
                .name("Baze de Date")
                .slug("bd")
                .abbreviation("BD")
                .semester(1)
                .creditPoints(5)
                .description("Database course")
                .readme(null)
                .teacherIds(null)
                .build();

        when(studyYearRepository.findByCommunitySlugAndStudyYearName("fmi-info-id", StudyYearName.YEAR_1))
                .thenReturn(Optional.of(studyYear));
        when(courseRepository.existsByStudyYearIdAndNameIgnoreCase(1, "Baze de Date"))
                .thenReturn(false);
        when(courseRepository.existsByStudyYearIdAndSlugIgnoreCase(1, "bd"))
                .thenReturn(false);
        when(courseRepository.save(any(Course.class)))
                .thenAnswer(invocation -> {
                    Course c = invocation.getArgument(0);
                    c.setId(10L);
                    return c;
                });

        CourseResponseDto result = courseService.createCourse("fmi-info-id", StudyYearName.YEAR_1, request);

        assertNotNull(result);
        assertEquals(10L, result.id());
        assertEquals("Baze de Date", result.name());
        assertEquals("bd", result.slug());
        assertEquals("BD", result.abbreviation());
        assertEquals(1, result.semester());
        assertEquals(5, result.creditPoints());
        assertFalse(result.archived());
    }

    @Test
    @DisplayName("createCourse successfully creates course with teachers")
    public void testCreateCourse_Success_WithTeachers() {
        UUID communityId = UUID.randomUUID();
        UUID teacherId = UUID.randomUUID();
        Community community = Community.builder().id(communityId).slug("fmi-info-id").build();
        StudyYear studyYear = StudyYear.builder().id(1).studyYearName(StudyYearName.YEAR_1).community(community).build();
        Teacher teacher = Teacher.builder().id(teacherId).community(community).coursesTaught(new ArrayList<>()).build();

        CreateCourseRequestDto request = CreateCourseRequestDto.builder()
                .name("Baze de Date")
                .slug("bd")
                .abbreviation("BD")
                .semester(1)
                .creditPoints(5)
                .teacherIds(List.of(teacherId))
                .build();

        when(studyYearRepository.findByCommunitySlugAndStudyYearName("fmi-info-id", StudyYearName.YEAR_1))
                .thenReturn(Optional.of(studyYear));
        when(courseRepository.existsByStudyYearIdAndNameIgnoreCase(1, "Baze de Date")).thenReturn(false);
        when(courseRepository.existsByStudyYearIdAndSlugIgnoreCase(1, "bd")).thenReturn(false);
        when(teacherRepository.findAllByIdInAndCommunityId(List.of(teacherId), communityId))
                .thenReturn(List.of(teacher));
        when(courseRepository.save(any(Course.class)))
                .thenAnswer(invocation -> {
                    Course c = invocation.getArgument(0);
                    c.setId(10L);
                    return c;
                });

        CourseResponseDto result = courseService.createCourse("fmi-info-id", StudyYearName.YEAR_1, request);

        assertNotNull(result);
        assertEquals(10L, result.id());
        verify(teacherRepository).save(teacher);
        assertTrue(teacher.getCoursesTaught().stream().anyMatch(c -> c.getId().equals(10L)));
    }

    @Test
    @DisplayName("createCourse throws 404 when study year not found")
    public void testCreateCourse_StudyYearNotFound() {
        CreateCourseRequestDto request = CreateCourseRequestDto.builder()
                .name("BD").slug("bd").abbreviation("BD").semester(1).build();

        when(studyYearRepository.findByCommunitySlugAndStudyYearName("fmi-info-id", StudyYearName.YEAR_1))
                .thenReturn(Optional.empty());

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () ->
                courseService.createCourse("fmi-info-id", StudyYearName.YEAR_1, request));
        assertEquals(HttpStatus.NOT_FOUND, ex.getStatusCode());
    }

    @Test
    @DisplayName("createCourse throws 409 when name already exists")
    public void testCreateCourse_NameConflict() {
        Community community = Community.builder().id(UUID.randomUUID()).build();
        StudyYear studyYear = StudyYear.builder().id(1).studyYearName(StudyYearName.YEAR_1).community(community).build();
        CreateCourseRequestDto request = CreateCourseRequestDto.builder()
                .name("BD").slug("bd").abbreviation("BD").semester(1).build();

        when(studyYearRepository.findByCommunitySlugAndStudyYearName("fmi-info-id", StudyYearName.YEAR_1))
                .thenReturn(Optional.of(studyYear));
        when(courseRepository.existsByStudyYearIdAndNameIgnoreCase(1, "BD")).thenReturn(true);

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () ->
                courseService.createCourse("fmi-info-id", StudyYearName.YEAR_1, request));
        assertEquals(HttpStatus.CONFLICT, ex.getStatusCode());
    }

    @Test
    @DisplayName("createCourse throws 400 when teacher not found in community")
    public void testCreateCourse_TeacherNotFoundInCommunity() {
        UUID communityId = UUID.randomUUID();
        UUID teacherId = UUID.randomUUID();
        Community community = Community.builder().id(communityId).slug("fmi-info-id").build();
        StudyYear studyYear = StudyYear.builder().id(1).studyYearName(StudyYearName.YEAR_1).community(community).build();
        CreateCourseRequestDto request = CreateCourseRequestDto.builder()
                .name("BD").slug("bd").abbreviation("BD").semester(1).teacherIds(List.of(teacherId)).build();

        when(studyYearRepository.findByCommunitySlugAndStudyYearName("fmi-info-id", StudyYearName.YEAR_1))
                .thenReturn(Optional.of(studyYear));
        when(courseRepository.existsByStudyYearIdAndNameIgnoreCase(1, "BD")).thenReturn(false);
        when(courseRepository.existsByStudyYearIdAndSlugIgnoreCase(1, "bd")).thenReturn(false);
        when(teacherRepository.findAllByIdInAndCommunityId(List.of(teacherId), communityId))
                .thenReturn(Collections.emptyList());

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () ->
                courseService.createCourse("fmi-info-id", StudyYearName.YEAR_1, request));
        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
    }

    // =========================================================================
    // updateCourse Tests
    // =========================================================================

    @Test
    @DisplayName("updateCourse throws 400 when no fields provided")
    public void testUpdateCourse_NoFields() {
        UpdateCourseRequestDto request = UpdateCourseRequestDto.builder().build();

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () ->
                courseService.updateCourse("fmi-info-id", StudyYearName.YEAR_1, "bd", request));
        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
    }

    @Test
    @DisplayName("updateCourse successfully updates fields partially")
    public void testUpdateCourse_PartialSuccess() {
        Community community = Community.builder().id(UUID.randomUUID()).slug("fmi-info-id").build();
        StudyYear studyYear = StudyYear.builder().id(1).studyYearName(StudyYearName.YEAR_1).community(community).build();
        Course course = Course.builder()
                .id(1L)
                .name("Baze de Date")
                .slug("bd")
                .abbreviation("BD")
                .semester(1)
                .creditPoints(5)
                .studyYear(studyYear)
                .archived(false)
                .build();

        UpdateCourseRequestDto request = UpdateCourseRequestDto.builder()
                .name("Baze de Date Avansate")
                .creditPoints(6)
                .build();

        when(courseRepository.findBySlugAndCommunitySlugAndStudyYearNameWithTeachersAndCommunity("bd", "fmi-info-id", StudyYearName.YEAR_1))
                .thenReturn(Optional.of(course));
        when(courseRepository.existsByStudyYearIdAndNameIgnoreCaseAndIdNot(1, "Baze de Date Avansate", 1L))
                .thenReturn(false);
        when(courseRepository.save(any(Course.class))).thenAnswer(invocation -> invocation.getArgument(0));

        CourseResponseDto result = courseService.updateCourse("fmi-info-id", StudyYearName.YEAR_1, "bd", request);

        assertNotNull(result);
        assertEquals("Baze de Date Avansate", result.name());
        assertEquals("bd", result.slug());
        assertEquals(6, result.creditPoints());
    }

    @Test
    @DisplayName("updateCourse throws 409 when new name conflicts")
    public void testUpdateCourse_NameConflict() {
        Community community = Community.builder().id(UUID.randomUUID()).slug("fmi-info-id").build();
        StudyYear studyYear = StudyYear.builder().id(1).studyYearName(StudyYearName.YEAR_1).community(community).build();
        Course course = Course.builder().id(1L).name("BD").slug("bd").studyYear(studyYear).build();
        UpdateCourseRequestDto request = UpdateCourseRequestDto.builder().name("ASC").build();

        when(courseRepository.findBySlugAndCommunitySlugAndStudyYearNameWithTeachersAndCommunity("bd", "fmi-info-id", StudyYearName.YEAR_1))
                .thenReturn(Optional.of(course));
        when(courseRepository.existsByStudyYearIdAndNameIgnoreCaseAndIdNot(1, "ASC", 1L))
                .thenReturn(true);

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () ->
                courseService.updateCourse("fmi-info-id", StudyYearName.YEAR_1, "bd", request));
        assertEquals(HttpStatus.CONFLICT, ex.getStatusCode());
    }

    // =========================================================================
    // deleteCourse Tests
    // =========================================================================

    @Test
    @DisplayName("deleteCourse successfully deletes existing course")
    public void testDeleteCourse_Success() {
        Course course = Course.builder().id(1L).slug("bd").build();
        when(courseRepository.findBySlugAndCommunitySlugAndStudyYearName("bd", "fmi-info-id", StudyYearName.YEAR_1))
                .thenReturn(Optional.of(course));

        courseService.deleteCourse("fmi-info-id", StudyYearName.YEAR_1, "bd");

        verify(courseRepository).delete(course);
    }

    @Test
    @DisplayName("deleteCourse throws 404 when course not found")
    public void testDeleteCourse_NotFound() {
        when(courseRepository.findBySlugAndCommunitySlugAndStudyYearName("bd", "fmi-info-id", StudyYearName.YEAR_1))
                .thenReturn(Optional.empty());

        assertThrows(ResponseStatusException.class, () ->
                courseService.deleteCourse("fmi-info-id", StudyYearName.YEAR_1, "bd"));
    }

    // =========================================================================
    // archiveCourse Tests
    // =========================================================================

    @Test
    @DisplayName("archiveCourse archives and unarchives course")
    public void testArchiveCourse_Success() {
        Course course = Course.builder().id(1L).slug("bd").archived(false).build();
        when(courseRepository.findBySlugAndCommunitySlugAndStudyYearName("bd", "fmi-info-id", StudyYearName.YEAR_1))
                .thenReturn(Optional.of(course));
        when(courseRepository.save(any(Course.class))).thenAnswer(invocation -> invocation.getArgument(0));

        CourseResponseDto archived = courseService.archiveCourse("fmi-info-id", StudyYearName.YEAR_1, "bd", true);
        assertTrue(archived.archived());

        CourseResponseDto unarchived = courseService.archiveCourse("fmi-info-id", StudyYearName.YEAR_1, "bd", false);
        assertFalse(unarchived.archived());
    }

    // =========================================================================
    // addTeacher & removeTeacher Tests
    // =========================================================================

    @Test
    @DisplayName("addTeacher adds teacher to course")
    public void testAddTeacher_Success() {
        UUID communityId = UUID.randomUUID();
        UUID teacherId = UUID.randomUUID();
        Community community = Community.builder().id(communityId).slug("fmi-info-id").build();
        StudyYear studyYear = StudyYear.builder().id(1).studyYearName(StudyYearName.YEAR_1).community(community).build();
        Course course = Course.builder().id(1L).slug("bd").studyYear(studyYear).teachers(new ArrayList<>()).build();
        Teacher teacher = Teacher.builder().id(teacherId).community(community).coursesTaught(new ArrayList<>()).build();

        when(courseRepository.findBySlugAndCommunitySlugAndStudyYearNameWithTeachersAndCommunity("bd", "fmi-info-id", StudyYearName.YEAR_1))
                .thenReturn(Optional.of(course));
        when(teacherRepository.findByIdWithCommunity(teacherId)).thenReturn(Optional.of(teacher));
        when(courseRepository.save(any(Course.class))).thenAnswer(invocation -> invocation.getArgument(0));

        CourseHomeResponseDto result = courseService.addTeacher("fmi-info-id", StudyYearName.YEAR_1, "bd", teacherId);

        assertNotNull(result);
        assertEquals(1, result.teachers().size());
        assertEquals(teacherId, result.teachers().get(0).id());
        verify(teacherRepository).save(teacher);
    }

    @Test
    @DisplayName("removeTeacher removes teacher from course")
    public void testRemoveTeacher_Success() {
        UUID communityId = UUID.randomUUID();
        UUID teacherId = UUID.randomUUID();
        Community community = Community.builder().id(communityId).slug("fmi-info-id").build();
        StudyYear studyYear = StudyYear.builder().id(1).studyYearName(StudyYearName.YEAR_1).community(community).build();
        Teacher teacher = Teacher.builder().id(teacherId).community(community).coursesTaught(new ArrayList<>()).build();
        List<Teacher> teachers = new ArrayList<>();
        teachers.add(teacher);
        Course course = Course.builder().id(1L).slug("bd").studyYear(studyYear).teachers(teachers).build();
        teacher.getCoursesTaught().add(course);

        when(courseRepository.findBySlugAndCommunitySlugAndStudyYearNameWithTeachersAndCommunity("bd", "fmi-info-id", StudyYearName.YEAR_1))
                .thenReturn(Optional.of(course));
        when(teacherRepository.findByIdWithCommunity(teacherId)).thenReturn(Optional.of(teacher));
        when(courseRepository.save(any(Course.class))).thenAnswer(invocation -> invocation.getArgument(0));

        CourseHomeResponseDto result = courseService.removeTeacher("fmi-info-id", StudyYearName.YEAR_1, "bd", teacherId);

        assertNotNull(result);
        assertEquals(0, result.teachers().size());
        verify(teacherRepository).save(teacher);
    }
}
