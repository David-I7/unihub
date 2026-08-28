package com.unihub.app.controllers;

import com.unihub.app.domain.RoleType;
import com.unihub.app.dto.PageDto;
import com.unihub.app.dto.UserDto;
import com.unihub.app.dto.community.resources.request.AddCommunityMemberRequestDto;
import com.unihub.app.dto.community.resources.request.CreateJoinCodeRequestDto;
import com.unihub.app.dto.community.resources.request.UpdateMemberRoleRequestDto;
import com.unihub.app.dto.community.resources.response.CommunityJoinCodeResponseDto;
import com.unihub.app.dto.community.resources.response.CommunityMemberResponseDto;
import com.unihub.app.repositories.authentication.SessionRepository;
import com.unihub.app.repositories.authentication.UserIdentityRepository;
import com.unihub.app.repositories.authentication.UserRepository;
import com.unihub.app.repositories.authorization.PermissionRepository;
import com.unihub.app.repositories.authorization.RoleRepository;
import com.unihub.app.repositories.community.resources.CommunityMemberRepository;
import com.unihub.app.security.JwtAuthentication;
import com.unihub.app.services.authorization.AuthorizationService;
import com.unihub.app.services.community.resources.CommunityJoinCodeService;
import com.unihub.app.services.community.resources.CommunityMemberService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import tools.jackson.databind.ObjectMapper;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.unihub.app.BaseIntegrationTest;

@AutoConfigureMockMvc
public class CommunityMemberControllerTests extends BaseIntegrationTest {

    private static final String BASE_URL = "/api/v1/communities/fmi-info";

    @Autowired
    private MockMvc mockMvc;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @MockitoBean
    private CommunityMemberService communityMemberService;

    @MockitoBean
    private CommunityJoinCodeService communityJoinCodeService;

    @MockitoBean
    private AuthorizationService authorizationService;

    private UUID userId;
    private UserDto userDto;

    @BeforeEach
    public void setUp() {
        userId = UUID.randomUUID();
        userDto = new UserDto(userId, "david@example.com", "david");
        JwtAuthentication auth = new JwtAuthentication(userDto);
        SecurityContextHolder.getContext().setAuthentication(auth);
        when(authorizationService.requireAuthentication()).thenReturn(auth);
        when(authorizationService.safeRequireAuthentication()).thenReturn(auth);
        when(authorizationService.hasGlobalPermission(eq(userId), any())).thenReturn(true);
        when(authorizationService.hasCommunityPermission(any(), eq(userId), any())).thenReturn(true);
    }

    // =========================================================================
    // GET /members
    // =========================================================================

    @Test
    @DisplayName("GET /members returns paginated member list")
    public void testGetMembers_Success() throws Exception {
        UUID memberUserId = UUID.randomUUID();
        OffsetDateTime joinedAt = OffsetDateTime.now();

        CommunityMemberResponseDto memberDto = CommunityMemberResponseDto.builder()
                .userId(memberUserId)
                .username("student_1")
                .role("COMMUNITY_MEMBER")
                .joinedAt(joinedAt)
                .build();

        PageDto<CommunityMemberResponseDto> pageDto = PageDto.<CommunityMemberResponseDto>builder()
                .content(List.of(memberDto))
                .number(0)
                .size(20)
                .totalElements(1)
                .totalPages(1)
                .first(true)
                .last(true)
                .build();

        when(communityMemberService.getMembers(eq("fmi-info"), any(Pageable.class))).thenReturn(pageDto);

        mockMvc.perform(get(BASE_URL + "/members")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray())
                .andExpect(jsonPath("$.content[0].username").value("student_1"))
                .andExpect(jsonPath("$.content[0].role").value("COMMUNITY_MEMBER"))
                .andExpect(jsonPath("$.totalElements").value(1));
    }

    // =========================================================================
    // POST /members
    // =========================================================================

    @Test
    @DisplayName("POST /members adds member directly")
    public void testAddMember_Success() throws Exception {
        AddCommunityMemberRequestDto requestDto = new AddCommunityMemberRequestDto("new_student", RoleType.COMMUNITY_MEMBER);

        doNothing().when(communityMemberService).addMemberDirectly(eq("fmi-info"), eq(userId), any(AddCommunityMemberRequestDto.class));

        mockMvc.perform(post(BASE_URL + "/members")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestDto)))
                .andExpect(status().isOk());

        verify(communityMemberService).addMemberDirectly(eq("fmi-info"), eq(userId), any(AddCommunityMemberRequestDto.class));
    }

    // =========================================================================
    // DELETE /leave
    // =========================================================================

    @Test
    @DisplayName("DELETE /leave allows authenticated user to leave community")
    public void testLeaveCommunity_Success() throws Exception {
        doNothing().when(communityMemberService).leaveCommunity("fmi-info", userId);

        mockMvc.perform(delete(BASE_URL + "/leave")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNoContent());

        verify(communityMemberService).leaveCommunity("fmi-info", userId);
    }

    // =========================================================================
    // PATCH /members/{username}/role
    // =========================================================================

    @Test
    @DisplayName("PATCH /members/{username}/role updates member role")
    public void testUpdateMemberRole_Success() throws Exception {
        UpdateMemberRoleRequestDto requestDto = new UpdateMemberRoleRequestDto(RoleType.COMMUNITY_ADMIN);

        CommunityMemberResponseDto responseDto = CommunityMemberResponseDto.builder()
                .userId(UUID.randomUUID())
                .username("student_1")
                .role(RoleType.COMMUNITY_ADMIN.name())
                .joinedAt(OffsetDateTime.now())
                .build();

        when(communityMemberService.updateMemberRole(eq("fmi-info"), eq("student_1"), any(UpdateMemberRoleRequestDto.class)))
                .thenReturn(responseDto);

        mockMvc.perform(patch(BASE_URL + "/members/student_1/role")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestDto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value("student_1"))
                .andExpect(jsonPath("$.role").value("COMMUNITY_ADMIN"));
    }

    // =========================================================================
    // DELETE /members/{username}
    // =========================================================================

    @Test
    @DisplayName("DELETE /members/{username} removes member from community")
    public void testRemoveMember_Success() throws Exception {
        doNothing().when(communityMemberService).removeMember("fmi-info", userId, "student_1");

        mockMvc.perform(delete(BASE_URL + "/members/student_1")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNoContent());

        verify(communityMemberService).removeMember("fmi-info", userId, "student_1");
    }

    // =========================================================================
    // POST /join-codes
    // =========================================================================

    @Test
    @DisplayName("POST /join-codes creates join code")
    public void testCreateJoinCode_Success() throws Exception {
        CreateJoinCodeRequestDto requestDto = new CreateJoinCodeRequestDto(10, 24);

        UUID codeId = UUID.randomUUID();
        CommunityJoinCodeResponseDto responseDto = CommunityJoinCodeResponseDto.builder()
                .id(codeId)
                .code("ABC12345")
                .maxUses(10)
                .usesCount(0)
                .expiresAt(OffsetDateTime.now().plusHours(24))
                .createdAt(OffsetDateTime.now())
                .build();

        when(communityJoinCodeService.createJoinCode(eq("fmi-info"), eq(userId), any(CreateJoinCodeRequestDto.class)))
                .thenReturn(responseDto);

        mockMvc.perform(post(BASE_URL + "/join-codes")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestDto)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(codeId.toString()))
                .andExpect(jsonPath("$.code").value("ABC12345"))
                .andExpect(jsonPath("$.maxUses").value(10));
    }

    // =========================================================================
    // GET /join-codes
    // =========================================================================

    @Test
    @DisplayName("GET /join-codes returns list of join codes")
    public void testGetJoinCodes_Success() throws Exception {
        UUID codeId = UUID.randomUUID();
        CommunityJoinCodeResponseDto responseDto = CommunityJoinCodeResponseDto.builder()
                .id(codeId)
                .code("ABC12345")
                .maxUses(10)
                .usesCount(0)
                .expiresAt(OffsetDateTime.now().plusHours(24))
                .createdAt(OffsetDateTime.now())
                .build();

        when(communityJoinCodeService.getJoinCodes("fmi-info")).thenReturn(List.of(responseDto));

        mockMvc.perform(get(BASE_URL + "/join-codes")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].id").value(codeId.toString()))
                .andExpect(jsonPath("$[0].code").value("ABC12345"));
    }

    // =========================================================================
    // DELETE /join-codes/{codeId}
    // =========================================================================

    @Test
    @DisplayName("DELETE /join-codes/{codeId} deletes join code")
    public void testDeleteJoinCode_Success() throws Exception {
        UUID codeId = UUID.randomUUID();

        doNothing().when(communityJoinCodeService).deleteJoinCode("fmi-info", codeId);

        mockMvc.perform(delete(BASE_URL + "/join-codes/" + codeId)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNoContent());

        verify(communityJoinCodeService).deleteJoinCode("fmi-info", codeId);
    }
}
