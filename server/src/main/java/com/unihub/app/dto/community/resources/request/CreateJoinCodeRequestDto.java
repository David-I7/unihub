package com.unihub.app.dto.community.resources.request;

import jakarta.validation.constraints.Min;

public record CreateJoinCodeRequestDto(
        @Min(value = 1, message = "maxUses must be at least 1")
        Integer maxUses,

        @Min(value = 1, message = "validForHours must be at least 1")
        Integer validForHours
) {
}
