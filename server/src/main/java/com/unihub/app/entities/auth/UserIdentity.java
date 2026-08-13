package com.unihub.app.entities.auth;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(
        name = "user_identities",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = {"provider","provider_subject"}, name = "unique_identity_provider_subject")
        }
)
@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UserIdentity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    private AuthProvider provider;

    @Column(nullable = false, name = "provider_subject")
    private String providerSubject;

    @Column(nullable = false, name = "provider_email")
    private String providerEmail;

    @Column(nullable = false, name = "created_at")
    private OffsetDateTime createdAt;
}
