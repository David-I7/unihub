package com.unihub.app.services;

import com.unihub.app.domain.PermissionType;
import com.unihub.app.domain.RoleType;
import com.unihub.app.dto.UserDto;
import com.unihub.app.dto.community.content.request.CreateFolderRequestDto;
import com.unihub.app.dto.community.content.request.UpdateFolderRequestDto;
import com.unihub.app.dto.community.content.response.BreadcrumbDto;
import com.unihub.app.dto.community.content.response.FolderSummaryDto;
import com.unihub.app.entities.authentication.User;
import com.unihub.app.entities.community.content.Folder;
import com.unihub.app.entities.community.content.MaterialFile;
import com.unihub.app.entities.community.resources.Community;
import com.unihub.app.entities.community.resources.Course;
import com.unihub.app.entities.community.resources.StudyYear;
import com.unihub.app.entities.community.resources.StudyYearName;
import com.unihub.app.mappers.community.CommunityContentMapper;
import com.unihub.app.repositories.authentication.UserRepository;
import com.unihub.app.repositories.community.content.FolderRepository;
import com.unihub.app.repositories.community.content.ResourceRepository;
import com.unihub.app.repositories.community.resources.CourseRepository;
import com.unihub.app.services.authorization.AuthorizationService;
import com.unihub.app.services.community.content.FolderService;
import com.unihub.app.services.storage.FileStorageService;
import org.junit.jupiter.api.BeforeEach;
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

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class FolderServiceTests {

    @Mock
    private FolderRepository folderRepository;

    @Mock
    private CourseRepository courseRepository;

    @Mock
    private ResourceRepository resourceRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private FileStorageService fileStorageService;

    @Mock
    private AuthorizationService authorizationService;

    @Mock
    private com.unihub.app.mappers.UserMapper userMapper;

    @Spy
    private CommunityContentMapper contentMapper = new CommunityContentMapper();

    @InjectMocks
    private FolderService folderService;

    private User owner;
    private UserDto ownerDto;
    private Community community;
    private StudyYear studyYear;
    private Course course;

    @BeforeEach
    public void setUp() {
        UUID ownerId = UUID.randomUUID();
        owner = User.builder().id(ownerId).username("david").build();
        ownerDto = new UserDto(ownerId, "david@test.com", "david", true, RoleType.USER);

        community = Community.builder().id(UUID.randomUUID()).slug("cs-community").build();
        studyYear = StudyYear.builder().id(1).studyYearName(StudyYearName.YEAR_1).community(community).build();
        course = Course.builder().id(10L).slug("algorithms").studyYear(studyYear).build();
    }

    @Test
    @DisplayName("Create root folder successfully")
    public void testCreateRootFolder_Success() {
        CreateFolderRequestDto requestDto = new CreateFolderRequestDto("Lectures", null);

        when(courseRepository.findBySlugAndCommunitySlugAndStudyYearName("algorithms", "cs-community", StudyYearName.YEAR_1))
                .thenReturn(Optional.of(course));
        when(folderRepository.existsByCourseIdAndParentFolderIsNullAndNameIgnoreCase(10L, "Lectures"))
                .thenReturn(false);
        when(userMapper.toEntity(ownerDto))
                .thenReturn(owner);
        when(folderRepository.save(any(Folder.class))).thenAnswer(invocation -> {
            Folder f = invocation.getArgument(0);
            f.setId(UUID.randomUUID());
            return f;
        });

        FolderSummaryDto result = folderService.createFolder("cs-community", StudyYearName.YEAR_1, "algorithms", ownerDto, requestDto);
        assertNotNull(result);
        assertEquals("Lectures", result.name());
    }

    @Test
    @DisplayName("Create folder with duplicate name in same level throws 409 Conflict")
    public void testCreateFolder_DuplicateName() {
        CreateFolderRequestDto requestDto = new CreateFolderRequestDto("Lectures", null);

        when(courseRepository.findBySlugAndCommunitySlugAndStudyYearName("algorithms", "cs-community", StudyYearName.YEAR_1))
                .thenReturn(Optional.of(course));
        when(folderRepository.existsByCourseIdAndParentFolderIsNullAndNameIgnoreCase(10L, "Lectures"))
                .thenReturn(true);

        assertThrows(ResponseStatusException.class, () ->
                folderService.createFolder("cs-community", StudyYearName.YEAR_1, "algorithms", ownerDto, requestDto)
        );
    }

    @Test
    @DisplayName("Owner can update folder name")
    public void testUpdateFolder_Success() {
        Folder folder = Folder.builder()
                .id(UUID.randomUUID())
                .name("Old Name")
                .course(course)
                .owner(owner)
                .build();

        UpdateFolderRequestDto requestDto = new UpdateFolderRequestDto("New Name", null, null);

        when(folderRepository.findByIdWithCourseAndCommunity(folder.getId()))
                .thenReturn(Optional.of(folder));
        when(folderRepository.existsByCourseIdAndParentFolderIsNullAndNameIgnoreCaseAndIdNot(10L, "New Name", folder.getId()))
                .thenReturn(false);
        when(folderRepository.save(any(Folder.class))).thenReturn(folder);

        FolderSummaryDto result = folderService.updateFolder(folder.getId(), ownerDto, requestDto);
        assertEquals("New Name", result.name());
    }

    @Test
    @DisplayName("Non-owner cannot update folder (throws 403 Forbidden)")
    public void testUpdateFolder_Forbidden() {
        Folder folder = Folder.builder()
                .id(UUID.randomUUID())
                .name("Old Name")
                .course(course)
                .owner(owner)
                .build();

        UserDto otherUser = new UserDto(UUID.randomUUID(), "other@test.com", "other", true, RoleType.USER);
        UpdateFolderRequestDto requestDto = new UpdateFolderRequestDto("New Name", null, null);

        when(folderRepository.findByIdWithCourseAndCommunity(folder.getId()))
                .thenReturn(Optional.of(folder));

        assertThrows(ResponseStatusException.class, () ->
                folderService.updateFolder(folder.getId(), otherUser, requestDto)
        );
    }

    @Test
    @DisplayName("Owner can delete empty folder")
    public void testDeleteFolder_Owner_EmptyFolder() {
        Folder folder = Folder.builder()
                .id(UUID.randomUUID())
                .name("Empty Folder")
                .course(course)
                .owner(owner)
                .build();

        when(folderRepository.findByIdWithCourseAndCommunity(folder.getId()))
                .thenReturn(Optional.of(folder));
        when(authorizationService.hasCommunityPermission("cs-community", owner.getId(), PermissionType.MODERATE_FOLDER))
                .thenReturn(false);
        when(folderRepository.existsByParentFolderId(folder.getId())).thenReturn(false);
        when(resourceRepository.existsByFolderId(folder.getId())).thenReturn(false);

        folderService.deleteFolder(folder.getId(), ownerDto);

        verify(folderRepository).delete(folder);
    }

    @Test
    @DisplayName("Owner cannot delete non-empty folder (throws 400 Bad Request)")
    public void testDeleteFolder_Owner_NonEmptyFolder() {
        Folder folder = Folder.builder()
                .id(UUID.randomUUID())
                .name("Non Empty Folder")
                .course(course)
                .owner(owner)
                .build();

        when(folderRepository.findByIdWithCourseAndCommunity(folder.getId()))
                .thenReturn(Optional.of(folder));
        when(authorizationService.hasCommunityPermission("cs-community", owner.getId(), PermissionType.MODERATE_FOLDER))
                .thenReturn(false);
        when(folderRepository.existsByParentFolderId(folder.getId())).thenReturn(true);

        assertThrows(ResponseStatusException.class, () ->
                folderService.deleteFolder(folder.getId(), ownerDto)
        );
    }

    @Test
    @DisplayName("Moderator can delete non-empty folder and files in storage are cleaned up")
    public void testDeleteFolder_Moderator_Cascade() {
        Folder folder = Folder.builder()
                .id(UUID.randomUUID())
                .name("Folder To Moderate")
                .course(course)
                .owner(owner)
                .build();

        MaterialFile file = MaterialFile.builder()
                .id(UUID.randomUUID())
                .storageKey("key/file.pdf")
                .build();

        when(folderRepository.findByIdWithCourseAndCommunity(folder.getId()))
                .thenReturn(Optional.of(folder));
        when(authorizationService.hasCommunityPermission("cs-community", owner.getId(), PermissionType.MODERATE_FOLDER))
                .thenReturn(true);
        when(resourceRepository.findByFolderId(folder.getId()))
                .thenReturn(List.of(file));
        when(folderRepository.findByParentFolderId(folder.getId()))
                .thenReturn(List.of());

        folderService.deleteFolder(folder.getId(), ownerDto);

        verify(fileStorageService).deleteFile("key/file.pdf");
        verify(folderRepository).delete(folder);
    }

    @Test
    @DisplayName("getBreadcrumbs returns ordered breadcrumb chain from root ancestor to current folder")
    public void testGetBreadcrumbs_Success() {
        UUID rootFolderId = UUID.randomUUID();
        Folder rootFolder = Folder.builder()
                .id(rootFolderId)
                .name("Root Folder")
                .parentFolder(null)
                .build();

        UUID childFolderId = UUID.randomUUID();
        Folder childFolder = Folder.builder()
                .id(childFolderId)
                .name("Child Folder")
                .parentFolder(rootFolder)
                .build();

        when(folderRepository.findById(childFolderId)).thenReturn(Optional.of(childFolder));

        List<BreadcrumbDto> breadcrumbs = folderService.getBreadcrumbs(childFolderId);

        assertEquals(2, breadcrumbs.size());
        assertEquals("Root Folder", breadcrumbs.get(0).name());
        assertEquals("FOLDER", breadcrumbs.get(0).type());
        assertEquals("Child Folder", breadcrumbs.get(1).name());
        assertEquals("FOLDER", breadcrumbs.get(1).type());
    }

    @Test
    @DisplayName("getBreadcrumbs throws 404 when folder not found")
    public void testGetBreadcrumbs_NotFound() {
        UUID nonExistentId = UUID.randomUUID();
        when(folderRepository.findById(nonExistentId)).thenReturn(Optional.empty());

        assertThrows(ResponseStatusException.class, () -> folderService.getBreadcrumbs(nonExistentId));
    }
}
