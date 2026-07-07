package com.unihub.app.mappers;

import com.unihub.app.dto.validation.ConstraintValidationDto;
import com.unihub.app.dto.validation.ConstraintValidationType;
import org.springframework.stereotype.Component;
import org.springframework.validation.FieldError;
import org.springframework.validation.ObjectError;

@Component
public class ObjectErrorMapper {

    public ConstraintValidationDto toDto(ObjectError error) {
        if (error instanceof FieldError fieldError) {
            return new ConstraintValidationDto(
                    ConstraintValidationType.FIELD,
                    fieldError.getObjectName(),
                    fieldError.getField(),
                    fieldError.getDefaultMessage()
            );
        } else {
            return new ConstraintValidationDto(
                    ConstraintValidationType.OBJECT,
                    error.getObjectName(),
                    null,
                    error.getDefaultMessage()
            );
        }
    }
}
