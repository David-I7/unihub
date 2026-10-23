package com.unihub.app.services;

import com.unihub.app.domain.PermissionType;

import com.unihub.app.domain.RoleType;
import com.unihub.app.dto.UserDto;
import com.unihub.app.dto.community.content.request.UpdateMaterialRequestDto;
import com.unihub.app.dto.community.content.response.MaterialResponseDto;
import com.unihub.app.entities.authentication.User;
import com.unihub.app.entities.community.content.MaterialFile;
import com.unihub.app.entities.community.content.MaterialLink;
import com.unihub.app.entities.community.content.MaterialLinkType;
import com.unihub.app.entities.community.content.Resource;
import com.unihub.app.entities.community.content.ResourceType;
import com.unihub.app.entities.community.resources.Community;
import com.unihub.app.entities.community.resources.Course;
import com.unihub.app.entities.community.resources.StudyYear;
import com.unihub.app.entities.community.resources.StudyYearName;
import com.unihub.app.mappers.community.CommunityContentMapper;
import com.unihub.app.repositories.community.content.FolderRepository;
import com.unihub.app.repositories.community.content.ResourceRepository;
import com.unihub.app.security.policies.MaterialPolicy;
import com.unihub.app.services.community.content.ResourceService;
import com.unihub.app.services.storage.FileStorageService;
import com.unihub.app.validation.MaterialLinkValidator;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class ResourceServiceTests {

    @Mock
    private ResourceRepository resourceRepository;

    @Mock
    private FolderRepository folderRepository;

    @Mock
    private FileStorageService fileStorageService;

    @Spy
    private MaterialLinkValidator materialLinkValidator = new MaterialLinkValidator();

    @Spy
    private CommunityContentMapper contentMapper = new CommunityContentMapper();

    @Mock
    private MaterialPolicy materialPolicy;

    @InjectMocks
    private ResourceService resourceService;

    private User owner;
    private UserDto ownerDto;
    private Course course;

    @BeforeEach
    public void setUp() {
        UUID ownerId = UUID.randomUUID();
        owner = User.builder().id(ownerId).username("david").build();
        ownerDto = new UserDto(ownerId, "david@test.com", "david", true, RoleType.USER);

        Community community = Community.builder().id(UUID.randomUUID()).slug("fmi").build();
        StudyYear studyYear = StudyYear.builder().id(1).studyYearName(StudyYearName.YEAR_1).community(community).build();
        course = Course.builder().id(5L).slug("math").studyYear(studyYear).build();
    }

    @Test
    @DisplayName("Get material by ID returns MaterialResponseDto")
    public void testGetMaterialById_Success() {
        UUID resourceId = UUID.randomUUID();
        MaterialLink link = MaterialLink.builder()
                .id(resourceId)
                .title("Course Link")
                .description("Link desc")
                .url("https://github.com/test/repo")
                .linkType(MaterialLinkType.GITHUB)
                .type(ResourceType.MATERIAL_LINK)
                .owner(owner)
                .course(course)
                .build();

        when(resourceRepository.findById(resourceId)).thenReturn(Optional.of(link));

        MaterialResponseDto response = resourceService.getMaterialById(resourceId);
        assertNotNull(response);
        assertEquals(ResourceType.MATERIAL_LINK, response.type());
        assertEquals("Course Link", response.link().title());
    }

    @Test
    @DisplayName("Update material link")
    public void testUpdateMaterial_Success() {
        UUID resourceId = UUID.randomUUID();
        MaterialLink link = MaterialLink.builder()
                .id(resourceId)
                .title("Old Title")
                .url("https://github.com/old/repo")
                .linkType(MaterialLinkType.GITHUB)
                .type(ResourceType.MATERIAL_LINK)
                .owner(owner)
                .course(course)
                .build();

        UpdateMaterialRequestDto requestDto = new UpdateMaterialRequestDto(
                "New Title",
                "New Desc",
                null,
                null,
                "https://github.com/new/repo",
                MaterialLinkType.GITHUB
        );

        when(resourceRepository.findByIdWithCourseAndCommunity(resourceId)).thenReturn(Optional.of(link));
        when(resourceRepository.existsByCourseIdAndFolderIsNullAndTitleIgnoreCaseAndIdNot(5L, "New Title", resourceId))
                .thenReturn(false);
        when(resourceRepository.save(any(Resource.class))).thenReturn(link);

        MaterialResponseDto response = resourceService.updateMaterial(resourceId, ownerDto, requestDto);
        assertNotNull(response);
        assertEquals("New Title", response.link().title());
        assertEquals("https://github.com/new/repo", response.link().url());
        verify(materialPolicy).check(ownerDto, link, PermissionType.UPDATE_MATERIAL);
    }

    @Test
    @DisplayName("Update material throws AccessDeniedException when policy denies")
    public void testUpdateMaterial_AccessDenied() {
        UUID resourceId = UUID.randomUUID();
        MaterialLink link = MaterialLink.builder().id(resourceId).build();
        UpdateMaterialRequestDto requestDto = new UpdateMaterialRequestDto("New", null, null, null, null, null);

        when(resourceRepository.findByIdWithCourseAndCommunity(resourceId)).thenReturn(Optional.of(link));
        doThrow(new AccessDeniedException("Access denied")).when(materialPolicy).check(ownerDto, link, PermissionType.UPDATE_MATERIAL);

        assertThrows(AccessDeniedException.class, () -> resourceService.updateMaterial(resourceId, ownerDto, requestDto));
        verify(resourceRepository, never()).save(any());
    }

    @Test
    @DisplayName("Delete file material deletes DB record and removes file from storage")
    public void testDeleteMaterial_FileCleanup() {
        UUID resourceId = UUID.randomUUID();
        MaterialFile file = MaterialFile.builder()
                .id(resourceId)
                .storageKey("key/file.pdf")
                .type(ResourceType.MATERIAL_FILE)
                .owner(owner)
                .course(course)
                .build();

        when(resourceRepository.findByIdWithCourseAndCommunity(resourceId)).thenReturn(Optional.of(file));

        resourceService.deleteMaterial(resourceId, ownerDto);

        verify(materialPolicy).check(ownerDto, file, PermissionType.DELETE_MATERIAL);
        verify(fileStorageService).deleteFile("key/file.pdf");
        verify(resourceRepository).delete(file);
    }

    @Test
    @DisplayName("Delete material throws AccessDeniedException when policy denies")
    public void testDeleteMaterial_AccessDenied() {
        UUID resourceId = UUID.randomUUID();
        MaterialFile file = MaterialFile.builder().id(resourceId).build();

        when(resourceRepository.findByIdWithCourseAndCommunity(resourceId)).thenReturn(Optional.of(file));
        doThrow(new AccessDeniedException("Access denied")).when(materialPolicy).check(ownerDto, file, PermissionType.DELETE_MATERIAL);

        assertThrows(AccessDeniedException.class, () -> resourceService.deleteMaterial(resourceId, ownerDto));
        verify(resourceRepository, never()).delete(any());
    }
}
