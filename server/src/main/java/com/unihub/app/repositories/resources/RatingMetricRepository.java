package com.unihub.app.repositories.resources;

import com.unihub.app.entities.resources.RatingMetric;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RatingMetricRepository extends JpaRepository<RatingMetric,Integer> {
}
