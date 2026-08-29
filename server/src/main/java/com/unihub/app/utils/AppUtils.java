package com.unihub.app.utils;

import com.unihub.app.config.DevelopmentProperties;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

@Component
@RequiredArgsConstructor
public class AppUtils {

    private final DevelopmentProperties developmentProperties;

    public String getOrigin(){
        if (developmentProperties.isDevelopment()){
            return developmentProperties.clientOrigin();
        }else return ServletUriComponentsBuilder
                .fromCurrentContextPath()
                .build()
                .toUriString();
    }

    public boolean isDevelopment(){
        return developmentProperties.isDevelopment();
    }
}
