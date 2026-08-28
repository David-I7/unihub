package com.unihub.app.controllers.community.resources;

import com.unihub.app.dto.PageDto;
import com.unihub.app.dto.UserDto;
import com.unihub.app.dto.community.resources.request.UpdateMemberRoleRequestDto;
import com.unihub.app.dto.community.resources.response.CommunityMemberResponseDto;
import com.unihub.app.services.authorization.AuthorizationService;
import com.unihub.app.services.community.resources.CommunityMemberService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/communities/{communitySlug}")
@RequiredArgsConstructor
public class CommunityMemberController {

    private final CommunityMemberService communityMemberService;
    private final AuthorizationService authorizationService;

    @GetMapping("/members")
    public ResponseEntity<PageDto<CommunityMemberResponseDto>> getMembers(
            @PathVariable String communitySlug,
            @PageableDefault(page = 0, size = 20, sort = "joinedAt", direction = Sort.Direction.ASC) Pageable pageable
    ) {
        PageDto<CommunityMemberResponseDto> members = communityMemberService.getMembers(communitySlug, pageable);
        return ResponseEntity.ok(members);
    }

    @PostMapping("/join")
    public ResponseEntity<CommunityMemberResponseDto> joinCommunity(
            @PathVariable String communitySlug
    ) {
        UserDto user = authorizationService.requireAuthentication().getUserDto();
        CommunityMemberResponseDto response = communityMemberService.joinCommunity(communitySlug, user.id());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @DeleteMapping("/leave")
    public ResponseEntity<Void> leaveCommunity(
            @PathVariable String communitySlug
    ) {
        UserDto user = authorizationService.requireAuthentication().getUserDto();
        communityMemberService.leaveCommunity(communitySlug, user.id());
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/members/{username}/role")
    @PreAuthorize("@security.hasCommunityPermission(#communitySlug, 'update:memberRole')")
    public ResponseEntity<CommunityMemberResponseDto> updateMemberRole(
            @PathVariable String communitySlug,
            @PathVariable String username,
            @Valid @RequestBody UpdateMemberRoleRequestDto requestDto
    ) {
        CommunityMemberResponseDto response = communityMemberService.updateMemberRole(communitySlug, username, requestDto);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/members/{username}")
    @PreAuthorize("@security.hasCommunityPermission(#communitySlug, 'delete:member')")
    public ResponseEntity<Void> removeMember(
            @PathVariable String communitySlug,
            @PathVariable String username
    ) {
        UserDto caller = authorizationService.requireAuthentication().getUserDto();
        communityMemberService.removeMember(communitySlug, caller.id(), username);
        return ResponseEntity.noContent().build();
    }
}
