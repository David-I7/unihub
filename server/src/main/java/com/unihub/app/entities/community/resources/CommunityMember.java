package com.unihub.app.entities.community.resources;

import com.unihub.app.entities.authentication.User;
import com.unihub.app.entities.authorization.Role;
import jakarta.persistence.*;
import lombok.*;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(
        uniqueConstraints = {@UniqueConstraint(columnNames = {"community_id", "user_id"})},
        name = "community_members"
)
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class CommunityMember {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "community_id")
    private Community community;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(nullable = false, name="role_id")
    private UUID roleId;

    @Column(name = "joined_at", nullable = false)
    private OffsetDateTime joinedAt;

    @PrePersist
    private void prePersist() {
        if (joinedAt == null) {
            joinedAt = OffsetDateTime.now();
        }
    }
}
