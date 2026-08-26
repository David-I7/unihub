package com.unihub.app.repositories.community.content;

import com.unihub.app.entities.community.content.MaterialFile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface MaterialFileRepository extends JpaRepository<MaterialFile, UUID> {

    @Query("""
        SELECT mf FROM MaterialFile mf
        JOIN FETCH mf.resource r
        LEFT JOIN FETCH r.owner
        WHERE r.course.id = :courseId AND r.folder.id = :folderId
        ORDER BY r.createdAt DESC
    """)
    List<MaterialFile> findByCourseIdAndFolderId(@Param("courseId") Long courseId, @Param("folderId") UUID folderId);

    @Query("""
        SELECT mf FROM MaterialFile mf
        JOIN FETCH mf.resource r
        LEFT JOIN FETCH r.owner
        WHERE r.course.id = :courseId AND r.folder IS NULL
        ORDER BY r.createdAt DESC
    """)
    List<MaterialFile> findRootFilesByCourseId(@Param("courseId") Long courseId);
}
