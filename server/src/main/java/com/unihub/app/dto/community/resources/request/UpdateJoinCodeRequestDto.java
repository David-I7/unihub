package com.unihub.app.dto.community.resources.request;

import jakarta.validation.constraints.Min;

public record UpdateJoinCodeRequestDto(
        @Min(value = -1, message = "maxUses must be -1 or greater")
        Integer maxUses,

        @Min(value = -1, message = "validForHours must be -1 or greater")
        Integer validForHours
) {
}
