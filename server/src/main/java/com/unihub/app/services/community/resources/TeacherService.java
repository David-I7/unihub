package com.unihub.app.services.community.resources;

import com.unihub.app.domain.PermissionType;
import com.unihub.app.dto.PageDto;
import com.unihub.app.dto.UserDto;
import com.unihub.app.dto.community.resources.request.CreateTeacherRequestDto;
import com.unihub.app.dto.community.resources.request.UpdateTeacherRequestDto;
import com.unihub.app.dto.community.resources.response.*;
import com.unihub.app.entities.community.resources.Community;
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
        if (caller == null || !authorizationService.hasCommunityPermission(communitySlug, caller.id(), PermissionType.CREATE_TEACHER)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Permission denied to create teacher");
        }

        Community community = communityRepository.findBySlug(communitySlug)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Community not found"));

        String firstName = dto.firstName().trim();
        String lastName = dto.lastName().trim();

        Optional<Teacher> existing = teacherRepository.findByCommunityIdAndFirstNameAndLastName(
                community.getId(), firstName, lastName
        );
        if (existing.isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Teacher with the same first and last name already exists in this community");
        }

        Teacher teacher = resourceMapper.toTeacherEntity(dto, community);
        teacher.setFirstName(firstName);
        teacher.setLastName(lastName);

        Teacher saved = teacherRepository.save(teacher);
        return resourceMapper.toTeacherResponseDto(saved);
    }

    @Transactional
    public TeacherResponseDto updateTeacher(UUID teacherId, UserDto caller, UpdateTeacherRequestDto dto) {
        if (dto.firstName() == null && dto.lastName() == null && dto.estimatedAge() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "At least one field must be provided for update");
        }

        Teacher teacher = teacherRepository.findByIdWithCommunity(teacherId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Teacher not found"));

        String communitySlug = teacher.getCommunity().getSlug();
        if (caller == null || !authorizationService.hasCommunityPermission(communitySlug, caller.id(), PermissionType.UPDATE_TEACHER)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Permission denied to update teacher");
        }

        String newFirstName = dto.firstName() != null ? dto.firstName().trim() : teacher.getFirstName();
        String newLastName = dto.lastName() != null ? dto.lastName().trim() : teacher.getLastName();

        if (!newFirstName.equalsIgnoreCase(teacher.getFirstName()) || !newLastName.equalsIgnoreCase(teacher.getLastName())) {
            Optional<Teacher> duplicate = teacherRepository.findByCommunityIdAndFirstNameAndLastName(
                    teacher.getCommunity().getId(), newFirstName, newLastName
            );
            if (duplicate.isPresent() && !duplicate.get().getId().equals(teacherId)) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Teacher with the same name already exists in this community");
            }
        }

        if (dto.firstName() != null) {
            teacher.setFirstName(newFirstName);
        }
        if (dto.lastName() != null) {
            teacher.setLastName(newLastName);
        }
        if (dto.estimatedAge() != null) {
            teacher.setEstimatedBirthDate(LocalDate.now().minusYears(dto.estimatedAge()));
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
    public PageDto<TeacherResponseDto> getPaginatedTeachers(String communitySlug, String search, Pageable pageable) {
        if (!communityRepository.existsBySlug(communitySlug)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Community not found");
        }

        Page<Teacher> page = (search != null && !search.isBlank())
                ? teacherRepository.findByCommunitySlugAndSearch(communitySlug, search.trim(), pageable)
                : teacherRepository.findByCommunitySlug(communitySlug, pageable);

        return pageMapper.toPageDto(page.map(resourceMapper::toTeacherResponseDto));
    }

    @Transactional(readOnly = true)
    public TeacherDetailResponseDto getTeacherDetail(UUID teacherId, Pageable pageable) {
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

        Page<TeacherRating> ratingsPage = teacherRatingRepository.findByTeacherId(teacherId, pageable);
        PageDto<TeacherRatingResponseDto> ratingsDto = pageMapper.toPageDto(
                ratingsPage.map(resourceMapper::toTeacherRatingResponseDto)
        );

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
                .ratings(ratingsDto)
                .build();
    }
}
