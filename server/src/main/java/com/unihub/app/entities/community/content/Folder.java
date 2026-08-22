package com.unihub.app.entities.community.content;

import com.unihub.app.entities.authentication.User;
import com.unihub.app.entities.community.resources.CourseOffering;
import jakarta.persistence.*;
import lombok.*;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "folders")
@Builder
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class Folder {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String name;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_offering_id")
    private CourseOffering courseOffering;

    @OneToMany
    @JoinColumn(name = "parent_folder_id")
    private List<Folder> subfolders;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_folder_id")
    private Folder parentFolder;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id", nullable = false)
    private User owner;

    @OneToMany(mappedBy = "folder")
    private List<Resource> resources;

    @Column(nullable = false, name = "created_at")
    private OffsetDateTime createdAt;

    @PrePersist
    private void prePersist() {
        createdAt = OffsetDateTime.now();
    }
}
