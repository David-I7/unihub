package com.unihub.app.repositories.community.content;

import com.unihub.app.entities.community.content.MaterialFile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface MaterialFileRepository extends JpaRepository<MaterialFile, UUID> {
}
