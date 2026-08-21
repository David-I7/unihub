package com.unihub.app.repositories.resources;

import com.unihub.app.entities.resources.TeacherRatingValue;
import com.unihub.app.entities.resources.TeacherRatingValueId;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TeacherRatingValueRepository extends JpaRepository<TeacherRatingValue, TeacherRatingValueId> {
}
