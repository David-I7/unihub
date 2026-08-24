package com.unihub.app.repositories.community.resources;

import com.unihub.app.entities.community.resources.Course;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface CourseRepository extends JpaRepository<Course, UUID> {
}
