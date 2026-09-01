package com.unihub.app.repositories.community.resources;

import com.unihub.app.entities.community.resources.StudyYearName;
import com.unihub.app.entities.community.resources.Teacher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface TeacherRepository extends JpaRepository<Teacher, UUID> {

    @Query("SELECT t FROM Teacher t WHERE t.community.slug = :communitySlug")
    Page<Teacher> findByCommunitySlug(@Param("communitySlug") String communitySlug, Pageable pageable);

    @Query("""
        SELECT t FROM Teacher t
        WHERE t.community.slug = :communitySlug
        AND (
            LOWER(t.firstName) LIKE LOWER(CONCAT('%', :search, '%'))
            OR LOWER(t.lastName) LIKE LOWER(CONCAT('%', :search, '%'))
            OR LOWER(CONCAT(t.firstName, ' ', t.lastName)) LIKE LOWER(CONCAT('%', :search, '%'))
            OR LOWER(CONCAT(t.lastName, ' ', t.firstName)) LIKE LOWER(CONCAT('%', :search, '%'))
        )
    """)
    Page<Teacher> findByCommunitySlugAndSearch(
            @Param("communitySlug") String communitySlug,
            @Param("search") String search,
            Pageable pageable
    );

    @Query(
            value = """
                SELECT DISTINCT t FROM Teacher t
                JOIN t.coursesTaught c
                WHERE t.community.slug = :communitySlug
                AND (CAST(:studyYear AS string) IS NULL OR c.studyYear.studyYearName = :studyYear)
                AND (:semester IS NULL OR c.semester = :semester)
            """,
            countQuery = """
                SELECT COUNT(DISTINCT t) FROM Teacher t
                JOIN t.coursesTaught c
                WHERE t.community.slug = :communitySlug
                AND (CAST(:studyYear AS string) IS NULL OR c.studyYear.studyYearName = :studyYear)
                AND (:semester IS NULL OR c.semester = :semester)
            """
    )
    Page<Teacher> findByCommunitySlugAndFilters(
            @Param("communitySlug") String communitySlug,
            @Param("studyYear") StudyYearName studyYear,
            @Param("semester") Integer semester,
            Pageable pageable
    );

    @Query(
            value = """
                SELECT DISTINCT t FROM Teacher t
                JOIN t.coursesTaught c
                WHERE t.community.slug = :communitySlug
                AND (CAST(:studyYear AS string) IS NULL OR c.studyYear.studyYearName = :studyYear)
                AND (:semester IS NULL OR c.semester = :semester)
                AND (
                    LOWER(t.firstName) LIKE LOWER(CONCAT('%', :search, '%'))
                    OR LOWER(t.lastName) LIKE LOWER(CONCAT('%', :search, '%'))
                    OR LOWER(CONCAT(t.firstName, ' ', t.lastName)) LIKE LOWER(CONCAT('%', :search, '%'))
                    OR LOWER(CONCAT(t.lastName, ' ', t.firstName)) LIKE LOWER(CONCAT('%', :search, '%'))
                )
            """,
            countQuery = """
                SELECT COUNT(DISTINCT t) FROM Teacher t
                JOIN t.coursesTaught c
                WHERE t.community.slug = :communitySlug
                AND (CAST(:studyYear AS string) IS NULL OR c.studyYear.studyYearName = :studyYear)
                AND (:semester IS NULL OR c.semester = :semester)
                AND (
                    LOWER(t.firstName) LIKE LOWER(CONCAT('%', :search, '%'))
                    OR LOWER(t.lastName) LIKE LOWER(CONCAT('%', :search, '%'))
                    OR LOWER(CONCAT(t.firstName, ' ', t.lastName)) LIKE LOWER(CONCAT('%', :search, '%'))
                    OR LOWER(CONCAT(t.lastName, ' ', t.firstName)) LIKE LOWER(CONCAT('%', :search, '%'))
                )
            """
    )
    Page<Teacher> findByCommunitySlugAndFiltersAndSearch(
            @Param("communitySlug") String communitySlug,
            @Param("search") String search,
            @Param("studyYear") StudyYearName studyYear,
            @Param("semester") Integer semester,
            Pageable pageable
    );

    @Query("""
        SELECT DISTINCT t FROM Teacher t
        LEFT JOIN FETCH t.coursesTaught c
        WHERE t.community.slug = :communitySlug
        ORDER BY t.lastName ASC, t.firstName ASC
    """)
    List<Teacher> findByCommunitySlugWithCourses(@Param("communitySlug") String communitySlug);

    @Query("""
        SELECT t FROM Teacher t
        WHERE t.community.id = :communityId
        AND LOWER(t.firstName) = LOWER(:firstName)
        AND LOWER(t.lastName) = LOWER(:lastName)
    """)
    Optional<Teacher> findByCommunityIdAndFirstNameAndLastName(
            @Param("communityId") UUID communityId,
            @Param("firstName") String firstName,
            @Param("lastName") String lastName
    );

    @Query("SELECT t FROM Teacher t JOIN FETCH t.community WHERE t.id = :teacherId")
    Optional<Teacher> findByIdWithCommunity(@Param("teacherId") UUID teacherId);

    @Query("SELECT t FROM Teacher t JOIN FETCH t.community LEFT JOIN FETCH t.coursesTaught WHERE t.id = :teacherId")
    Optional<Teacher> findByIdWithCommunityAndCourses(@Param("teacherId") UUID teacherId);

    @Query("SELECT t FROM Teacher t WHERE t.id IN :ids AND t.community.id = :communityId")
    List<Teacher> findAllByIdInAndCommunityId(@Param("ids") List<UUID> ids, @Param("communityId") UUID communityId);
}
