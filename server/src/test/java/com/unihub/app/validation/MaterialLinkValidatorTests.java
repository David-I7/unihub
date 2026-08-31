package com.unihub.app.validation;

import com.unihub.app.entities.community.content.MaterialLinkType;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.web.server.ResponseStatusException;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertThrows;

public class MaterialLinkValidatorTests {

    private MaterialLinkValidator validator;

    @BeforeEach
    public void setUp() {
        validator = new MaterialLinkValidator();
    }

    @Test
    @DisplayName("Valid GitHub link passes validation")
    public void testValidGitHubLink() {
        assertDoesNotThrow(() ->
                validator.validate("https://github.com/user/project", MaterialLinkType.GITHUB)
        );
        assertDoesNotThrow(() ->
                validator.validate("https://gist.github.com/user/12345", MaterialLinkType.GITHUB)
        );
    }

    @Test
    @DisplayName("Invalid domain for GitHub throws Bad Request")
    public void testInvalidGitHubDomain() {
        assertThrows(ResponseStatusException.class, () ->
                validator.validate("https://gitlab.com/user/project", MaterialLinkType.GITHUB)
        );
    }

    @Test
    @DisplayName("Valid Google Drive link passes validation")
    public void testValidDriveLink() {
        assertDoesNotThrow(() ->
                validator.validate("https://drive.google.com/file/d/123/view", MaterialLinkType.DRIVE)
        );
        assertDoesNotThrow(() ->
                validator.validate("https://docs.google.com/document/d/123/edit", MaterialLinkType.DRIVE)
        );
    }

    @Test
    @DisplayName("Invalid domain for Drive throws Bad Request")
    public void testInvalidDriveDomain() {
        assertThrows(ResponseStatusException.class, () ->
                validator.validate("https://dropbox.com/s/123", MaterialLinkType.DRIVE)
        );
    }

    @Test
    @DisplayName("Valid Video link passes validation")
    public void testValidVideoLink() {
        assertDoesNotThrow(() ->
                validator.validate("https://www.youtube.com/watch?v=123", MaterialLinkType.VIDEO)
        );
        assertDoesNotThrow(() ->
                validator.validate("https://vimeo.com/123456", MaterialLinkType.VIDEO)
        );
    }

    @Test
    @DisplayName("HTTP URL is rejected (HTTPS only)")
    public void testHttpUrlRejected() {
        assertThrows(ResponseStatusException.class, () ->
                validator.validate("http://github.com/user/project", MaterialLinkType.GITHUB)
        );
    }

    @Test
    @DisplayName("Valid general HTTPS URL with OTHER link type passes")
    public void testValidOtherLink() {
        assertDoesNotThrow(() ->
                validator.validate("https://example.com/materials/article", MaterialLinkType.OTHER)
        );
    }

    @Test
    @DisplayName("Valid HTTPS URL with DOCS and DOCX link types passes")
    public void testValidDocsAndDocxLink() {
        assertDoesNotThrow(() ->
                validator.validate("https://docs.google.com/document/d/123/edit", MaterialLinkType.DOCS)
        );
        assertDoesNotThrow(() ->
                validator.validate("https://example.com/files/report.docx", MaterialLinkType.DOCX)
        );
    }
}
