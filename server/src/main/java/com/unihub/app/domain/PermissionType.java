package com.unihub.app.domain;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum PermissionType {
    // Global
    MANAGE_USERS(Permissions.MANAGE_USERS),
    CREATE_COMMUNITY(Permissions.CREATE_COMMUNITY),
    MANAGE_TEACHERS(Permissions.MANAGE_TEACHERS),
    MANAGE_RATING_METRICS(Permissions.MANAGE_RATING_METRICS),
    MODERATE_TEACHER_RATINGS(Permissions.MODERATE_TEACHER_RATINGS),

    // Community Admin
    MANAGE_COMMUNITY(Permissions.MANAGE_COMMUNITY),
    MANAGE_ACADEMIC_STRUCTURE(Permissions.MANAGE_ACADEMIC_STRUCTURE),
    MANAGE_COMMUNITY_MEMBERS(Permissions.MANAGE_COMMUNITY_MEMBERS),
    MODERATE_COMMUNITY(Permissions.MODERATE_COMMUNITY),

    // Collaboration
    MANAGE_CONTENT(Permissions.MANAGE_CONTENT),
    RATE_TEACHER(Permissions.RATE_TEACHER);

    private final String value;
}