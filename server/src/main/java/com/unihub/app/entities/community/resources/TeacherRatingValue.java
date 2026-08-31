package com.unihub.app.entities.community.resources;

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

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("teacherRatingId")
    @JoinColumn(name = "teacher_rating_id")
    private TeacherRating teacherRating;

    @ManyToOne(fetch = FetchType.LAZY)
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
