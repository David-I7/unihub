package com.unihub.app.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

import java.util.regex.Pattern;

public class UsernameValidator implements ConstraintValidator<Username,String>{

    private static Pattern USERNAME_PATTERN = Pattern.compile("[a-zA-Z0-9][a-zA-Z0-9_-]{1,}[a-zA-Z0-9]$");

    private static final Pattern ALLOWED_CHARS_PATTERN =
            Pattern.compile("^[a-zA-Z0-9_-]+$");

    @Override
    public boolean isValid(String username, ConstraintValidatorContext context) {
        // 1. Nulls are allowed
        if (username == null) {
            return true;
        }

        // 2. Check length requirement (Under 3 characters not allowed)
        if (username.length() < 3) {
            setCustomMessage(context, "Username must be at least 3 characters long.");
            return false;
        }

        // 3. Check for invalid characters
        if (!ALLOWED_CHARS_PATTERN.matcher(username).matches()) {
            setCustomMessage(context, "Username can only contain letters, numbers, underscores (_), and hyphens (-).");
            return false;
        }

        // 4. Check start and end constraints (Must be alphanumeric)
        if (!USERNAME_PATTERN.matcher(username).matches()) {
            setCustomMessage(context, "Username must start and end with a letter or a number.");
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
