package com.unihub.app.repositories.community.content;

import com.unihub.app.entities.community.content.Lecture;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface LectureRepository extends JpaRepository<Lecture, UUID> {
}
