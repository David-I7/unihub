package com.unihub.app.repositories.community.content;

import com.unihub.app.entities.community.content.Resource;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface ResourceRepository extends JpaRepository<Resource, UUID> {

    @Query("""
        SELECT r FROM Resource r
        LEFT JOIN FETCH r.owner
        WHERE r.course.id = :courseId AND r.folder.id = :folderId
        ORDER BY r.createdAt DESC
    """)
    List<Resource> findByCourseIdAndFolderId(@Param("courseId") Long courseId, @Param("folderId") UUID folderId);

    @Query("""
        SELECT r FROM Resource r
        LEFT JOIN FETCH r.owner
        WHERE r.course.id = :courseId AND r.folder IS NULL
        ORDER BY r.createdAt DESC
    """)
    List<Resource> findRootResourcesByCourseId(@Param("courseId") Long courseId);
}
