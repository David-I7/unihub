package com.unihub.app.repositories.community.content;

import com.unihub.app.entities.community.content.Resource;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface ResourceRepository extends JpaRepository<Resource, UUID> {
}
