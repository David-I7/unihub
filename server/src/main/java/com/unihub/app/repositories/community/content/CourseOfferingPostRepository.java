package com.unihub.app.repositories.community.content;

import com.unihub.app.entities.community.content.CourseOfferingPost;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface CourseOfferingPostRepository extends JpaRepository<CourseOfferingPost, UUID> {
    List<CourseOfferingPost> findByCourseOfferingId(int courseOfferingId);
}
