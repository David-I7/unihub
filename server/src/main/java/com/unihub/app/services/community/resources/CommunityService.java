package com.unihub.app.services.community.resources;

import com.unihub.app.dto.PageDto;
import com.unihub.app.dto.community.resources.CommunityDetailResponseDto;
import com.unihub.app.dto.community.resources.CommunityResponseDto;
import com.unihub.app.dto.community.resources.StudyYearSummaryDto;
import com.unihub.app.entities.community.resources.Community;
import com.unihub.app.mappers.PageMapper;
import com.unihub.app.mappers.community.CommunityMapper;
import com.unihub.app.repositories.community.resources.CommunityRepository;
import com.unihub.app.repositories.community.resources.StudyYearRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CommunityService {

    private final CommunityRepository communityRepository;

    private final StudyYearRepository studyYearRepository;

    private final CommunityMapper communityMapper;

    private final PageMapper pageMapper;

    @Transactional(readOnly = true)
    public PageDto<CommunityResponseDto> findAll(Pageable pageable) {
        return pageMapper.toPageDto(communityRepository.findAll(pageable)
                .map(communityMapper::toDto));
    }

    @Transactional(readOnly = true)
    public CommunityDetailResponseDto findBySlug(String slug) {
        Community community = communityRepository.findBySlug(slug)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Community not found"));

        List<StudyYearSummaryDto> studyYears = studyYearRepository.findSummariesByCommunityId(community.getId());
        return communityMapper.toDetailDto(community, studyYears);
    }

}
