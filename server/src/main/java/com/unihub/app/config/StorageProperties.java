package com.unihub.app.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.storage")
public record StorageProperties(
        String type,
        String localDir,
        long uploadExpirationSec,
        long downloadExpirationSec
) {
    public StorageProperties {
        if (type == null || type.isBlank()) {
            type = "filesystem";
        }
        if (localDir == null || localDir.isBlank()) {
            localDir = "./uploads";
        }
        if (uploadExpirationSec <= 0) {
            uploadExpirationSec = 300;
        }
        if (downloadExpirationSec <= 0) {
            downloadExpirationSec = 3600;
        }
    }
}
