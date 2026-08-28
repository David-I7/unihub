package com.unihub.app.services.authorization;

import com.unihub.app.domain.RoleType;
import com.unihub.app.entities.authorization.Permission;
import com.unihub.app.entities.authorization.Role;
import com.unihub.app.repositories.authorization.PermissionRepository;
import com.unihub.app.repositories.authorization.RoleRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.Collections;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RoleService {

    private final CacheManager cacheManager;
    private final RoleRepository roleRepository;
    private final PermissionRepository permissionRepository;

    @Cacheable(cacheNames = "roles", key = "#roleName.name()")
    public Role getRoleByName(RoleType roleName) {
        return roleRepository.findByName(roleName.name())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.INTERNAL_SERVER_ERROR,
                        "Required role does not exist: " + roleName.name()
                ));
    }

    @Cacheable(cacheNames = "roles", key = "#roleId")
    public Role getRoleById(UUID roleId) {
        return roleRepository.findById(roleId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.INTERNAL_SERVER_ERROR,
                        "Required role does not exist: " + roleId
                ));
    }

    @Cacheable(cacheNames = "rolePermissionsByName", key = "#roleName", condition = "#roleName != null && !#roleName.isBlank()")
    public List<String> getPermissionNamesByRoleName(String roleName) {
        if (roleName == null || roleName.isBlank()) {
            return Collections.emptyList();
        }
        return permissionRepository.findPermissionNamesByRoleName(roleName);
    }

    @PostConstruct
    public void initializeRoles() {
        var roles = roleRepository.findAllWithPermissions();
        var roleCache = cacheManager.getCache("roles");
        var rolePermissionsCache = cacheManager.getCache("rolePermissionsByName");

        roles.forEach(role -> {
            roleCache.put(role.getName(), role);
            roleCache.put(role.getId(), role);
            rolePermissionsCache.put(role.getName(), role.getPermissions().stream().map(Permission::getName).toList());
        });
    }
}