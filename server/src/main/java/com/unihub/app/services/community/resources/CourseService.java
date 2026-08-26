package com.unihub.app.services.community.resources;

import com.unihub.app.dto.community.content.response.CourseMaterialsResponseDto;
import com.unihub.app.dto.community.content.response.FolderSummaryDto;
import com.unihub.app.dto.community.content.response.MaterialFileDto;
import com.unihub.app.dto.community.content.response.MaterialLinkDto;
import com.unihub.app.dto.community.resources.response.CourseResponseDto;
import com.unihub.app.dto.community.resources.response.CourseTeachersResponseDto;
import com.unihub.app.entities.community.content.Folder;
import com.unihub.app.entities.community.content.MaterialFile;
import com.unihub.app.entities.community.content.MaterialLink;
import com.unihub.app.entities.community.content.Resource;
import com.unihub.app.entities.community.resources.Course;
import com.unihub.app.entities.community.resources.StudyYearName;
import com.unihub.app.mappers.community.CommunityContentMapper;
import com.unihub.app.mappers.community.CommunityResourceMapper;
import com.unihub.app.repositories.community.content.FolderRepository;
import com.unihub.app.repositories.community.content.ResourceRepository;
import com.unihub.app.repositories.community.resources.CourseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CourseService {

    private final CourseRepository courseRepository;
    private final FolderRepository folderRepository;
    private final ResourceRepository resourceRepository;
    private final CommunityContentMapper contentMapper;
    private final CommunityResourceMapper resourceMapper;

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
        List<Resource> resources;

        if (folderId != null) {
            if (!folderRepository.existsByIdAndCourseId(folderId, courseId)) {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Folder not found");
            }

            folders = folderRepository.findByCourseIdAndParentFolderId(courseId, folderId);
            resources = resourceRepository.findByCourseIdAndFolderId(courseId, folderId);
        } else {
            folders = folderRepository.findRootFoldersByCourseId(courseId);
            resources = resourceRepository.findRootResourcesByCourseId(courseId);
        }

        List<FolderSummaryDto> folderDtos = folders.stream()
                .map(contentMapper::toFolderSummaryDto)
                .toList();

        List<MaterialFileDto> fileDtos = new ArrayList<>();
        List<MaterialLinkDto> linkDtos = new ArrayList<>();

        for (Resource resource : resources) {
            if (resource instanceof MaterialFile file) {
                fileDtos.add(contentMapper.toMaterialFileDto(file));
            } else if (resource instanceof MaterialLink link) {
                linkDtos.add(contentMapper.toMaterialLinkDto(link));
            }
        }

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
        Course course = courseRepository.findBySlugAndCommunitySlugAndStudyYearName(courseSlug, communitySlug, studyYearName)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Course not found"));
        return resourceMapper.toCourseResponseDto(course);
    }

    public CourseTeachersResponseDto getCourseTeachers(String communitySlug, StudyYearName studyYearName, String courseSlug) {
        Course course = courseRepository.findBySlugAndCommunitySlugAndStudyYearNameWithTeachers(courseSlug, communitySlug, studyYearName)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Course not found"));
        return resourceMapper.toCourseTeachersResponseDto(course);
    }
}
