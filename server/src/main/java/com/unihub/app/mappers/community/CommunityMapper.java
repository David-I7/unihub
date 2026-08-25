package com.unihub.app.mappers.community;

import com.unihub.app.dto.community.OwnerDto;
import com.unihub.app.dto.community.resources.CommunityRequestDto;
import com.unihub.app.dto.community.resources.CommunityResponseDto;
import com.unihub.app.entities.community.resources.Community;
import org.springframework.stereotype.Component;

@Component
public class CommunityMapper {

    public CommunityResponseDto toDto(Community community) {
        return CommunityResponseDto.builder()
                .id(community.getId())
                .name(community.getName())
                .description(community.getDescription())
                .memberCount(community.getMemberCount())
                .createdAt(community.getCreatedAt())
                .owner(new OwnerDto(community.getOwner().getId(), community.getOwner().getUsername()))
                .backgroundColor(community.getBackgroundColor())
                .verified(community.isVerified())
                .slug(community.getSlug())
                .build();
    }

    public Community toCommunity(CommunityRequestDto communityRequestDto) {
        return Community.builder()
                .name(communityRequestDto.name())
                .description(communityRequestDto.description())
                .backgroundColor(communityRequestDto.backgroundColor())
                .slug(communityRequestDto.slug())
                .build();
    }
}
