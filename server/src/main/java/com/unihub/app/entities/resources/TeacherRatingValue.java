package com.unihub.app.entities.resources;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "teacher_rating_values")
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class TeacherRatingValue {

    @EmbeddedId
    private TeacherRatingValueId id;

    @ManyToOne
    @MapsId("teacherRatingId")
    @JoinColumn(name = "teacher_rating_id")
    private TeacherRating teacherRating;

    @ManyToOne
    @MapsId("ratingMetricId")
    @JoinColumn(name = "rating_metric_id")
    private RatingMetric ratingMetric;

    @Column(nullable = false)
    private int value;

    @Override
    public String toString() {
        return "TeacherRatingValue{" +
                "id=" + id +
                ", teacherRating=" + teacherRating +
                ", ratingMetric=" + ratingMetric +
                ", value=" + value +
                '}';
    }
}
