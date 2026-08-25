package com.unihub.app.mappers.community;

import com.unihub.app.dto.community.OwnerDto;
import com.unihub.app.dto.community.content.*;
import com.unihub.app.entities.community.content.*;
import org.springframework.stereotype.Component;

@Component
public class ResourceContentMapper {

    public FolderSummaryDto toFolderSummaryDto(Folder folder) {
        OwnerDto owner = folder.getOwner() == null
                ? null
                : new OwnerDto(folder.getOwner().getId(), folder.getOwner().getUsername());

        return FolderSummaryDto.builder()
                .id(folder.getId())
                .name(folder.getName())
                .parentFolderId(folder.getParentFolder() == null ? null : folder.getParentFolder().getId())
                .createdAt(folder.getCreatedAt())
                .owner(owner)
                .build();
    }

    public MaterialFileDto toMaterialFileDto(MaterialFile materialFile) {
        Resource resource = materialFile.getResource();
        OwnerDto owner = resource.getOwner() == null
                ? null
                : new OwnerDto(resource.getOwner().getId(), resource.getOwner().getUsername());

        return MaterialFileDto.builder()
                .id(materialFile.getId())
                .title(resource.getTitle())
                .description(resource.getDescription())
                .storageKey(materialFile.getStorageKey())
                .mediaType(materialFile.getMediaType() != null ? materialFile.getMediaType().toString() : null)
                .size(materialFile.getSize())
                .createdAt(resource.getCreatedAt())
                .owner(owner)
                .build();
    }

    public MaterialLinkDto toMaterialLinkDto(MaterialLink materialLink) {
        Resource resource = materialLink.getResource();
        OwnerDto owner = resource.getOwner() == null
                ? null
                : new OwnerDto(resource.getOwner().getId(), resource.getOwner().getUsername());

        return MaterialLinkDto.builder()
                .id(materialLink.getID())
                .title(resource.getTitle())
                .description(resource.getDescription())
                .url(materialLink.getUrl())
                .linkType(materialLink.getLinkType())
                .createdAt(resource.getCreatedAt())
                .owner(owner)
                .build();
    }

    public ExamResponseDto toExamDto(Exam exam) {
        Resource resource = exam.getResource();
        OwnerDto owner = resource.getOwner() == null
                ? null
                : new OwnerDto(resource.getOwner().getId(), resource.getOwner().getUsername());

        return ExamResponseDto.builder()
                .id(exam.getId())
                .title(resource.getTitle())
                .description(resource.getDescription())
                .scheduledDate(exam.getScheduledDate())
                .estimatedDurationMinutes(exam.getEstimatedDurationMinutes())
                .createdAt(resource.getCreatedAt())
                .owner(owner)
                .build();
    }

    public LectureResponseDto toLectureDto(Lecture lecture) {
        Resource resource = lecture.getResource();
        OwnerDto owner = resource.getOwner() == null
                ? null
                : new OwnerDto(resource.getOwner().getId(), resource.getOwner().getUsername());

        return LectureResponseDto.builder()
                .id(lecture.getId())
                .title(resource.getTitle())
                .description(resource.getDescription())
                .startTime(lecture.getStartTime())
                .endTime(lecture.getEndTime())
                .location(lecture.getLocation())
                .createdAt(resource.getCreatedAt())
                .owner(owner)
                .build();
    }

    public AssignmentResponseDto toAssignmentDto(Assignment assignment) {
        Resource resource = assignment.getResource();
        OwnerDto owner = resource.getOwner() == null
                ? null
                : new OwnerDto(resource.getOwner().getId(), resource.getOwner().getUsername());

        return AssignmentResponseDto.builder()
                .id(assignment.getId())
                .title(resource.getTitle())
                .description(resource.getDescription())
                .dueDate(assignment.getDueDate())
                .estimatedDurationMinutes(assignment.getEstimatedDurationMinutes())
                .createdAt(resource.getCreatedAt())
                .owner(owner)
                .build();
    }
}
