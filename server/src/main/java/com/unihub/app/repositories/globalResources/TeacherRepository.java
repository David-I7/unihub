package com.unihub.app.repositories.globalResources;

import com.unihub.app.entities.globalResources.Teacher;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface TeacherRepository extends JpaRepository<Teacher, UUID> {

    @Query("SELECT t FROM Teacher t WHERE t.firstName = :firstName AND t.lastName = :lastName")
    Optional<Teacher> findByFirstNameAndLastName(String firstName, String lastName);

    @Query("""
        SELECT DISTINCT t FROM Teacher t
        JOIN t.communities comm
        LEFT JOIN FETCH t.coursesTaught c
        WHERE comm.slug = :communitySlug
        ORDER BY t.lastName ASC, t.firstName ASC
    """)
    List<Teacher> findByCommunitySlugWithCourses(@Param("communitySlug") String communitySlug);
}
