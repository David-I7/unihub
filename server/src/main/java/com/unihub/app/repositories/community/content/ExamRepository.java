package com.unihub.app.repositories.community.content;

import com.unihub.app.entities.community.content.Exam;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.UUID;

public interface ExamRepository extends JpaRepository<Exam, UUID> {

    @Query(
        value = "SELECT e FROM Exam e JOIN FETCH e.resource r LEFT JOIN FETCH r.owner WHERE r.course.id = :courseId",
        countQuery = "SELECT COUNT(e) FROM Exam e JOIN e.resource r WHERE r.course.id = :courseId"
    )
    Page<Exam> findByCourseId(@Param("courseId") int courseId, Pageable pageable);
}
