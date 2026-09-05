package com.unihub.app.controllers.community.resources;

import com.unihub.app.dto.PageDto;
import com.unihub.app.dto.UserDto;
import com.unihub.app.dto.community.content.request.CreatePostRequestDto;
import com.unihub.app.dto.community.content.response.PostResponseDto;
import com.unihub.app.dto.community.resources.request.CreateCommunityRequestDto;
import com.unihub.app.dto.community.resources.request.JoinCommunityRequestDto;
import com.unihub.app.dto.community.resources.request.UpdateCommunityReadmeRequestDto;
import com.unihub.app.dto.community.resources.request.UpdateCommunityRequestDto;
import com.unihub.app.dto.community.resources.response.CallerMembershipDto;
import com.unihub.app.dto.community.resources.response.CommunityHomeResponseDto;
import com.unihub.app.dto.community.resources.response.CommunityJoinPreviewResponseDto;
import com.unihub.app.dto.community.resources.response.CommunityReadmeResponseDto;
import com.unihub.app.dto.community.resources.response.CommunityResponseDto;
import com.unihub.app.dto.community.resources.response.StudyYearIdentifiersResponseDto;
import com.unihub.app.dto.user.UserEnrolledCommunityDto;
import com.unihub.app.services.community.content.CommunityPostService;
import com.unihub.app.services.community.resources.CommunityJoinCodeService;
import com.unihub.app.services.community.resources.CommunityMemberService;
import com.unihub.app.services.community.resources.CommunityService;
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

@RestController
@RequestMapping("/api/v1/communities")
@RequiredArgsConstructor
public class CommunityController {

    private final CommunityService communityService;
    private final CommunityMemberService communityMemberService;
    private final CommunityJoinCodeService communityJoinCodeService;
    private final CommunityPostService communityPostService;

    @GetMapping
    public ResponseEntity<PageDto<CommunityResponseDto>> getCommunities(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Boolean verified,
            @RequestParam(required = false) Boolean joined,
            @AuthenticationPrincipal UserDto user,
            @PageableDefault(page = 0, size = 10, sort = "memberCount", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        PageDto<CommunityResponseDto> page = communityService.findAll(user, search, verified, joined, pageable);
        return ResponseEntity.ok(page);
    }

    @PostMapping
    @PreAuthorize("@security.hasGlobalPermission('create:community')")
    public ResponseEntity<CommunityResponseDto> createCommunity(
            @AuthenticationPrincipal UserDto user,
            @Valid @RequestBody CreateCommunityRequestDto requestDto
    ) {
        CommunityResponseDto created = communityService.createCommunity(user, requestDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PostMapping("/join")
    public ResponseEntity<UserEnrolledCommunityDto> joinCommunity(
            @AuthenticationPrincipal UserDto user,
            @Valid @RequestBody JoinCommunityRequestDto requestDto
    ) {
        UserEnrolledCommunityDto enrolled = communityMemberService.joinWithCode(user, requestDto.joinCode());
        return ResponseEntity.status(HttpStatus.CREATED).body(enrolled);
    }

    @GetMapping("/{communitySlug}/join-codes/preview")
    public ResponseEntity<CommunityJoinPreviewResponseDto> getJoinCodePreview(
            @PathVariable String communitySlug,
            @RequestParam String code,
            @AuthenticationPrincipal UserDto user
    ) {
        CommunityJoinPreviewResponseDto preview = communityJoinCodeService.getJoinCodePreview(communitySlug, code, user);
        return ResponseEntity.ok(preview);
    }

    @GetMapping("/{communitySlug}/study-years")
    public ResponseEntity<List<StudyYearIdentifiersResponseDto>> getCommunityStudyYears(
            @PathVariable String communitySlug
    ) {
        List<StudyYearIdentifiersResponseDto> communityStudyYears = communityService.getCommunityStudyYears(communitySlug);
        return ResponseEntity.ok(communityStudyYears);
    }

    @GetMapping("/{communitySlug}/membership")
    public ResponseEntity<CallerMembershipDto> getCallerMembership(
            @PathVariable String communitySlug,
            @AuthenticationPrincipal UserDto user
    ) {
        CallerMembershipDto callerMembership = communityService.getCallerMembership(communitySlug, user);
        return ResponseEntity.ok(callerMembership);
    }

    @GetMapping("/{communitySlug}/home")
    public ResponseEntity<CommunityHomeResponseDto> getCommunityHome(
            @PathVariable String communitySlug,
            @AuthenticationPrincipal UserDto user
    ) {
        CommunityHomeResponseDto communityHome = communityService.getCommunityHome(communitySlug, user);
        return ResponseEntity.ok(communityHome);
    }

    @GetMapping("/{communitySlug}")
    public ResponseEntity<CommunityResponseDto> getCommunity(
            @PathVariable String communitySlug,
            @AuthenticationPrincipal UserDto user
    ) {
        CommunityResponseDto community = communityService.findBySlug(communitySlug, user);
        return ResponseEntity.ok(community);
    }

    @PatchMapping("/{communitySlug}")
    @PreAuthorize("@security.hasCommunityPermission(#communitySlug, 'update:community')")
    public ResponseEntity<CommunityResponseDto> updateCommunity(
            @PathVariable String communitySlug,
            @AuthenticationPrincipal UserDto user,
            @Valid @RequestBody UpdateCommunityRequestDto requestDto
    ) {
        CommunityResponseDto updated = communityService.updateCommunity(communitySlug, user.id(), requestDto);
        return ResponseEntity.ok(updated);
    }

    @GetMapping("/{communitySlug}/readme")
    public ResponseEntity<CommunityReadmeResponseDto> getCommunityReadme(
            @PathVariable String communitySlug
    ) {
        CommunityReadmeResponseDto readme = communityService.getCommunityReadme(communitySlug);
        return ResponseEntity.ok(readme);
    }

    @PatchMapping("/{communitySlug}/readme")
    @PreAuthorize("@security.hasCommunityPermission(#communitySlug, 'update:community')")
    public ResponseEntity<CommunityReadmeResponseDto> updateCommunityReadme(
            @PathVariable String communitySlug,
            @AuthenticationPrincipal UserDto user,
            @Valid @RequestBody UpdateCommunityReadmeRequestDto requestDto
    ) {
        CommunityReadmeResponseDto updated = communityService.updateCommunityReadme(communitySlug, user.id(), requestDto);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{communitySlug}")
    @PreAuthorize("@security.hasCommunityPermission(#communitySlug, 'delete:community')")
    public ResponseEntity<Void> deleteCommunity(
            @PathVariable String communitySlug,
            @AuthenticationPrincipal UserDto user
    ) {
        communityService.deleteCommunity(communitySlug, user.id());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{communitySlug}/posts")
    @PreAuthorize("@security.hasCommunityPermission(#communitySlug, 'create:post')")
    public ResponseEntity<PostResponseDto> createCommunityPost(
            @PathVariable String communitySlug,
            @AuthenticationPrincipal UserDto user,
            @Valid @RequestBody CreatePostRequestDto requestDto
    ) {
        PostResponseDto created = communityPostService.createCommunityPost(communitySlug, user, requestDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping("/{communitySlug}/posts")
    public ResponseEntity<PageDto<PostResponseDto>> getCommunityPosts(
            @PathVariable String communitySlug,
            @AuthenticationPrincipal UserDto user,
            @PageableDefault(page = 0, size = 10) Pageable pageable
    ) {
        PageDto<PostResponseDto> posts = communityPostService.getCommunityPosts(communitySlug, user, pageable);
        return ResponseEntity.ok(posts);
    }
}
