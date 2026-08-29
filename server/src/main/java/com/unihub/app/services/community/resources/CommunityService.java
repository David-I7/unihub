package com.unihub.app.services.community.resources;

import com.unihub.app.domain.PermissionType;
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
import com.unihub.app.mappers.PageMapper;
import com.unihub.app.mappers.UserMapper;
import com.unihub.app.mappers.community.CommunityResourceMapper;
import com.unihub.app.repositories.authentication.UserRepository;
import com.unihub.app.repositories.community.resources.CommunityMemberRepository;
import com.unihub.app.repositories.community.resources.CommunityRepository;
import com.unihub.app.services.authorization.AuthorizationService;
import com.unihub.app.services.authorization.RoleService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
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
    public PageDto<CommunityResponseDto> findAll(Pageable pageable) {
        return pageMapper.toPageDto(communityRepository.findAll(pageable)
                .map(communityMapper::toCommunityResponseDto));
    }

    @Transactional(readOnly = true)
    public CommunityResponseDto findBySlug(String slug) {
        Community community = communityRepository.findBySlugWithOwner(slug)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Community not found"));
        return communityMapper.toCommunityResponseDto(community);
    }

    @Transactional(readOnly = true)
    public CommunityHomeResponseDto getCommunityHome(String communitySlug) {
        CommunityResponseDto community = findBySlug(communitySlug);
        List<StudyYearMetricsResponseDto> studyYears = studyYearService.getCommunityStudyYearMetrics(communitySlug);
        return communityMapper.toCommunityHomeResponseDto(community, studyYears);
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

        return communityMapper.toCommunityResponseDto(savedCommunity);
    }

    @Transactional
    public CommunityResponseDto updateCommunity(String slug, UUID userId, UpdateCommunityRequestDto dto) {
        if (dto.name() == null && dto.slug() == null && dto.description() == null && dto.readme() == null && dto.backgroundColor() == null && dto.verified() == null && dto.newOwnerUsername() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "At least one field must be provided for update");
        }

        Community community = communityRepository.findBySlugWithOwner(slug)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Community not found"));

        if (dto.description() != null) {
            community.setDescription(dto.description());
        }

        if (dto.readme() != null) {
            community.setReadme(dto.readme());
        }

        if (dto.slug() != null && !dto.slug().equals(community.getSlug())) {
            if (communityRepository.existsBySlug(dto.slug())) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "A community with this slug already exists");
            }
            community.setSlug(dto.slug());
        }

        if (dto.name() != null && !dto.name().equals(community.getName())) {
            if (communityRepository.existsByName(dto.name())) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "A community with this name already exists");
            }
            community.setName(dto.name());
        }

        if (dto.backgroundColor() != null) {
            community.setBackgroundColor(dto.backgroundColor());
        }

        if (dto.verified() != null) {
            if (authorizationService.hasGlobalPermission(PermissionType.VERIFY_COMMUNITY)) {
                community.setVerified(dto.verified());
            } else {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only platform administrators can verify communities");
            }
        }

        if (dto.newOwnerUsername() != null && !dto.newOwnerUsername().equals(community.getOwner().getUsername())) {
            User newOwner = userRepository.findByUsername(dto.newOwnerUsername())
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
        return communityMapper.toCommunityResponseDto(saved);
    }

    @Transactional
    public void deleteCommunity(String slug, UUID userId) {
        Community community = communityRepository.findBySlugWithOwner(slug)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Community not found"));

        communityRepository.delete(community);
    }
}
