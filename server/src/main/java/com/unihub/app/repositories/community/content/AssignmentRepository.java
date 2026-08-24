package com.unihub.app.repositories.community.content;

import com.unihub.app.entities.community.content.Assignment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface AssignmentRepository extends JpaRepository<Assignment, UUID> {
}
