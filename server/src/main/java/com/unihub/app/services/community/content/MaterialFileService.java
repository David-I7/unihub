package com.unihub.app.services.community.content;

import com.unihub.app.config.StorageProperties;
import com.unihub.app.dto.UserDto;
import com.unihub.app.dto.community.content.request.CreateMaterialFileRequestDto;
import com.unihub.app.dto.community.content.request.PresignedUploadUrlRequestDto;
import com.unihub.app.dto.community.content.response.DownloadUrlResponseDto;
import com.unihub.app.dto.community.content.response.MaterialFileDto;
import com.unihub.app.dto.community.content.response.PresignedUploadUrlResponseDto;
import com.unihub.app.entities.authentication.User;
import com.unihub.app.entities.community.content.Folder;
import com.unihub.app.entities.community.content.MaterialFile;
import com.unihub.app.entities.community.content.ResourceType;
import com.unihub.app.entities.community.resources.Course;
import com.unihub.app.entities.community.resources.StudyYearName;
import com.unihub.app.mappers.community.CommunityContentMapper;
import com.unihub.app.repositories.authentication.UserRepository;
import com.unihub.app.repositories.community.content.FolderRepository;
import com.unihub.app.repositories.community.content.MaterialFileRepository;
import com.unihub.app.repositories.community.content.ResourceRepository;
import com.unihub.app.repositories.community.resources.CourseRepository;
import com.unihub.app.services.storage.FileStorageService;
import com.unihub.app.validation.MaterialFileValidator;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.Duration;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class MaterialFileService {

    private final MaterialFileRepository materialFileRepository;
    private final ResourceRepository resourceRepository;
    private final FolderRepository folderRepository;
    private final CourseRepository courseRepository;
    private final UserRepository userRepository;
    private final FileStorageService fileStorageService;
    private final MaterialFileValidator materialFileValidator;
    private final StorageProperties storageProperties;
    private final CommunityContentMapper contentMapper;

    public PresignedUploadUrlResponseDto requestPresignedUploadUrl(
            String communitySlug,
            StudyYearName studyYearName,
            String courseSlug,
            UserDto userDto,
            PresignedUploadUrlRequestDto requestDto
    ) {
        courseRepository.findBySlugAndCommunitySlugAndStudyYearName(courseSlug, communitySlug, studyYearName)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Course not found"));

        materialFileValidator.validate(requestDto.contentType(), requestDto.size());

        String sanitizedFileName = materialFileValidator.sanitizeFileName(requestDto.fileName());
        String storageKey = String.format(
                "communities/%s/courses/%s/materials/%s/%s",
                communitySlug,
                courseSlug,
                UUID.randomUUID(),
                sanitizedFileName
        );

        Duration duration = Duration.ofSeconds(storageProperties.uploadExpirationSec());
        String uploadUrl = fileStorageService.generatePresignedUploadUrl(
                storageKey,
                requestDto.contentType(),
                requestDto.size(),
                duration
        );

        return PresignedUploadUrlResponseDto.builder()
                .uploadUrl(uploadUrl)
                .storageKey(storageKey)
                .build();
    }

    @Transactional
    public MaterialFileDto createMaterialFile(
            String communitySlug,
            StudyYearName studyYearName,
            String courseSlug,
            UserDto userDto,
            CreateMaterialFileRequestDto requestDto
    ) {
        Course course = courseRepository.findBySlugAndCommunitySlugAndStudyYearName(courseSlug, communitySlug, studyYearName)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Course not found"));

        String title = requestDto.title().trim();
        Folder folder = null;

        if (requestDto.folderId() != null) {
            folder = folderRepository.findById(requestDto.folderId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Folder not found"));

            if (!folder.getCourse().getId().equals(course.getId())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Folder does not belong to this course");
            }

            if (resourceRepository.existsByCourseIdAndFolderIdAndTitleIgnoreCase(course.getId(), folder.getId(), title)) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Material with title '" + title + "' already exists in this folder");
            }
        } else {
            if (resourceRepository.existsByCourseIdAndFolderIsNullAndTitleIgnoreCase(course.getId(), title)) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Material with title '" + title + "' already exists at root level");
            }
        }

        if (!fileStorageService.fileExists(requestDto.storageKey())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "File not found in storage. Upload may not have completed");
        }

        long actualSize = fileStorageService.getFileSize(requestDto.storageKey());
        materialFileValidator.validate(requestDto.mediaType(), actualSize);

        User owner = userRepository.findById(userDto.id())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        MediaType mediaType = MediaType.parseMediaType(requestDto.mediaType());

        MaterialFile materialFile = MaterialFile.builder()
                .title(title)
                .description(requestDto.description())
                .course(course)
                .folder(folder)
                .owner(owner)
                .type(ResourceType.MATERIAL_FILE)
                .storageKey(requestDto.storageKey())
                .mediaType(mediaType)
                .size(actualSize)
                .build();

        MaterialFile saved = materialFileRepository.save(materialFile);
        return contentMapper.toMaterialFileDto(saved);
    }

    public DownloadUrlResponseDto getDownloadUrl(UUID materialId) {
        MaterialFile materialFile = materialFileRepository.findById(materialId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Material file not found"));

        Duration duration = Duration.ofSeconds(storageProperties.downloadExpirationSec());
        String downloadUrl = fileStorageService.generatePresignedDownloadUrl(materialFile.getStorageKey(), duration);

        return DownloadUrlResponseDto.builder()
                .downloadUrl(downloadUrl)
                .build();
    }
}
