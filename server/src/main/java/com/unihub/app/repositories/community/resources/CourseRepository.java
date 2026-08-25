package com.unihub.app.repositories.community.resources;

import com.unihub.app.entities.community.resources.Course;
import com.unihub.app.entities.community.resources.StudyYearName;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface CourseRepository extends JpaRepository<Course, Integer> {

    @Query("""
        SELECT DISTINCT c FROM Course c
        LEFT JOIN FETCH c.teachers t
        WHERE c.studyYear.id = :studyYearId AND c.archived = false
        ORDER BY c.semester ASC, c.name ASC
    """)
    List<Course> findActiveByStudyYearIdWithTeachers(@Param("studyYearId") int studyYearId);

    @Query("""
        SELECT DISTINCT c FROM Course c
        LEFT JOIN FETCH c.teachers t
        WHERE c.studyYear.id = :studyYearId
        ORDER BY c.semester ASC, c.name ASC
    """)
    List<Course> findAllByStudyYearIdWithTeachers(@Param("studyYearId") int studyYearId);

    @Query("""
        SELECT c FROM Course c
        JOIN c.studyYear sy
        JOIN sy.community comm
        WHERE c.id = :courseId
          AND comm.slug = :communitySlug
          AND sy.studyYearName = :studyYearName
    """)
    Optional<Course> findByIdAndCommunitySlugAndStudyYearName(
            @Param("courseId") int courseId,
            @Param("communitySlug") String communitySlug,
            @Param("studyYearName") StudyYearName studyYearName
    );
}
