package com.unihub.app.repositories;


import com.unihub.app.entities.Session;
import com.unihub.app.entities.SessionRevokeReason;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SessionRepository extends JpaRepository<Session, UUID> {

    @Query("SELECT s from Session s WHERE s.refreshToken = :refreshToken")
    Optional<Session> findByRefreshToken(String refreshToken);

    @Query("SELECT COUNT(s) > 0 from Session s WHERE s.refreshToken = :refreshToken")
    boolean existsByRefreshToken(String refreshToken);

    @Query("SELECT s from Session s WHERE s.user.id = :userId")
    List<Session> findAllByUserId(UUID userId);

    @Modifying
    @Query("""
            UPDATE Session s
            SET s.revoked = true, s.revokedReason = :revokedReason
            WHERE s.user.id = :userId and s.refreshToken <> :refreshToken
            """)
    int revokeOtherRefreshTokens(UUID userId, String refreshToken, SessionRevokeReason revokedReason);

}
