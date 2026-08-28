package com.unihub.app.validation;


import com.unihub.app.dto.authentication.LocalUsernameOrEmailLoginRequestDto;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import org.hibernate.validator.internal.constraintvalidators.bv.EmailValidator;

import java.lang.reflect.Method;
import java.util.Arrays;

public class UsernameOrEmailValidator implements ConstraintValidator<UsernameOrEmail, LocalUsernameOrEmailLoginRequestDto> {

    @Override
    public boolean isValid(LocalUsernameOrEmailLoginRequestDto value, ConstraintValidatorContext context) {
        if (value == null) return false;

        var email = value.email();
        var username = value.username();

        if (username == null && email == null) {
            setCustomMessage(context, "Either username or email must be provided.");
            return false;
        }

        if (username != null && email != null) {
            setCustomMessage(context, "Only one of username or email should be provided.");
            return false;
        }

        return true;
    }

    private void setCustomMessage(ConstraintValidatorContext context, String message) {
        context.disableDefaultConstraintViolation();
        context.buildConstraintViolationWithTemplate(message)
                .addConstraintViolation();
    }
}
