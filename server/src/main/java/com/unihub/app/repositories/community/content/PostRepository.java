package com.unihub.app.repositories.community.content;

import com.unihub.app.entities.community.content.Post;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface PostRepository extends JpaRepository<Post, UUID> {

    @Query("SELECT p FROM Post p JOIN FETCH p.owner WHERE p.id = :id")
    Optional<Post> findByIdWithOwner(@Param("id") UUID id);

    @Modifying
    @Query("UPDATE Post p SET p.likesCount = p.likesCount + 1 WHERE p.id = :id")
    void incrementLikesCount(@Param("id") UUID id);

    @Modifying
    @Query("UPDATE Post p SET p.likesCount = CASE WHEN p.likesCount > 0 THEN p.likesCount - 1 ELSE 0 END WHERE p.id = :id")
    void decrementLikesCount(@Param("id") UUID id);

    @Modifying
    @Query("UPDATE Post p SET p.commentsCount = p.commentsCount + 1 WHERE p.id = :id")
    void incrementCommentsCount(@Param("id") UUID id);

    @Modifying
    @Query("UPDATE Post p SET p.commentsCount = CASE WHEN p.commentsCount > 0 THEN p.commentsCount - 1 ELSE 0 END WHERE p.id = :id")
    void decrementCommentsCount(@Param("id") UUID id);
}
