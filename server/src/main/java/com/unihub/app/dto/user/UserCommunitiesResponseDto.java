package com.unihub.app.dto.user;

import lombok.Builder;

import java.util.List;

@Builder
public record UserCommunitiesResponseDto(
        List<UserEnrolledCommunityDto> communities,
        List<String> permissions
) {
}
