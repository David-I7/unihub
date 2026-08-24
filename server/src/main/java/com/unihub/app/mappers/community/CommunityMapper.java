package com.unihub.app.mappers.community;

import com.unihub.app.dto.community.OwnerDto;
import com.unihub.app.dto.community.resources.CommunityResponseDto;
import com.unihub.app.entities.authentication.User;
import com.unihub.app.entities.community.resources.Community;
import org.springframework.stereotype.Component;

@Component
public class CommunityMapper {

    public CommunityResponseDto toDto(Community  community) {
        return new CommunityResponseDto(
                community.getId(),
                community.getName(),
                community.getDescription(),
                community.getMemberCount(),
                community.getCreatedAt(),
                new OwnerDto(community.getOwner().getId(), community.getOwner().getUsername()),
                community.getBackgroundColor(),
                community.isVerified()
        );
    }

    public Community toCommunity(CommunityResponseDto communityResponseDto) {
        return Community.builder()
                .id(communityResponseDto.id())
                .name(communityResponseDto.name())
                .description(communityResponseDto.description())
                .memberCount(communityResponseDto.memberCount())
                .createdAt(communityResponseDto.createdAt())
                .backgroundColor(communityResponseDto.backgroundColor())
                .verified(communityResponseDto.verified())
                .owner(User.builder()
                        .id(communityResponseDto.owner().id())
                        .username(communityResponseDto.owner().username())
                        .build())
                .build();
    }
}
