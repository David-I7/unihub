package com.unihub.app.services;

import com.unihub.app.domain.RoleType;
import com.unihub.app.entities.authorization.Role;
import com.unihub.app.repositories.authorization.PermissionRepository;
import com.unihub.app.repositories.authorization.RoleRepository;
import com.unihub.app.services.authorization.RoleService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.cache.CacheManager;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@SpringBootTest
public class RoleServiceTests {

    @Autowired
    private RoleService roleService;

    @Autowired
    private CacheManager cacheManager;

    @MockitoBean
    private RoleRepository roleRepository;

    @MockitoBean
    private PermissionRepository permissionRepository;

    @BeforeEach
    public void setUp() {
        for (String name : cacheManager.getCacheNames()) {
            var cache = cacheManager.getCache(name);
            if (cache != null) {
                cache.clear();
            }
        }
    }

    @Test
    @DisplayName("getPermissionNamesByRoleName returns permission names and caches result")
    public void testGetPermissionNamesByRoleName_CachesResult() {
        String roleName = "STUDENT";
        List<String> permissions = List.of("CREATE_POST", "VIEW_CALENDAR");
        when(permissionRepository.findPermissionNamesByRoleName(roleName)).thenReturn(permissions);

        List<String> result1 = roleService.getPermissionNamesByRoleName(roleName);
        List<String> result2 = roleService.getPermissionNamesByRoleName(roleName);

        assertEquals(permissions, result1);
        assertEquals(permissions, result2);
        verify(permissionRepository, times(1)).findPermissionNamesByRoleName(roleName);
    }

    @Test
    @DisplayName("getPermissionNamesByRoleName returns empty list when roleName is null without querying repo")
    public void testGetPermissionNamesByRoleName_NullRole() {
        List<String> result = roleService.getPermissionNamesByRoleName(null);
        assertNotNull(result);
        assertTrue(result.isEmpty());
        verifyNoInteractions(permissionRepository);
    }

    @Test
    @DisplayName("getPermissionNamesByRoleName returns empty list when roleName is blank without querying repo")
    public void testGetPermissionNamesByRoleName_BlankRole() {
        List<String> result = roleService.getPermissionNamesByRoleName("   ");
        assertNotNull(result);
        assertTrue(result.isEmpty());
        verifyNoInteractions(permissionRepository);
    }

    @Test
    @DisplayName("getRole returns role and caches result")
    public void testGetRole_CachesResult() {
        Role role = Role.builder().name("USER").build();
        when(roleRepository.findByName("USER")).thenReturn(Optional.of(role));

        Role result1 = roleService.getRole(RoleType.USER);
        Role result2 = roleService.getRole(RoleType.USER);

        assertEquals(role, result1);
        assertEquals(role, result2);
        verify(roleRepository, times(1)).findByName("USER");
    }
}
