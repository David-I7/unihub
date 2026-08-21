package com.unihub.app.entities.resources;

import com.unihub.app.entities.auth.User;
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

    @ManyToOne
    @JoinColumn(name = "teacher_id", nullable = false)
    private Teacher teacher;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "description")
    private String description;

    @OneToMany(mappedBy = "teacherRating")
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
                ", values=" + Objects.toIdentityString(values) +
                '}';
    }

    @PrePersist
    void onCreate() {
        createdAt = OffsetDateTime.now();
    }
}
