package com.unihub.app.services.community.content;

import com.unihub.app.domain.PermissionType;

import com.unihub.app.dto.UserDto;
import com.unihub.app.dto.community.content.request.UpdateMaterialRequestDto;
import com.unihub.app.dto.community.content.response.MaterialResponseDto;
import com.unihub.app.entities.community.content.Folder;
import com.unihub.app.entities.community.content.MaterialFile;
import com.unihub.app.entities.community.content.MaterialLink;
import com.unihub.app.entities.community.content.MaterialLinkType;
import com.unihub.app.entities.community.content.Resource;
import com.unihub.app.mappers.community.CommunityContentMapper;
import com.unihub.app.repositories.community.content.FolderRepository;
import com.unihub.app.repositories.community.content.ResourceRepository;
import com.unihub.app.security.policies.MaterialPolicy;
import com.unihub.app.services.storage.FileStorageService;
import com.unihub.app.validation.MaterialLinkValidator;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ResourceService {

    private final ResourceRepository resourceRepository;
    private final FolderRepository folderRepository;
    private final FileStorageService fileStorageService;
    private final MaterialLinkValidator materialLinkValidator;
    private final CommunityContentMapper contentMapper;
    private final MaterialPolicy materialPolicy;

    @Transactional(readOnly = true)
    public MaterialResponseDto getMaterialById(UUID materialId) {
        Resource resource = resourceRepository.findById(materialId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Material not found"));

        return contentMapper.toMaterialResponseDto(resource);
    }

    @Transactional
    public MaterialResponseDto updateMaterial(
            UUID materialId,
            UserDto caller,
            UpdateMaterialRequestDto requestDto
    ) {
        Resource resource = resourceRepository.findByIdWithCourseAndCommunity(materialId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Material not found"));

        materialPolicy.check(caller, resource, PermissionType.UPDATE_MATERIAL);

        Long courseId = resource.getCourse().getId();

        if (requestDto.title().isUndefined() && requestDto.description().isUndefined()
                && requestDto.folderId().isUndefined() && requestDto.moveToRoot().isUndefined()
                && requestDto.url().isUndefined() && requestDto.linkType().isUndefined()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "At least one field must be provided for update");
        }

        if (Boolean.TRUE.equals(requestDto.moveToRoot().orElse(false))) {
            resource.setFolder(null);
        } else if (requestDto.folderId().isPresent()) {
            UUID targetFolderId = requestDto.folderId().get();
            if (targetFolderId == null) {
                resource.setFolder(null);
            } else {
                Folder newFolder = folderRepository.findById(targetFolderId)
                        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Folder not found"));

                if (!newFolder.getCourse().getId().equals(courseId)) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Folder does not belong to this course");
                }

                resource.setFolder(newFolder);
            }
        }

        if (requestDto.title().isPresent()) {
            String title = requestDto.title().get();
            if (title != null && !title.isBlank()) {
                resource.setTitle(title.trim());
            }
        }

        requestDto.description().ifPresent(resource::setDescription);

        UUID folderId = resource.getFolder() != null ? resource.getFolder().getId() : null;
        if (folderId != null) {
            if (resourceRepository.existsByCourseIdAndFolderIdAndTitleIgnoreCaseAndIdNot(courseId, folderId, resource.getTitle(), resource.getId())) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Material with title '" + resource.getTitle() + "' already exists in target folder");
            }
        } else {
            if (resourceRepository.existsByCourseIdAndFolderIsNullAndTitleIgnoreCaseAndIdNot(courseId, resource.getTitle(), resource.getId())) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Material with title '" + resource.getTitle() + "' already exists at root level");
            }
        }

        if (resource instanceof MaterialLink materialLink) {
            if (requestDto.url().isPresent() || requestDto.linkType().isPresent()) {
                String newUrl = requestDto.url().isPresent() && requestDto.url().get() != null
                        ? requestDto.url().get().trim() : materialLink.getUrl();
                MaterialLinkType newType = requestDto.linkType().isPresent() && requestDto.linkType().get() != null
                        ? requestDto.linkType().get() : materialLink.getLinkType();

                materialLinkValidator.validate(newUrl, newType);

                materialLink.setUrl(newUrl);
                materialLink.setLinkType(newType);
            }
        }

        Resource updated = resourceRepository.save(resource);
        return contentMapper.toMaterialResponseDto(updated);
    }

    @Transactional
    public void deleteMaterial(UUID materialId, UserDto caller) {
        Resource resource = resourceRepository.findByIdWithCourseAndCommunity(materialId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Material not found"));

        materialPolicy.check(caller, resource, PermissionType.DELETE_MATERIAL);

        if (resource instanceof MaterialFile materialFile) {
            fileStorageService.deleteFile(materialFile.getStorageKey());
        }

        resourceRepository.delete(resource);
    }
}
