package com.unihub.app.config;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import org.openapitools.jackson.nullable.JsonNullableJackson3Module;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

@Configuration
@EnableScheduling
@EnableAsync
@EnableConfigurationProperties({SessionProperties.class, EmailProperties.class, DevelopmentProperties.class, AwsProperties.class, StorageProperties.class})
public class AppConfig {

    @Bean
    public PasswordEncoder passwordEncoder(){
        return new BCryptPasswordEncoder();
    }

    @Bean
    public JsonNullableJackson3Module jsonNullableModule() {
        return new JsonNullableJackson3Module();
    }

}
