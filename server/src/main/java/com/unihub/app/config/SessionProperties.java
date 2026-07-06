package com.unihub.app.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.session")
public record SessionProperties(String secret, long accessTokenExpirationMS, long refreshTokenExpirationMS) {
}
