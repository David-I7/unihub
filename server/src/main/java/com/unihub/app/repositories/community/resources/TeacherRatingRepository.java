package com.unihub.app.repositories.community.resources;

import com.unihub.app.entities.community.resources.TeacherRating;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface TeacherRatingRepository extends JpaRepository<TeacherRating, Long> {

    @Query("SELECT tr FROM TeacherRating tr LEFT JOIN FETCH tr.user WHERE tr.teacher.id = :teacherId")
    Page<TeacherRating> findByTeacherId(@Param("teacherId") UUID teacherId, Pageable pageable);

    @Query("""
        SELECT rm.id, rm.name, rm.description, COALESCE(AVG(trv.value * 1.0), 0.0), COUNT(trv.value)
        FROM RatingMetric rm
        LEFT JOIN TeacherRatingValue trv ON trv.ratingMetric = rm AND trv.teacherRating.teacher.id = :teacherId
        GROUP BY rm.id, rm.name, rm.description
        ORDER BY rm.id ASC
    """)
    List<Object[]> findMetricBreakdownByTeacherId(@Param("teacherId") UUID teacherId);

    Optional<TeacherRating> findByTeacherIdAndUserId(UUID teacherId, UUID userId);

    boolean existsByTeacherIdAndUserId(UUID teacherId, UUID userId);
}
