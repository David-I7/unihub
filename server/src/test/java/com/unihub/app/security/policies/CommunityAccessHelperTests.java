package com.unihub.app.security.policies;

import com.unihub.app.domain.RoleType;
import com.unihub.app.dto.UserDto;
import com.unihub.app.services.authorization.RoleService;
import com.unihub.app.services.community.resources.CommunityMemberService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

public class CommunityAccessHelperTests {

    private CommunityMemberService communityMemberService;
    private RoleService roleService;
    private CommunityAccessHelper helper;
    private UUID userId;

    @BeforeEach
    public void setUp() {
        communityMemberService = mock(CommunityMemberService.class);
        roleService = mock(RoleService.class);
        helper = new CommunityAccessHelper(communityMemberService, roleService);
        userId = UUID.randomUUID();
    }

    @Test
    @DisplayName("hasGlobalRole returns true for ROOT user regardless of requested role")
    public void testHasGlobalRole_RootUser() {
        UserDto rootUser = new UserDto(userId, "root@example.com", "root", true, RoleType.ROOT);
        assertThat(helper.hasGlobalRole(rootUser, RoleType.ADMIN)).isTrue();
        assertThat(helper.hasGlobalRole(rootUser, RoleType.USER)).isTrue();
    }

    @Test
    @DisplayName("hasGlobalRole checks exact match for non-root roles")
    public void testHasGlobalRole_ExactMatch() {
        UserDto adminUser = new UserDto(userId, "admin@example.com", "admin", true, RoleType.ADMIN);
        assertThat(helper.hasGlobalRole(adminUser, RoleType.ADMIN)).isTrue();
        assertThat(helper.hasGlobalRole(adminUser, RoleType.ROOT)).isFalse();

        UserDto regularUser = new UserDto(userId, "user@example.com", "user", true, RoleType.USER);
        assertThat(helper.hasGlobalRole(regularUser, RoleType.USER)).isTrue();
        assertThat(helper.hasGlobalRole(regularUser, RoleType.ADMIN)).isFalse();
    }

    @Test
    @DisplayName("hasCommunityRole grants access to platform administrators")
    public void testHasCommunityRole_PlatformAdmin() {
        UserDto rootUser = new UserDto(userId, "root@example.com", "root", true, RoleType.ROOT);
        assertThat(helper.hasCommunityRole("fmi", rootUser, RoleType.COMMUNITY_ADMIN)).isTrue();

        UserDto adminUser = new UserDto(userId, "admin@example.com", "admin", true, RoleType.ADMIN);
        assertThat(helper.hasCommunityRole("fmi", adminUser, RoleType.COMMUNITY_OWNER)).isTrue();
    }

    @Test
    @DisplayName("hasCommunityRole supports role hierarchy for community owner and admin")
    public void testHasCommunityRole_Hierarchy() {
        UserDto user = new UserDto(userId, "member@example.com", "member", true, RoleType.USER);

        // When user is COMMUNITY_OWNER
        when(communityMemberService.getCommunityRole("fmi", userId)).thenReturn(RoleType.COMMUNITY_OWNER);
        assertThat(helper.hasCommunityRole("fmi", user, RoleType.COMMUNITY_OWNER)).isTrue();
        assertThat(helper.hasCommunityRole("fmi", user, RoleType.COMMUNITY_ADMIN)).isTrue();
        assertThat(helper.hasCommunityRole("fmi", user, RoleType.COMMUNITY_MEMBER)).isTrue();

        // When user is COMMUNITY_ADMIN
        when(communityMemberService.getCommunityRole("fmi", userId)).thenReturn(RoleType.COMMUNITY_ADMIN);
        assertThat(helper.hasCommunityRole("fmi", user, RoleType.COMMUNITY_OWNER)).isFalse();
        assertThat(helper.hasCommunityRole("fmi", user, RoleType.COMMUNITY_ADMIN)).isTrue();
        assertThat(helper.hasCommunityRole("fmi", user, RoleType.COMMUNITY_MEMBER)).isTrue();

        // When user is COMMUNITY_MEMBER
        when(communityMemberService.getCommunityRole("fmi", userId)).thenReturn(RoleType.COMMUNITY_MEMBER);
        assertThat(helper.hasCommunityRole("fmi", user, RoleType.COMMUNITY_OWNER)).isFalse();
        assertThat(helper.hasCommunityRole("fmi", user, RoleType.COMMUNITY_ADMIN)).isFalse();
        assertThat(helper.hasCommunityRole("fmi", user, RoleType.COMMUNITY_MEMBER)).isTrue();
    }

    @Test
    @DisplayName("hasCommunityRole returns false for non-members")
    public void testHasCommunityRole_NonMember() {
        UserDto user = new UserDto(userId, "outsider@example.com", "outsider", true, RoleType.USER);
        when(communityMemberService.getCommunityRole("fmi", userId)).thenReturn(null);

        assertThat(helper.hasCommunityRole("fmi", user, RoleType.COMMUNITY_MEMBER)).isFalse();
    }
}
