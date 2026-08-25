package com.unihub.app.entities.community.content;

import com.unihub.app.entities.authentication.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "posts")
@Builder
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class Post {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String description;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(nullable = false)
    private CommunicationChannel channel;

    @Column(nullable = false)
    private boolean pinned;

    @Column(nullable = false, name = "likes_count")
    private int likesCount;

    @Column(nullable = false, name = "comments_count")
    private int commentsCount;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "owner_id", nullable = false)
    private User owner;

    @OneToMany(mappedBy = "post", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Comment> comments;

    @Column(nullable = false, name = "created_at")
    private OffsetDateTime createdAt;

    @Column(nullable = false, name = "updated_at")
    private OffsetDateTime updatedAt;

    @PrePersist
    private void prePersist() {
        createdAt = OffsetDateTime.now();
        updatedAt = createdAt;
    }

    @PreUpdate
    private void preUpdate() {
        updatedAt = OffsetDateTime.now();
    }
}
