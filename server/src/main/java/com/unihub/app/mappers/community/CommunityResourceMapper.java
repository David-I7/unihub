package com.unihub.app.mappers.community;

import com.unihub.app.dto.community.OwnerDto;
import com.unihub.app.dto.community.resources.*;
import com.unihub.app.dto.globalResources.TeacherResponseDto;
import com.unihub.app.entities.community.resources.Community;
import com.unihub.app.entities.community.resources.Course;
import com.unihub.app.entities.community.resources.StudyYear;
import com.unihub.app.entities.globalResources.Teacher;
import com.unihub.app.mappers.GlobalResourceMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;

@Component
@RequiredArgsConstructor
public class CommunityResourceMapper {

    private final GlobalResourceMapper globalResourceMapper;

    public CommunityResponseDto toCommunityResponseDto(Community community) {
        return CommunityResponseDto.builder()
                .id(community.getId())
                .name(community.getName())
                .description(community.getDescription())
                .memberCount(community.getMemberCount())
                .createdAt(community.getCreatedAt())
                .owner(new OwnerDto(community.getOwner().getId(), community.getOwner().getUsername()))
                .backgroundColor(community.getBackgroundColor())
                .verified(community.isVerified())
                .slug(community.getSlug())
                .build();
    }

    public Community toCommunity(CommunityRequestDto communityRequestDto) {
        return Community.builder()
                .name(communityRequestDto.name())
                .description(communityRequestDto.description())
                .backgroundColor(communityRequestDto.backgroundColor())
                .slug(communityRequestDto.slug())
                .build();
    }

    public CourseSummaryDto toCourseSummaryDto(Course course) {
        List<TeacherResponseDto> teachers = course.getTeachers() != null
                ? course.getTeachers().stream().map(globalResourceMapper::toTeacherResponseDto).toList()
                : Collections.emptyList();

        return CourseSummaryDto.builder()
                .id(course.getId())
                .name(course.getName())
                .slug(course.getSlug())
                .abbreviation(course.getAbbreviation())
                .semester(course.getSemester())
                .creditPoints(course.getCreditPoints())
                .archived(course.isArchived())
                .description(course.getDescription())
                .teachers(teachers)
                .build();
    }

    public StudyYearDetailResponseDto toStudyYearDetailResponseDto(StudyYear studyYear, List<CourseSummaryDto> courses) {
        return StudyYearDetailResponseDto.builder()
                .id(studyYear.getId())
                .studyYearName(studyYear.getStudyYearName())
                .courses(courses)
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
                .build();
    }
}
