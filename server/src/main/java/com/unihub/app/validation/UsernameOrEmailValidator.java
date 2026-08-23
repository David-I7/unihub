package com.unihub.app.validation;


import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import org.hibernate.validator.internal.constraintvalidators.bv.EmailValidator;

import java.lang.reflect.Method;
import java.util.Arrays;

public class UsernameOrEmailValidator implements ConstraintValidator<UsernameOrEmail,Object> {

    private static final EmailValidator emailValidator = new EmailValidator();

    private static final UsernameValidator usernameValidator = new UsernameValidator();

    @Override
    public boolean isValid(Object value, ConstraintValidatorContext context) {
        if(value == null) return false;

        Method[] methods =  Arrays.stream(value.getClass().getDeclaredMethods())
                .filter(method -> method.getParameterCount() == 0)
                .filter(method->
                        isUsernameMethod(method) ||
                        isEmailMethod(method))
                .toArray(Method[]::new);

        if(methods.length != 2){ return false;}

        var usernameMethod = Arrays.stream(methods).filter(this::isUsernameMethod).findFirst().orElseThrow();
        var emailMethod = Arrays.stream(methods).filter(this::isEmailMethod).findFirst().orElseThrow();

        if (!usernameMethod.canAccess(value) || !emailMethod.canAccess(value)) {
            return false;
        }

        try{
            var username = usernameMethod.invoke(value);
            var email = emailMethod.invoke(value);

            if(username == null && email == null){
                setCustomMessage(context, "Either username or email must be provided.");
                return false;
            }

            if (username != null && email != null) {
                setCustomMessage(context, "Only one of username or email should be provided.");
                return false;
            }

            if (username != null) {
                if (username instanceof String usernameStr && usernameValidator.isValid(usernameStr, context)) {
                    return true;
                }
                return false;
            }else {
                if (email instanceof String emailStr && emailValidator.isValid(emailStr, context)) {
                    return true;
                }
                setCustomMessage(context, "Invalid email format.");
                return false;
            }
        }catch (ReflectiveOperationException e) {
            return false;
        }
    }

    private boolean isEmailMethod(Method method){
        return method.getName().equals("getEmail") || method.getName().equals("email");
    }

    private boolean isUsernameMethod(Method method){
        return method.getName().equals("getUsername") || method.getName().equals("username");
    }

    private void setCustomMessage(ConstraintValidatorContext context, String message) {
        context.disableDefaultConstraintViolation();
        context.buildConstraintViolationWithTemplate(message)
                .addConstraintViolation();
    }
}
