package com.unihub.app.services;

import com.unihub.app.domain.Permissions;
import com.unihub.app.domain.RoleType;
import com.unihub.app.dto.PageDto;
import com.unihub.app.dto.UserDto;
import com.unihub.app.dto.community.resources.request.CreateCommunityRequestDto;
import com.unihub.app.dto.community.resources.request.UpdateCommunityRequestDto;
import com.unihub.app.dto.community.resources.response.CommunityHomeResponseDto;
import com.unihub.app.dto.community.resources.response.CommunityResponseDto;
import com.unihub.app.dto.community.resources.response.StudyYearIdentifiersResponseDto;
import com.unihub.app.dto.community.resources.response.StudyYearMetricsResponseDto;
import com.unihub.app.entities.authentication.User;
import com.unihub.app.entities.authorization.Role;
import com.unihub.app.entities.community.resources.Community;
import com.unihub.app.entities.community.resources.CommunityMember;
import com.unihub.app.entities.community.resources.StudyYearName;
import com.unihub.app.mappers.GlobalResourceMapper;
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
    private GlobalResourceMapper globalResourceMapper = new GlobalResourceMapper();

    @Spy
    private CommunityResourceMapper communityMapper = new CommunityResourceMapper(new GlobalResourceMapper());

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

        PageRequest pageRequest = PageRequest.of(0, 10);
        when(communityRepository.findAllWithFilters(isNull(), isNull(), isNull(), eq(pageRequest)))
                .thenReturn(new PageImpl<>(List.of(community), pageRequest, 1));

        PageDto<CommunityResponseDto> result = communityService.findAll(null, null, null, null, pageRequest);

        assertNotNull(result);
        assertEquals(1, result.totalElements());
        assertEquals(1, result.content().size());

        CommunityResponseDto dto = result.content().get(0);
        assertNotNull(dto.id());
        assertEquals(communityId, dto.id());
        assertEquals("FMI - Informatica ID", dto.name());
        assertEquals("fmi-info-id", dto.slug());
        assertEquals("Desc", dto.description());
        assertEquals(10, dto.memberCount());
        assertEquals("#2563eb", dto.backgroundColor());
        assertTrue(dto.verified());
        assertEquals(createdAt, dto.createdAt());
        assertNotNull(dto.owner());
        assertEquals(ownerId, dto.owner().id());
        assertEquals("david", dto.owner().username());
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
        assertEquals(communityId, result.id());
        assertEquals("FMI - Informatica ID", result.name());
        assertEquals("fmi-info-id", result.slug());
        assertEquals("Desc", result.description());
        assertEquals(10, result.memberCount());
        assertEquals("#2563eb", result.backgroundColor());
        assertTrue(result.verified());
        assertEquals(createdAt, result.createdAt());
        assertNotNull(result.owner());
        assertEquals(ownerId, result.owner().id());
        assertEquals("david", result.owner().username());

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
        assertEquals("fmi-info-id", result.community().slug());
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
        assertEquals("FMI", result.name());
        assertEquals("fmi", result.slug());
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
}
