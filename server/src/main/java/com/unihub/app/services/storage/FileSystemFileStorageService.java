package com.unihub.app.services.storage;

import com.unihub.app.config.DevelopmentProperties;
import com.unihub.app.config.StorageProperties;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.io.InputStream;
import java.net.MalformedURLException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.Duration;

@Service
@ConditionalOnProperty(name = "app.storage.type", havingValue = "filesystem", matchIfMissing = true)
@RequiredArgsConstructor
public class FileSystemFileStorageService implements FileStorageService {

    private final StorageProperties storageProperties;
    private final DevelopmentProperties developmentProperties;

    @Override
    public String generatePresignedUploadUrl(String storageKey, String contentType, long contentLength, Duration duration) {
        String baseUrl = getBaseOrigin();
        String encodedKey = URLEncoder.encode(storageKey, StandardCharsets.UTF_8);
        return baseUrl + "/api/v1/storage/local/upload?key=" + encodedKey;
    }

    @Override
    public String generatePresignedDownloadUrl(String storageKey, Duration duration) {
        String baseUrl = getBaseOrigin();
        String encodedKey = URLEncoder.encode(storageKey, StandardCharsets.UTF_8);
        return baseUrl + "/api/v1/storage/local/download?key=" + encodedKey;
    }

    @Override
    public void deleteFile(String storageKey) {
        try {
            Path targetPath = resolvePath(storageKey);
            Files.deleteIfExists(targetPath);
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to delete file from storage", e);
        }
    }

    @Override
    public boolean fileExists(String storageKey) {
        Path targetPath = resolvePath(storageKey);
        return Files.isRegularFile(targetPath);
    }

    @Override
    public long getFileSize(String storageKey) {
        try {
            Path targetPath = resolvePath(storageKey);
            if (!Files.isRegularFile(targetPath)) {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "File not found in storage");
            }
            return Files.size(targetPath);
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to read file size from storage", e);
        }
    }

    public void saveLocalFile(String storageKey, InputStream inputStream) {
        try {
            Path targetPath = resolvePath(storageKey);
            Path parentDir = targetPath.getParent();
            if (parentDir != null && !Files.exists(parentDir)) {
                Files.createDirectories(parentDir);
            }
            Files.copy(inputStream, targetPath, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to store local file", e);
        }
    }

    public Resource loadLocalFileAsResource(String storageKey) {
        try {
            Path targetPath = resolvePath(storageKey);
            if (!Files.isRegularFile(targetPath)) {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "File not found in storage");
            }
            Resource resource = new UrlResource(targetPath.toUri());
            if (!resource.exists() || !resource.isReadable()) {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "File not accessible");
            }
            return resource;
        } catch (MalformedURLException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Invalid file path", e);
        }
    }

    public Path resolvePath(String storageKey) {
        if (storageKey == null || storageKey.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Storage key cannot be empty");
        }
        Path rootPath = Paths.get(storageProperties.localDir()).toAbsolutePath().normalize();
        Path resolvedPath = rootPath.resolve(storageKey).normalize();

        if (!resolvedPath.startsWith(rootPath)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid storage key path");
        }
        return resolvedPath;
    }

    private String getBaseOrigin() {
        String origin = developmentProperties.origin();
        if (origin == null || origin.isBlank()) {
            origin = "http://localhost:8080";
        }
        if (origin.endsWith("/")) {
            return origin.substring(0, origin.length() - 1);
        }
        return origin;
    }
}
