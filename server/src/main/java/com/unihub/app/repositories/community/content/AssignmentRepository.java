package com.unihub.app.repositories.community.content;

import com.unihub.app.entities.community.content.Assignment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.UUID;

public interface AssignmentRepository extends JpaRepository<Assignment, UUID> {

    @Query(
        value = "SELECT a FROM Assignment a JOIN FETCH a.resource r LEFT JOIN FETCH r.owner WHERE r.course.id = :courseId",
        countQuery = "SELECT COUNT(a) FROM Assignment a JOIN a.resource r WHERE r.course.id = :courseId"
    )
    Page<Assignment> findByCourseId(@Param("courseId") Long courseId, Pageable pageable);
}
