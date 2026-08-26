package com.unihub.app.repositories.community.content;

import com.unihub.app.entities.community.content.CourseComment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface CourseCommentRepository extends JpaRepository<CourseComment, UUID> {
    List<CourseComment> findByCoursePostId(UUID coursePostId);
}
