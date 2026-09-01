package com.unihub.app.repositories.community.content;

import com.unihub.app.entities.community.content.Notification;
import com.unihub.app.entities.community.content.NotificationCategory;
import com.unihub.app.entities.community.content.NotificationType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.UUID;

public interface NotificationRepository extends JpaRepository<Notification, UUID>, JpaSpecificationExecutor<Notification> {

    long countByUserIdAndIsReadFalse(UUID userId);

    long countByUserIdAndCategoryAndIsReadFalse(UUID userId, NotificationCategory category);

    @Query(value = """
            SELECT
                n.id AS id,
                n.title AS title,
                n.message AS message,
                n.category AS category,
                n.type AS type,
                n.isRead AS isRead,
                n.createdAt AS createdAt,
                e.id AS eventId,
                a.id AS actorId,
                a.username AS actorUsername,
                CASE WHEN a.id IS NOT NULL AND a.deletedAt IS NULL THEN true ELSE false END AS actorActive,
                COALESCE(eComm.slug, cpComm.slug, crsComm.slug) AS communitySlug,
                COALESCE(eComm.name, cpComm.name, crsComm.name) AS communityName,
                COALESCE(eSy.studyYearName, crsSy.studyYearName) AS studyYearName,
                COALESCE(eCrs.name, crs.name) AS courseName,
                COALESCE(eCrs.slug, crs.slug) AS courseSlug
            FROM Notification n
            LEFT JOIN n.actor a
            LEFT JOIN n.event e
            LEFT JOIN e.community eComm
            LEFT JOIN e.course eCrs
            LEFT JOIN eCrs.studyYear eSy
            LEFT JOIN n.post p
            LEFT JOIN p.communityPost cp
            LEFT JOIN cp.community cpComm
            LEFT JOIN p.coursePost crsp
            LEFT JOIN crsp.course crs
            LEFT JOIN crs.studyYear crsSy
            LEFT JOIN crsSy.community crsComm
            WHERE n.user.id = :userId
              AND (COALESCE(:category,'') = ''  OR n.category = :category)
              AND (COALESCE(:type,'') = '' OR n.type = :type)
              AND (:isRead IS NULL OR n.isRead = :isRead)
            """,
            countQuery = """
            SELECT COUNT(n)
            FROM Notification n
            WHERE n.user.id = :userId
              AND (COALESCE(:category,'') = ''  OR n.category = :category)
              AND (COALESCE(:type,'') = '' OR n.type = :type)
              AND (:isRead IS NULL OR n.isRead = :isRead)
            """)
    Page<NotificationProjection> findUserNotifications(
            @Param("userId") UUID userId,
            @Param("category") NotificationCategory category,
            @Param("type") NotificationType type,
            @Param("isRead") Boolean isRead,
            Pageable pageable
    );

    @Modifying
    @Query(value = """
            UPDATE notifications
            SET is_read = true
            WHERE user_id = :userId
              AND is_read = false
            """, nativeQuery = true)
    int markAllAsReadByUserId(@Param("userId") UUID userId);

    @Modifying
    @Query(value = """
            UPDATE notifications
            SET is_read = true
            WHERE id = :id
              AND user_id = :userId
            """, nativeQuery = true)
    int markAsReadByIdAndUserId(@Param("id") UUID id, @Param("userId") UUID userId);
}
