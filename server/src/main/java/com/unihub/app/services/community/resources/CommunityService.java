package com.unihub.app.services.community.resources;

import com.unihub.app.dto.community.resources.CommunityResponseDto;
import com.unihub.app.mappers.community.CommunityMapper;
import com.unihub.app.repositories.community.resources.CommunityRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CommunityService {

    private final CommunityRepository communityRepository;

    private final CommunityMapper communityMapper;

    @Transactional
    public Page<CommunityResponseDto> findAll(Pageable pageable) {
        return communityRepository.findAll(pageable)
                .map(communityMapper::toDto);
    }

}
