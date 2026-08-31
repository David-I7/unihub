package com.unihub.app.validation;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.web.server.ResponseStatusException;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

public class MaterialFileValidatorTests {

    private MaterialFileValidator validator;

    @BeforeEach
    public void setUp() {
        validator = new MaterialFileValidator();
    }

    @Test
    @DisplayName("Valid PDF under 20MB passes validation")
    public void testValidPdf() {
        assertDoesNotThrow(() -> validator.validate("application/pdf", 10 * 1024 * 1024));
    }

    @Test
    @DisplayName("PDF exceeding 20MB throws Bad Request")
    public void testPdfExceedingLimit() {
        assertThrows(ResponseStatusException.class, () ->
                validator.validate("application/pdf", 21 * 1024 * 1024)
        );
    }

    @Test
    @DisplayName("Valid PNG under 5MB passes validation")
    public void testValidPng() {
        assertDoesNotThrow(() -> validator.validate("image/png", 3 * 1024 * 1024));
    }

    @Test
    @DisplayName("Valid JPEG under 5MB passes validation")
    public void testValidJpeg() {
        assertDoesNotThrow(() -> validator.validate("image/jpeg", 4 * 1024 * 1024));
    }

    @Test
    @DisplayName("Valid WebP under 5MB passes validation")
    public void testValidWebp() {
        assertDoesNotThrow(() -> validator.validate("image/webp", 2 * 1024 * 1024));
    }

    @Test
    @DisplayName("Image exceeding 5MB throws Bad Request")
    public void testImageExceedingLimit() {
        assertThrows(ResponseStatusException.class, () ->
                validator.validate("image/png", 6 * 1024 * 1024)
        );
    }

    @Test
    @DisplayName("Unsupported MIME type throws Bad Request")
    public void testUnsupportedType() {
        assertThrows(ResponseStatusException.class, () ->
                validator.validate("text/plain", 1024)
        );
    }

    @Test
    @DisplayName("Zero or negative file size throws Bad Request")
    public void testInvalidSize() {
        assertThrows(ResponseStatusException.class, () ->
                validator.validate("application/pdf", 0)
        );
    }

    @Test
    @DisplayName("Sanitize file name replaces unsafe characters")
    public void testSanitizeFileName() {
        assertEquals("lecture_notes.pdf", validator.sanitizeFileName("lecture notes.pdf"));
        assertEquals("test__file.png", validator.sanitizeFileName("test/..file.png"));
        assertEquals("file", validator.sanitizeFileName("   "));
    }
}
