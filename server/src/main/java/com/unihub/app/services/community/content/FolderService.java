package com.unihub.app.services.community.content;

import com.unihub.app.domain.PermissionType;
import com.unihub.app.dto.UserDto;
import com.unihub.app.dto.community.content.request.CreateFolderRequestDto;
import com.unihub.app.dto.community.content.request.UpdateFolderRequestDto;
import com.unihub.app.dto.community.content.response.FolderSummaryDto;
import com.unihub.app.entities.authentication.User;
import com.unihub.app.entities.community.content.Folder;
import com.unihub.app.entities.community.content.MaterialFile;
import com.unihub.app.entities.community.content.Resource;
import com.unihub.app.entities.community.resources.Course;
import com.unihub.app.entities.community.resources.StudyYearName;
import com.unihub.app.mappers.UserMapper;
import com.unihub.app.mappers.community.CommunityContentMapper;
import com.unihub.app.repositories.authentication.UserRepository;
import com.unihub.app.repositories.community.content.FolderRepository;
import com.unihub.app.repositories.community.content.ResourceRepository;
import com.unihub.app.repositories.community.resources.CourseRepository;
import com.unihub.app.services.authorization.AuthorizationService;
import com.unihub.app.services.storage.FileStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class FolderService {

    private final FolderRepository folderRepository;
    private final CourseRepository courseRepository;
    private final ResourceRepository resourceRepository;
    private final UserRepository userRepository;
    private final FileStorageService fileStorageService;
    private final AuthorizationService authorizationService;
    private final CommunityContentMapper contentMapper;
    private final UserMapper userMapper;

    @Transactional
    public FolderSummaryDto createFolder(
            String communitySlug,
            StudyYearName studyYearName,
            String courseSlug,
            UserDto userDto,
            CreateFolderRequestDto requestDto
    ) {
        Course course = courseRepository.findBySlugAndCommunitySlugAndStudyYearName(courseSlug, communitySlug, studyYearName)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Course not found"));

        String folderName = requestDto.name();
        Folder parentFolder = null;

        if (requestDto.parentFolderId() != null) {
            parentFolder = folderRepository.findByIdWithCourse(requestDto.parentFolderId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Parent folder not found"));

            if (!parentFolder.getCourse().getId().equals(course.getId())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Parent folder does not belong to this course");
            }

            if (folderRepository.existsByCourseIdAndParentFolderIdAndNameIgnoreCase(course.getId(), parentFolder.getId(), folderName)) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Folder with name '" + folderName + "' already exists in this folder");
            }
        } else {
            if (folderRepository.existsByCourseIdAndParentFolderIsNullAndNameIgnoreCase(course.getId(), folderName)) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Folder with name '" + folderName + "' already exists at root level");
            }
        }

        User owner = userMapper.toEntity(userDto);

        Folder folder = Folder.builder()
                .name(folderName)
                .course(course)
                .parentFolder(parentFolder)
                .owner(owner)
                .build();

        Folder saved = folderRepository.save(folder);
        return contentMapper.toFolderSummaryDto(saved);
    }

    @Transactional
    public FolderSummaryDto updateFolder(
            UUID folderId,
            UserDto userDto,
            UpdateFolderRequestDto requestDto
    ) {
        Folder folder = folderRepository.findByIdWithCourseAndCommunity(folderId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Folder not found"));

        if (folder.getOwner() == null || !folder.getOwner().getId().equals(userDto.id())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only the folder owner can update this folder");
        }

        Long courseId = folder.getCourse().getId();

        if (requestDto.name().isUndefined() && requestDto.parentFolderId().isUndefined() && requestDto.moveToRoot().isUndefined()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "At least one field must be provided for update");
        }

        if (Boolean.TRUE.equals(requestDto.moveToRoot().orElse(false))) {
            folder.setParentFolder(null);
        } else if (requestDto.parentFolderId().isPresent()) {
            UUID targetParentId = requestDto.parentFolderId().get();
            if (targetParentId == null) {
                folder.setParentFolder(null);
            } else {
                if (targetParentId.equals(folder.getId())) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot set folder parent to itself");
                }

                Folder newParent = folderRepository.findById(targetParentId)
                        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Parent folder not found"));

                if (!newParent.getCourse().getId().equals(courseId)) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Parent folder does not belong to this course");
                }

                if (isDescendantOf(newParent, folder.getId())) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot move folder into its own subfolder");
                }

                folder.setParentFolder(newParent);
            }
        }

        if (requestDto.name().isPresent()) {
            String name = requestDto.name().get();
            if (name != null && !name.isBlank()) {
                folder.setName(name.trim());
            }
        }

        UUID parentId = folder.getParentFolder() != null ? folder.getParentFolder().getId() : null;
        if (parentId != null) {
            if (folderRepository.existsByCourseIdAndParentFolderIdAndNameIgnoreCaseAndIdNot(courseId, parentId, folder.getName(), folder.getId())) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Folder with name '" + folder.getName() + "' already exists in target parent");
            }
        } else {
            if (folderRepository.existsByCourseIdAndParentFolderIsNullAndNameIgnoreCaseAndIdNot(courseId, folder.getName(), folder.getId())) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Folder with name '" + folder.getName() + "' already exists at root level");
            }
        }

        Folder updated = folderRepository.save(folder);
        return contentMapper.toFolderSummaryDto(updated);
    }

    @Transactional
    public void deleteFolder(UUID folderId, UserDto userDto) {
        Folder folder = folderRepository.findByIdWithCourseAndCommunity(folderId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Folder not found"));

        String communitySlug = folder.getCourse().getStudyYear().getCommunity().getSlug();
        boolean isModerator = authorizationService.hasCommunityPermission(communitySlug, userDto.id(), PermissionType.MODERATE_FOLDER);
        boolean isOwner = folder.getOwner() != null && folder.getOwner().getId().equals(userDto.id());

        if (!isModerator && !isOwner) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You do not have permission to delete this folder");
        }

        if (!isModerator) {
            boolean hasSubfolders = folderRepository.existsByParentFolderId(folder.getId());
            boolean hasResources = resourceRepository.existsByFolderId(folder.getId());

            if (hasSubfolders || hasResources) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Folder must be empty before it can be deleted by owner");
            }

            folderRepository.delete(folder);
        } else {
            recursivelyDeleteFolderStorage(folder);
            folderRepository.delete(folder);
        }
    }

    private void recursivelyDeleteFolderStorage(Folder folder) {
        List<Resource> resources = resourceRepository.findByFolderId(folder.getId());
        for (Resource resource : resources) {
            if (resource instanceof MaterialFile materialFile) {
                fileStorageService.deleteFile(materialFile.getStorageKey());
            }
        }

        List<Folder> subfolders = folderRepository.findByParentFolderId(folder.getId());
        for (Folder subfolder : subfolders) {
            recursivelyDeleteFolderStorage(subfolder);
        }
    }

    private boolean isDescendantOf(Folder current, UUID ancestorId) {
        Folder parent = current.getParentFolder();
        while (parent != null) {
            if (parent.getId().equals(ancestorId)) {
                return true;
            }
            parent = parent.getParentFolder();
        }
        return false;
    }
}
