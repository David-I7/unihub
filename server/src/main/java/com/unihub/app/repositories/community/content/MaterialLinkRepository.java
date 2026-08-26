package com.unihub.app.repositories.community.content;

import com.unihub.app.entities.community.content.MaterialLink;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface MaterialLinkRepository extends JpaRepository<MaterialLink, UUID> {
}
