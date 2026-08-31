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
import com.unihub.app.services.authorization.AuthorizationService;
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
    private final AuthorizationService authorizationService;
    private final MaterialLinkValidator materialLinkValidator;
    private final CommunityContentMapper contentMapper;

    @Transactional(readOnly = true)
    public MaterialResponseDto getMaterialById(UUID materialId) {
        Resource resource = resourceRepository.findById(materialId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Material not found"));

        return contentMapper.toMaterialResponseDto(resource);
    }

    @Transactional
    public MaterialResponseDto updateMaterial(
            UUID materialId,
            UserDto userDto,
            UpdateMaterialRequestDto requestDto
    ) {
        Resource resource = resourceRepository.findByIdWithCourseAndCommunity(materialId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Material not found"));

        if (resource.getOwner() == null || !resource.getOwner().getId().equals(userDto.id())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only the material owner can update this material");
        }

        Long courseId = resource.getCourse().getId();

        if (Boolean.TRUE.equals(requestDto.moveToRoot())) {
            resource.setFolder(null);
        } else if (requestDto.folderId() != null) {
            Folder newFolder = folderRepository.findById(requestDto.folderId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Folder not found"));

            if (!newFolder.getCourse().getId().equals(courseId)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Folder does not belong to this course");
            }

            resource.setFolder(newFolder);
        }

        if (requestDto.title() != null && !requestDto.title().isBlank()) {
            resource.setTitle(requestDto.title().trim());
        }

        if (requestDto.description() != null) {
            resource.setDescription(requestDto.description());
        }

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
            if (requestDto.url() != null || requestDto.linkType() != null) {
                String newUrl = requestDto.url() != null ? requestDto.url().trim() : materialLink.getUrl();
                MaterialLinkType newType = requestDto.linkType() != null ? requestDto.linkType() : materialLink.getLinkType();

                materialLinkValidator.validate(newUrl, newType);

                materialLink.setUrl(newUrl);
                materialLink.setLinkType(newType);
            }
        }

        Resource updated = resourceRepository.save(resource);
        return contentMapper.toMaterialResponseDto(updated);
    }

    @Transactional
    public void deleteMaterial(UUID materialId, UserDto userDto) {
        Resource resource = resourceRepository.findByIdWithCourseAndCommunity(materialId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Material not found"));

        String communitySlug = resource.getCourse().getStudyYear().getCommunity().getSlug();
        boolean isModerator = authorizationService.hasCommunityPermission(communitySlug, userDto.id(), PermissionType.MODERATE_MATERIAL);
        boolean isOwner = resource.getOwner() != null && resource.getOwner().getId().equals(userDto.id());

        if (!isModerator && !isOwner) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You do not have permission to delete this material");
        }

        if (resource instanceof MaterialFile materialFile) {
            fileStorageService.deleteFile(materialFile.getStorageKey());
        }

        resourceRepository.delete(resource);
    }
}
