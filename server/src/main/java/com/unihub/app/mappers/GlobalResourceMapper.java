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
}
