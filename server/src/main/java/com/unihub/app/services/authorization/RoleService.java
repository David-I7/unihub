package com.unihub.app.services.authorization;

import com.unihub.app.domain.RoleType;
import com.unihub.app.entities.authorization.Permission;
import com.unihub.app.entities.authorization.Role;
import com.unihub.app.repositories.authorization.PermissionRepository;
import com.unihub.app.repositories.authorization.RoleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.Collections;
import java.util.List;

@Service
@RequiredArgsConstructor
public class RoleService {

    private final RoleRepository roleRepository;
    private final PermissionRepository permissionRepository;

    @Cacheable(cacheNames = "roles", key = "#roleName.name()")
    public Role getRole(RoleType roleName) {
        return roleRepository.findByName(roleName.name())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.INTERNAL_SERVER_ERROR,
                        "Required role does not exist: " + roleName.name()
                ));
    }

    @Cacheable(cacheNames = "rolePermissionsByName", key = "#roleName", condition = "#roleName != null && !#roleName.isBlank()")
    public List<String> getPermissionNamesByRoleName(String roleName) {
        if (roleName == null || roleName.isBlank()) {
            return Collections.emptyList();
        }
        return permissionRepository.findPermissionNamesByRoleName(roleName);
    }
}