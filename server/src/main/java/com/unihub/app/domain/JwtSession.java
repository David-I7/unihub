package com.unihub.app.domain;

import com.unihub.app.dto.UserDto;
import org.springframework.http.ResponseCookie;

public record JwtSession(UserDto userDto, String accessToken, ResponseCookie cookie) {
}
