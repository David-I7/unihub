package com.unihub.app.repositories.authentication;


import com.unihub.app.entities.authentication.Session;
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
            SET s.revoked = true
            WHERE s.initialSessionId = :initialSessionId or s.id = :initialSessionId
            """)
    int revokeSessionFamily(UUID initialSessionId);

    @Modifying
    @Query("""
            UPDATE Session s
            SET s.revoked = true
            WHERE s.refreshToken = :refreshToken
            """)
    int revokeSession(String refreshToken);

}
