package com.unihub.app.repositories.community.content;

import com.unihub.app.entities.community.content.EventReminder;
import com.unihub.app.entities.community.content.ReminderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

public interface EventReminderRepository extends JpaRepository<EventReminder, UUID> {

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

    List<EventReminder> findByEventIdAndStatus(UUID eventId, ReminderStatus status);

    List<EventReminder> findByUserIdAndEventId(UUID userId, UUID eventId);

    void deleteByUserIdAndEventId(UUID userId, UUID eventId);
}
