package com.unihub.app.dto.community.resources.request;

import com.unihub.app.domain.RoleType;
import jakarta.validation.constraints.NotNull;

public record UpdateMemberRoleRequestDto(
        @NotNull(message = "Role is required")
        RoleType role
) {
}
