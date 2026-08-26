package com.unihub.app.entities.community.content;

import com.unihub.app.entities.authentication.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(
        name = "event_reminders",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = {"user_id", "event_id", "offset_minutes"})
        },
        indexes = {
                @Index(name = "idx_event_reminders_pending_remind_at", columnList = "status, remind_at ASC")
        }
)
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EventReminder {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "event_id", nullable = false)
    private Event event;

    @Column(name = "offset_minutes", nullable = false)
    private int offsetMinutes;

    @Column(name = "remind_at", nullable = false)
    private OffsetDateTime remindAt;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(nullable = false)
    @Builder.Default
    private ReminderStatus status = ReminderStatus.PENDING;

    @Column(nullable = false, name = "created_at")
    private OffsetDateTime createdAt;

    @PrePersist
    private void prePersist() {
        createdAt = OffsetDateTime.now();
    }
}
