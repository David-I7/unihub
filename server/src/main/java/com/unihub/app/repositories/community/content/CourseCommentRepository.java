package com.unihub.app.repositories.community.content;

import com.unihub.app.entities.community.content.CourseComment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CourseCommentRepository extends JpaRepository<CourseComment, UUID> {
    List<CourseComment> findByCoursePostId(UUID coursePostId);

    @Query("SELECT cc.coursePost.course.studyYear.community.slug FROM CourseComment cc WHERE cc.id = :commentId")
    Optional<String> findCommunitySlugByCommentId(@Param("commentId") UUID commentId);
}
