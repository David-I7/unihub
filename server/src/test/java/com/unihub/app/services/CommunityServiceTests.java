package com.unihub.app.services;

import com.unihub.app.dto.PageDto;
import com.unihub.app.dto.community.resources.CommunityResponseDto;
import com.unihub.app.entities.authentication.User;
import com.unihub.app.entities.community.resources.Community;
import com.unihub.app.mappers.GlobalResourceMapper;
import com.unihub.app.mappers.PageMapper;
import com.unihub.app.mappers.community.CommunityResourceMapper;
import com.unihub.app.repositories.community.resources.CommunityRepository;
import com.unihub.app.services.community.resources.CommunityService;
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
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class CommunityServiceTests {

    @Mock
    private CommunityRepository communityRepository;

    @Spy
    private GlobalResourceMapper globalResourceMapper = new GlobalResourceMapper();

    @Spy
    private CommunityResourceMapper communityMapper = new CommunityResourceMapper(new GlobalResourceMapper());

    @Spy
    private PageMapper pageMapper = new PageMapper();

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
        when(communityRepository.findAll(pageRequest))
                .thenReturn(new PageImpl<>(List.of(community), pageRequest, 1));

        PageDto<CommunityResponseDto> result = communityService.findAll(pageRequest);

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

        when(communityRepository.findBySlug("fmi-info-id")).thenReturn(Optional.of(community));

        CommunityResponseDto result = communityService.findBySlug("fmi-info-id");

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

        verify(communityRepository).findBySlug("fmi-info-id");
    }

    @Test
    @DisplayName("findBySlug throws 404 when slug does not exist")
    public void testFindBySlug_NotFound() {
        when(communityRepository.findBySlug("non-existent")).thenReturn(Optional.empty());

        assertThrows(ResponseStatusException.class, () -> communityService.findBySlug("non-existent"));
    }
}
