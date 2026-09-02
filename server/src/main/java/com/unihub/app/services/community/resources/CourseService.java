package com.unihub.app.services.community.resources;

import com.unihub.app.dto.community.content.response.CourseMaterialsResponseDto;
import com.unihub.app.dto.community.resources.request.CreateCourseRequestDto;
import com.unihub.app.dto.community.resources.request.UpdateCourseRequestDto;
import com.unihub.app.dto.community.resources.response.CourseHomeResponseDto;
import com.unihub.app.dto.community.resources.response.CourseResponseDto;
import com.unihub.app.entities.community.content.Folder;
import com.unihub.app.entities.community.content.Resource;
import com.unihub.app.entities.community.resources.Course;
import com.unihub.app.entities.community.resources.StudyYear;
import com.unihub.app.entities.community.resources.StudyYearName;
import com.unihub.app.entities.community.resources.Teacher;
import com.unihub.app.mappers.community.CommunityContentMapper;
import com.unihub.app.mappers.community.CommunityResourceMapper;
import com.unihub.app.repositories.community.content.FolderRepository;
import com.unihub.app.repositories.community.content.ResourceRepository;
import com.unihub.app.repositories.community.resources.CourseRepository;
import com.unihub.app.repositories.community.resources.StudyYearRepository;
import com.unihub.app.repositories.community.resources.TeacherRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CourseService {

    private final CourseRepository courseRepository;
    private final StudyYearRepository studyYearRepository;
    private final TeacherRepository teacherRepository;
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

        return contentMapper.toCourseMaterialsResponseDto(folders, resources);
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

    public CourseHomeResponseDto getCourseHome(String communitySlug, StudyYearName studyYearName, String courseSlug) {
        Course course = courseRepository.findBySlugAndCommunitySlugAndStudyYearNameWithTeachers(courseSlug, communitySlug, studyYearName)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Course not found"));
        return resourceMapper.toCourseHomeResponseDto(course);
    }

    @Transactional
    public CourseResponseDto createCourse(String communitySlug, StudyYearName studyYearName, CreateCourseRequestDto dto) {
        StudyYear studyYear = studyYearRepository.findByCommunitySlugAndStudyYearName(communitySlug, studyYearName)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Study year not found"));

        if (courseRepository.existsByStudyYearIdAndNameIgnoreCase(studyYear.getId(), dto.name())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Course with this name already exists in this study year");
        }

        if (courseRepository.existsByStudyYearIdAndSlugIgnoreCase(studyYear.getId(), dto.slug())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Course with this slug already exists in this study year");
        }

        List<Teacher> teachers = Collections.emptyList();
        if (dto.teacherIds() != null && !dto.teacherIds().isEmpty()) {
            teachers = teacherRepository.findAllByIdInAndCommunityId(dto.teacherIds(), studyYear.getCommunity().getId());
            if (teachers.size() != dto.teacherIds().size()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "One or more teachers were not found in this community");
            }
        }

        Course course = resourceMapper.toCourseEntity(dto, studyYear, teachers);
        Course saved = courseRepository.save(course);

        if (!teachers.isEmpty()) {
            for (Teacher teacher : teachers) {
                if (teacher.getCoursesTaught() == null) {
                    teacher.setCoursesTaught(new ArrayList<>());
                }
                if (!teacher.getCoursesTaught().contains(saved)) {
                    teacher.getCoursesTaught().add(saved);
                }
                teacherRepository.save(teacher);
            }
        }

        return resourceMapper.toCourseResponseDto(saved);
    }

    @Transactional
    public CourseResponseDto updateCourse(String communitySlug, StudyYearName studyYearName, String courseSlug, UpdateCourseRequestDto dto) {
        if (dto.name().isUndefined() && dto.slug().isUndefined() && dto.abbreviation().isUndefined()
                && dto.semester().isUndefined() && dto.creditPoints().isUndefined()
                && dto.description().isUndefined() && dto.readme().isUndefined()
                && dto.archived().isUndefined() && dto.teacherIds().isUndefined()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "At least one field must be provided for update");
        }

        Course course = courseRepository.findBySlugAndCommunitySlugAndStudyYearNameWithTeachersAndCommunity(courseSlug, communitySlug, studyYearName)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Course not found"));

        int studyYearId = course.getStudyYear().getId();

        if (dto.name().isPresent()) {
            String name = dto.name().get();
            if (name != null && !name.equalsIgnoreCase(course.getName())) {
                if (courseRepository.existsByStudyYearIdAndNameIgnoreCaseAndIdNot(studyYearId, name, course.getId())) {
                    throw new ResponseStatusException(HttpStatus.CONFLICT, "Course with this name already exists in this study year");
                }
                course.setName(name);
            }
        }

        if (dto.slug().isPresent()) {
            String slug = dto.slug().get();
            if (slug != null && !slug.equalsIgnoreCase(course.getSlug())) {
                if (courseRepository.existsByStudyYearIdAndSlugIgnoreCaseAndIdNot(studyYearId, slug, course.getId())) {
                    throw new ResponseStatusException(HttpStatus.CONFLICT, "Course with this slug already exists in this study year");
                }
                course.setSlug(slug);
            }
        }

        dto.abbreviation().ifPresent(course::setAbbreviation);
        dto.semester().ifPresent(course::setSemester);
        dto.creditPoints().ifPresent(course::setCreditPoints);
        dto.description().ifPresent(course::setDescription);
        dto.readme().ifPresent(course::setReadme);
        dto.archived().ifPresent(course::setArchived);

        if (dto.teacherIds().isPresent()) {
            List<UUID> teacherIds = dto.teacherIds().get();
            List<Teacher> newTeachers = Collections.emptyList();
            if (teacherIds != null && !teacherIds.isEmpty()) {
                newTeachers = teacherRepository.findAllByIdInAndCommunityId(teacherIds, course.getStudyYear().getCommunity().getId());
                if (newTeachers.size() != teacherIds.size()) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "One or more teachers were not found in this community");
                }
            }

            List<Teacher> currentTeachers = course.getTeachers() != null ? new ArrayList<>(course.getTeachers()) : new ArrayList<>();
            Set<UUID> targetIds = newTeachers.stream().map(Teacher::getId).collect(Collectors.toSet());

            for (Teacher current : currentTeachers) {
                if (!targetIds.contains(current.getId())) {
                    if (current.getCoursesTaught() != null) {
                        current.getCoursesTaught().remove(course);
                    }
                    teacherRepository.save(current);
                }
            }

            for (Teacher newTeacher : newTeachers) {
                if (newTeacher.getCoursesTaught() == null) {
                    newTeacher.setCoursesTaught(new ArrayList<>());
                }
                if (!newTeacher.getCoursesTaught().contains(course)) {
                    newTeacher.getCoursesTaught().add(course);
                }
                teacherRepository.save(newTeacher);
            }

            course.setTeachers(new ArrayList<>(newTeachers));
        }

        Course saved = courseRepository.save(course);
        return resourceMapper.toCourseResponseDto(saved);
    }

    @Transactional
    public void deleteCourse(String communitySlug, StudyYearName studyYearName, String courseSlug) {
        Course course = courseRepository.findBySlugAndCommunitySlugAndStudyYearName(courseSlug, communitySlug, studyYearName)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Course not found"));

        courseRepository.delete(course);
    }

    @Transactional
    public CourseResponseDto archiveCourse(String communitySlug, StudyYearName studyYearName, String courseSlug, boolean archived) {
        Course course = courseRepository.findBySlugAndCommunitySlugAndStudyYearName(courseSlug, communitySlug, studyYearName)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Course not found"));

        course.setArchived(archived);
        Course saved = courseRepository.save(course);
        return resourceMapper.toCourseResponseDto(saved);
    }

    @Transactional
    public CourseHomeResponseDto addTeacher(String communitySlug, StudyYearName studyYearName, String courseSlug, UUID teacherId) {
        Course course = courseRepository.findBySlugAndCommunitySlugAndStudyYearNameWithTeachersAndCommunity(courseSlug, communitySlug, studyYearName)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Course not found"));

        Teacher teacher = teacherRepository.findByIdWithCommunity(teacherId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Teacher not found"));

        if (!teacher.getCommunity().getId().equals(course.getStudyYear().getCommunity().getId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Teacher does not belong to this community");
        }

        if (teacher.getCoursesTaught() == null) {
            teacher.setCoursesTaught(new ArrayList<>());
        }
        if (!teacher.getCoursesTaught().contains(course)) {
            teacher.getCoursesTaught().add(course);
        }

        if (course.getTeachers() == null) {
            course.setTeachers(new ArrayList<>());
        }
        if (!course.getTeachers().contains(teacher)) {
            course.getTeachers().add(teacher);
        }

        teacherRepository.save(teacher);
        Course saved = courseRepository.save(course);
        return resourceMapper.toCourseHomeResponseDto(saved);
    }

    @Transactional
    public CourseHomeResponseDto removeTeacher(String communitySlug, StudyYearName studyYearName, String courseSlug, UUID teacherId) {
        Course course = courseRepository.findBySlugAndCommunitySlugAndStudyYearNameWithTeachersAndCommunity(courseSlug, communitySlug, studyYearName)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Course not found"));

        Teacher teacher = teacherRepository.findByIdWithCommunity(teacherId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Teacher not found"));

        if (teacher.getCoursesTaught() != null) {
            teacher.getCoursesTaught().remove(course);
        }
        if (course.getTeachers() != null) {
            course.getTeachers().remove(teacher);
        }

        teacherRepository.save(teacher);
        Course saved = courseRepository.save(course);
        return resourceMapper.toCourseHomeResponseDto(saved);
    }
}
