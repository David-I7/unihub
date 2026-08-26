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

    @Query("""
        SELECT er FROM EventReminder er
        JOIN FETCH er.user u
        WHERE er.event.id = :eventId
    """)
    List<EventReminder> findByEventIdWithUser(@Param("eventId") UUID eventId);

    List<EventReminder> findByEventIdAndStatus(UUID eventId, ReminderStatus status);

    List<EventReminder> findByUserIdAndEventId(UUID userId, UUID eventId);

    List<EventReminder> findByUserIdAndEventIdIn(UUID userId, java.util.Collection<UUID> eventIds);

    boolean existsByUserIdAndEventIdAndOffsetMinutes(UUID userId, UUID eventId, int offsetMinutes);

    boolean existsByUserIdAndEventId(UUID userId, UUID eventId);

    java.util.Optional<EventReminder> findByIdAndUserId(UUID id, UUID userId);

    void deleteByIdAndUserId(UUID id, UUID userId);

    void deleteByUserIdAndEventId(UUID userId, UUID eventId);
}
