package com.unihub.app.repositories.community.content;

import com.unihub.app.entities.community.content.CoursePost;
import com.unihub.app.entities.community.content.Post;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CoursePostRepository extends JpaRepository<CoursePost, UUID> {
    List<CoursePost> findByCourseId(Long courseId);

    @Query(value = """
        SELECT cp.post FROM CoursePost cp
        JOIN cp.post p
        JOIN FETCH p.owner
        WHERE cp.course.id = :courseId
        ORDER BY p.pinned DESC, p.createdAt DESC
    """,
    countQuery = """
        SELECT COUNT(cp) FROM CoursePost cp
        WHERE cp.course.id = :courseId
    """)
    Page<Post> findPostsByCourseId(@Param("courseId") Long courseId, Pageable pageable);

    @Query("SELECT cp.course.studyYear.community.slug FROM CoursePost cp WHERE cp.post.id = :postId")
    Optional<String> findCommunitySlugByPostId(@Param("postId") UUID postId);
}
