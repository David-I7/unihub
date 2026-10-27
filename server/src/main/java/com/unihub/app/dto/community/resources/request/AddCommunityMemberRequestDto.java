package com.unihub.app.dto.community.resources.request;

import com.unihub.app.domain.RoleType;
import com.unihub.app.validation.Username;
import jakarta.validation.constraints.NotBlank;

public record AddCommunityMemberRequestDto(
        @NotBlank(message = "Username is required")
        @Username
        String username,

        RoleType role
) {
        public AddCommunityMemberRequestDto{
                if (username != null){
                        username = username.trim().toLowerCase();
                }
        }
}
