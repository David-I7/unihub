package com.unihub.app.dto.community.resources.response;


import com.unihub.app.dto.community.OwnerDto;
import lombok.Builder;
import java.time.OffsetDateTime;
import java.util.UUID;

@Builder
public record CommunityResponseDto(
    UUID id,
    String name,
    String description,
    String readme,
    int memberCount,
    OffsetDateTime createdAt,
    OwnerDto owner,
    String backgroundColor,
    boolean verified,
    String slug
) {
}
