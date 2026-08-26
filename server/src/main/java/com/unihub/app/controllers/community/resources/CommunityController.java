package com.unihub.app.controllers.community.resources;

import com.unihub.app.dto.PageDto;
import com.unihub.app.dto.community.content.response.PostResponseDto;
import com.unihub.app.dto.community.resources.response.CommunityResponseDto;
import com.unihub.app.dto.community.resources.response.CommunityStudyYearsResponseDto;
import com.unihub.app.services.community.content.CommunityPostService;
import com.unihub.app.services.community.resources.CommunityService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/communities")
@RequiredArgsConstructor
public class CommunityController {

    private final CommunityService communityService;
    private final CommunityPostService communityPostService;

    @GetMapping
    public ResponseEntity<PageDto<CommunityResponseDto>> getCommunities(
            @PageableDefault(page = 0, size = 10, sort = "memberCount", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        PageDto<CommunityResponseDto> page = communityService.findAll(pageable);
        return ResponseEntity.ok(page);
    }

    @GetMapping("/{communitySlug}/study-years")
    public ResponseEntity<CommunityStudyYearsResponseDto> getCommunityStudyYears(
            @PathVariable String communitySlug
    ) {
        CommunityStudyYearsResponseDto communityStudyYears = communityService.getCommunityStudyYears(communitySlug);
        return ResponseEntity.ok(communityStudyYears);
    }

    @GetMapping("/{communitySlug}")
    public ResponseEntity<CommunityResponseDto> getCommunity(
            @PathVariable String communitySlug
    ) {
        CommunityResponseDto community = communityService.findBySlug(communitySlug);
        return ResponseEntity.ok(community);
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
