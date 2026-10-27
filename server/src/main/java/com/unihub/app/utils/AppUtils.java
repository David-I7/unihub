package com.unihub.app.utils;

import com.unihub.app.config.DevelopmentProperties;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.util.List;

@Component
@RequiredArgsConstructor
public class AppUtils {

    private final DevelopmentProperties developmentProperties;

    public String getClientOrigin(){
        return developmentProperties.clientOrigin();
    }

    public String getOrigin(){
       return developmentProperties.origin();
    }

    public boolean isDevelopment(){
        return developmentProperties.isDevelopment();
    }

    public List<String> getAllowedOrigins(){
        return java.util.stream.Stream.of(developmentProperties.clientOrigin(), developmentProperties.origin())
                .toList();
    }
}
