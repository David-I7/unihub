package com.unihub.app.mappers;

import com.unihub.app.dto.globalResources.TeacherResponseDto;
import com.unihub.app.entities.globalResources.Teacher;
import org.springframework.stereotype.Component;

@Component
public class GlobalResourceMapper {

    public TeacherResponseDto toTeacherResponseDto(Teacher teacher) {
        return TeacherResponseDto.builder()
                .id(teacher.getId())
                .firstName(teacher.getFirstName())
                .lastName(teacher.getLastName())
                .averageRating(teacher.getAverageRating())
                .ratingsCount(teacher.getRatingsCount())
                .createdAt(teacher.getCreatedAt())
                .build();
    }

    public com.unihub.app.dto.globalResources.TeacherWithCoursesDto toTeacherWithCoursesDto(Teacher teacher, java.util.List<com.unihub.app.dto.community.resources.CourseSummaryDto> courses) {
        return com.unihub.app.dto.globalResources.TeacherWithCoursesDto.builder()
                .id(teacher.getId())
                .firstName(teacher.getFirstName())
                .lastName(teacher.getLastName())
                .averageRating(teacher.getAverageRating())
                .ratingsCount(teacher.getRatingsCount())
                .createdAt(teacher.getCreatedAt())
                .courses(courses)
                .build();
    }
}
