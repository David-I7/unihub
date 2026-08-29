package com.unihub.app.dto.user.request;

import com.unihub.app.validation.Username;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record UpdateUserProfileRequestDto(
        @Username
        String username
) {
}
