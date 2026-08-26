package com.unihub.app.services.community.resources;

import com.unihub.app.dto.community.content.CourseMaterialsResponseDto;
import com.unihub.app.dto.community.content.FolderSummaryDto;
import com.unihub.app.dto.community.content.MaterialFileDto;
import com.unihub.app.dto.community.content.MaterialLinkDto;
import com.unihub.app.dto.community.resources.CourseResponseDto;
import com.unihub.app.dto.globalResources.TeacherResponseDto;
import com.unihub.app.entities.community.content.Folder;
import com.unihub.app.entities.community.content.MaterialFile;
import com.unihub.app.entities.community.content.MaterialLink;
import com.unihub.app.entities.community.resources.Course;
import com.unihub.app.entities.community.resources.StudyYearName;
import com.unihub.app.mappers.GlobalResourceMapper;
import com.unihub.app.mappers.community.CommunityContentMapper;
import com.unihub.app.mappers.community.CommunityResourceMapper;
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
    private final CommunityContentMapper contentMapper;
    private final CommunityResourceMapper resourceMapper;
    private final GlobalResourceMapper globalResourceMapper;

    @Transactional(readOnly = true)
    public CourseMaterialsResponseDto getMaterials(
            String communitySlug,
            StudyYearName studyYearName,
            String courseSlug,
            UUID folderId
    ) {
        Course course = verifyCourseExists(communitySlug, studyYearName, courseSlug);
        Long courseId = course.getId();

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
                .map(contentMapper::toFolderSummaryDto)
                .toList();

        List<MaterialFileDto> fileDtos = files.stream()
                .map(contentMapper::toMaterialFileDto)
                .toList();

        List<MaterialLinkDto> linkDtos = links.stream()
                .map(contentMapper::toMaterialLinkDto)
                .toList();

        return CourseMaterialsResponseDto.builder()
                .folders(folderDtos)
                .files(fileDtos)
                .links(linkDtos)
                .build();
    }

    public Course verifyCourseExists(String communitySlug, StudyYearName studyYearName, String courseSlug) {
        return courseRepository.findBySlugAndCommunitySlugAndStudyYearName(courseSlug, communitySlug, studyYearName)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Course not found"));
    }

    public CourseResponseDto findBySlug(String communitySlug, StudyYearName studyYearName, String courseSlug) {
        Course course = verifyCourseExists(communitySlug, studyYearName, courseSlug);
        return resourceMapper.toCourseResponseDto(course);
    }

    public List<TeacherResponseDto> findCourseTeachers(String communitySlug, StudyYearName studyYearName, String courseSlug) {
        Course course = courseRepository.findBySlugAndCommunitySlugAndStudyYearNameWithTeachers(courseSlug, communitySlug, studyYearName)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Course not found"));
        return course.getTeachers().stream()
                .map(globalResourceMapper::toTeacherResponseDto)
                .toList();
    }
}
