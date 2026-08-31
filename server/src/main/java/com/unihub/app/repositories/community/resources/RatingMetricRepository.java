package com.unihub.app.repositories.community.resources;

import com.unihub.app.entities.community.resources.RatingMetric;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RatingMetricRepository extends JpaRepository<RatingMetric, Integer> {
    Optional<RatingMetric> findByName(String name);
}
