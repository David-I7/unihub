package com.unihub.app.services;

import com.unihub.app.domain.RoleType;
import com.unihub.app.dto.PageDto;
import com.unihub.app.dto.UserDto;
import com.unihub.app.dto.community.resources.request.AddCommunityMemberRequestDto;
import com.unihub.app.dto.community.resources.request.UpdateMemberRoleRequestDto;
import com.unihub.app.dto.community.resources.response.CommunityMemberResponseDto;
import com.unihub.app.dto.user.UserEnrolledCommunityDto;
import com.unihub.app.entities.authentication.User;
import com.unihub.app.entities.authorization.Role;
import com.unihub.app.entities.community.resources.Community;
import com.unihub.app.entities.community.resources.CommunityJoinCode;
import com.unihub.app.entities.community.resources.CommunityMember;
import com.unihub.app.mappers.GlobalResourceMapper;
import com.unihub.app.mappers.PageMapper;
import com.unihub.app.mappers.UserMapper;
import com.unihub.app.mappers.community.CommunityResourceMapper;
import com.unihub.app.repositories.authentication.UserRepository;
import com.unihub.app.repositories.community.resources.CommunityJoinCodeRepository;
import com.unihub.app.repositories.community.resources.CommunityMemberRepository;
import com.unihub.app.repositories.community.resources.CommunityRepository;
import com.unihub.app.security.JwtAuthentication;
import com.unihub.app.services.authorization.AuthorizationService;
import com.unihub.app.services.authorization.RoleService;
import com.unihub.app.services.community.resources.CommunityMemberService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.web.server.ResponseStatusException;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class CommunityMemberServiceTests {

    @Mock
    private CommunityMemberRepository communityMemberRepository;

    @Mock
    private CommunityRepository communityRepository;

    @Mock
    private CommunityJoinCodeRepository joinCodeRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private RoleService roleService;

    @Mock
    private AuthorizationService authorizationService;

    private PageMapper pageMapper;
    private GlobalResourceMapper globalResourceMapper;
    private CommunityResourceMapper communityMapper;
    private UserMapper userMapper;
    private CommunityMemberService communityMemberService;

    @org.junit.jupiter.api.BeforeEach
    public void setUp() {
        pageMapper = new PageMapper();
        globalResourceMapper = new GlobalResourceMapper();
        communityMapper = new CommunityResourceMapper(globalResourceMapper);
        userMapper = new UserMapper(roleService);
        communityMemberService = new CommunityMemberService(
                communityMemberRepository,
                communityRepository,
                joinCodeRepository,
                userRepository,
                roleService,
                authorizationService,
                pageMapper,
                userMapper,
                communityMapper
        );
    }

    // =========================================================================
    // getMembers
    // =========================================================================

    @Test
    @DisplayName("getMembers returns paginated members with role name")
    public void testGetMembers_Success() {
        UUID roleId = UUID.randomUUID();
        Role role = Role.builder().id(roleId).name(RoleType.COMMUNITY_MEMBER.name()).build();
        User user = User.builder().id(UUID.randomUUID()).username("student").build();

        CommunityMember member = CommunityMember.builder()
                .user(user)
                .roleId(roleId)
                .joinedAt(OffsetDateTime.now())
                .build();

        PageRequest pageRequest = PageRequest.of(0, 20);

        when(communityRepository.existsBySlug("fmi-info")).thenReturn(true);
        when(communityMemberRepository.findMembersByCommunitySlug("fmi-info", pageRequest))
                .thenReturn(new PageImpl<>(List.of(member), pageRequest, 1));
        when(roleService.getRoleById(roleId)).thenReturn(role);

        PageDto<CommunityMemberResponseDto> result = communityMemberService.getMembers("fmi-info", pageRequest);

        assertNotNull(result);
        assertEquals(1, result.totalElements());
        assertEquals("student", result.content().get(0).username());
        assertEquals("COMMUNITY_MEMBER", result.content().get(0).role());
    }

    @Test
    @DisplayName("getMembers throws 404 when community does not exist")
    public void testGetMembers_NotFound() {
        when(communityRepository.existsBySlug("unknown")).thenReturn(false);

        assertThrows(ResponseStatusException.class, () -> communityMemberService.getMembers("unknown", PageRequest.of(0, 20)));
    }

    // =========================================================================
    // joinWithCode
    // =========================================================================

    @Test
    @DisplayName("joinWithCode successfully joins community when code is valid")
    public void testJoinWithCode_Success() {
        UUID userId = UUID.randomUUID();
        UUID commId = UUID.randomUUID();
        UUID codeId = UUID.randomUUID();
        UUID roleId = UUID.randomUUID();

        UserDto userDto = new UserDto(userId, "david@example.com", "david");
        JwtAuthentication auth = new JwtAuthentication(userDto);
        Community community = Community.builder().id(commId).slug("fmi-info").name("FMI Info").build();
        Role memberRole = Role.builder().id(roleId).name(RoleType.COMMUNITY_MEMBER.name()).build();

        CommunityJoinCode joinCode = CommunityJoinCode.builder()
                .id(codeId)
                .code("ABC12345")
                .community(community)
                .maxUses(10)
                .usesCount(0)
                .expiresAt(OffsetDateTime.now().plusDays(1))
                .build();

        when(joinCodeRepository.findByCodeWithCommunity("ABC12345")).thenReturn(Optional.of(joinCode));
        when(communityMemberRepository.existsByCommunityIdAndUserId(commId, userId)).thenReturn(false);
        when(authorizationService.requireAuthentication()).thenReturn(auth);
        when(roleService.getRoleByName(RoleType.COMMUNITY_MEMBER)).thenReturn(memberRole);

        UserEnrolledCommunityDto result = communityMemberService.joinWithCode(userId, "ABC12345");

        assertNotNull(result);
        assertEquals(commId, result.id());
        assertEquals("fmi-info", result.slug());
        assertEquals("COMMUNITY_MEMBER", result.role());

        verify(communityMemberRepository).save(any(CommunityMember.class));
        verify(joinCodeRepository).incrementUsesCount(codeId);
        verify(communityRepository).updateMemberCount(commId, 1);
    }

    // =========================================================================
    // addMemberDirectly
    // =========================================================================

    @Test
    @DisplayName("addMemberDirectly successfully adds member")
    public void testAddMemberDirectly_Success() {
        UUID callerId = UUID.randomUUID();
        UUID commId = UUID.randomUUID();
        UUID targetUserId = UUID.randomUUID();
        UUID roleId = UUID.randomUUID();

        User owner = User.builder().id(callerId).username("owner").build();
        Community community = Community.builder().id(commId).slug("fmi-info").owner(owner).build();
        User targetUser = User.builder().id(targetUserId).username("new_student").build();
        Role memberRole = Role.builder().id(roleId).name(RoleType.COMMUNITY_MEMBER.name()).build();

        AddCommunityMemberRequestDto dto = new AddCommunityMemberRequestDto("new_student", RoleType.COMMUNITY_MEMBER);

        when(communityRepository.findBySlugWithOwner("fmi-info")).thenReturn(Optional.of(community));
        when(userRepository.findByUsername("new_student")).thenReturn(Optional.of(targetUser));
        when(communityMemberRepository.existsByCommunityIdAndUserId(commId, targetUserId)).thenReturn(false);
        when(roleService.getRoleByName(RoleType.COMMUNITY_MEMBER)).thenReturn(memberRole);

        communityMemberService.addMemberDirectly("fmi-info", callerId, dto);

        verify(communityMemberRepository).save(any(CommunityMember.class));
        verify(communityRepository).updateMemberCount(commId, 1);
    }

    // =========================================================================
    // leaveCommunity
    // =========================================================================

    @Test
    @DisplayName("leaveCommunity removes regular member")
    public void testLeaveCommunity_Success() {
        UUID userId = UUID.randomUUID();
        UUID ownerId = UUID.randomUUID();
        UUID commId = UUID.randomUUID();

        User owner = User.builder().id(ownerId).build();
        Community community = Community.builder().id(commId).slug("fmi-info").owner(owner).memberCount(5).build();
        CommunityMember member = CommunityMember.builder().community(community).build();

        when(communityRepository.findBySlugWithOwner("fmi-info")).thenReturn(Optional.of(community));
        when(communityMemberRepository.findByCommunityIdAndUserId(commId, userId)).thenReturn(Optional.of(member));

        communityMemberService.leaveCommunity("fmi-info", userId);

        verify(communityMemberRepository).delete(member);
        verify(communityRepository).updateMemberCount(commId, -1);
    }

    // =========================================================================
    // updateMemberRole
    // =========================================================================

    @Test
    @DisplayName("updateMemberRole updates role of community member")
    public void testUpdateMemberRole_Success() {
        UUID commId = UUID.randomUUID();
        UUID targetUserId = UUID.randomUUID();
        UUID newRoleId = UUID.randomUUID();

        User owner = User.builder().id(UUID.randomUUID()).username("owner").build();
        Community community = Community.builder().id(commId).slug("fmi-info").owner(owner).build();
        User targetUser = User.builder().id(targetUserId).username("student").build();
        Role newRole = Role.builder().id(newRoleId).name(RoleType.COMMUNITY_ADMIN.name()).build();

        CommunityMember member = CommunityMember.builder()
                .community(community)
                .user(targetUser)
                .roleId(UUID.randomUUID())
                .joinedAt(OffsetDateTime.now())
                .build();

        UpdateMemberRoleRequestDto dto = new UpdateMemberRoleRequestDto(RoleType.COMMUNITY_ADMIN);

        when(communityRepository.findBySlugWithOwner("fmi-info")).thenReturn(Optional.of(community));
        when(userRepository.findByUsername("student")).thenReturn(Optional.of(targetUser));
        when(communityMemberRepository.findByCommunityIdAndUserId(commId, targetUserId)).thenReturn(Optional.of(member));
        when(roleService.getRoleByName(RoleType.COMMUNITY_ADMIN)).thenReturn(newRole);
        when(communityMemberRepository.save(member)).thenReturn(member);

        CommunityMemberResponseDto result = communityMemberService.updateMemberRole("fmi-info", "student", dto);

        assertNotNull(result);
        assertEquals("COMMUNITY_ADMIN", result.role());
        assertEquals("student", result.username());
    }

    // =========================================================================
    // removeMember
    // =========================================================================

    @Test
    @DisplayName("removeMember deletes member from community")
    public void testRemoveMember_Success() {
        UUID callerId = UUID.randomUUID();
        UUID commId = UUID.randomUUID();
        UUID targetUserId = UUID.randomUUID();
        UUID targetRoleId = UUID.randomUUID();

        User owner = User.builder().id(callerId).username("owner").build();
        Community community = Community.builder().id(commId).slug("fmi-info").owner(owner).build();
        User targetUser = User.builder().id(targetUserId).username("student").build();
        Role memberRole = Role.builder().id(targetRoleId).name(RoleType.COMMUNITY_MEMBER.name()).build();

        CommunityMember targetMember = CommunityMember.builder()
                .community(community)
                .user(targetUser)
                .roleId(targetRoleId)
                .build();

        when(communityRepository.findBySlugWithOwner("fmi-info")).thenReturn(Optional.of(community));
        when(userRepository.findByUsername("student")).thenReturn(Optional.of(targetUser));
        when(communityMemberRepository.findByCommunityIdAndUserId(commId, targetUserId)).thenReturn(Optional.of(targetMember));
        when(authorizationService.getGlobalRoleName(callerId)).thenReturn("USER");
        when(roleService.getRoleById(targetRoleId)).thenReturn(memberRole);

        communityMemberService.removeMember("fmi-info", callerId, "student");

        verify(communityMemberRepository).delete(targetMember);
        verify(communityRepository).updateMemberCount(commId, -1);
    }
}
