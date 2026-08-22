package com.unihub.app.entities.community.resources;

import com.unihub.app.entities.community.content.Folder;
import com.unihub.app.entities.community.content.Post;
import com.unihub.app.entities.globalResources.Teacher;
import jakarta.persistence.*;
import lombok.*;

import java.time.OffsetDateTime;
import java.util.List;

@Entity
@Table(
        name = "course_offerings",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = {"course_id", "study_year_id"})
        }
)
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

    @ManyToMany(mappedBy = "coursesTaught")
    private List<Teacher> teachers;

    @OneToMany(mappedBy = "courseOffering")
    private List<Post> posts;

    @Column(name = "created_at",nullable = false)
    private OffsetDateTime  createdAt;

    @OneToMany(mappedBy = "courseOffering")
    private List<Folder> folders;

    @Column
    private String description;

    @PrePersist
    private void prePersist() {
        createdAt = OffsetDateTime.now();
    }
}
