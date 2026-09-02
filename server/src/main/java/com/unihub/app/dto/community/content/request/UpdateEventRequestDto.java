package com.unihub.app.dto.community.content.request;

import com.unihub.app.entities.community.content.EventLocation;
import com.unihub.app.entities.community.content.EventType;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.Builder;
import org.openapitools.jackson.nullable.JsonNullable;

@Builder
public record UpdateEventRequestDto(

        JsonNullable<@NotNull(message = "Title cannot be null") @Size(min = 1, max = 120, message = "Title must not exceed 120 characters") String> title,

        JsonNullable<@Size(max = 2000, message = "Description must not exceed 2000 characters") String> description,

        JsonNullable<@NotNull(message = "Event type cannot be null") EventType> type,

        JsonNullable<@Positive(message = "Duration must be positive") @Max(value = 168, message = "Duration cannot exceed 168 hours") Float> durationHours,

        JsonNullable<@NotNull(message = "Location cannot be null") EventLocation> location,

        JsonNullable<@Size(max = 500, message = "Location details must not exceed 500 characters") String> locationDetails
) {
        public UpdateEventRequestDto {
                title = title == null ? JsonNullable.undefined() : title.map(String::trim);
                description = description == null ? JsonNullable.undefined() : description.map(String::trim);
                type = type == null ? JsonNullable.undefined() : type;
                durationHours = durationHours == null ? JsonNullable.undefined() : durationHours;
                location = location == null ? JsonNullable.undefined() : location;
                locationDetails = locationDetails == null ? JsonNullable.undefined() : locationDetails.map(String::trim);
        }
}
