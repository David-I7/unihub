package com.unihub.app.services.community.resources;

import com.unihub.app.dto.community.content.CourseMaterialsResponseDto;
import com.unihub.app.dto.community.content.FolderSummaryDto;
import com.unihub.app.dto.community.content.MaterialFileDto;
import com.unihub.app.dto.community.content.MaterialLinkDto;
import com.unihub.app.entities.community.content.Folder;
import com.unihub.app.entities.community.content.MaterialFile;
import com.unihub.app.entities.community.content.MaterialLink;
import com.unihub.app.entities.community.resources.Course;
import com.unihub.app.entities.community.resources.StudyYearName;
import com.unihub.app.mappers.community.ResourceContentMapper;
import com.unihub.app.repositories.community.content.FolderRepository;
import com.unihub.app.repositories.community.content.MaterialFileRepository;
import com.unihub.app.repositories.community.content.MaterialLinkRepository;
import com.unihub.app.repositories.community.resources.CourseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CourseService {

    private final CourseRepository courseRepository;
    private final FolderRepository folderRepository;
    private final MaterialFileRepository materialFileRepository;
    private final MaterialLinkRepository materialLinkRepository;
    private final ResourceContentMapper resourceContentMapper;

    @Transactional(readOnly = true)
    public CourseMaterialsResponseDto getMaterials(
            String communitySlug,
            StudyYearName studyYearName,
            int courseId,
            UUID folderId
    ) {
        verifyCourseExists(communitySlug, studyYearName, courseId);

        List<Folder> folders;
        List<MaterialFile> files;
        List<MaterialLink> links;

        if (folderId != null) {
            if (!folderRepository.existsByIdAndCourseId(folderId, courseId)) {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Folder not found");
            }

            folders = folderRepository.findByCourseIdAndParentFolderId(courseId, folderId);
            files = materialFileRepository.findByCourseIdAndFolderId(courseId, folderId);
            links = materialLinkRepository.findByCourseIdAndFolderId(courseId, folderId);
        } else {
            folders = folderRepository.findRootFoldersByCourseId(courseId);
            files = materialFileRepository.findRootFilesByCourseId(courseId);
            links = materialLinkRepository.findRootLinksByCourseId(courseId);
        }

        List<FolderSummaryDto> folderDtos = folders.stream()
                .map(resourceContentMapper::toFolderSummaryDto)
                .toList();

        List<MaterialFileDto> fileDtos = files.stream()
                .map(resourceContentMapper::toMaterialFileDto)
                .toList();

        List<MaterialLinkDto> linkDtos = links.stream()
                .map(resourceContentMapper::toMaterialLinkDto)
                .toList();

        return CourseMaterialsResponseDto.builder()
                .folders(folderDtos)
                .files(fileDtos)
                .links(linkDtos)
                .build();
    }

    public Course verifyCourseExists(String communitySlug, StudyYearName studyYearName, int courseId) {
        return courseRepository.findByIdAndCommunitySlugAndStudyYearName(courseId, communitySlug, studyYearName)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Course not found"));
    }
}
