package com.unihub.app.services.community.content;

import com.unihub.app.dto.UserDto;
import com.unihub.app.dto.community.content.request.CreateMaterialLinkRequestDto;
import com.unihub.app.dto.community.content.response.MaterialLinkDto;
import com.unihub.app.entities.authentication.User;
import com.unihub.app.entities.community.content.Folder;
import com.unihub.app.entities.community.content.MaterialLink;
import com.unihub.app.entities.community.content.ResourceType;
import com.unihub.app.entities.community.resources.Course;
import com.unihub.app.entities.community.resources.StudyYearName;
import com.unihub.app.mappers.community.CommunityContentMapper;
import com.unihub.app.repositories.authentication.UserRepository;
import com.unihub.app.repositories.community.content.FolderRepository;
import com.unihub.app.repositories.community.content.MaterialLinkRepository;
import com.unihub.app.repositories.community.content.ResourceRepository;
import com.unihub.app.repositories.community.resources.CourseRepository;
import com.unihub.app.validation.MaterialLinkValidator;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class MaterialLinkService {

    private final MaterialLinkRepository materialLinkRepository;
    private final ResourceRepository resourceRepository;
    private final FolderRepository folderRepository;
    private final CourseRepository courseRepository;
    private final UserRepository userRepository;
    private final MaterialLinkValidator materialLinkValidator;
    private final CommunityContentMapper contentMapper;

    @Transactional
    public MaterialLinkDto createMaterialLink(
            String communitySlug,
            StudyYearName studyYearName,
            String courseSlug,
            UserDto userDto,
            CreateMaterialLinkRequestDto requestDto
    ) {
        Course course = courseRepository.findBySlugAndCommunitySlugAndStudyYearName(courseSlug, communitySlug, studyYearName)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Course not found"));

        materialLinkValidator.validate(requestDto.url(), requestDto.linkType());

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

        User owner = userRepository.findById(userDto.id())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        MaterialLink materialLink = MaterialLink.builder()
                .title(title)
                .description(requestDto.description())
                .course(course)
                .folder(folder)
                .owner(owner)
                .type(ResourceType.MATERIAL_LINK)
                .url(requestDto.url().trim())
                .linkType(requestDto.linkType())
                .build();

        MaterialLink saved = materialLinkRepository.save(materialLink);
        return contentMapper.toMaterialLinkDto(saved);
    }
}
