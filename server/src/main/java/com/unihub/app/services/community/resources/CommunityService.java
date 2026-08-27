package com.unihub.app.services.community.resources;

import com.unihub.app.dto.PageDto;
import com.unihub.app.dto.community.resources.response.CommunityResponseDto;
import com.unihub.app.dto.community.resources.response.CommunityHomeResponseDto;
import com.unihub.app.dto.community.resources.response.StudyYearIdentifiersResponseDto;
import com.unihub.app.dto.community.resources.response.StudyYearMetricsResponseDto;
import com.unihub.app.entities.community.resources.Community;
import com.unihub.app.mappers.PageMapper;
import com.unihub.app.mappers.community.CommunityResourceMapper;
import com.unihub.app.repositories.community.resources.CommunityRepository;
import lombok.RequiredArgsConstructor;
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
        Community community = communityRepository.findBySlug(slug)
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
}
