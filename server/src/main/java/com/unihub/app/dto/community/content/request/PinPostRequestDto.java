package com.unihub.app.dto.community.content.request;

import jakarta.validation.constraints.NotNull;

public record PinPostRequestDto(
        @NotNull(message = "Pinned status must be specified")
        boolean pinned
) {
}
