package com.unihub.app.validation;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;
import java.util.Set;

@Component
public class MaterialFileValidator {

    public static final long MAX_PDF_SIZE_BYTES = 20 * 1024 * 1024; // 20 MB
    public static final long MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

    private static final Map<String, Long> ALLOWED_MEDIA_TYPES = Map.of(
            "application/pdf", MAX_PDF_SIZE_BYTES,
            "image/png", MAX_IMAGE_SIZE_BYTES,
            "image/jpeg", MAX_IMAGE_SIZE_BYTES,
            "image/webp", MAX_IMAGE_SIZE_BYTES
    );

    public void validate(String contentType, long size) {
        if (contentType == null || contentType.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Content-Type is required");
        }

        String normalizedContentType = contentType.toLowerCase().trim();
        // Strip parameters like charset if present (e.g. application/pdf; charset=UTF-8)
        int semicolonIndex = normalizedContentType.indexOf(';');
        if (semicolonIndex != -1) {
            normalizedContentType = normalizedContentType.substring(0, semicolonIndex).trim();
        }

        Long maxSize = ALLOWED_MEDIA_TYPES.get(normalizedContentType);
        if (maxSize == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Unsupported file type. Only PDF (application/pdf) and images (image/png, image/jpeg, image/webp) are allowed"
            );
        }

        if (size <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "File size must be greater than 0 bytes");
        }

        if (size > maxSize) {
            String limitDesc = maxSize == MAX_PDF_SIZE_BYTES ? "20MB" : "5MB";
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "File size exceeds maximum allowed limit of " + limitDesc + " for " + normalizedContentType
            );
        }
    }

    public String sanitizeFileName(String fileName) {
        if (fileName == null || fileName.isBlank()) {
            return "file";
        }
        String cleaned = fileName.replaceAll("[^a-zA-Z0-9._-]", "_")
                .replaceAll("\\.{2,}", "_");
        if (cleaned.isBlank() || cleaned.equals(".")) {
            return "file";
        }
        return cleaned;
    }
}
