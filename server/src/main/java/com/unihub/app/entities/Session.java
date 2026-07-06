package com.unihub.app.entities;

import jakarta.persistence.*;
import lombok.*;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "sessions", uniqueConstraints = {@UniqueConstraint(columnNames = "refresh_token", name = "unique_refresh_token")})
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class Session {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "refresh_token",nullable = false)
    private String refreshToken;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "expires_at", nullable = false)
    private OffsetDateTime expiresAt;

    @Column(name = "revoked", nullable = false)
    private boolean revoked;

    @Column(name = "revoked_reason")
    private SessionRevokeReason revokedReason;

}
