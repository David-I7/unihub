package com.unihub.app.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.session")
public record SessionProperties(long accessTokenExpirationSec, long refreshTokenExpirationSec) {
}
