package com.unihub.app.repositories.community.content;

import com.unihub.app.entities.community.content.Folder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface FolderRepository extends JpaRepository<Folder, UUID> {

    @Query("SELECT f FROM Folder f LEFT JOIN FETCH f.owner WHERE f.course.id = :courseId AND f.parentFolder.id = :parentFolderId ORDER BY f.name ASC")
    List<Folder> findByCourseIdAndParentFolderId(@Param("courseId") Long courseId, @Param("parentFolderId") UUID parentFolderId);

    @Query("SELECT f FROM Folder f LEFT JOIN FETCH f.owner WHERE f.course.id = :courseId AND f.parentFolder IS NULL ORDER BY f.name ASC")
    List<Folder> findRootFoldersByCourseId(@Param("courseId") Long courseId);

    @Query("SELECT f FROM Folder f LEFT JOIN FETCH f.course WHERE f.id = :id")
    Optional<Folder> findByIdWithCourse(UUID id);

    boolean existsByIdAndCourseId(UUID id, Long courseId);

    boolean existsByCourseIdAndParentFolderIdAndNameIgnoreCase(Long courseId, UUID parentFolderId, String name);

    boolean existsByCourseIdAndParentFolderIsNullAndNameIgnoreCase(Long courseId, String name);

    boolean existsByCourseIdAndParentFolderIdAndNameIgnoreCaseAndIdNot(Long courseId, UUID parentFolderId, String name, UUID id);

    boolean existsByCourseIdAndParentFolderIsNullAndNameIgnoreCaseAndIdNot(Long courseId, String name, UUID id);

    boolean existsByParentFolderId(UUID parentFolderId);

    List<Folder> findByParentFolderId(UUID parentFolderId);

    @Query("SELECT f FROM Folder f LEFT JOIN FETCH f.owner JOIN FETCH f.course c JOIN FETCH c.studyYear sy JOIN FETCH sy.community WHERE f.id = :id")
    Optional<Folder> findByIdWithCourseAndCommunity(@Param("id") UUID id);
}
