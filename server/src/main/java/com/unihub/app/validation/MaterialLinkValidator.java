package com.unihub.app.validation;

import com.unihub.app.entities.community.content.MaterialLinkType;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.Locale;
import java.util.Set;

@Component
public class MaterialLinkValidator {

    private static final Set<String> GITHUB_DOMAINS = Set.of(
            "github.com",
            "gist.github.com",
            "raw.githubusercontent.com"
    );

    private static final Set<String> DRIVE_DOMAINS = Set.of(
            "drive.google.com",
            "docs.google.com"
    );

    private static final Set<String> VIDEO_DOMAINS = Set.of(
            "youtube.com",
            "www.youtube.com",
            "youtu.be",
            "vimeo.com",
            "www.vimeo.com",
            "loom.com",
            "www.loom.com",
            "dailymotion.com",
            "www.dailymotion.com",
            "twitch.tv",
            "www.twitch.tv"
    );

    public void validate(String url, MaterialLinkType linkType) {
        if (url == null || url.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "URL is required");
        }
        if (linkType == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Link type is required");
        }

        URI uri;
        try {
            uri = new URI(url.trim());
        } catch (URISyntaxException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid URL syntax", e);
        }

        String scheme = uri.getScheme();
        if (scheme == null || !"https".equalsIgnoreCase(scheme)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only HTTPS URLs are allowed");
        }

        String host = uri.getHost();
        if (host == null || host.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "URL host must be valid");
        }
        String normalizedHost = host.toLowerCase(Locale.ROOT);

        switch (linkType) {
            case GITHUB -> {
                boolean matches = GITHUB_DOMAINS.contains(normalizedHost)
                        || normalizedHost.endsWith(".github.com")
                        || normalizedHost.endsWith(".github.io");
                if (!matches) {
                    throw new ResponseStatusException(
                            HttpStatus.BAD_REQUEST,
                            "URL host '" + host + "' does not match GITHUB link type"
                    );
                }
            }
            case DRIVE -> {
                boolean matches = DRIVE_DOMAINS.contains(normalizedHost)
                        || normalizedHost.endsWith(".drive.google.com")
                        || normalizedHost.endsWith(".docs.google.com");
                if (!matches) {
                    throw new ResponseStatusException(
                            HttpStatus.BAD_REQUEST,
                            "URL host '" + host + "' does not match DRIVE link type"
                    );
                }
            }
            case VIDEO -> {
                boolean matches = VIDEO_DOMAINS.contains(normalizedHost)
                        || normalizedHost.endsWith(".youtube.com")
                        || normalizedHost.endsWith(".vimeo.com")
                        || normalizedHost.endsWith(".loom.com");
                if (!matches) {
                    throw new ResponseStatusException(
                            HttpStatus.BAD_REQUEST,
                            "URL host '" + host + "' does not match VIDEO link type"
                    );
                }
            }
            case OTHER -> {
                // Any valid HTTPS URL is allowed
            }
        }
    }
}
