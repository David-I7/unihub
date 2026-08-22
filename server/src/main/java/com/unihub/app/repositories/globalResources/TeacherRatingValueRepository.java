package com.unihub.app.repositories.globalResources;

import com.unihub.app.entities.globalResources.TeacherRatingValue;
import com.unihub.app.entities.globalResources.TeacherRatingValueId;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TeacherRatingValueRepository extends JpaRepository<TeacherRatingValue, TeacherRatingValueId> {
}
