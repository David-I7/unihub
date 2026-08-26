package com.unihub.app.entities.community.content;

import com.unihub.app.entities.authentication.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(
        name = "event_subscriptions",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = {"user_id", "event_id"})
        }
)
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EventSubscription {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "event_id", nullable = false)
    private Event event;

    @Column(nullable = false, name = "created_at")
    private OffsetDateTime createdAt;

    @PrePersist
    private void prePersist() {
        createdAt = OffsetDateTime.now();
    }
}
