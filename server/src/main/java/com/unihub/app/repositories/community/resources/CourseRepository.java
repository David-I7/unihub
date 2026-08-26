package com.unihub.app.repositories.community.resources;

import com.unihub.app.entities.community.resources.Course;
import com.unihub.app.entities.community.resources.StudyYearName;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface CourseRepository extends JpaRepository<Course, Long> {

    @Query("""
        SELECT DISTINCT c FROM Course c
        LEFT JOIN FETCH c.teachers t
        WHERE c.studyYear.id = :studyYearId AND c.archived = false
        ORDER BY c.semester ASC, c.name ASC
    """)
    List<Course> findAllActiveByStudyYearIdWithTeachers(@Param("studyYearId") int studyYearId);

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
        LEFT JOIN FETCH c.teachers
        WHERE c.slug = :courseSlug
          AND comm.slug = :communitySlug
          AND sy.studyYearName = :studyYearName
    """)
    Optional<Course> findBySlugAndCommunitySlugAndStudyYearNameWithTeachers(
            @Param("courseSlug") String courseSlug,
            @Param("communitySlug") String communitySlug,
            @Param("studyYearName") StudyYearName studyYearName
    );

    @Query("""
        SELECT c FROM Course c
        JOIN c.studyYear sy
        JOIN sy.community comm
        WHERE c.slug = :courseSlug
          AND comm.slug = :communitySlug
          AND sy.studyYearName = :studyYearName
    """)
    Optional<Course> findBySlugAndCommunitySlugAndStudyYearName(
            @Param("courseSlug") String courseSlug,
            @Param("communitySlug") String communitySlug,
            @Param("studyYearName") StudyYearName studyYearName
    );

    @Query("""
        SELECT c FROM Course c
        JOIN FETCH c.studyYear sy
        JOIN FETCH sy.community comm
        WHERE c.id = :courseId
    """)
    Optional<Course> findByIdWithStudyYearAndCommunity(@Param("courseId") Long courseId);
}
