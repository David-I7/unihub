package com.unihub.app.mappers.community;

import com.unihub.app.dto.PageDto;
import com.unihub.app.dto.community.OwnerDto;
import com.unihub.app.dto.community.resources.request.CreateCommunityRequestDto;
import com.unihub.app.dto.community.resources.request.CreateJoinCodeRequestDto;
import com.unihub.app.dto.community.resources.request.CreateStudyYearRequestDto;
import com.unihub.app.dto.community.resources.response.*;
import com.unihub.app.dto.globalResources.TeacherResponseDto;
import com.unihub.app.entities.authentication.User;
import com.unihub.app.entities.community.resources.*;
import com.unihub.app.mappers.GlobalResourceMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.OffsetDateTime;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class CommunityResourceMapper {

    private final GlobalResourceMapper globalResourceMapper;

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
                .readme(community.getReadme())
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
                ? course.getTeachers().stream().map(globalResourceMapper::toTeacherResponseDto).toList()
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
}
