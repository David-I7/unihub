package com.unihub.app.entities.community.resources;

import com.unihub.app.entities.authentication.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.OffsetDateTime;
import java.util.Objects;
import java.util.Set;

@Entity
@Table(
        name = "teacher_ratings",
        uniqueConstraints = @UniqueConstraint(columnNames = {"teacher_id", "user_id"})
)
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class TeacherRating {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "teacher_id", nullable = false)
    private Teacher teacher;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "description")
    private String description;

    @Column(name = "is_anonymous", nullable = false)
    @Builder.Default
    private boolean isAnonymous = false;

    @OneToMany(mappedBy = "teacherRating", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<TeacherRatingValue> values;

    @Override
    public String toString() {
        return "TeacherRating{" +
                "id=" + id +
                ", teacher=" + teacher +
                ", user=" + user +
                ", createdAt=" + createdAt +
                ", title='" + title + '\'' +
                ", description='" + description + '\'' +
                ", isAnonymous=" + isAnonymous +
                ", values=" + Objects.toIdentityString(values) +
                '}';
    }

    @PrePersist
    void onCreate() {
        createdAt = OffsetDateTime.now();
    }
}
