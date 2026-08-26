package com.unihub.app.repositories.authorization;

import com.unihub.app.entities.authorization.Permission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface PermissionRepository extends JpaRepository<Permission, UUID> {

    @Query("SELECT p.name FROM Permission p JOIN p.roles r WHERE r.name = :roleName")
    List<String> findPermissionNamesByRoleName(@Param("roleName") String roleName);
}
