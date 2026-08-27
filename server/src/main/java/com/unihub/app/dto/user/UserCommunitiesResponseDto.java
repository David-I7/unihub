package com.unihub.app.dto.user;

import lombok.Builder;

import java.util.List;
import java.util.Map;

@Builder
public record UserCommunitiesResponseDto(
        List<UserEnrolledCommunityDto> communities,
        Map<String, List<String>> permissionsByRole
) {
}
