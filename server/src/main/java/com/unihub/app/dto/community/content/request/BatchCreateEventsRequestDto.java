package com.unihub.app.dto.community.content.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import lombok.Builder;

import java.util.List;

@Builder
public record BatchCreateEventsRequestDto(
        @NotBlank(message = "Community slug is required")
        String communitySlug,

        @NotEmpty(message = "Events list cannot be empty")
        @Size(max = 200, message = "Cannot import more than 200 events in a single batch")
        List<@Valid BatchEventItemDto> events
) {
    public BatchCreateEventsRequestDto {
        communitySlug = communitySlug != null ? communitySlug.trim() : communitySlug;
    }
}
