package com.unihub.app.repositories.resources;

import com.unihub.app.entities.resources.Teacher;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;
import java.util.UUID;

public interface TeacherRepository extends JpaRepository<Teacher,UUID> {

    @Query("SELECT t FROM Teacher t WHERE t.firstName = :firstName AND t.lastName = :lastName")
    Optional<Teacher> findByFirstNameAndLastName(String firstName, String lastName);

}
