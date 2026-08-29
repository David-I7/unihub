package com.unihub.app.security;


import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;
import org.springframework.stereotype.Service;
import java.time.Instant;
import java.util.UUID;

@Service
public class TokenRevocationService {

    private final Cache revokedUsers;

    public TokenRevocationService(CacheManager cacheManager) {
        this.revokedUsers = cacheManager.getCache("revokedUsers");
    }

    public void revokeUserTokens(UUID userId) {
        revokedUsers.put(userId, Instant.now());
    }

    public boolean isTokenRevoked(UUID userId, Instant issuedAt) {
        Instant revokedAt = revokedUsers.get(userId, Instant.class);
        if (revokedAt == null) {
            return false;
        }
        return issuedAt.isBefore(revokedAt);
    }

    public void clearRevocation(UUID userId) {
        revokedUsers.evict(userId);
    }
}
