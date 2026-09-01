package com.unihub.app.services.community.resources;

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
import com.unihub.app.entities.community.resources.CommunityMembersId;
import com.unihub.app.mappers.PageMapper;
import com.unihub.app.mappers.UserMapper;
import com.unihub.app.mappers.community.CommunityResourceMapper;
import com.unihub.app.repositories.authentication.UserRepository;
import com.unihub.app.repositories.community.resources.CommunityJoinCodeRepository;
import com.unihub.app.repositories.community.resources.CommunityMemberRepository;
import com.unihub.app.repositories.community.resources.CommunityRepository;
import com.unihub.app.services.authorization.RoleService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.OffsetDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CommunityMemberService {

    private final CommunityMemberRepository communityMemberRepository;
    private final CommunityRepository communityRepository;
    private final CommunityJoinCodeRepository joinCodeRepository;
    private final UserRepository userRepository;
    private final RoleService roleService;
    private final PageMapper pageMapper;
    private final UserMapper userMapper;
    private final CommunityResourceMapper communityMapper;

    @Transactional(readOnly = true)
    public PageDto<CommunityMemberResponseDto> getMembers(String communitySlug, String search, RoleType role, Pageable pageable) {
        if (!communityRepository.existsBySlug(communitySlug)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Community not found");
        }

        UUID roleId = role != null ? roleService.getRoleByName(role).getId() : null;
        String trimmedSearch = (search != null && !search.trim().isEmpty()) ? search.trim() : null;

        Page<CommunityMember> page = communityMemberRepository.findMembersByCommunitySlugWithFilters(
                communitySlug,
                trimmedSearch,
                roleId,
                pageable
        );
        return pageMapper.toPageDto(page.map(member -> {
            String roleName = roleService.getRoleById(member.getRoleId()).getName();
            return communityMapper.toCommunityMemberResponseDto(member, roleName);
        }));
    }

    @Transactional
    public UserEnrolledCommunityDto joinWithCode(UserDto userDto, String code) {
        CommunityJoinCode joinCode = joinCodeRepository.findByCodeWithCommunity(code)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid join code"));

        if (joinCode.isExpired()) {
            joinCodeRepository.delete(joinCode);
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Join code has expired");
        }

        if (joinCode.isUsageLimitReached()) {
            joinCodeRepository.delete(joinCode);
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Join code usage limit reached");
        }

        Community community = joinCode.getCommunity();

        if (communityMemberRepository.existsByCommunityIdAndUserId(community.getId(), userDto.id())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "You are already a member of this community");
        }

        User user = userMapper.toEntity(userDto);

        Role memberRole = roleService.getRoleByName(RoleType.COMMUNITY_MEMBER);
        OffsetDateTime now = OffsetDateTime.now();

        CommunityMember member = communityMapper.toCommunityMemberEntity(
                community,
                user,
                memberRole.getId(),
                now
        );

        communityMemberRepository.save(member);
        joinCodeRepository.incrementUsesCount(joinCode.getId());
        communityRepository.updateMemberCount(community.getId(), 1);

        return userMapper.toUserEnrolledCommunityDto(community, RoleType.COMMUNITY_MEMBER.name(), now);
    }

    @Transactional
    public void addMemberDirectly(String communitySlug, UserDto caller, AddCommunityMemberRequestDto dto) {
        Community community = communityRepository.findBySlugWithOwner(communitySlug)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Community not found"));

        User targetUser = userRepository.findByUsername(dto.username())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Target user not found"));

        if (communityMemberRepository.existsByCommunityIdAndUserId(community.getId(), targetUser.getId())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "User is already a member of this community");
        }

        RoleType targetRole = dto.role() != null ? dto.role() : RoleType.COMMUNITY_MEMBER;

        if (targetRole == RoleType.COMMUNITY_ADMIN) {
            boolean isPlatformAdmin = caller.role() == RoleType.ROOT || caller.role() == RoleType.ADMIN;
            boolean isOwner = community.getOwner().getId().equals(caller.id());

            if (!isOwner && !isPlatformAdmin) {
                throw new ResponseStatusException(
                        HttpStatus.FORBIDDEN,
                        "Only community owners or platform administrators can directly assign the administrator role"
                );
            }
        } else if (targetRole != RoleType.COMMUNITY_MEMBER) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Role must be COMMUNITY_MEMBER or COMMUNITY_ADMIN");
        }

        Role assignedRole = roleService.getRoleByName(targetRole);
        OffsetDateTime now = OffsetDateTime.now();

        CommunityMember member = communityMapper.toCommunityMemberEntity(
                community,
                targetUser,
                assignedRole.getId(),
                now
        );

        communityMemberRepository.save(member);
        communityRepository.updateMemberCount(community.getId(), 1);
    }

    @Transactional
    public void leaveCommunity(String communitySlug, UUID userId) {
        Community community = communityRepository.findBySlugWithOwner(communitySlug)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Community not found"));

        if (community.getOwner().getId().equals(userId)) {
            if (community.getMemberCount() == 1) {
                communityRepository.delete(community);
                return;
            }
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Community owner cannot leave a community. You must delete the community, or transfer ownership if you want to leave."
            );
        }

        CommunityMember member = communityMemberRepository.findByCommunityIdAndUserId(community.getId(), userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "You are not a member of this community"));

        communityMemberRepository.delete(member);
        communityRepository.updateMemberCount(community.getId(), -1);
    }

    @Transactional
    public CommunityMemberResponseDto updateMemberRole(String communitySlug, String targetUsername, UpdateMemberRoleRequestDto dto) {
        if (dto.role() != RoleType.COMMUNITY_MEMBER && dto.role() != RoleType.COMMUNITY_ADMIN) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid role. Only COMMUNITY_MEMBER and COMMUNITY_ADMIN are allowed.");
        }

        Community community = communityRepository.findBySlugWithOwner(communitySlug)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Community not found"));

        if (community.getOwner().getUsername().equals(targetUsername)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot change the role of the community owner. Use the transferOwnership method instead.");
        }

        User targetUser = userRepository.findByUsername(targetUsername)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Target user not found"));

        CommunityMember member = communityMemberRepository.findByCommunityIdAndUserId(community.getId(), targetUser.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User is not a member of this community"));

        Role newRole = roleService.getRoleByName(dto.role());
        member.setRoleId(newRole.getId());
        CommunityMember saved = communityMemberRepository.save(member);

        return communityMapper.toCommunityMemberResponseDto(saved, newRole.getName());
    }

    @Transactional
    public void removeMember(String communitySlug, UserDto caller, String targetUsername) {
        Community community = communityRepository.findBySlugWithOwner(communitySlug)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Community not found"));

        if (community.getOwner().getUsername().equals(targetUsername)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot remove the community owner. Use the transferOwnership method instead.");
        }

        User targetUser = userRepository.findByUsername(targetUsername)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Target user not found"));

        CommunityMember targetMember = communityMemberRepository.findByCommunityIdAndUserId(community.getId(), targetUser.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Member not found in this community"));

        boolean isPlatformAdmin = caller.role() == RoleType.ROOT || caller.role() == RoleType.ADMIN;
        boolean isOwner = community.getOwner().getId().equals(caller.id());

        String targetRoleName = roleService.getRoleById(targetMember.getRoleId()).getName();

        // If caller is COMMUNITY_ADMIN (not owner or platform admin), they cannot remove another COMMUNITY_ADMIN
        if (!isOwner && !isPlatformAdmin && RoleType.COMMUNITY_ADMIN.name().equals(targetRoleName)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Community administrators cannot remove other administrators");
        }

        communityMemberRepository.delete(targetMember);
        communityRepository.updateMemberCount(community.getId(), -1);
    }

    @Scheduled(cron="@daily")
    protected void deleteExpiredCodes(){
        joinCodeRepository.deleteExpiredCodes();
    }
}
