package com.unihub.app.dto.community.resources;


import com.unihub.app.dto.community.OwnerDto;
import lombok.Builder;
import java.time.OffsetDateTime;
import java.util.UUID;

@Builder
public record CommunityResponseDto(
    UUID id,
    String name,
    String description,
    int memberCount,
    OffsetDateTime createdAt,
    OwnerDto owner
) {
}
