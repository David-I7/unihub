package com.unihub.app.controllers.community.resources;

import com.unihub.app.domain.RoleType;
import com.unihub.app.dto.PageDto;
import com.unihub.app.dto.UserDto;
import com.unihub.app.dto.community.resources.request.AddCommunityMemberRequestDto;
import com.unihub.app.dto.community.resources.request.CreateJoinCodeRequestDto;
import com.unihub.app.dto.community.resources.request.UpdateJoinCodeRequestDto;
import com.unihub.app.dto.community.resources.request.UpdateMemberRoleRequestDto;
import com.unihub.app.dto.community.resources.response.CommunityJoinCodeResponseDto;
import com.unihub.app.dto.community.resources.response.CommunityMemberResponseDto;
import com.unihub.app.services.community.resources.CommunityJoinCodeService;
import com.unihub.app.services.community.resources.CommunityMemberService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/communities/{communitySlug}")
@RequiredArgsConstructor
public class CommunityMemberController {

    private final CommunityMemberService communityMemberService;
    private final CommunityJoinCodeService communityJoinCodeService;

    @GetMapping("/members")
    public ResponseEntity<PageDto<CommunityMemberResponseDto>> getMembers(
            @PathVariable String communitySlug,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) RoleType role,
            @PageableDefault(page = 0, size = 20, sort = "joinedAt", direction = Sort.Direction.ASC) Pageable pageable
    ) {
        PageDto<CommunityMemberResponseDto> members = communityMemberService.getMembers(communitySlug, search, role, pageable);
        return ResponseEntity.ok(members);
    }

    @PostMapping("/members")
    @PreAuthorize("hasPermission(#communitySlug, 'MEMBER', 'CREATE')")
    public ResponseEntity<Void> addMember(
            @PathVariable String communitySlug,
            @AuthenticationPrincipal UserDto caller,
            @Valid @RequestBody AddCommunityMemberRequestDto requestDto
    ) {
        communityMemberService.addMemberDirectly(communitySlug, caller, requestDto);
        return ResponseEntity.ok(null);
    }

    @DeleteMapping("/leave")
    public ResponseEntity<Void> leaveCommunity(
            @PathVariable String communitySlug,
            @AuthenticationPrincipal UserDto user
    ) {
        communityMemberService.leaveCommunity(communitySlug, user.id());
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/members/{username}/role")
    @PreAuthorize("hasPermission(#communitySlug, 'MEMBER_ROLE', 'UPDATE')")
    public ResponseEntity<CommunityMemberResponseDto> updateMemberRole(
            @PathVariable String communitySlug,
            @PathVariable String username,
            @Valid @RequestBody UpdateMemberRoleRequestDto requestDto
    ) {
        CommunityMemberResponseDto response = communityMemberService.updateMemberRole(communitySlug, username, requestDto);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/members/{username}")
    @PreAuthorize("hasPermission(#communitySlug, 'MEMBER', 'DELETE')")
    public ResponseEntity<Void> removeMember(
            @PathVariable String communitySlug,
            @AuthenticationPrincipal UserDto caller,
            @PathVariable String username
    ) {
        communityMemberService.removeMember(communitySlug, caller, username);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/memberships/{membershipId}")
    @PreAuthorize("hasPermission(#communitySlug, 'MEMBER', 'DELETE')")
    public ResponseEntity<Void> removeMemberById(
            @PathVariable String communitySlug,
            @AuthenticationPrincipal UserDto caller,
            @PathVariable UUID membershipId
    ) {
        communityMemberService.removeMember(communitySlug, caller, membershipId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/join-codes")
    @PreAuthorize("hasPermission(#communitySlug, 'JOIN_CODE', 'CREATE')")
    public ResponseEntity<CommunityJoinCodeResponseDto> createJoinCode(
            @PathVariable String communitySlug,
            @AuthenticationPrincipal UserDto caller,
            @Valid @RequestBody CreateJoinCodeRequestDto requestDto
    ) {
        CommunityJoinCodeResponseDto response = communityJoinCodeService.createJoinCode(communitySlug, caller, requestDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/join-codes")
    @PreAuthorize("hasPermission(#communitySlug, 'ROLE', 'COMMUNITY_ADMIN')")
    public ResponseEntity<List<CommunityJoinCodeResponseDto>> getJoinCodes(
            @PathVariable String communitySlug
    ) {
        List<CommunityJoinCodeResponseDto> codes = communityJoinCodeService.getJoinCodes(communitySlug);
        return ResponseEntity.ok(codes);
    }

    @PatchMapping("/join-codes/{codeId}")
    @PreAuthorize("hasPermission(#communitySlug, 'JOIN_CODE', 'UPDATE')")
    public ResponseEntity<CommunityJoinCodeResponseDto> updateJoinCode(
            @PathVariable String communitySlug,
            @PathVariable UUID codeId,
            @Valid @RequestBody UpdateJoinCodeRequestDto requestDto
    ) {
        CommunityJoinCodeResponseDto response = communityJoinCodeService.updateJoinCode(communitySlug, codeId, requestDto);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/join-codes/{codeId}")
    @PreAuthorize("hasPermission(#communitySlug, 'JOIN_CODE', 'DELETE')")
    public ResponseEntity<Void> deleteJoinCode(
            @PathVariable String communitySlug,
            @PathVariable UUID codeId
    ) {
        communityJoinCodeService.deleteJoinCode(communitySlug, codeId);
        return ResponseEntity.noContent().build();
    }
}
