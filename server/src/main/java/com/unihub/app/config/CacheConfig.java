package com.unihub.app.config;

import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import com.unihub.app.services.authentication.VerificationCodeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.caffeine.CaffeineCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.Duration;

@Configuration
@EnableCaching
public class CacheConfig {

    @Autowired
    private EmailProperties emailProperties;

    @Autowired
    private SessionProperties sessionProperties;

    @Bean
    CacheManager cacheManager() {
        var manager = new CaffeineCacheManager();

        manager.registerCustomCache(
                "roles",
                Caffeine.newBuilder()
                        .maximumSize(100)
                        .build()
        );

        manager.registerCustomCache(
                "rolePermissionsByName",
                Caffeine.newBuilder()
                        .maximumSize(100)
                        .build()
        );

        manager.registerCustomCache("pendingRegistrations",
                Caffeine.newBuilder()
                .expireAfterWrite(Duration.ofSeconds(emailProperties.emailVerificationTokenExpirationSec()))
                .maximumSize(10_000)
                .build()
        );

        manager.registerCustomCache("pendingEmailVerifications", Caffeine.newBuilder()
                .expireAfterWrite(Duration.ofSeconds(emailProperties.emailVerificationTokenExpirationSec()))
                .maximumSize(10_000)
                .build()
        );

        manager.registerCustomCache("revokedUsers", Caffeine.newBuilder()
                .expireAfterWrite(Duration.ofSeconds(sessionProperties.accessTokenExpirationSec()))
                .maximumSize(10_000)
                .build()
        );

        return manager;
    }
}
