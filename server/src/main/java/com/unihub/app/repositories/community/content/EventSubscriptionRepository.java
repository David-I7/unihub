package com.unihub.app.repositories.community.content;

import com.unihub.app.entities.community.content.EventSubscription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface EventSubscriptionRepository extends JpaRepository<EventSubscription, UUID> {

    boolean existsByUserIdAndEventId(UUID userId, UUID eventId);

    Optional<EventSubscription> findByUserIdAndEventId(UUID userId, UUID eventId);

    @Query("SELECT es FROM EventSubscription es JOIN FETCH es.event e WHERE es.user.id = :userId")
    List<EventSubscription> findByUserId(@Param("userId") UUID userId);

    void deleteByUserIdAndEventId(UUID userId, UUID eventId);
}
