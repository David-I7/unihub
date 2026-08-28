package com.unihub.app.controllers.community.resources;

import com.unihub.app.dto.PageDto;
import com.unihub.app.dto.UserDto;
import com.unihub.app.dto.community.content.response.PostResponseDto;
import com.unihub.app.dto.community.resources.request.CreateCommunityRequestDto;
import com.unihub.app.dto.community.resources.request.UpdateCommunityRequestDto;
import com.unihub.app.dto.community.resources.response.CommunityHomeResponseDto;
import com.unihub.app.dto.community.resources.response.CommunityResponseDto;
import com.unihub.app.dto.community.resources.response.StudyYearIdentifiersResponseDto;
import com.unihub.app.services.authorization.AuthorizationService;
import com.unihub.app.services.community.content.CommunityPostService;
import com.unihub.app.services.community.resources.CommunityService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/communities")
@RequiredArgsConstructor
public class CommunityController {

    private final CommunityService communityService;
    private final CommunityPostService communityPostService;
    private final AuthorizationService authorizationService;

    @GetMapping
    public ResponseEntity<PageDto<CommunityResponseDto>> getCommunities(
            @PageableDefault(page = 0, size = 10, sort = "memberCount", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        PageDto<CommunityResponseDto> page = communityService.findAll(pageable);
        return ResponseEntity.ok(page);
    }

    @PostMapping
    @PreAuthorize("@security.hasGlobalPermission('create:community')")
    public ResponseEntity<CommunityResponseDto> createCommunity(
            @Valid @RequestBody CreateCommunityRequestDto requestDto
    ) {
        UserDto user = authorizationService.requireAuthentication().getUserDto();
        CommunityResponseDto created = communityService.createCommunity(user.id(), requestDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping("/{communitySlug}/study-years")
    public ResponseEntity<List<StudyYearIdentifiersResponseDto>> getCommunityStudyYears(
            @PathVariable String communitySlug
    ) {
        List<StudyYearIdentifiersResponseDto> communityStudyYears = communityService.getCommunityStudyYears(communitySlug);
        return ResponseEntity.ok(communityStudyYears);
    }

    @GetMapping("/{communitySlug}/home")
    public ResponseEntity<CommunityHomeResponseDto> getCommunityHome(
            @PathVariable String communitySlug
    ) {
        CommunityHomeResponseDto communityHome = communityService.getCommunityHome(communitySlug);
        return ResponseEntity.ok(communityHome);
    }

    @GetMapping("/{communitySlug}")
    public ResponseEntity<CommunityResponseDto> getCommunity(
            @PathVariable String communitySlug
    ) {
        CommunityResponseDto community = communityService.findBySlug(communitySlug);
        return ResponseEntity.ok(community);
    }

    @PatchMapping("/{communitySlug}")
    @PreAuthorize("@security.hasCommunityPermission(#communitySlug, 'update:community')")
    public ResponseEntity<CommunityResponseDto> updateCommunity(
            @PathVariable String communitySlug,
            @Valid @RequestBody UpdateCommunityRequestDto requestDto
    ) {
        UserDto user = authorizationService.requireAuthentication().getUserDto();
        CommunityResponseDto updated = communityService.updateCommunity(communitySlug, user.id(), requestDto);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{communitySlug}")
    @PreAuthorize("@security.hasCommunityPermission(#communitySlug, 'delete:community')")
    public ResponseEntity<Void> deleteCommunity(
            @PathVariable String communitySlug
    ) {
        UserDto user = authorizationService.requireAuthentication().getUserDto();
        communityService.deleteCommunity(communitySlug, user.id());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{communitySlug}/posts")
    public ResponseEntity<PageDto<PostResponseDto>> getCommunityPosts(
            @PathVariable String communitySlug,
            @PageableDefault(page = 0, size = 10) Pageable pageable
    ) {
        PageDto<PostResponseDto> posts = communityPostService.getCommunityPosts(communitySlug, pageable);
        return ResponseEntity.ok(posts);
    }
}
