package com.unihub.app.entities.content;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import java.time.OffsetDateTime;

@Entity
@Table(name = "assignments")
@SuperBuilder
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class Assignment extends Resource{

    @Column(name = "due_date", nullable = false)
    private OffsetDateTime dueDate;

    @Column(name = "estimated_duration_minutes")
    private int estimatedDurationMinutes;

    @Column(name = "grade_weight")
    private float gradeWeight;

}
