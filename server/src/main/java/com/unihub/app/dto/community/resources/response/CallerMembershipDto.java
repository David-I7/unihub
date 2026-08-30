package com.unihub.app.dto.community.resources.response;

import lombok.Builder;
import java.util.List;

@Builder
public record CallerMembershipDto(
        boolean isMember,
        String role,
        List<String> permissions
) {
}
