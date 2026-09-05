package com.unihub.app.services;

import com.unihub.app.domain.Permissions;
import com.unihub.app.domain.RoleType;
import com.unihub.app.dto.PageDto;
import com.unihub.app.dto.UserDto;
import com.unihub.app.dto.community.OwnerDto;
import com.unihub.app.dto.community.resources.request.CreateCommunityRequestDto;
import com.unihub.app.dto.community.resources.request.UpdateCommunityReadmeRequestDto;
import com.unihub.app.dto.community.resources.request.UpdateCommunityRequestDto;
import com.unihub.app.dto.community.resources.response.CommunityHomeResponseDto;
import com.unihub.app.dto.community.resources.response.CommunityReadmeResponseDto;
import com.unihub.app.dto.community.resources.response.CommunityResponseDto;
import com.unihub.app.dto.community.resources.response.StudyYearIdentifiersResponseDto;
import com.unihub.app.dto.community.resources.response.StudyYearMetricsResponseDto;
import com.unihub.app.entities.authentication.User;
import com.unihub.app.entities.authorization.Role;
import com.unihub.app.entities.community.resources.Community;
import com.unihub.app.entities.community.resources.CommunityMember;
import com.unihub.app.entities.community.resources.StudyYearName;
import com.unihub.app.mappers.PageMapper;
import com.unihub.app.mappers.UserMapper;
import com.unihub.app.mappers.community.CommunityResourceMapper;
import com.unihub.app.repositories.authentication.UserRepository;
import com.unihub.app.repositories.community.resources.CommunityMemberRepository;
import com.unihub.app.repositories.community.resources.CommunityRepository;
import com.unihub.app.security.JwtAuthentication;
import com.unihub.app.services.authorization.AuthorizationService;
import com.unihub.app.services.authorization.RoleService;
import com.unihub.app.services.community.resources.CommunityService;
import com.unihub.app.services.community.resources.StudyYearService;
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

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isNull;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class CommunityServiceTests {

    @Mock
    private CommunityRepository communityRepository;

    @Mock
    private CommunityMemberRepository communityMemberRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private RoleService roleService;

    @Mock
    private AuthorizationService authorizationService;

    @Mock
    private StudyYearService studyYearService;

    @Spy
    private CommunityResourceMapper communityMapper = new CommunityResourceMapper();

    @Spy
    private PageMapper pageMapper = new PageMapper();

    @Spy
    private UserMapper userMapper = new UserMapper(roleService);

    @InjectMocks
    private CommunityService communityService;

    @Test
    @DisplayName("findAll returns paginated CommunityResponseDto with non-null fields")
    public void testFindAll() {
        UUID ownerId = UUID.randomUUID();
        User owner = User.builder().id(ownerId).username("david").build();
        UUID communityId = UUID.randomUUID();
        OffsetDateTime createdAt = OffsetDateTime.now();

        CommunityResponseDto expectedDto = CommunityResponseDto.builder()
                .id(communityId)
                .name("FMI - Informatica ID")
                .slug("fmi-info-id")
                .description("Desc")
                .memberCount(10)
                .backgroundColor("#2563eb")
                .verified(true)
                .createdAt(createdAt)
                .owner(new OwnerDto(ownerId, "david", false))
                .isJoined(false)
                .build();

        PageRequest pageRequest = PageRequest.of(0, 10);
        when(communityRepository.findAllWithFilters(isNull(), isNull(), isNull(), eq(pageRequest)))
                .thenReturn(new PageImpl<>(List.of(expectedDto), pageRequest, 1));

        PageDto<CommunityResponseDto> result = communityService.findAll(null, null, null, null, pageRequest);

        assertNotNull(result);
        assertEquals(1, result.totalElements());
        assertEquals(1, result.content().size());

        CommunityResponseDto dto = result.content().get(0);
        assertNotNull(dto.getId());
        assertEquals(communityId, dto.getId());
        assertEquals("FMI - Informatica ID", dto.getName());
        assertEquals("fmi-info-id", dto.getSlug());
        assertEquals("Desc", dto.getDescription());
        assertEquals(10, dto.getMemberCount());
        assertEquals("#2563eb", dto.getBackgroundColor());
        assertTrue(dto.isVerified());
        assertEquals(createdAt, dto.getCreatedAt());
        assertNotNull(dto.getOwner());
        assertEquals(ownerId, dto.getOwner().id());
        assertEquals("david", dto.getOwner().username());
    }

    @Test
    @DisplayName("findBySlug returns community with all non-null fields")
    public void testFindBySlug_Success() {
        UUID communityId = UUID.randomUUID();
        UUID ownerId = UUID.randomUUID();
        User owner = User.builder().id(ownerId).username("david").build();
        OffsetDateTime createdAt = OffsetDateTime.now();

        Community community = Community.builder()
                .id(communityId)
                .name("FMI - Informatica ID")
                .slug("fmi-info-id")
                .description("Desc")
                .memberCount(10)
                .backgroundColor("#2563eb")
                .verified(true)
                .createdAt(createdAt)
                .owner(owner)
                .build();

        when(communityRepository.findBySlugWithOwner("fmi-info-id")).thenReturn(Optional.of(community));

        CommunityResponseDto result = communityService.findBySlug("fmi-info-id", null);

        assertNotNull(result);
        assertEquals(communityId, result.getId());
        assertEquals("FMI - Informatica ID", result.getName());
        assertEquals("fmi-info-id", result.getSlug());
        assertEquals("Desc", result.getDescription());
        assertEquals(10, result.getMemberCount());
        assertEquals("#2563eb", result.getBackgroundColor());
        assertTrue(result.isVerified());
        assertEquals(createdAt, result.getCreatedAt());
        assertNotNull(result.getOwner());
        assertEquals(ownerId, result.getOwner().id());
        assertEquals("david", result.getOwner().username());

        verify(communityRepository).findBySlugWithOwner("fmi-info-id");
    }

    @Test
    @DisplayName("findBySlug throws 404 when slug does not exist")
    public void testFindBySlug_NotFound() {
        when(communityRepository.findBySlugWithOwner("non-existent")).thenReturn(Optional.empty());

        assertThrows(ResponseStatusException.class, () -> communityService.findBySlug("non-existent", null));
    }

    @Test
    @DisplayName("getCommunityHome returns community and its study years")
    public void testGetCommunityHome_Success() {
        UUID communityId = UUID.randomUUID();
        UUID ownerId = UUID.randomUUID();
        User owner = User.builder().id(ownerId).username("david").build();
        OffsetDateTime createdAt = OffsetDateTime.now();

        Community community = Community.builder()
                .id(communityId)
                .name("FMI - Informatica ID")
                .slug("fmi-info-id")
                .description("Desc")
                .memberCount(10)
                .backgroundColor("#2563eb")
                .verified(true)
                .createdAt(createdAt)
                .owner(owner)
                .build();

        List<StudyYearMetricsResponseDto> studyYears = List.of(
                new StudyYearMetricsResponseDto(1, StudyYearName.YEAR_1, createdAt, 6, 0, 30),
                new StudyYearMetricsResponseDto(2, StudyYearName.YEAR_2, createdAt, 6, 0, 30)
        );

        when(communityRepository.findBySlugWithOwner("fmi-info-id")).thenReturn(Optional.of(community));
        when(studyYearService.getCommunityStudyYearMetrics("fmi-info-id")).thenReturn(studyYears);

        CommunityHomeResponseDto result = communityService.getCommunityHome("fmi-info-id", null);

        assertNotNull(result);
        assertEquals("fmi-info-id", result.community().getSlug());
        assertEquals(2, result.studyYears().size());
        assertEquals(1, result.studyYears().get(0).id());

        verify(communityRepository).findBySlugWithOwner("fmi-info-id");
        verify(studyYearService).getCommunityStudyYearMetrics("fmi-info-id");
    }

    @Test
    @DisplayName("getCommunityStudyYears returns study year identifiers")
    public void testGetCommunityStudyYears_Success() {
        List<StudyYearIdentifiersResponseDto> identifiers = List.of(
                new StudyYearIdentifiersResponseDto(1, StudyYearName.YEAR_1),
                new StudyYearIdentifiersResponseDto(2, StudyYearName.YEAR_2)
        );

        when(studyYearService.getCommunityStudyYearIdentifiers("fmi-info-id")).thenReturn(identifiers);

        List<StudyYearIdentifiersResponseDto> result = communityService.getCommunityStudyYears("fmi-info-id");

        assertNotNull(result);
        assertEquals(2, result.size());
        assertEquals(1, result.get(0).id());
    }

    @Test
    @DisplayName("createCommunity successfully creates community and adds owner membership")
    public void testCreateCommunity_Success() {
        UUID userId = UUID.randomUUID();
        UserDto userDto = new UserDto(userId, "david@example.com", "david", false, RoleType.USER);
        CreateCommunityRequestDto dto = new CreateCommunityRequestDto("FMI", "fmi", "Desc", "#fff");

        Role ownerRole = Role.builder().id(UUID.randomUUID()).name(RoleType.COMMUNITY_OWNER.name()).build();

        when(communityRepository.findByNameOrSlug("FMI", "fmi")).thenReturn(List.of());
        when(communityRepository.save(any(Community.class))).thenAnswer(i -> {
            Community c = i.getArgument(0);
            c.setId(UUID.randomUUID());
            return c;
        });
        when(roleService.getRoleByName(RoleType.COMMUNITY_OWNER)).thenReturn(ownerRole);

        CommunityResponseDto result = communityService.createCommunity(userDto, dto);

        assertNotNull(result);
        assertEquals("FMI", result.getName());
        assertEquals("fmi", result.getSlug());
        verify(communityRepository).save(any(Community.class));
        verify(communityMemberRepository).save(any(CommunityMember.class));
    }

    @Test
    @DisplayName("deleteCommunity deletes community when found")
    public void testDeleteCommunity_Success() {
        UUID userId = UUID.randomUUID();
        Community community = Community.builder().id(UUID.randomUUID()).slug("fmi").build();

        when(communityRepository.findBySlugWithOwner("fmi")).thenReturn(Optional.of(community));

        communityService.deleteCommunity("fmi", userId);

        verify(communityRepository).delete(community);
    }

    @Test
    @DisplayName("getCommunityReadme returns readme response dto when community exists")
    public void testGetCommunityReadme_Success() {
        Community community = Community.builder().id(UUID.randomUUID()).slug("fmi").readme("# Welcome").build();

        when(communityRepository.findBySlug("fmi")).thenReturn(Optional.of(community));

        CommunityReadmeResponseDto result = communityService.getCommunityReadme("fmi");

        assertNotNull(result);
        assertEquals("# Welcome", result.readme());
        verify(communityRepository).findBySlug("fmi");
    }

    @Test
    @DisplayName("getCommunityReadme throws 404 when community does not exist")
    public void testGetCommunityReadme_NotFound() {
        when(communityRepository.findBySlug("unknown")).thenReturn(Optional.empty());

        assertThrows(ResponseStatusException.class, () -> communityService.getCommunityReadme("unknown"));
    }

    @Test
    @DisplayName("updateCommunityReadme updates readme when community exists")
    public void testUpdateCommunityReadme_Success() {
        UUID userId = UUID.randomUUID();
        Community community = Community.builder().id(UUID.randomUUID()).slug("fmi").readme("# Old").build();
        UpdateCommunityReadmeRequestDto dto = new UpdateCommunityReadmeRequestDto("# New");

        when(communityRepository.findBySlug("fmi")).thenReturn(Optional.of(community));
        when(communityRepository.save(any(Community.class))).thenAnswer(i -> i.getArgument(0));

        CommunityReadmeResponseDto result = communityService.updateCommunityReadme("fmi", userId, dto);

        assertNotNull(result);
        assertEquals("# New", result.readme());
        verify(communityRepository).save(community);
    }

    @Test
    @DisplayName("updateCommunityReadme throws 404 when community does not exist")
    public void testUpdateCommunityReadme_NotFound() {
        UUID userId = UUID.randomUUID();
        UpdateCommunityReadmeRequestDto dto = new UpdateCommunityReadmeRequestDto("# New");

        when(communityRepository.findBySlug("unknown")).thenReturn(Optional.empty());

        assertThrows(ResponseStatusException.class, () ->
                communityService.updateCommunityReadme("unknown", userId, dto));
    }
}
