package com.unihub.app.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.*;

@Documented
@Constraint(validatedBy = UsernameOrEmailValidator.class)
@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
public @interface UsernameOrEmail {

    String message() default "Invalid username or email.";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};

}
