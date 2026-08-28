package com.unihub.app.services.community.resources;

import com.unihub.app.domain.RoleType;
import com.unihub.app.dto.PageDto;
import com.unihub.app.dto.community.resources.request.UpdateMemberRoleRequestDto;
import com.unihub.app.dto.community.resources.response.CommunityMemberResponseDto;
import com.unihub.app.entities.authentication.User;
import com.unihub.app.entities.authorization.Role;
import com.unihub.app.entities.community.resources.Community;
import com.unihub.app.entities.community.resources.CommunityMember;
import com.unihub.app.entities.community.resources.CommunityMembersId;
import com.unihub.app.mappers.PageMapper;
import com.unihub.app.repositories.authentication.UserRepository;
import com.unihub.app.repositories.community.resources.CommunityMemberRepository;
import com.unihub.app.repositories.community.resources.CommunityRepository;
import com.unihub.app.services.authorization.AuthorizationService;
import com.unihub.app.services.authorization.RoleService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
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
    private final UserRepository userRepository;
    private final RoleService roleService;
    private final AuthorizationService authorizationService;
    private final PageMapper pageMapper;

    @Transactional(readOnly = true)
    public PageDto<CommunityMemberResponseDto> getMembers(String communitySlug, Pageable pageable) {
        if (!communityRepository.existsBySlug(communitySlug)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Community not found");
        }

        Page<CommunityMember> page = communityMemberRepository.findMembersByCommunitySlug(communitySlug, pageable);
        return pageMapper.toPageDto(page.map(this::toResponseDto));
    }

    @Transactional
    public CommunityMemberResponseDto joinCommunity(String communitySlug, UUID userId) {
        Community community = communityRepository.findBySlug(communitySlug)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Community not found"));

        if (communityMemberRepository.existsByCommunityIdAndUserId(community.getId(), userId)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "You are already a member of this community");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        Role memberRole = roleService.getRoleByName(RoleType.COMMUNITY_MEMBER);
        OffsetDateTime now = OffsetDateTime.now();

        CommunityMember member = CommunityMember.builder()
                .id(new CommunityMembersId(community.getId(), user.getId()))
                .community(community)
                .user(user)
                .roleId(memberRole.getId())
                .joinedAt(now)
                .build();

        CommunityMember saved = communityMemberRepository.save(member);
        communityRepository.updateMemberCount(community.getId(), 1);

        return toResponseDto(saved);
    }

    @Transactional
    public void leaveCommunity(String communitySlug, UUID userId) {
        Community community = communityRepository.findBySlugWithOwner(communitySlug)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Community not found"));

        if (community.getOwner().getId().equals(userId)) {
            if(community.getMemberCount() == 1){
                communityRepository.delete(community);
                return;
            }
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Community owner cannot leave. Transfer ownership or delete the community first."
            );
        }

        CommunityMember member = communityMemberRepository.findByCommunityIdAndUserId(community.getId(), userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "You are not a member of this community"));

        communityMemberRepository.delete(member);
        communityRepository.updateMemberCount(community.getId(), -1);
    }

    @Transactional
    public CommunityMemberResponseDto updateMemberRole(String communitySlug, String targetUsername, UpdateMemberRoleRequestDto dto) {
        if(dto.role() != RoleType.COMMUNITY_MEMBER && dto.role() != RoleType.COMMUNITY_ADMIN){
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid role. Only COMMUNITY_MEMBER and COMMUNITY_ADMIN are allowed. Use PATCH /api/v1/communities/{communitySlug} to transfer ownership.");
        }

        Community community = communityRepository.findBySlugWithOwner(communitySlug)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Community not found"));

        if (community.getOwner().getUsername().equals(targetUsername)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot change the role of the community owner");
        }

        User targetUser = userRepository.findByUsername(targetUsername)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Target user not found"));

        CommunityMember member = communityMemberRepository.findByCommunityIdAndUserId(community.getId(), targetUser.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User is not a member of this community"));

        Role newRole = roleService.getRoleByName(dto.role());
        member.setRoleId(newRole.getId());
        CommunityMember saved = communityMemberRepository.save(member);

        return toResponseDto(saved);
    }

    @Transactional
    public void removeMember(String communitySlug, UUID callerId, String targetUsername) {
        Community community = communityRepository.findBySlugWithOwner(communitySlug)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Community not found"));

        if (community.getOwner().getUsername().equals(targetUsername)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot remove the community owner");
        }

        User targetUser = userRepository.findByUsername(targetUsername)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Target user not found"));

        CommunityMember targetMember = communityMemberRepository.findByCommunityIdAndUserId(community.getId(), targetUser.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Member not found in this community"));

        String callerGlobalRole = authorizationService.getGlobalRoleName(callerId);
        boolean isPlatformAdmin = RoleType.ROOT.name().equals(callerGlobalRole) || RoleType.ADMIN.name().equals(callerGlobalRole);
        boolean isOwner = community.getOwner().getId().equals(callerId);

        String targetRoleName = roleService.getRoleById(targetMember.getRoleId()).getName();

        // If caller is COMMUNITY_ADMIN (not owner or platform admin), they cannot remove another COMMUNITY_ADMIN
        if (!isOwner && !isPlatformAdmin && RoleType.COMMUNITY_ADMIN.name().equals(targetRoleName)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Community administrators cannot remove other administrators");
        }

        communityMemberRepository.delete(targetMember);
        communityRepository.updateMemberCount(community.getId(), -1);
    }

    private CommunityMemberResponseDto toResponseDto(CommunityMember member) {
        String roleName = roleService.getRoleById(member.getRoleId()).getName();
        return CommunityMemberResponseDto.builder()
                .userId(member.getUser().getId())
                .username(member.getUser().getUsername())
                .email(member.getUser().getEmail())
                .role(roleName)
                .joinedAt(member.getJoinedAt())
                .build();
    }
}
