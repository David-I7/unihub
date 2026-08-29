package com.unihub.app.repositories.authentication;

import com.unihub.app.entities.authentication.Session;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SessionRepository extends JpaRepository<Session, UUID> {

    @Query("SELECT s from Session s WHERE s.refreshToken = :refreshToken")
    Optional<Session> findByRefreshToken(String refreshToken);

    @Modifying
    @Query("""
            UPDATE Session s
            SET s.revoked = true
            WHERE s.initialSessionId = :initialSessionId or s.id = :initialSessionId
            """)
    int revokeSessionFamily(UUID initialSessionId);

    @Modifying
    @Query("""
            UPDATE Session s
            SET s.revoked = true
            WHERE s.user.id = :userId
            """)
    int revokeAllByUserId(UUID userId);

    @Query("""
        SELECT root.id FROM Session root
        WHERE root.initialSessionId IS NULL
          AND root.id NOT IN (
              SELECT DISTINCT COALESCE(s.initialSessionId, s.id)
              FROM Session s
              WHERE s.revoked = false AND s.expiresAt >= CURRENT_TIMESTAMP
          )
    """)
    List<UUID> findExpiredFamilyIds(Pageable pageable);

    @Modifying
    @Query("""
        DELETE FROM Session s
        WHERE s.id IN :familyIds OR s.initialSessionId IN :familyIds
    """)
    int deleteByFamilyIds(@Param("familyIds") List<UUID> familyIds);
}
