package com.unihub.app.repositories.community.content;

import com.unihub.app.entities.community.content.CoursePost;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface CoursePostRepository extends JpaRepository<CoursePost, UUID> {
    List<CoursePost> findByCourseId(Long courseId);
}
