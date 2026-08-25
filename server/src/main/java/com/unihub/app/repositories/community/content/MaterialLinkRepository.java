package com.unihub.app.repositories.community.content;

import com.unihub.app.entities.community.content.MaterialLink;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface MaterialLinkRepository extends JpaRepository<MaterialLink, UUID> {

    @Query("""
        SELECT ml FROM MaterialLink ml
        JOIN FETCH ml.resource r
        LEFT JOIN FETCH r.owner
        WHERE r.course.id = :courseId AND r.folder.id = :folderId
        ORDER BY r.createdAt DESC
    """)
    List<MaterialLink> findByCourseIdAndFolderId(@Param("courseId") int courseId, @Param("folderId") UUID folderId);

    @Query("""
        SELECT ml FROM MaterialLink ml
        JOIN FETCH ml.resource r
        LEFT JOIN FETCH r.owner
        WHERE r.course.id = :courseId AND r.folder IS NULL
        ORDER BY r.createdAt DESC
    """)
    List<MaterialLink> findRootLinksByCourseId(@Param("courseId") int courseId);
}
