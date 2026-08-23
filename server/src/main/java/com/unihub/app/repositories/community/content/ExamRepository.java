package com.unihub.app.repositories.community.content;

import com.unihub.app.entities.community.content.Exam;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;
import java.util.UUID;

public interface ExamRepository extends JpaRepository<Exam, UUID> {
    @Query(
            """
        SELECT e FROM Exam e
        LEFT JOIN FETCH e.attachments a
        LEFT JOIN FETCH a.materialFile
        LEFT JOIN FETCH a.materialLink
        WHERE e.resource.id = :resourceId
        """
    )
    Optional<Exam> getExamWithAttachments(UUID resourceId);
}
