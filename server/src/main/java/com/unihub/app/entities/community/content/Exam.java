package com.unihub.app.entities.community.content;

import jakarta.persistence.*;
import lombok.*;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "exams")
@Builder
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class Exam{

    @Id
    private UUID id;

    @Column(name = "scheduled_date", nullable = false)
    private OffsetDateTime scheduledDate;

    @Column(name = "estimated_duration_minutes")
    private Integer estimatedDurationMinutes;

    @Column(name = "grade_weight", nullable = false)
    private float gradeWeight;

    @OneToMany
    @JoinColumn(name = "parent_resource_id", referencedColumnName = "id", insertable = false, updatable = false)
    private List<Attachment> attachments;

    @OneToOne(optional = false)
    @JoinColumn(name = "id", nullable = false)
    @MapsId
    private Resource resource;

}
