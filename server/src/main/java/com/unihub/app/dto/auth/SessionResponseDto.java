package com.unihub.app.dto.auth;

import com.unihub.app.dto.UserDto;

public record SessionResponseDto(UserDto user, String accessToken) {
}
