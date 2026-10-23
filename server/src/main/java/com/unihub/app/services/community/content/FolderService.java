package com.unihub.app.services.community.content;

import com.unihub.app.domain.PermissionType;

import com.unihub.app.domain.PermissionType;
import com.unihub.app.entities.community.resources.StudyYearName;
import com.unihub.app.dto.UserDto;
import com.unihub.app.dto.community.content.request.CreateFolderRequestDto;
import com.unihub.app.dto.community.content.request.UpdateFolderRequestDto;
import com.unihub.app.dto.community.content.response.BreadcrumbDto;
import com.unihub.app.dto.community.content.response.FolderSummaryDto;
import com.unihub.app.entities.authentication.User;
import com.unihub.app.entities.community.content.Folder;
import com.unihub.app.entities.community.content.MaterialFile;
import com.unihub.app.entities.community.content.Resource;
import com.unihub.app.entities.community.resources.Course;
import com.unihub.app.mappers.UserMapper;
import com.unihub.app.mappers.community.CommunityContentMapper;
import com.unihub.app.repositories.community.content.FolderRepository;
import com.unihub.app.repositories.community.content.ResourceRepository;
import com.unihub.app.repositories.community.resources.CourseRepository;
import com.unihub.app.security.policies.CommunityAccessHelper;
import com.unihub.app.security.policies.FolderPolicy;
import com.unihub.app.services.storage.FileStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class FolderService {

    private final FolderRepository folderRepository;
    private final CourseRepository courseRepository;
    private final ResourceRepository resourceRepository;
    private final FileStorageService fileStorageService;
    private final CommunityAccessHelper communityAccessHelper;
    private final CommunityContentMapper contentMapper;
    private final UserMapper userMapper;
    private final FolderPolicy folderPolicy;

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

        Long courseId = course.getId();
        Folder parentFolder = null;

        if (requestDto.parentFolderId() != null) {
            parentFolder = folderRepository.findById(requestDto.parentFolderId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Parent folder not found"));

            if (!parentFolder.getCourse().getId().equals(courseId)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Parent folder does not belong to this course");
            }

            if (folderRepository.existsByCourseIdAndParentFolderIdAndNameIgnoreCase(courseId, parentFolder.getId(), requestDto.name())) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Folder with name '" + requestDto.name() + "' already exists in target parent");
            }
        } else {
            if (folderRepository.existsByCourseIdAndParentFolderIsNullAndNameIgnoreCase(courseId, requestDto.name())) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Folder with name '" + requestDto.name() + "' already exists at root level");
            }
        }

        User owner = userMapper.toEntity(userDto);
        Folder folder = Folder.builder()
                .name(requestDto.name())
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
            UserDto caller,
            UpdateFolderRequestDto requestDto
    ) {
        Folder folder = folderRepository.findByIdWithCourseAndCommunity(folderId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Folder not found"));

        folderPolicy.check(caller, folder, PermissionType.UPDATE_FOLDER);

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

        folderPolicy.check(userDto, folder, PermissionType.DELETE_FOLDER);

        String communitySlug = folder.getCourse().getStudyYear().getCommunity().getSlug();
        boolean isModerator = communityAccessHelper.hasCommunityPermission(communitySlug, userDto.id(), PermissionType.MODERATE_FOLDER);

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

    private boolean isDescendantOf(Folder candidateParent, UUID folderId) {
        Folder current = candidateParent;
        while (current != null) {
            if (current.getId().equals(folderId)) {
                return true;
            }
            current = current.getParentFolder();
        }
        return false;
    }

    @Transactional(readOnly = true)
    public List<BreadcrumbDto> getBreadcrumbs(UUID folderId) {
        Folder current = folderRepository.findById(folderId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Folder not found"));

        List<BreadcrumbDto> breadcrumbs = new ArrayList<>();
        while (current != null) {
            breadcrumbs.add(new BreadcrumbDto(current.getId(), current.getName()));
            current = current.getParentFolder();
        }

        Collections.reverse(breadcrumbs);
        return breadcrumbs;
    }
}
