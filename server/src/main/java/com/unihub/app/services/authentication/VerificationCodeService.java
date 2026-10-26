package com.unihub.app.services.authentication;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;
import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.CachePut;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.concurrent.ThreadLocalRandom;

@Service
public class VerificationCodeService {

    private static final int MAX_ATTEMPTS = 5;
    private final Cache pendingRegistrations;
    private final Cache pendingEmailVerifications;

    public VerificationCodeService(CacheManager cacheManager) {
        this.pendingRegistrations = cacheManager.getCache("pendingRegistrations");
        this.pendingEmailVerifications = cacheManager.getCache("pendingEmailVerifications");
    }

    @AllArgsConstructor
    @Setter
    @Getter
    public class PendingRegistration {
        String username;
        String email;
        String encodedPassword;
        String code;
        int attempts;
        Instant createdAt;

        public PendingRegistration(String username, String email, String encodedPassword, String code, int attempts) {
            this(username, email, encodedPassword, code, attempts, Instant.now());
        }
    }

    @AllArgsConstructor
    @Setter
    @Getter
    public class PendingEmailVerification {
        String email;
        String code;
        int attempts;
        Instant createdAt;

        public PendingEmailVerification(String email, String code, int attempts) {
            this(email, code, attempts, Instant.now());
        }
    }

    public String generateCode() {
        int randomCode = ThreadLocalRandom.current().nextInt(1_000_000);
        return String.format("%06d", randomCode);
    }

    @CachePut(cacheNames = "pendingRegistrations", key = "#email.toLowerCase()", unless = "#result == null")
    public PendingRegistration savePendingRegistration(String username, String email, String encodedPassword, String code) {
        PendingRegistration pending = pendingRegistrations.get(email.toLowerCase(), PendingRegistration.class);

        if (pending != null && pending.getCreatedAt() != null && !pending.getCreatedAt().plusSeconds(60).isBefore(Instant.now())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "A registration request is already pending for this email address.");
        }

        pendingRegistrations.evict(email.toLowerCase());
        return new PendingRegistration(username, email, encodedPassword, code, 0, Instant.now());
    }

    public PendingRegistration getPendingRegistration(String email) {
        return pendingRegistrations.get(email.toLowerCase(), PendingRegistration.class);
    }

    public PendingRegistration verifyAndConsumeRegistration(String email, String code) {
        String key = email.toLowerCase();
        PendingRegistration pending = pendingRegistrations.get(key, PendingRegistration.class);

        if (pending == null) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Verification code has expired or is invalid.");
        }

        if (pending.getAttempts() >= MAX_ATTEMPTS) {
            pendingRegistrations.evict(key);
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Too many failed attempts. Please register again.");
        }

        if (!pending.getCode().equals(code)) {
            pending.setAttempts(pending.getAttempts() + 1);
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Invalid verification code.");
        }

        pendingRegistrations.evict(key);
        return pending;
    }

    @CachePut(cacheNames = "pendingEmailVerifications", key = "#email.toLowerCase()", unless = "#result == null")
    public void savePendingEmailVerification(String email, String code) {
        PendingEmailVerification pending = pendingEmailVerifications.get(email.toLowerCase(), PendingEmailVerification.class);

        if (pending != null && pending.getCreatedAt() != null && !pending.getCreatedAt().plusSeconds(60).isBefore(Instant.now())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "A verification request is already pending for this email address.");
        }

        pendingEmailVerifications.evict(email.toLowerCase());
        pendingEmailVerifications.put(email.toLowerCase(), new PendingEmailVerification(email, code, 0, Instant.now()));
    }

    public boolean existsPendingEmailVerification(String email) {
        return pendingEmailVerifications.get(email.toLowerCase(), PendingEmailVerification.class) != null;
    }

    public PendingEmailVerification getPendingEmailVerification(String email) {
        return pendingEmailVerifications.get(email.toLowerCase(), PendingEmailVerification.class);
    }

    public void verifyAndConsumeEmailVerification(String email, String code) {
        String key = email.toLowerCase();
        PendingEmailVerification pending = pendingEmailVerifications.get(key, PendingEmailVerification.class);

        if (pending == null) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Verification code has expired or is invalid.");
        }

        if (pending.getAttempts() >= MAX_ATTEMPTS) {
            pendingEmailVerifications.evict(key);
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Too many failed attempts. Please request a new verification code.");
        }

        if (!pending.getCode().equals(code)) {
            pending.setAttempts(pending.getAttempts() + 1);
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Invalid verification code.");
        }

        pendingEmailVerifications.evict(key);
    }
}
