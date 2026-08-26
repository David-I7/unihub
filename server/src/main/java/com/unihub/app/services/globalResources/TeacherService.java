package com.unihub.app.services.globalResources;

import com.unihub.app.dto.PageDto;
import com.unihub.app.dto.community.resources.CourseSummaryDto;
import com.unihub.app.dto.globalResources.TeacherResponseDto;
import com.unihub.app.dto.globalResources.TeacherWithCoursesDto;
import com.unihub.app.entities.globalResources.Teacher;
import com.unihub.app.mappers.GlobalResourceMapper;
import com.unihub.app.mappers.PageMapper;
import com.unihub.app.mappers.community.CommunityResourceMapper;
import com.unihub.app.repositories.globalResources.TeacherRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class TeacherService {

    private final TeacherRepository teacherRepository;
    private final GlobalResourceMapper globalResourceMapper;
    private final CommunityResourceMapper communityResourceMapper;
    private final PageMapper pageMapper;

    @Transactional(readOnly = true)
    public PageDto<TeacherResponseDto> findAll(Pageable pageable) {
        return pageMapper.toPageDto(teacherRepository.findAll(pageable)
                .map(globalResourceMapper::toTeacherResponseDto));
    }

    @Transactional(readOnly = true)
    public List<TeacherWithCoursesDto> getCommunityTeachers(String communitySlug) {
        List<Teacher> teachers = teacherRepository.findByCommunitySlugWithCourses(communitySlug);

        return teachers.stream()
                .map(teacher -> {
                    List<CourseSummaryDto> communityCourses = teacher.getCoursesTaught() == null
                            ? List.of()
                            : teacher.getCoursesTaught().stream()
                            .filter(c -> c.getStudyYear().getCommunity().getSlug().equals(communitySlug))
                            .map(communityResourceMapper::toCourseSummaryDto)
                            .toList();

                    return globalResourceMapper.toTeacherWithCoursesDto(teacher, communityCourses);
                })
                .toList();
    }

    @Transactional
    public Teacher create(Teacher teacher){
        Optional<Teacher> teacherOptional = teacherRepository.findByFirstNameAndLastName(teacher.getFirstName(), teacher.getLastName());

        if (teacherOptional.isPresent()) throw new ResponseStatusException(
                HttpStatus.CONFLICT,
                "Teacher with the same first name and last name already exists"
        );

        return teacherRepository.save(teacher);
    }
}
