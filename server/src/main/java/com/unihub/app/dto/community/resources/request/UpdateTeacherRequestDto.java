package com.unihub.app.dto.community.resources.request;

import lombok.Builder;

@Builder
public record UpdateTeacherRequestDto(
        String firstName,
        String lastName,
        Integer estimatedAge
) {
    public UpdateTeacherRequestDto {
        if(firstName == null) {;
            firstName = null;
        } else if(firstName.isBlank()){
            firstName = null;
        }else firstName = firstName.trim();

        if(lastName == null) {
            lastName = null;
        }else if(lastName.isBlank()){
            lastName = null;
        }else lastName = lastName.trim();
    }
}
