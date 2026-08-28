package com.unihub.app.entities.community.resources;

import com.unihub.app.entities.authentication.User;
import com.unihub.app.entities.authorization.Role;
import jakarta.persistence.*;
import lombok.*;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "community_members")
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class CommunityMember {

    @EmbeddedId
    private CommunityMembersId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("communityId")
    @JoinColumn(name = "community_id")
    private Community community;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("userId")
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
