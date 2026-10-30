package com.unihub.app.repositories.community.content;

import com.unihub.app.entities.community.content.Comment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface CommentRepository extends JpaRepository<Comment, UUID> {
    @Query(value = """
        SELECT c FROM Comment c
        JOIN FETCH c.owner
        WHERE c.post.id = :postId
        ORDER BY c.createdAt DESC
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
            JOIN FETCH c.post
            LEFT JOIN FETCH c.post.communityPost comm_p
            LEFT JOIN FETCH comm_p.community
            LEFT JOIN FETCH c.post.coursePost course_p
            LEFT JOIN FETCH course_p.course
            WHERE c.id = :id
          """)
    Optional<Comment> findByIdWithOwnerAndPost(@Param("id") UUID id);
}
