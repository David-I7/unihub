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

        if(methods.length == 0){ return false;}

        for(Method method : methods){
            try{
                if(method.canAccess(value)) {
                    if (isUsernameMethod(method)) {
                        var username = method.invoke(value);

                        if(username instanceof String usernameStr && usernameValidator.isValid(usernameStr, context)){
                            return true;
                        }

                    }else if (isEmailMethod(method)) {
                        var email = method.invoke(value);

                        if(email instanceof String emailStr && emailValidator.isValid(emailStr, context)){
                            return true;
                        }
                    }
                }
            }catch (ReflectiveOperationException e) {
                return false;
            }
        }

        return false;
    }

    private boolean isEmailMethod(Method method){
        return method.getName().equals("getEmail") || method.getName().equals("email");
    }

    private boolean isUsernameMethod(Method method){
        return method.getName().equals("getUsername") || method.getName().equals("username");
    }
}
