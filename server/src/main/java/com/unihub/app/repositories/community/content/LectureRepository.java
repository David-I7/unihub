package com.unihub.app.repositories.community.content;

import com.unihub.app.entities.community.content.Lecture;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.UUID;

public interface LectureRepository extends JpaRepository<Lecture, UUID> {

    @Query(
        value = "SELECT l FROM Lecture l JOIN FETCH l.resource r LEFT JOIN FETCH r.owner WHERE r.course.id = :courseId",
        countQuery = "SELECT COUNT(l) FROM Lecture l JOIN l.resource r WHERE r.course.id = :courseId"
    )
    Page<Lecture> findByCourseId(@Param("courseId") int courseId, Pageable pageable);
}
