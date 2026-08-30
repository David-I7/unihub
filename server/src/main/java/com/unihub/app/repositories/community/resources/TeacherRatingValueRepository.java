package com.unihub.app.repositories.community.resources;

import com.unihub.app.entities.community.resources.TeacherRatingValue;
import com.unihub.app.entities.community.resources.TeacherRatingValueId;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TeacherRatingValueRepository extends JpaRepository<TeacherRatingValue, TeacherRatingValueId> {
}
