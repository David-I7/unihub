package com.unihub.app.config;

import com.github.benmanes.caffeine.cache.Caffeine;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.caffeine.CaffeineCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableCaching
public class CacheConfig {

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

        return manager;
    }
}
