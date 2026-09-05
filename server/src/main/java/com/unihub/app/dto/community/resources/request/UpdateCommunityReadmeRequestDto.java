package com.unihub.app.dto.community.resources.request;

import jakarta.validation.constraints.Size;
import lombok.Builder;

@Builder
public record UpdateCommunityReadmeRequestDto(
        @Size(max = 50000, message = "Readme must not exceed 50000 characters")
        String readme
) {
        public UpdateCommunityReadmeRequestDto {
                readme = (readme != null && !readme.trim().isEmpty()) ? readme.trim() : null;
        }
}
