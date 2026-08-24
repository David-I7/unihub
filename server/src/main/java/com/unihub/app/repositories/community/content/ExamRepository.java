package com.unihub.app.repositories.community.content;

import com.unihub.app.entities.community.content.Exam;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface ExamRepository extends JpaRepository<Exam, UUID> {
}
