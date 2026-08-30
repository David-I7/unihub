package com.unihub.app.services;

import com.unihub.app.config.CacheConfig;
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

import com.unihub.app.config.EmailProperties;
import com.unihub.app.config.SessionProperties;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

@SpringBootTest(classes = {RoleService.class, CacheConfig.class})
@EnableConfigurationProperties({EmailProperties.class, SessionProperties.class})
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
    @DisplayName("getPermissionNamesByRoleType returns permission names and caches result")
    public void testGetPermissionNamesByRoleType_CachesResult() {
        RoleType roleType = RoleType.COMMUNITY_MEMBER;
        List<String> permissions = List.of("create:post", "create:comment");
        when(permissionRepository.findPermissionNamesByRoleName(roleType.name())).thenReturn(permissions);

        List<String> result1 = roleService.getPermissionNamesByRoleType(roleType);
        List<String> result2 = roleService.getPermissionNamesByRoleType(roleType);

        assertEquals(permissions, result1);
        assertEquals(permissions, result2);
        verify(permissionRepository, times(1)).findPermissionNamesByRoleName(roleType.name());
    }

    @Test
    @DisplayName("getPermissionNamesByRoleType returns empty list when roleType is null without querying repo")
    public void testGetPermissionNamesByRoleType_NullRole() {
        List<String> result = roleService.getPermissionNamesByRoleType(null);
        assertNotNull(result);
        assertTrue(result.isEmpty());
        verifyNoInteractions(permissionRepository);
    }

    @Test
    @DisplayName("getRole returns role and caches result")
    public void testGetRole_CachesResult() {
        Role role = Role.builder().name("USER").build();
        when(roleRepository.findByName("USER")).thenReturn(Optional.of(role));

        Role result1 = roleService.getRoleByName(RoleType.USER);
        Role result2 = roleService.getRoleByName(RoleType.USER);

        assertEquals(role, result1);
        assertEquals(role, result2);
        verify(roleRepository, times(1)).findByName("USER");
    }
}
