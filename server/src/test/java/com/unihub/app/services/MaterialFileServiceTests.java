package com.unihub.app.services;

import com.unihub.app.config.StorageProperties;
import com.unihub.app.domain.RoleType;
import com.unihub.app.dto.UserDto;
import com.unihub.app.dto.community.content.request.CreateMaterialFileRequestDto;
import com.unihub.app.dto.community.content.request.PresignedUploadUrlRequestDto;
import com.unihub.app.dto.community.content.response.DownloadUrlResponseDto;
import com.unihub.app.dto.community.content.response.MaterialFileDto;
import com.unihub.app.dto.community.content.response.PresignedUploadUrlResponseDto;
import com.unihub.app.entities.authentication.User;
import com.unihub.app.entities.community.content.MaterialFile;
import com.unihub.app.entities.community.resources.Community;
import com.unihub.app.entities.community.resources.Course;
import com.unihub.app.entities.community.resources.StudyYear;
import com.unihub.app.entities.community.resources.StudyYearName;
import com.unihub.app.mappers.community.CommunityContentMapper;
import com.unihub.app.repositories.authentication.UserRepository;
import com.unihub.app.repositories.community.content.FolderRepository;
import com.unihub.app.repositories.community.content.MaterialFileRepository;
import com.unihub.app.repositories.community.content.ResourceRepository;
import com.unihub.app.repositories.community.resources.CourseRepository;
import com.unihub.app.services.community.content.MaterialFileService;
import com.unihub.app.services.storage.FileStorageService;
import com.unihub.app.validation.MaterialFileValidator;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import java.time.Duration;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class MaterialFileServiceTests {

    @Mock
    private MaterialFileRepository materialFileRepository;

    @Mock
    private ResourceRepository resourceRepository;

    @Mock
    private FolderRepository folderRepository;

    @Mock
    private CourseRepository courseRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private FileStorageService fileStorageService;

    @Spy
    private MaterialFileValidator materialFileValidator = new MaterialFileValidator();

    @Spy
    private StorageProperties storageProperties = new StorageProperties("filesystem", "./uploads", 300, 3600);

    @Spy
    private CommunityContentMapper contentMapper = new CommunityContentMapper();

    @InjectMocks
    private MaterialFileService materialFileService;

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
    @DisplayName("Request presigned upload URL returns valid URL and storage key")
    public void testRequestPresignedUploadUrl_Success() {
        PresignedUploadUrlRequestDto requestDto = new PresignedUploadUrlRequestDto("lecture.pdf", "application/pdf", 1024L);

        when(courseRepository.findBySlugAndCommunitySlugAndStudyYearName("math", "fmi", StudyYearName.YEAR_1))
                .thenReturn(Optional.of(course));
        when(fileStorageService.generatePresignedUploadUrl(anyString(), eq("application/pdf"), eq(1024L), any(Duration.class)))
                .thenReturn("http://localhost:8080/api/v1/storage/local/upload?key=test");

        PresignedUploadUrlResponseDto response = materialFileService.requestPresignedUploadUrl("fmi", StudyYearName.YEAR_1, "math", ownerDto, requestDto);

        assertNotNull(response);
        assertEquals("http://localhost:8080/api/v1/storage/local/upload?key=test", response.uploadUrl());
        assertNotNull(response.storageKey());
    }

    @Test
    @DisplayName("Create MaterialFile after verifying file existence in storage")
    public void testCreateMaterialFile_Success() {
        CreateMaterialFileRequestDto requestDto = new CreateMaterialFileRequestDto(
                "Lecture 1 Slides",
                "Intro slides",
                null,
                "communities/fmi/courses/math/materials/123/lecture.pdf",
                "application/pdf",
                1024L
        );

        when(courseRepository.findBySlugAndCommunitySlugAndStudyYearName("math", "fmi", StudyYearName.YEAR_1))
                .thenReturn(Optional.of(course));
        when(resourceRepository.existsByCourseIdAndFolderIsNullAndTitleIgnoreCase(5L, "Lecture 1 Slides"))
                .thenReturn(false);
        when(fileStorageService.fileExists(requestDto.storageKey())).thenReturn(true);
        when(fileStorageService.getFileSize(requestDto.storageKey())).thenReturn(1024L);
        when(userRepository.findById(owner.getId())).thenReturn(Optional.of(owner));
        when(materialFileRepository.save(any(MaterialFile.class))).thenAnswer(invocation -> {
            MaterialFile file = invocation.getArgument(0);
            file.setId(UUID.randomUUID());
            return file;
        });

        MaterialFileDto result = materialFileService.createMaterialFile("fmi", StudyYearName.YEAR_1, "math", ownerDto, requestDto);
        assertNotNull(result);
        assertEquals("Lecture 1 Slides", result.title());
    }

    @Test
    @DisplayName("Create MaterialFile fails if file does not exist in storage")
    public void testCreateMaterialFile_FileNotInStorage() {
        CreateMaterialFileRequestDto requestDto = new CreateMaterialFileRequestDto(
                "Lecture 1 Slides",
                "Intro slides",
                null,
                "communities/fmi/courses/math/materials/123/lecture.pdf",
                "application/pdf",
                1024L
        );

        when(courseRepository.findBySlugAndCommunitySlugAndStudyYearName("math", "fmi", StudyYearName.YEAR_1))
                .thenReturn(Optional.of(course));
        when(resourceRepository.existsByCourseIdAndFolderIsNullAndTitleIgnoreCase(5L, "Lecture 1 Slides"))
                .thenReturn(false);
        when(fileStorageService.fileExists(requestDto.storageKey())).thenReturn(false);

        assertThrows(ResponseStatusException.class, () ->
                materialFileService.createMaterialFile("fmi", StudyYearName.YEAR_1, "math", ownerDto, requestDto)
        );
    }

    @Test
    @DisplayName("Get download URL generates presigned download URL")
    public void testGetDownloadUrl_Success() {
        UUID materialId = UUID.randomUUID();
        MaterialFile file = MaterialFile.builder()
                .id(materialId)
                .storageKey("key/test.pdf")
                .build();

        when(materialFileRepository.findById(materialId)).thenReturn(Optional.of(file));
        when(fileStorageService.generatePresignedDownloadUrl(eq("key/test.pdf"), any(Duration.class)))
                .thenReturn("http://localhost:8080/api/v1/storage/local/download?key=test");

        DownloadUrlResponseDto result = materialFileService.getDownloadUrl(materialId);
        assertNotNull(result);
        assertEquals("http://localhost:8080/api/v1/storage/local/download?key=test", result.downloadUrl());
    }
}
