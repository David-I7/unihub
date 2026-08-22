package com.unihub.app.entities.community.content;

import jakarta.persistence.*;
import lombok.*;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "assignments")
@Builder
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class Assignment {

    @Id
    private UUID id;

    @Column(name = "due_date", nullable = false)
    private OffsetDateTime dueDate;

    @Column(name = "estimated_duration_minutes")
    private Integer estimatedDurationMinutes;

    @Column(name = "grade_weight")
    private float gradeWeight;

    @OneToMany
    @JoinColumn(name = "parent_resource_id", referencedColumnName = "id", insertable = false, updatable = false)
    private List<Attachment> attachments;

    @OneToOne(optional = false)
    @JoinColumn(name = "id", nullable = false)
    @MapsId
    private Resource resource;

}
