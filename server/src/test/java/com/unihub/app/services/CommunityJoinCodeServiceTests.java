package com.unihub.app.services;

import com.unihub.app.domain.RoleType;
import com.unihub.app.dto.UserDto;
import com.unihub.app.dto.community.resources.request.CreateJoinCodeRequestDto;
import com.unihub.app.dto.community.resources.request.UpdateJoinCodeRequestDto;
import com.unihub.app.dto.community.resources.response.CommunityJoinCodeResponseDto;
import com.unihub.app.entities.community.resources.Community;
import com.unihub.app.entities.community.resources.CommunityJoinCode;
import com.unihub.app.mappers.GlobalResourceMapper;
import com.unihub.app.mappers.UserMapper;
import com.unihub.app.mappers.community.CommunityResourceMapper;
import com.unihub.app.repositories.community.resources.CommunityJoinCodeRepository;
import com.unihub.app.repositories.community.resources.CommunityMemberRepository;
import com.unihub.app.repositories.community.resources.CommunityRepository;
import com.unihub.app.services.authorization.RoleService;
import com.unihub.app.services.community.resources.CommunityJoinCodeService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class CommunityJoinCodeServiceTests {

    @Mock
    private CommunityJoinCodeRepository joinCodeRepository;

    @Mock
    private CommunityRepository communityRepository;

    @Mock
    private CommunityMemberRepository communityMemberRepository;

    @Mock
    private RoleService roleService;

    private GlobalResourceMapper globalResourceMapper;
    private CommunityResourceMapper communityMapper;
    private UserMapper userMapper;
    private CommunityJoinCodeService communityJoinCodeService;

    @org.junit.jupiter.api.BeforeEach
    public void setUp() {
        globalResourceMapper = new GlobalResourceMapper();
        communityMapper = new CommunityResourceMapper(globalResourceMapper);
        userMapper = new UserMapper(roleService);
        communityJoinCodeService = new CommunityJoinCodeService(
                joinCodeRepository,
                communityRepository,
                communityMemberRepository,
                userMapper,
                communityMapper
        );
    }

    @Test
    @DisplayName("createJoinCode successfully creates and returns join code")
    public void testCreateJoinCode_Success() {
        UUID callerId = UUID.randomUUID();
        UserDto userDto = new UserDto(callerId, "david@example.com", "david", false, RoleType.USER);
        Community community = Community.builder().id(UUID.randomUUID()).slug("fmi-info").build();

        CreateJoinCodeRequestDto dto = new CreateJoinCodeRequestDto(10, 24);

        when(communityRepository.findBySlug("fmi-info")).thenReturn(Optional.of(community));
        when(joinCodeRepository.existsByCode(anyString())).thenReturn(false);
        when(joinCodeRepository.save(any(CommunityJoinCode.class))).thenAnswer(invocation -> {
            CommunityJoinCode code = invocation.getArgument(0);
            code.setId(UUID.randomUUID());
            return code;
        });

        CommunityJoinCodeResponseDto result = communityJoinCodeService.createJoinCode("fmi-info", userDto, dto);

        assertNotNull(result);
        assertNotNull(result.id());
        assertNotNull(result.code());
        assertEquals(8, result.code().length());
        assertEquals(10, result.maxUses());
        assertEquals(0, result.usesCount());
        verify(joinCodeRepository).save(any(CommunityJoinCode.class));
    }

    @Test
    @DisplayName("getJoinCodes returns list of join codes for community")
    public void testGetJoinCodes_Success() {
        UUID codeId = UUID.randomUUID();
        OffsetDateTime now = OffsetDateTime.now();
        Community community = Community.builder().id(UUID.randomUUID()).slug("fmi-info").build();
        CommunityJoinCode code = CommunityJoinCode.builder()
                .id(codeId)
                .code("ABC12345")
                .community(community)
                .maxUses(10)
                .usesCount(2)
                .expiresAt(now.plusDays(1))
                .createdAt(now)
                .build();

        when(communityRepository.existsBySlug("fmi-info")).thenReturn(true);
        when(joinCodeRepository.findByCommunitySlugWithCommunity("fmi-info")).thenReturn(List.of(code));

        List<CommunityJoinCodeResponseDto> result = communityJoinCodeService.getJoinCodes("fmi-info");

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(codeId, result.get(0).id());
        assertEquals("ABC12345", result.get(0).code());
        assertEquals(10, result.get(0).maxUses());
        assertEquals(2, result.get(0).usesCount());
    }

    @Test
    @DisplayName("getJoinCodes throws 404 when community does not exist")
    public void testGetJoinCodes_CommunityNotFound() {
        when(communityRepository.existsBySlug("unknown")).thenReturn(false);

        assertThrows(ResponseStatusException.class, () -> communityJoinCodeService.getJoinCodes("unknown"));
    }

    @Test
    @DisplayName("deleteJoinCode deletes join code when belonging to community")
    public void testDeleteJoinCode_Success() {
        UUID codeId = UUID.randomUUID();
        Community community = Community.builder().slug("fmi-info").build();
        CommunityJoinCode code = CommunityJoinCode.builder().id(codeId).community(community).build();

        when(joinCodeRepository.findById(codeId)).thenReturn(Optional.of(code));

        communityJoinCodeService.deleteJoinCode("fmi-info", codeId);

        verify(joinCodeRepository).delete(code);
    }

    @Test
    @DisplayName("updateJoinCode updates maxUses and validForHours successfully")
    public void testUpdateJoinCode_Success() {
        UUID codeId = UUID.randomUUID();
        OffsetDateTime now = OffsetDateTime.now();
        Community community = Community.builder().slug("fmi-info").build();
        CommunityJoinCode code = CommunityJoinCode.builder()
                .id(codeId)
                .code("ABC12345")
                .community(community)
                .maxUses(10)
                .usesCount(0)
                .expiresAt(now.plusHours(24))
                .createdAt(now)
                .build();

        UpdateJoinCodeRequestDto dto = new UpdateJoinCodeRequestDto(50, 72);

        when(joinCodeRepository.findById(codeId)).thenReturn(Optional.of(code));
        when(joinCodeRepository.save(any(CommunityJoinCode.class))).thenAnswer(i -> i.getArgument(0));

        CommunityJoinCodeResponseDto result = communityJoinCodeService.updateJoinCode("fmi-info", codeId, dto);

        assertNotNull(result);
        assertEquals(50, result.maxUses());
        assertNotNull(result.expiresAt());
        verify(joinCodeRepository).save(code);
    }

    @Test
    @DisplayName("updateJoinCode sets unlimited semantics with -1 for maxUses and validForHours")
    public void testUpdateJoinCode_UnlimitedSemantics() {
        UUID codeId = UUID.randomUUID();
        OffsetDateTime now = OffsetDateTime.now();
        Community community = Community.builder().slug("fmi-info").build();
        CommunityJoinCode code = CommunityJoinCode.builder()
                .id(codeId)
                .code("ABC12345")
                .community(community)
                .maxUses(10)
                .usesCount(0)
                .expiresAt(now.plusHours(24))
                .createdAt(now)
                .build();

        UpdateJoinCodeRequestDto dto = new UpdateJoinCodeRequestDto(-1, -1);

        when(joinCodeRepository.findById(codeId)).thenReturn(Optional.of(code));
        when(joinCodeRepository.save(any(CommunityJoinCode.class))).thenAnswer(i -> i.getArgument(0));

        CommunityJoinCodeResponseDto result = communityJoinCodeService.updateJoinCode("fmi-info", codeId, dto);

        assertNotNull(result);
        assertNull(result.maxUses());
        assertNull(result.expiresAt());
        verify(joinCodeRepository).save(code);
    }

    @Test
    @DisplayName("updateJoinCode throws 404 when join code belongs to different community")
    public void testUpdateJoinCode_WrongCommunity() {
        UUID codeId = UUID.randomUUID();
        Community otherCommunity = Community.builder().slug("other-community").build();
        CommunityJoinCode code = CommunityJoinCode.builder()
                .id(codeId)
                .code("ABC12345")
                .community(otherCommunity)
                .build();

        UpdateJoinCodeRequestDto dto = new UpdateJoinCodeRequestDto(20, 24);

        when(joinCodeRepository.findById(codeId)).thenReturn(Optional.of(code));

        assertThrows(ResponseStatusException.class, () -> communityJoinCodeService.updateJoinCode("fmi-info", codeId, dto));
    }
}
