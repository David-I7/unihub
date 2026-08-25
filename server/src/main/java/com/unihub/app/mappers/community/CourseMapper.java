package com.unihub.app.mappers.community;

import com.unihub.app.dto.community.resources.CourseSummaryDto;
import com.unihub.app.dto.community.resources.CourseTeacherDto;
import com.unihub.app.dto.community.resources.StudyYearDetailResponseDto;
import com.unihub.app.entities.community.resources.Course;
import com.unihub.app.entities.community.resources.StudyYear;
import com.unihub.app.entities.globalResources.Teacher;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;

@Component
public class CourseMapper {

    public CourseSummaryDto toSummaryDto(Course course) {
        List<CourseTeacherDto> teachers = course.getTeachers() != null
                ? course.getTeachers().stream().map(this::toTeacherDto).toList()
                : Collections.emptyList();

        return CourseSummaryDto.builder()
                .id(course.getId())
                .name(course.getName())
                .abbreviation(course.getAbbreviation())
                .semester(course.getSemester())
                .creditPoints(course.getCreditPoints())
                .archived(course.isArchived())
                .description(course.getDescription())
                .teachers(teachers)
                .build();
    }

    public CourseTeacherDto toTeacherDto(Teacher teacher) {
        return CourseTeacherDto.builder()
                .id(teacher.getId())
                .firstName(teacher.getFirstName())
                .lastName(teacher.getLastName())
                .averageRating(teacher.getAverageRating())
                .ratingsCount(teacher.getRatingsCount())
                .build();
    }

    public StudyYearDetailResponseDto toStudyYearDetailDto(StudyYear studyYear, List<CourseSummaryDto> courses) {
        return StudyYearDetailResponseDto.builder()
                .id(studyYear.getId())
                .studyYearName(studyYear.getStudyYearName())
                .courses(courses)
                .build();
    }
}
