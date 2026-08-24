package com.unihub.app.controllers.community.resources;

import com.unihub.app.dto.PageDto;
import com.unihub.app.dto.community.resources.CommunityResponseDto;
import com.unihub.app.mappers.PageMapper;
import com.unihub.app.services.community.resources.CommunityService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/communities")
@RequiredArgsConstructor
public class CommunityController {

    private final CommunityService communityService;

    private final PageMapper pageMapper;

    @GetMapping
    public ResponseEntity<PageDto<CommunityResponseDto>> getCommunities(
            @PageableDefault(page = 0, size = 10, sort = "memberCount", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        Page<CommunityResponseDto> page = communityService.findAll(pageable);
        return ResponseEntity.ok(pageMapper.<CommunityResponseDto>toPageDto(page));
    }
}
