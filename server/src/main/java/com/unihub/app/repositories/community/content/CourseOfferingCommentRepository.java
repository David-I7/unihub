package com.unihub.app.repositories.community.content;

import com.unihub.app.entities.community.content.CourseOfferingComment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface CourseOfferingCommentRepository extends JpaRepository<CourseOfferingComment, UUID> {
    List<CourseOfferingComment> findByCourseOfferingPostId(UUID courseOfferingPostId);
}
