package com.unihub.app.dto.community.content.response;

import lombok.Builder;

@Builder
public record PresignedUploadUrlResponseDto(
        String uploadUrl,
        String storageKey
) {
}
