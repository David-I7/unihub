package com.unihub.app.entities.community.resources;

import com.unihub.app.entities.community.content.CourseOfferingPost;
import com.unihub.app.entities.community.content.Folder;
import com.unihub.app.entities.globalResources.Teacher;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.OffsetDateTime;
import java.util.List;

@Entity
@Table(name = "course_offerings")
@Builder
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class CourseOffering {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @ManyToOne
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    @ManyToOne
    @JoinColumn(name = "study_year_id", nullable = false)
    private StudyYear studyYear;

    @Column(nullable = false)
    private int semester;

    @Column(nullable = false)
    @Builder.Default
    private boolean active = true;

    @Column(name = "credit_points", nullable = false)
    private int creditPoints;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(name = "passing_difficulty", nullable = false)
    private Difficulty passingDifficulty;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(name = "material_difficulty", nullable = false)
    private Difficulty materialDifficulty;

    @ManyToMany(mappedBy = "coursesTaught")
    private List<Teacher> teachers;

    @OneToMany(mappedBy = "courseOffering")
    private List<CourseOfferingPost> posts;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    @OneToMany(mappedBy = "courseOffering")
    private List<Folder> folders;

    @Column
    private String description;

    @PrePersist
    private void prePersist() {
        createdAt = OffsetDateTime.now();
    }
}
