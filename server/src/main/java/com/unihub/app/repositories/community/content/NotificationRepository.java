package com.unihub.app.repositories.community.content;

import com.unihub.app.entities.community.content.Notification;
import com.unihub.app.entities.community.content.NotificationCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.UUID;

public interface NotificationRepository extends JpaRepository<Notification, UUID>, JpaSpecificationExecutor<Notification> {

    long countByUserIdAndIsReadFalse(UUID userId);

    long countByUserIdAndCategoryAndIsReadFalse(UUID userId, NotificationCategory category);


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
