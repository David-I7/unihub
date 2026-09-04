package com.unihub.app.mappers.community;

import com.unihub.app.dto.PageDto;
import com.unihub.app.dto.community.OwnerDto;
import com.unihub.app.dto.community.resources.request.CreateCommunityRequestDto;
import com.unihub.app.dto.community.resources.request.CreateCourseRequestDto;
import com.unihub.app.dto.community.resources.request.CreateJoinCodeRequestDto;
import com.unihub.app.dto.community.resources.request.CreateStudyYearRequestDto;
import com.unihub.app.dto.community.resources.request.CreateTeacherRequestDto;
import com.unihub.app.dto.community.resources.response.*;
import com.unihub.app.entities.authentication.User;
import com.unihub.app.entities.community.resources.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.Period;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class CommunityResourceMapper {

    public TeacherResponseDto toTeacherResponseDto(Teacher teacher) {
        Integer estimatedAge = teacher.getEstimatedBirthDate() != null
                ? Period.between(teacher.getEstimatedBirthDate(), LocalDate.now()).getYears()
                : null;

        return TeacherResponseDto.builder()
                .id(teacher.getId())
                .firstName(teacher.getFirstName())
                .lastName(teacher.getLastName())
                .estimatedAge(estimatedAge)
                .averageRating(teacher.getAverageRating())
                .ratingsCount(teacher.getRatingsCount())
                .createdAt(teacher.getCreatedAt())
                .build();
    }

    public Teacher toTeacherEntity(CreateTeacherRequestDto dto, Community community) {
        LocalDate estimatedBirthDate = dto.estimatedAge() != null
                ? LocalDate.now().minusYears(dto.estimatedAge())
                : null;

        return Teacher.builder()
                .community(community)
                .firstName(dto.firstName())
                .lastName(dto.lastName())
                .estimatedBirthDate(estimatedBirthDate)
                .averageRating(0.0f)
                .ratingsCount(0)
                .createdAt(OffsetDateTime.now())
                .build();
    }

    public TeacherRatingValueResponseDto toTeacherRatingValueResponseDto(TeacherRatingValue value) {
        return TeacherRatingValueResponseDto.builder()
                .metricId(value.getRatingMetric().getId())
                .metricName(value.getRatingMetric().getName())
                .value(value.getValue())
                .build();
    }

    public TeacherRatingResponseDto toTeacherRatingResponseDto(TeacherRating rating) {
        OwnerDto author = null;
        if (!rating.isAnonymous() && rating.getUser() != null) {
            author = new OwnerDto(
                    rating.getUser().getId(),
                    rating.getUser().getUsername(),
                    rating.getUser().isActive()
            );
        }

        List<TeacherRatingValueResponseDto> values = rating.getValues() != null
                ? rating.getValues().stream().map(this::toTeacherRatingValueResponseDto).toList()
                : Collections.emptyList();

        return TeacherRatingResponseDto.builder()
                .id(rating.getId())
                .title(rating.getTitle())
                .description(rating.getDescription())
                .createdAt(rating.getCreatedAt())
                .isAnonymous(rating.isAnonymous())
                .author(author)
                .values(values)
                .build();
    }

    public Community toCommunityEntity(CreateCommunityRequestDto dto, User owner, boolean verified, OffsetDateTime createdAt) {
        return Community.builder()
                .name(dto.name())
                .slug(dto.slug())
                .description(dto.description())
                .readme(dto.readme())
                .backgroundColor(dto.backgroundColor())
                .verified(verified)
                .memberCount(1)
                .owner(owner)
                .createdAt(createdAt)
                .build();
    }

    public CommunityMember toCommunityMemberEntity(Community community, User user, UUID roleId, OffsetDateTime joinedAt) {
        return CommunityMember.builder()
                .id(new CommunityMembersId(community.getId(), user.getId()))
                .community(community)
                .user(user)
                .roleId(roleId)
                .joinedAt(joinedAt)
                .build();
    }

    public CommunityMemberResponseDto toCommunityMemberResponseDto(CommunityMember member, String roleName) {
        return CommunityMemberResponseDto.builder()
                .userId(member.getUser().getId())
                .username(member.getUser().getUsername())
                .email(member.getUser().getEmail())
                .role(roleName)
                .joinedAt(member.getJoinedAt())
                .build();
    }

    public CommunityJoinCode toCommunityJoinCodeEntity(
            CreateJoinCodeRequestDto dto,
            Community community,
            User creator,
            String code,
            OffsetDateTime now,
            OffsetDateTime expiresAt
    ) {
        return CommunityJoinCode.builder()
                .community(community)
                .code(code)
                .createdBy(creator)
                .maxUses(dto != null ? dto.maxUses() : null)
                .usesCount(0)
                .expiresAt(expiresAt)
                .createdAt(now)
                .build();
    }

    public CommunityJoinCodeResponseDto toCommunityJoinCodeResponseDto(CommunityJoinCode joinCode) {
        return CommunityJoinCodeResponseDto.builder()
                .id(joinCode.getId())
                .code(joinCode.getCode())
                .communityId(joinCode.getCommunity().getId())
                .communitySlug(joinCode.getCommunity().getSlug())
                .maxUses(joinCode.getMaxUses())
                .usesCount(joinCode.getUsesCount())
                .expiresAt(joinCode.getExpiresAt())
                .createdAt(joinCode.getCreatedAt())
                .build();
    }

    public CommunityResponseDto toCommunityResponseDto(Community community, boolean isJoined) {
        return CommunityResponseDto.builder()
                .id(community.getId())
                .name(community.getName())
                .description(community.getDescription())
                .memberCount(community.getMemberCount())
                .createdAt(community.getCreatedAt())
                .owner(new OwnerDto(community.getOwner().getId(), community.getOwner().getUsername(), community.getOwner().isActive()))
                .backgroundColor(community.getBackgroundColor())
                .verified(community.isVerified())
                .slug(community.getSlug())
                .isJoined(isJoined)
                .build();
    }

    public CourseHomeResponseDto toCourseHomeResponseDto(Course course) {
        List<TeacherResponseDto> teachers = course.getTeachers() != null
                ? course.getTeachers().stream().map(this::toTeacherResponseDto).toList()
                : Collections.emptyList();

        CourseResponseDto courseResponseDto = toCourseResponseDto(course);

        return CourseHomeResponseDto.builder()
                .course(courseResponseDto)
                .teachers(teachers)
                .build();
    }

    public StudyYearHomeResponseDto toStudyYearHomeResponseDto(StudyYear studyYear, PageDto<CourseHomeResponseDto> courses) {
        return StudyYearHomeResponseDto.builder()
                .studyYear(toStudyYearResponseDto(studyYear))
                .courses(courses)
                .build();
    }

    public StudyYear toStudyYearEntity(CreateStudyYearRequestDto dto, Community community) {
        return StudyYear.builder()
                .studyYearName(dto.studyYearName())
                .community(community)
                .createdAt(OffsetDateTime.now())
                .build();
    }

    public StudyYearResponseDto toStudyYearResponseDto(StudyYear studyYear) {
        return StudyYearResponseDto.builder()
                .id(studyYear.getId())
                .name(studyYear.getStudyYearName())
                .createdAt(studyYear.getCreatedAt())
                .build();
    }

    public CourseIdentifiersResponseDto courseIdentifiersResponseDto(Course course){
        return CourseIdentifiersResponseDto.builder()
                .id(course.getId())
                .slug(course.getSlug())
                .abbreviation(course.getAbbreviation())
                .name(course.getName())
                .semester(course.getSemester())
                .build();
    }

    public Course toCourseEntity(CreateCourseRequestDto dto, StudyYear studyYear, List<Teacher> teachers) {
        return Course.builder()
                .name(dto.name())
                .slug(dto.slug())
                .abbreviation(dto.abbreviation())
                .studyYear(studyYear)
                .semester(dto.semester())
                .creditPoints(dto.creditPoints() != null ? dto.creditPoints() : 5)
                .archived(false)
                .description(dto.description())
                .readme(dto.readme())
                .teachers(teachers != null ? teachers : Collections.emptyList())
                .createdAt(OffsetDateTime.now())
                .build();
    }

    public CourseResponseDto toCourseResponseDto(Course course) {
        return CourseResponseDto.builder()
                .id(course.getId())
                .name(course.getName())
                .slug(course.getSlug())
                .abbreviation(course.getAbbreviation())
                .semester(course.getSemester())
                .creditPoints(course.getCreditPoints())
                .archived(course.isArchived())
                .description(course.getDescription())
                .readme(course.getReadme())
                .build();
    }

    public CommunityHomeResponseDto toCommunityHomeResponseDto(
            CommunityResponseDto community,
            List<StudyYearMetricsResponseDto> studyYears,
            CallerMembershipDto callerMembership
    ) {
        return CommunityHomeResponseDto.builder()
                .community(community)
                .studyYears(studyYears)
                .callerMembership(callerMembership)
                .build();
    }

    public CommunityJoinPreviewResponseDto toCommunityJoinPreviewResponseDto(Community community, boolean isMember) {
        return CommunityJoinPreviewResponseDto.builder()
                .communityId(community.getId())
                .name(community.getName())
                .slug(community.getSlug())
                .description(community.getDescription())
                .backgroundColor(community.getBackgroundColor())
                .memberCount(community.getMemberCount())
                .verified(community.isVerified())
                .isMember(isMember)
                .build();
    }

    public OwnerDto toOwnerDto(User user) {
        if(user == null) return null;
        return new OwnerDto(user.getId(), user.getUsername(), user.isActive());
    }
}
