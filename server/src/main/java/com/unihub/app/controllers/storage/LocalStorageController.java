package com.unihub.app.controllers.storage;

import com.unihub.app.services.storage.FileSystemFileStorageService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

@RestController
@RequestMapping("/api/v1/storage/local")
@ConditionalOnProperty(name = "app.storage.type", havingValue = "filesystem", matchIfMissing = true)
@RequiredArgsConstructor
public class LocalStorageController {

    private final FileSystemFileStorageService fileSystemFileStorageService;

    @PutMapping("/upload")
    public ResponseEntity<Void> uploadFile(
            @RequestParam("key") String key,
            HttpServletRequest request
    ) {
        if (key == null || key.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Storage key is required");
        }
        try {
            fileSystemFileStorageService.saveLocalFile(key, request.getInputStream());
            return ResponseEntity.ok().build();
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to read upload payload", e);
        }
    }

    @GetMapping("/download")
    public ResponseEntity<Resource> downloadFile(@RequestParam("key") String key) {
        if (key == null || key.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Storage key is required");
        }
        Resource resource = fileSystemFileStorageService.loadLocalFileAsResource(key);
        Path filePath = fileSystemFileStorageService.resolvePath(key);

        MediaType mediaType = MediaType.APPLICATION_OCTET_STREAM;
        try {
            String probeType = Files.probeContentType(filePath);
            if (probeType != null) {
                mediaType = MediaType.parseMediaType(probeType);
            }
        } catch (IOException ignored) {
        }

        return ResponseEntity.ok()
                .contentType(mediaType)
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + filePath.getFileName().toString() + "\"")
                .body(resource);
    }
}
