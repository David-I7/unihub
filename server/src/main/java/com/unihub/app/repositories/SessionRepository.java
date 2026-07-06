package com.unihub.app.repositories;


import com.unihub.app.entities.Session;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface SessionRepository extends JpaRepository<Session, UUID> {
}
