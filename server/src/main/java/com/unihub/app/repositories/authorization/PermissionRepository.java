package com.unihub.app.repositories.authorization;

import com.unihub.app.entities.authorization.Permission;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface PermissionRepository extends JpaRepository<Permission, UUID> {
}
