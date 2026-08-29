package com.unihub.app.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.development")
public record DevelopmentProperties(
        String clientOrigin,
        boolean isDevelopment
) {
}
