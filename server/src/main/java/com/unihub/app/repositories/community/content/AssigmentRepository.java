package com.unihub.app.repositories.community.content;

import com.unihub.app.entities.community.content.Assignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;
import java.util.UUID;

public interface AssigmentRepository extends JpaRepository<Assignment, UUID> {

    @Query(
            """
            SELECT a FROM Assignment a
            LEFT JOIN FETCH a.attachments att
            LEFT JOIN FETCH att.materialFile
            LEFT JOIN FETCH att.materialLink
            WHERE a.resource.id = :resourceId
            """
    )
    Optional<Assignment> getAssigmentWithAttachments(UUID resourceId);
}
