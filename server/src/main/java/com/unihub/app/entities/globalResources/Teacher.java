package com.unihub.app.entities.globalResources;

import com.unihub.app.entities.community.resources.Course;
import jakarta.persistence.*;
import lombok.*;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "teachers",
uniqueConstraints = {
        @UniqueConstraint(columnNames = { "last_name","first_name"})
})
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Teacher {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "first_name", nullable = false)
    private String firstName;

    @Column(name = "last_name", nullable = false)
    private String lastName;

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

    @ManyToMany
    @JoinTable(
            name = "teacher_communities",
            joinColumns = @JoinColumn(name = "teacher_id"),
            inverseJoinColumns = @JoinColumn(name = "community_id")
    )
    private List<com.unihub.app.entities.community.resources.Community> communities;

    @Override
    public String toString() {
        return "Teacher{" +
                "id=" + id +
                ", firstName='" + firstName + '\'' +
                ", lastName='" + lastName + '\'' +
                ", averageRating=" + averageRating +
                ", ratingsCount=" + ratingsCount +
                '}';
    }

    @PrePersist
    void onCreate() {
        createdAt = OffsetDateTime.now();
    }
}
