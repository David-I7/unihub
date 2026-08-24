package com.unihub.app.entities.community.resources;

import com.unihub.app.entities.authentication.User;
import com.unihub.app.entities.authorization.Role;
import jakarta.persistence.*;
import lombok.*;

import java.time.OffsetDateTime;

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

    @ManyToOne
    @MapsId("communityId")
    @JoinColumn(name = "community_id")
    private Community community;

    @ManyToOne
    @MapsId("userId")
    @JoinColumn(name = "user_id")
    private User user;

    @JoinColumn(name = "role_id")
    @OneToOne
    private Role role;

    @Column(name = "joined_at", nullable = false)
    private OffsetDateTime joinedAt;

    @PrePersist
    private void prePersist() {
        if (joinedAt == null) {
            joinedAt = OffsetDateTime.now();
        }
    }
}
