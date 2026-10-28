package com.unihub.app.dto.community.resources.request;

import jakarta.validation.constraints.Min;
import lombok.Builder;
import org.openapitools.jackson.nullable.JsonNullable;

@Builder
public record UpdateJoinCodeRequestDto(
        JsonNullable<@Min(value = -1, message = "maxUses must be 1 or greater") Integer> maxUses,
        JsonNullable<@Min(value = -1, message = "validForHours must be 1 or greater") Integer> validForHours
) {
    public UpdateJoinCodeRequestDto(Integer maxUses, Integer validForHours) {
        this(
                maxUses != null ? JsonNullable.of(maxUses) : JsonNullable.undefined(),
                validForHours != null ? JsonNullable.of(validForHours) : JsonNullable.undefined()
        );
    }

    public UpdateJoinCodeRequestDto {
        maxUses = maxUses == null ? JsonNullable.undefined() : maxUses;
        validForHours = validForHours == null ? JsonNullable.undefined() : validForHours;
    }
}
