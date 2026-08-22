package com.unihub.app.entities.community.resources;

import com.unihub.app.entities.authentication.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "communities")
@Builder
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class Community {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, unique = true)
    private String name;

    @Column(name = "description", nullable = false)
    private String description;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    @Column(name = "members_count", nullable = false)
    private int memberCount;

    @OneToMany(mappedBy = "community")
    private List<StudyYear> studyYears;

    @OneToOne
    @JoinColumn(name = "owner_id")
    private User owner;

    @OneToMany(mappedBy = "community")
    private List<Course> courses;

    @OneToMany(mappedBy = "community")
    private List<CommunityMember> communityMembers;

    @PrePersist
    private void prePersist() {
        createdAt = OffsetDateTime.now();
    }

}
