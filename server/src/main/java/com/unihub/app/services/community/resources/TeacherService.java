package com.unihub.app.services.community.resources;

import com.unihub.app.domain.PermissionType;
import com.unihub.app.dto.PageDto;
import com.unihub.app.dto.UserDto;
import com.unihub.app.dto.community.resources.request.CreateTeacherRequestDto;
import com.unihub.app.dto.community.resources.request.UpdateTeacherRequestDto;
import com.unihub.app.dto.community.resources.response.*;
import com.unihub.app.entities.community.resources.Community;
import com.unihub.app.entities.community.resources.StudyYearName;
import com.unihub.app.entities.community.resources.Teacher;
import com.unihub.app.entities.community.resources.TeacherRating;
import com.unihub.app.mappers.PageMapper;
import com.unihub.app.mappers.community.CommunityResourceMapper;
import com.unihub.app.repositories.community.resources.CommunityRepository;
import com.unihub.app.repositories.community.resources.TeacherRatingRepository;
import com.unihub.app.repositories.community.resources.TeacherRepository;
import com.unihub.app.services.authorization.AuthorizationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.Period;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TeacherService {

    private final TeacherRepository teacherRepository;
    private final TeacherRatingRepository teacherRatingRepository;
    private final CommunityRepository communityRepository;
    private final AuthorizationService authorizationService;
    private final CommunityResourceMapper resourceMapper;
    private final PageMapper pageMapper;

    @Transactional
    public TeacherResponseDto createTeacher(String communitySlug, UserDto caller, CreateTeacherRequestDto dto) {
        if(caller == null || !authorizationService.hasCommunityPermission(communitySlug, caller.id(), PermissionType.CREATE_TEACHER)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Permission denied to create teacher");
        }

        Community community = communityRepository.findBySlug(communitySlug)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Community not found"));

        String firstName = dto.firstName();
        String lastName = dto.lastName();

        Optional<Teacher> existing = teacherRepository.findByCommunityIdAndFirstNameAndLastName(
                community.getId(), firstName, lastName
        );
        if (existing.isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Teacher with the same first and last name already exists in this community");
        }

        Teacher teacher = resourceMapper.toTeacherEntity(dto, community);
        Teacher saved = teacherRepository.save(teacher);
        return resourceMapper.toTeacherResponseDto(saved);
    }

    @Transactional
    public TeacherResponseDto updateTeacher(UUID teacherId, UserDto caller, UpdateTeacherRequestDto dto) {
        if (dto.firstName().isUndefined() && dto.lastName().isUndefined() && dto.estimatedAge().isUndefined()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "At least one field must be provided for update");
        }

        Teacher teacher = teacherRepository.findByIdWithCommunity(teacherId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Teacher not found"));

        String communitySlug = teacher.getCommunity().getSlug();

        if (caller == null || !authorizationService.hasCommunityPermission(communitySlug, caller.id(), PermissionType.UPDATE_TEACHER)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Permission denied to update teacher");
        }

        String targetFirstName = dto.firstName().isPresent() ? dto.firstName().get() : teacher.getFirstName();
        String targetLastName = dto.lastName().isPresent() ? dto.lastName().get() : teacher.getLastName();

        if (targetFirstName != null && targetLastName != null &&
                (!targetFirstName.equalsIgnoreCase(teacher.getFirstName()) || !targetLastName.equalsIgnoreCase(teacher.getLastName()))) {
            Optional<Teacher> duplicate = teacherRepository.findByCommunityIdAndFirstNameAndLastName(
                    teacher.getCommunity().getId(), targetFirstName, targetLastName
            );
            if (duplicate.isPresent() && !duplicate.get().getId().equals(teacherId)) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Teacher with the same name already exists in this community");
            }
        }

        dto.firstName().ifPresent(teacher::setFirstName);
        dto.lastName().ifPresent(teacher::setLastName);
        if (dto.estimatedAge().isPresent()) {
            Integer age = dto.estimatedAge().get();
            teacher.setEstimatedBirthDate(age != null ? LocalDate.now().minusYears(age) : null);
        }

        Teacher saved = teacherRepository.save(teacher);
        return resourceMapper.toTeacherResponseDto(saved);
    }

    @Transactional
    public void deleteTeacher(UUID teacherId, UserDto caller) {
        Teacher teacher = teacherRepository.findByIdWithCommunity(teacherId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Teacher not found"));

        String communitySlug = teacher.getCommunity().getSlug();
        if (caller == null || !authorizationService.hasCommunityPermission(communitySlug, caller.id(), PermissionType.DELETE_TEACHER)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Permission denied to delete teacher");
        }

        teacherRepository.delete(teacher);
    }

    @Transactional(readOnly = true)
    public PageDto<TeacherResponseDto> getPaginatedTeachers(
            String communitySlug,
            String search,
            StudyYearName studyYear,
            Integer semester,
            Pageable pageable
    ) {
        if (!communityRepository.existsBySlug(communitySlug)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Community not found");
        }

        boolean hasSearch = search != null && !search.isBlank();
        boolean hasFilters = studyYear != null || semester != null;

        Page<Teacher> page;
        if (hasSearch && hasFilters) {
            page = teacherRepository.findByCommunitySlugAndFiltersAndSearch(
                    communitySlug, search.trim(), studyYear, semester, pageable
            );
        } else if (hasFilters) {
            page = teacherRepository.findByCommunitySlugAndFilters(
                    communitySlug, studyYear, semester, pageable
            );
        } else if (hasSearch) {
            page = teacherRepository.findByCommunitySlugAndSearch(
                    communitySlug, search.trim(), pageable
            );
        } else {
            page = teacherRepository.findByCommunitySlug(
                    communitySlug, pageable
            );
        }

        return pageMapper.toPageDto(page.map(resourceMapper::toTeacherResponseDto));
    }

    @Transactional(readOnly = true)
    public TeacherDetailResponseDto getTeacherDetail(UUID teacherId) {
        Teacher teacher = teacherRepository.findByIdWithCommunityAndCourses(teacherId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Teacher not found"));

        List<CourseIdentifiersResponseDto> coursesTaught = teacher.getCoursesTaught() != null
                ? teacher.getCoursesTaught().stream().map(resourceMapper::courseIdentifiersResponseDto).toList()
                : Collections.emptyList();

        List<Object[]> rawBreakdown = teacherRatingRepository.findMetricBreakdownByTeacherId(teacherId);
        List<TeacherMetricRatingDto> detailedRatings = rawBreakdown.stream().map(row -> {
            int metricId = ((Number) row[0]).intValue();
            String metricName = (String) row[1];
            String description = (String) row[2];
            float avg = ((Number) row[3]).floatValue();
            long count = ((Number) row[4]).longValue();
            return TeacherMetricRatingDto.builder()
                    .metricId(metricId)
                    .metricName(metricName)
                    .description(description)
                    .averageRating(avg)
                    .ratingsCount(count)
                    .build();
        }).toList();

        Integer estimatedAge = teacher.getEstimatedBirthDate() != null
                ? Period.between(teacher.getEstimatedBirthDate(), LocalDate.now()).getYears()
                : null;

        return TeacherDetailResponseDto.builder()
                .id(teacher.getId())
                .firstName(teacher.getFirstName())
                .lastName(teacher.getLastName())
                .estimatedAge(estimatedAge)
                .averageRating(teacher.getAverageRating())
                .ratingsCount(teacher.getRatingsCount())
                .createdAt(teacher.getCreatedAt())
                .coursesTaught(coursesTaught)
                .detailedRatings(detailedRatings)
                .build();
    }
}
