package com.unihub.app.services.storage;

import com.unihub.app.config.DevelopmentProperties;
import com.unihub.app.config.StorageProperties;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.core.io.Resource;
import org.springframework.web.server.ResponseStatusException;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Path;
import java.time.Duration;

import static org.junit.jupiter.api.Assertions.assertArrayEquals;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

public class FileSystemFileStorageServiceTests {

    @TempDir
    Path tempDir;

    private FileSystemFileStorageService storageService;

    @BeforeEach
    public void setUp() {
        StorageProperties storageProperties = new StorageProperties(
                "filesystem",
                tempDir.toString(),
                300,
                3600
        );
        DevelopmentProperties developmentProperties = new DevelopmentProperties(
                "http://localhost:5173",
                "http://localhost:8080",
                true
        );
        storageService = new FileSystemFileStorageService(storageProperties, developmentProperties);
    }

    @Test
    @DisplayName("Generate presigned upload and download URLs returns valid local endpoints")
    public void testGeneratePresignedUrls() {
        String uploadUrl = storageService.generatePresignedUploadUrl("test/key.pdf", "application/pdf", 1024, Duration.ofMinutes(5));
        assertNotNull(uploadUrl);
        assertTrue(uploadUrl.contains("/api/v1/storage/local/upload?key="));

        String downloadUrl = storageService.generatePresignedDownloadUrl("test/key.pdf", Duration.ofHours(1));
        assertNotNull(downloadUrl);
        assertTrue(downloadUrl.contains("/api/v1/storage/local/download?key="));
    }

    @Test
    @DisplayName("Save, check existence, read size, load resource, and delete local file")
    public void testFileLifecycle() throws IOException {
        String key = "nested/dir/sample.txt";
        byte[] content = "Hello Local Storage!".getBytes(StandardCharsets.UTF_8);

        assertFalse(storageService.fileExists(key));

        storageService.saveLocalFile(key, new ByteArrayInputStream(content));

        assertTrue(storageService.fileExists(key));
        assertEquals(content.length, storageService.getFileSize(key));

        Resource resource = storageService.loadLocalFileAsResource(key);
        assertTrue(resource.exists());
        try (java.io.InputStream is = resource.getInputStream()) {
            assertArrayEquals(content, is.readAllBytes());
        }

        storageService.deleteFile(key);
        assertFalse(storageService.fileExists(key));
    }

    @Test
    @DisplayName("Path traversal attempts in storage key are rejected")
    public void testPathTraversalProtection() {
        assertThrows(ResponseStatusException.class, () ->
                storageService.resolvePath("../../etc/passwd")
        );
    }
}
