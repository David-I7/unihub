package com.unihub.app.repositories.community.content;

import com.unihub.app.entities.community.content.Folder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface FolderRepository extends JpaRepository<Folder, UUID> {

    @Query("SELECT f FROM Folder f LEFT JOIN FETCH f.owner WHERE f.course.id = :courseId AND f.parentFolder.id = :parentFolderId ORDER BY f.name ASC")
    List<Folder> findByCourseIdAndParentFolderId(@Param("courseId") Long courseId, @Param("parentFolderId") UUID parentFolderId);

    @Query("SELECT f FROM Folder f LEFT JOIN FETCH f.owner WHERE f.course.id = :courseId AND f.parentFolder IS NULL ORDER BY f.name ASC")
    List<Folder> findRootFoldersByCourseId(@Param("courseId") Long courseId);

    boolean existsByIdAndCourseId(UUID id, Long courseId);
}
