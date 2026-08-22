package com.unihub.app.repositories.community.content;

import com.unihub.app.entities.community.content.Folder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.UUID;

public interface FolderRepository extends JpaRepository<Folder, UUID> {

    @Query("SELECT f FROM Folder f WHERE f.courseOffering.id = :courseOfferingId AND f.parentFolder.id = :parentFolderId")
    List<Folder> findByCourseOfferingIdAndParentFolderId(int courseOfferingId, UUID parentFolderId);

    @Query("SELECT f FROM Folder f WHERE f.courseOffering.id = :courseOfferingId AND f.parentFolder IS NULL")
    List<Folder> findRootFoldersByCourseOfferingId(int courseOfferingId);
}
