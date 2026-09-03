package com.unihub.app.repositories.community.content;

import com.unihub.app.entities.community.content.EventReminder;
import com.unihub.app.entities.community.content.ReminderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

public interface EventReminderRepository extends JpaRepository<EventReminder, UUID> {

    @Query(value = """
        SELECT er FROM EventReminder er
        JOIN FETCH er.event e
        WHERE er.user.id = :userId
          AND er.status = :status
        ORDER BY er.remindAt ASC
    """, countQuery = """
        SELECT COUNT(er) FROM EventReminder er
        WHERE er.user.id = :userId
          AND er.status = :status
    """)
    Page<EventReminder> findUserRemindersByStatus(
            @Param("userId") UUID userId,
            @Param("status") ReminderStatus status,
            Pageable pageable
    );

    @Query(value = """
        SELECT er FROM EventReminder er
        JOIN FETCH er.event e
        WHERE er.user.id = :userId
        ORDER BY er.remindAt ASC
    """, countQuery = """
        SELECT COUNT(er) FROM EventReminder er
        WHERE er.user.id = :userId
    """)
    Page<EventReminder> findAllUserReminders(
            @Param("userId") UUID userId,
            Pageable pageable
    );

    @Query("""
        SELECT er FROM EventReminder er
        JOIN FETCH er.event e
        JOIN FETCH er.user u
        WHERE er.status = :status AND er.remindAt <= :now
    """)
    List<EventReminder> findPendingDueReminders(
            @Param("status") ReminderStatus status,
            @Param("now") OffsetDateTime now
    );

    @Query("""
        SELECT er FROM EventReminder er
        JOIN FETCH er.user u
        WHERE er.event.id = :eventId
    """)
    List<EventReminder> findByEventIdWithUser(@Param("eventId") UUID eventId);

    List<EventReminder> findByUserIdAndEventId(UUID userId, UUID eventId);

    boolean existsByUserIdAndEventId(UUID userId, UUID eventId);

    void deleteByUserIdAndEventId(UUID userId, UUID eventId);
}
