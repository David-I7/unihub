package com.unihub.app.security.permission;

import com.unihub.app.domain.PermissionType;
import com.unihub.app.domain.RoleType;
import com.unihub.app.dto.UserDto;
import com.unihub.app.security.JwtAuthentication;
import com.unihub.app.security.UnifiedPermissionEvaluator;
import com.unihub.app.security.policies.CommunityAccessHelper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.Authentication;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

public class UnifiedPermissionEvaluatorTests {

    private CommunityAccessHelper helper;
    private UnifiedPermissionEvaluator evaluator;
    private Authentication auth;
    private UserDto user;

    @BeforeEach
    public void setUp() {
        helper = mock(CommunityAccessHelper.class);
        evaluator = new UnifiedPermissionEvaluator(helper);
        user = new UserDto(UUID.randomUUID(), "test@gmail.com", "testuser", true, RoleType.USER);
        auth = new JwtAuthentication(user);
    }

    @Test
    @DisplayName("Returns false when authentication is null")
    public void testHasPermission_NullAuth_ReturnsFalse() {
        assertThat(evaluator.hasPermission(null, "fmi", "POST", "CREATE")).isFalse();
        assertThat(evaluator.hasPermission(null, "COMMUNITY", "CREATE")).isFalse();
    }

    @Test
    @DisplayName("Evaluates 3-arg hasPermission with community permission")
    public void testHasPermission_WithTargetId_EvaluatesCommunityPermission() {
        when(helper.hasCommunityPermission("fmi", user.id(), PermissionType.CREATE_POST)).thenReturn(true);

        boolean result = evaluator.hasPermission(auth, "fmi", "POST", "CREATE");

        assertThat(result).isTrue();
        verify(helper).hasCommunityPermission("fmi", user.id(), PermissionType.CREATE_POST);
    }

    @Test
    @DisplayName("Evaluates 2-arg hasPermission with global permission")
    public void testHasPermission_WithTargetDomainObject_EvaluatesGlobalPermission() {
        when(helper.hasGlobalPermission(user, PermissionType.CREATE_COMMUNITY)).thenReturn(true);

        boolean result = evaluator.hasPermission(auth, "COMMUNITY", "CREATE");

        assertThat(result).isTrue();
        verify(helper).hasGlobalPermission(user, PermissionType.CREATE_COMMUNITY);
    }

    @Test
    @DisplayName("Returns false when neither global nor community permission is granted")
    public void testHasPermission_Denied_ReturnsFalse() {
        when(helper.hasGlobalPermission(user, PermissionType.CREATE_POST)).thenReturn(false);
        when(helper.hasCommunityPermission("fmi", user.id(), PermissionType.CREATE_POST)).thenReturn(false);

        boolean result = evaluator.hasPermission(auth, "fmi", "POST", "CREATE");
        assertThat(result).isFalse();
    }

    @Test
    @DisplayName("Returns false when permission is unresolvable")
    public void testHasPermission_UnknownPermission_ReturnsFalse() {
        boolean result = evaluator.hasPermission(auth, "fmi", "UNKNOWN", "NONEXISTENT");
        assertThat(result).isFalse();
    }
}
