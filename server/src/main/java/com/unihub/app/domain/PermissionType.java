package com.unihub.app.domain;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum PermissionType {
    // Platform & User Management
    UPDATE_USER_ROLE(Permissions.UPDATE_USER_ROLE),
    DELETE_USER(Permissions.DELETE_USER),
    CREATE_COMMUNITY(Permissions.CREATE_COMMUNITY),
    UPDATE_COMMUNITY(Permissions.UPDATE_COMMUNITY),
    DELETE_COMMUNITY(Permissions.DELETE_COMMUNITY),
    VERIFY_COMMUNITY(Permissions.VERIFY_COMMUNITY),

    // Community Membership
    UPDATE_MEMBER_ROLE(Permissions.UPDATE_MEMBER_ROLE),
    DELETE_MEMBER(Permissions.DELETE_MEMBER),

    // Academic Structure
    CREATE_STUDY_YEAR(Permissions.CREATE_STUDY_YEAR),
    DELETE_STUDY_YEAR(Permissions.DELETE_STUDY_YEAR),
    CREATE_COURSE(Permissions.CREATE_COURSE),
    UPDATE_COURSE(Permissions.UPDATE_COURSE),
    ARCHIVE_COURSE(Permissions.ARCHIVE_COURSE),

    // Course Content (Folders & Materials)
    CREATE_FOLDER(Permissions.CREATE_FOLDER),
    UPDATE_FOLDER(Permissions.UPDATE_FOLDER),
    DELETE_FOLDER(Permissions.DELETE_FOLDER),
    MODERATE_FOLDER(Permissions.MODERATE_FOLDER),
    CREATE_MATERIAL(Permissions.CREATE_MATERIAL),
    UPDATE_MATERIAL(Permissions.UPDATE_MATERIAL),
    DELETE_MATERIAL(Permissions.DELETE_MATERIAL),
    MODERATE_MATERIAL(Permissions.MODERATE_MATERIAL),

    // Discussions (Posts & Comments)
    CREATE_POST(Permissions.CREATE_POST),
    UPDATE_POST(Permissions.UPDATE_POST),
    DELETE_POST(Permissions.DELETE_POST),
    MODERATE_POST(Permissions.MODERATE_POST),
    PIN_POST(Permissions.PIN_POST),
    CREATE_COMMENT(Permissions.CREATE_COMMENT),
    UPDATE_COMMENT(Permissions.UPDATE_COMMENT),
    DELETE_COMMENT(Permissions.DELETE_COMMENT),
    MODERATE_COMMENT(Permissions.MODERATE_COMMENT),

    // Calendar & Reminders
    CREATE_EVENT(Permissions.CREATE_EVENT),
    UPDATE_EVENT(Permissions.UPDATE_EVENT),
    DELETE_EVENT(Permissions.DELETE_EVENT),
    MODERATE_EVENT(Permissions.MODERATE_EVENT),
    CREATE_REMINDER(Permissions.CREATE_REMINDER),
    DELETE_REMINDER(Permissions.DELETE_REMINDER),

    // Teachers, Ratings & Metrics
    CREATE_TEACHER(Permissions.CREATE_TEACHER),
    UPDATE_TEACHER(Permissions.UPDATE_TEACHER),
    DELETE_TEACHER(Permissions.DELETE_TEACHER),
    CREATE_TEACHER_RATING(Permissions.CREATE_TEACHER_RATING),
    UPDATE_TEACHER_RATING(Permissions.UPDATE_TEACHER_RATING),
    DELETE_TEACHER_RATING(Permissions.DELETE_TEACHER_RATING),
    MODERATE_TEACHER_RATING(Permissions.MODERATE_TEACHER_RATING),
    CREATE_RATING_METRIC(Permissions.CREATE_RATING_METRIC),
    UPDATE_RATING_METRIC(Permissions.UPDATE_RATING_METRIC),
    DELETE_RATING_METRIC(Permissions.DELETE_RATING_METRIC);

    private final String value;
}