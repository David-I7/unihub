package com.unihub.app.dto;

import com.unihub.app.domain.RoleType;

import java.util.UUID;

public record UserDto(UUID id, String email, String username, boolean emailVerified, RoleType role) {
}
