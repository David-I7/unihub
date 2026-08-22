package com.unihub.app.entities.globalResources;

import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Embeddable
public class TeacherRatingValueId {

    private long teacherRatingId;

    private int ratingMetricId;
}