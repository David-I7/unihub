package com.unihub.app.entities.community.resources;

import com.unihub.app.entities.community.content.CoursePost;
import com.unihub.app.entities.community.content.Folder;
import com.unihub.app.entities.community.content.Resource;
import jakarta.persistence.*;
import lombok.*;

import java.time.OffsetDateTime;
import java.util.List;

@Entity
@Table(
        name = "courses",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = {"study_year_id", "name"}),
                @UniqueConstraint(columnNames = {"study_year_id", "slug"})
        },
        indexes = {
                @Index(name = "idx_courses_study_year_archived", columnList = "study_year_id, archived")
        }
)
@Builder
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class Course {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String slug;

    @Column(nullable = false)
    private String abbreviation;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "study_year_id", nullable = false)
    private StudyYear studyYear;

    @Column(nullable = false)
    private int semester;

    @Column(nullable = false)
    @Builder.Default
    private boolean archived = false;

    @Column(name = "credit_points", nullable = false)
    private int creditPoints ;

    @ManyToMany(mappedBy = "coursesTaught")
    private List<Teacher> teachers;

    @OneToMany(mappedBy = "course")
    private List<CoursePost> posts;

    @OneToMany(mappedBy = "course")
    private List<Folder> folders;

    @OneToMany(mappedBy = "course")
    private List<Resource> resources;

    @Column
    private String description;

    @Column(name = "readme")
    private String readme;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    @PrePersist
    private void prePersist() {
        createdAt = OffsetDateTime.now();
    }
}
