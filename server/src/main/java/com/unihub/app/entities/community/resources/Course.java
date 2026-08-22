package com.unihub.app.entities.community.resources;

import jakarta.persistence.*;
import lombok.*;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "courses",
        uniqueConstraints = {
        @UniqueConstraint(columnNames = {"community_id","name"})
})
@Builder
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class Course {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String name;

    @Column(name="abbreviation", nullable = false, length = 4)
    private String abbreviation;

    @ManyToOne
    @JoinColumn(name = "community_id")
    private Community community;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    @OneToMany(mappedBy = "course")
    private List<CourseOffering> courseOfferings;

    @PrePersist
    private void prePersist() {
        createdAt = OffsetDateTime.now();
    }
}
