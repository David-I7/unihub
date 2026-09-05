package com.unihub.app.services.community.resources;

import com.unihub.app.domain.PermissionType;
import com.unihub.app.domain.RoleType;
import com.unihub.app.dto.PageDto;
import com.unihub.app.dto.UserDto;
import com.unihub.app.dto.community.resources.request.CreateCommunityRequestDto;
import com.unihub.app.dto.community.resources.request.UpdateCommunityReadmeRequestDto;
import com.unihub.app.dto.community.resources.request.UpdateCommunityRequestDto;
import com.unihub.app.dto.community.resources.response.CallerMembershipDto;
import com.unihub.app.dto.community.resources.response.CommunityHomeResponseDto;
import com.unihub.app.dto.community.resources.response.CommunityReadmeResponseDto;
import com.unihub.app.dto.community.resources.response.CommunityResponseDto;
import com.unihub.app.dto.community.resources.response.StudyYearIdentifiersResponseDto;
import com.unihub.app.dto.community.resources.response.StudyYearMetricsResponseDto;
import com.unihub.app.entities.authentication.User;
import com.unihub.app.entities.authorization.Role;
import com.unihub.app.entities.community.resources.Community;
import com.unihub.app.entities.community.resources.CommunityMember;
import com.unihub.app.mappers.PageMapper;
import com.unihub.app.mappers.UserMapper;
import com.unihub.app.mappers.community.CommunityResourceMapper;
import com.unihub.app.repositories.authentication.UserRepository;
import com.unihub.app.repositories.community.resources.CommunityMemberRepository;
import com.unihub.app.repositories.community.resources.CommunityRepository;
import com.unihub.app.services.authorization.AuthorizationService;
import com.unihub.app.services.authorization.RoleService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.OffsetDateTime;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CommunityService {

    private final CommunityRepository communityRepository;
    private final CommunityMemberRepository communityMemberRepository;
    private final UserRepository userRepository;
    private final RoleService roleService;
    private final UserMapper userMapper;
    private final AuthorizationService authorizationService;
    private final CommunityResourceMapper communityMapper;
    private final PageMapper pageMapper;
    private final StudyYearService studyYearService;

    @Transactional(readOnly = true)
    public PageDto<CommunityResponseDto> findAll(
            UserDto caller,
            String search,
            Boolean verified,
            Boolean joined,
            Pageable pageable
    ) {
        String normalizedSearch = (search != null && !search.isBlank()) ? search.trim() : null;
        UUID joinedUserId = null;

        if (Boolean.TRUE.equals(joined)) {
            if (caller == null) {
                throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authentication required to filter by joined communities");
            }
            joinedUserId = caller.id();

            Page<CommunityResponseDto> page = communityRepository.findAllWithFilters(normalizedSearch, verified, joinedUserId, pageable);

            return pageMapper.toPageDto(page);
        }

        Page<CommunityResponseDto> page = communityRepository.findAllWithFilters(normalizedSearch, verified, joinedUserId, pageable);

        if (page.isEmpty()) {
            return pageMapper.toPageDto(page);
        }

        Set<UUID> enrolledIds = Collections.emptySet();
        if (caller != null) {
            List<UUID> pageIds = page.getContent().stream().map(CommunityResponseDto::getId).toList();
            enrolledIds = new HashSet<>(communityMemberRepository.findEnrolledCommunityIdsByUserIdAndCommunityIdIn(caller.id(), pageIds));
        }

        final Set<UUID> finalEnrolledIds = enrolledIds;
        List<CommunityResponseDto> dtos = page.getContent().stream()
                .map(community -> {
                    boolean isEnrolled = finalEnrolledIds.contains(community.getId());
                    community.setJoined(isEnrolled);
                    return community;
                })
                .toList();

        Page<CommunityResponseDto> dtoPage = new PageImpl<>(dtos, pageable, page.getTotalElements());
        return pageMapper.toPageDto(dtoPage);
    }

    @Transactional(readOnly = true)
    public CommunityResponseDto findBySlug(String slug, UserDto caller) {
        Community community = communityRepository.findBySlugWithOwner(slug)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Community not found"));
        boolean isJoined = (caller != null) && communityMemberRepository.existsByCommunityIdAndUserId(community.getId(), caller.id());
        return communityMapper.toCommunityResponseDto(community, isJoined);
    }

    @Transactional(readOnly = true)
    public CallerMembershipDto getCallerMembership(String communitySlug, UserDto caller) {
        if (caller == null) {
            return CallerMembershipDto.builder()
                    .isMember(false)
                    .role(null)
                    .permissions(Collections.emptyList())
                    .build();
        }

        return communityMemberRepository.findMemberByCommunitySlug(communitySlug, caller.id())
                .map(member -> {
                    Role role = roleService.getRoleById(member.getRoleId());
                    RoleType roleType = RoleType.valueOf(role.getName());
                    List<String> permissions = roleService.getPermissionNamesByRoleType(roleType);

                    return CallerMembershipDto.builder()
                            .isMember(true)
                            .role(role.getName())
                            .permissions(permissions)
                            .build();
                })
                .orElseGet(() -> CallerMembershipDto.builder()
                        .isMember(false)
                        .role(null)
                        .permissions(Collections.emptyList())
                        .build());
    }

    @Transactional(readOnly = true)
    public CommunityHomeResponseDto getCommunityHome(String communitySlug, UserDto caller) {
        CommunityResponseDto community = findBySlug(communitySlug, caller);
        List<StudyYearMetricsResponseDto> studyYears = studyYearService.getCommunityStudyYearMetrics(communitySlug);
        CallerMembershipDto callerMembership = getCallerMembership(communitySlug, caller);

        return communityMapper.toCommunityHomeResponseDto(community, studyYears, callerMembership);
    }

    @Transactional(readOnly = true)
    public List<StudyYearIdentifiersResponseDto> getCommunityStudyYears(String communitySlug) {
        return studyYearService.getCommunityStudyYearIdentifiers(communitySlug);
    }

    @Transactional
    public CommunityResponseDto createCommunity(UserDto user, CreateCommunityRequestDto dto) {
        List<Community> existingCommunities = communityRepository.findByNameOrSlug(dto.name(), dto.slug());

        if (existingCommunities.size() == 2) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Communities with this name and slug already exists");
        }
        else if (existingCommunities.size() == 1) {
            Community existingCommunity = existingCommunities.get(0);
            if (existingCommunity.getName().equals(dto.name()) && existingCommunity.getSlug().equals(dto.slug())) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "A community with this name and slug already exists");
            } else if (existingCommunity.getName().equals(dto.name())) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "A community with this name already exists");
            } else if (existingCommunity.getSlug().equals(dto.slug())) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "A community with this slug already exists");
            }
        }

        User owner = userMapper.toEntity(user);
        boolean verified = user.role() == RoleType.ROOT || user.role() == RoleType.ADMIN;
        OffsetDateTime now = OffsetDateTime.now();
        Community community = communityMapper.toCommunityEntity(dto, owner, verified, now);

        Community savedCommunity = communityRepository.save(community);

        Role ownerRole = roleService.getRoleByName(RoleType.COMMUNITY_OWNER);
        CommunityMember member = communityMapper.toCommunityMemberEntity(savedCommunity, owner, ownerRole.getId(), now);

        communityMemberRepository.save(member);

        return communityMapper.toCommunityResponseDto(savedCommunity, true);
    }

    @Transactional
    public CommunityResponseDto updateCommunity(String slug, UUID userId, UpdateCommunityRequestDto dto) {
        if (dto.name().isUndefined() && dto.slug().isUndefined() && dto.description().isUndefined() && dto.readme().isUndefined() && dto.backgroundColor().isUndefined() && dto.verified().isUndefined() && dto.newOwnerUsername().isUndefined()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "At least one field must be provided for update");
        }

        Community community = communityRepository.findBySlugWithOwner(slug)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Community not found"));

        dto.description().ifPresent(community::setDescription);
        dto.readme().ifPresent(community::setReadme);
        dto.backgroundColor().ifPresent(community::setBackgroundColor);

        if (dto.slug().isPresent()) {
            String newSlug = dto.slug().get();
            if (newSlug != null && !newSlug.equals(community.getSlug())) {
                if (communityRepository.existsBySlug(newSlug)) {
                    throw new ResponseStatusException(HttpStatus.CONFLICT, "A community with this slug already exists");
                }
                community.setSlug(newSlug);
            }
        }

        if (dto.name().isPresent()) {
            String newName = dto.name().get();
            if (newName != null && !newName.equals(community.getName())) {
                if (communityRepository.existsByName(newName)) {
                    throw new ResponseStatusException(HttpStatus.CONFLICT, "A community with this name already exists");
                }
                community.setName(newName);
            }
        }

        if (dto.verified().isPresent()) {
            if (authorizationService.hasGlobalPermission(PermissionType.VERIFY_COMMUNITY)) {
                community.setVerified(dto.verified().get());
            } else {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only platform administrators can verify communities");
            }
        }

        if (dto.newOwnerUsername().isPresent() && dto.newOwnerUsername().get() != null && !dto.newOwnerUsername().get().equals(community.getOwner().getUsername())) {
            User newOwner = userRepository.findByUsername(dto.newOwnerUsername().get())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "New owner user not found"));

            Role ownerRole = roleService.getRoleByName(RoleType.COMMUNITY_OWNER);
            Role adminRole = roleService.getRoleByName(RoleType.COMMUNITY_ADMIN);

            // Update old owner membership to COMMUNITY_ADMIN
            communityMemberRepository.findByCommunityIdAndUserId(community.getId(), community.getOwner().getId())
                    .ifPresent(oldOwnerMember -> {
                        oldOwnerMember.setRoleId(adminRole.getId());
                        communityMemberRepository.save(oldOwnerMember);
                    });

            // Update or add new owner membership as COMMUNITY_OWNER
            Optional<CommunityMember> newOwnerMemberOpt = communityMemberRepository.findByCommunityIdAndUserId(community.getId(), newOwner.getId());
            if (newOwnerMemberOpt.isPresent()) {
                CommunityMember newOwnerMember = newOwnerMemberOpt.get();
                newOwnerMember.setRoleId(ownerRole.getId());
                communityMemberRepository.save(newOwnerMember);
            } else {
                CommunityMember newMember = communityMapper.toCommunityMemberEntity(
                        community,
                        newOwner,
                        ownerRole.getId(),
                        OffsetDateTime.now()
                );
                communityMemberRepository.save(newMember);
                community.setMemberCount(community.getMemberCount() + 1);
            }

            community.setOwner(newOwner);
        }

        Community saved = communityRepository.save(community);
        return communityMapper.toCommunityResponseDto(saved, true);
    }

    @Transactional(readOnly = true)
    public CommunityReadmeResponseDto getCommunityReadme(String communitySlug) {
        Community community = communityRepository.findBySlug(communitySlug)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Community not found"));
        return communityMapper.toCommunityReadmeResponseDto(community.getReadme());
    }

    @Transactional
    public CommunityReadmeResponseDto updateCommunityReadme(String communitySlug, UUID callerUserId, UpdateCommunityReadmeRequestDto dto) {
        Community community = communityRepository.findBySlug(communitySlug)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Community not found"));
        community.setReadme(dto.readme());
        Community saved = communityRepository.save(community);
        return communityMapper.toCommunityReadmeResponseDto(saved.getReadme());
    }

    @Transactional
    public void deleteCommunity(String slug, UUID userId) {
        Community community = communityRepository.findBySlugWithOwner(slug)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Community not found"));

        communityRepository.delete(community);
    }
}
