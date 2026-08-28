package com.unihub.app.dto.user.request;

import com.unihub.app.domain.RoleType;
import jakarta.validation.constraints.NotNull;

public record UpdateUserRoleRequestDto(
        @NotNull(message = "Role is required")
        RoleType role
) {
}
