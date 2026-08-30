package com.unihub.app.repositories.community.content;

import com.unihub.app.entities.community.content.Comment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CommentRepository extends JpaRepository<Comment, UUID> {
    List<Comment> findByPostId(UUID postId);

    @Query(value = """
        SELECT c FROM Comment c
        JOIN FETCH c.owner
        WHERE c.post.id = :postId
        ORDER BY c.createdAt ASC
    """,
    countQuery = """
        SELECT COUNT(c) FROM Comment c
        WHERE c.post.id = :postId
    """)
    Page<Comment> findCommentsByPostId(@Param("postId") UUID postId, Pageable pageable);

    @Query("SELECT c FROM Comment c JOIN FETCH c.owner JOIN FETCH c.post WHERE c.id = :id")
    Optional<Comment> findByIdWithOwner(@Param("id") UUID id);

    @Query("""
        SELECT c FROM Comment c
        JOIN FETCH c.owner
        WHERE c.post.id IN :postIds
        ORDER BY c.createdAt ASC
    """)
    List<Comment> findByPostIdInOrderByCreatedAtAsc(@Param("postIds") List<UUID> postIds);
}
