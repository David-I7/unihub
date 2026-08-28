package com.unihub.app.services;

import com.unihub.app.dto.UserDto;
import com.unihub.app.dto.community.resources.request.CreateJoinCodeRequestDto;
import com.unihub.app.dto.community.resources.response.CommunityJoinCodeResponseDto;
import com.unihub.app.entities.authentication.User;
import com.unihub.app.entities.community.resources.Community;
import com.unihub.app.entities.community.resources.CommunityJoinCode;
import com.unihub.app.mappers.GlobalResourceMapper;
import com.unihub.app.mappers.UserMapper;
import com.unihub.app.mappers.community.CommunityResourceMapper;
import com.unihub.app.repositories.community.resources.CommunityJoinCodeRepository;
import com.unihub.app.repositories.community.resources.CommunityRepository;
import com.unihub.app.security.JwtAuthentication;
import com.unihub.app.services.authorization.AuthorizationService;
import com.unihub.app.services.authorization.RoleService;
import com.unihub.app.services.community.resources.CommunityJoinCodeService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
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
    private RoleService roleService;

    @Mock
    private AuthorizationService authorizationService;

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
                userMapper,
                communityMapper,
                authorizationService
        );
    }

    @Test
    @DisplayName("createJoinCode successfully creates and returns join code")
    public void testCreateJoinCode_Success() {
        UUID callerId = UUID.randomUUID();
        UserDto userDto = new UserDto(callerId, "david@example.com", "david");
        JwtAuthentication auth = new JwtAuthentication(userDto);
        Community community = Community.builder().id(UUID.randomUUID()).slug("fmi-info").build();

        CreateJoinCodeRequestDto dto = new CreateJoinCodeRequestDto(10, 24);

        when(communityRepository.findBySlug("fmi-info")).thenReturn(Optional.of(community));
        when(authorizationService.requireAuthentication()).thenReturn(auth);
        when(joinCodeRepository.existsByCode(anyString())).thenReturn(false);
        when(joinCodeRepository.save(any(CommunityJoinCode.class))).thenAnswer(invocation -> {
            CommunityJoinCode code = invocation.getArgument(0);
            code.setId(UUID.randomUUID());
            return code;
        });

        CommunityJoinCodeResponseDto result = communityJoinCodeService.createJoinCode("fmi-info", callerId, dto);

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
        when(joinCodeRepository.findByCommunitySlug("fmi-info")).thenReturn(List.of(code));

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
}
