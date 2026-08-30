package com.unihub.app.entities.community.resources;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Entity
@Table(
        name = "teachers",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = {"community_id", "last_name", "first_name"})
        }
)
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Teacher {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "community_id", nullable = false)
    private Community community;

    @Column(name = "first_name", nullable = false)
    private String firstName;

    @Column(name = "last_name", nullable = false)
    private String lastName;

    @Column(name = "estimated_birth_date")
    private LocalDate estimatedBirthDate;

    @Column(name = "average_rating", nullable = false)
    private float averageRating;

    @Column(name = "ratings_count", nullable = false)
    private int ratingsCount;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    @ManyToMany
    @JoinTable(
            name = "course_teachers",
            joinColumns = @JoinColumn(name = "teacher_id"),
            inverseJoinColumns = @JoinColumn(name = "course_id")
    )
    private List<Course> coursesTaught;

    @OneToMany(mappedBy = "teacher", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<TeacherRating> ratings;

    @Override
    public String toString() {
        return "Teacher{" +
                "id=" + id +
                ", firstName='" + firstName + '\'' +
                ", lastName='" + lastName + '\'' +
                ", estimatedBirthDate=" + estimatedBirthDate +
                ", averageRating=" + averageRating +
                ", ratingsCount=" + ratingsCount +
                '}';
    }

    @PrePersist
    void onCreate() {
        createdAt = OffsetDateTime.now();
    }
}
