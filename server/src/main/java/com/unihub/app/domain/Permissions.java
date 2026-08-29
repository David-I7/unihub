package com.unihub.app.domain;

public final class Permissions {
    private Permissions() {}

    // Platform & User Management
    public static final String UPDATE_USER_ROLE = "update:userRole";
    public static final String DELETE_USER = "delete:user";
    public static final String CREATE_COMMUNITY = "create:community";
    public static final String UPDATE_COMMUNITY = "update:community";
    public static final String DELETE_COMMUNITY = "delete:community";
    public static final String VERIFY_COMMUNITY = "verify:community";

    // Community Membership
    public static final String CREATE_JOIN_CODE = "create:joinCode";
    public static final String UPDATE_JOIN_CODE = "update:joinCode";
    public static final String DELETE_JOIN_CODE = "delete:joinCode";
    public static final String CREATE_MEMBER = "create:member";
    public static final String UPDATE_MEMBER_ROLE = "update:memberRole";
    public static final String DELETE_MEMBER = "delete:member";

    // Academic Structure
    public static final String CREATE_STUDY_YEAR = "create:studyYear";
    public static final String DELETE_STUDY_YEAR = "delete:studyYear";
    public static final String CREATE_COURSE = "create:course";
    public static final String UPDATE_COURSE = "update:course";
    public static final String ARCHIVE_COURSE = "archive:course";

    // Course Content (Folders & Materials)
    public static final String CREATE_FOLDER = "create:folder";
    public static final String UPDATE_FOLDER = "update:folder";
    public static final String DELETE_FOLDER = "delete:folder";
    public static final String MODERATE_FOLDER = "moderate:folder";
    public static final String CREATE_MATERIAL = "create:material";
    public static final String UPDATE_MATERIAL = "update:material";
    public static final String DELETE_MATERIAL = "delete:material";
    public static final String MODERATE_MATERIAL = "moderate:material";

    // Discussions (Posts & Comments)
    public static final String CREATE_POST = "create:post";
    public static final String UPDATE_POST = "update:post";
    public static final String DELETE_POST = "delete:post";
    public static final String MODERATE_POST = "moderate:post";
    public static final String PIN_POST = "pin:post";
    public static final String CREATE_COMMENT = "create:comment";
    public static final String UPDATE_COMMENT = "update:comment";
    public static final String DELETE_COMMENT = "delete:comment";
    public static final String MODERATE_COMMENT = "moderate:comment";

    // Calendar & Reminders
    public static final String CREATE_EVENT = "create:event";
    public static final String UPDATE_EVENT = "update:event";
    public static final String DELETE_EVENT = "delete:event";
    public static final String MODERATE_EVENT = "moderate:event";
    public static final String CREATE_REMINDER = "create:reminder";
    public static final String DELETE_REMINDER = "delete:reminder";

    // Teachers, Ratings & Metrics
    public static final String CREATE_TEACHER = "create:teacher";
    public static final String UPDATE_TEACHER = "update:teacher";
    public static final String DELETE_TEACHER = "delete:teacher";
    public static final String CREATE_TEACHER_RATING = "create:teacherRating";
    public static final String UPDATE_TEACHER_RATING = "update:teacherRating";
    public static final String DELETE_TEACHER_RATING = "delete:teacherRating";
    public static final String MODERATE_TEACHER_RATING = "moderate:teacherRating";
    public static final String CREATE_RATING_METRIC = "create:ratingMetric";
    public static final String UPDATE_RATING_METRIC = "update:ratingMetric";
    public static final String DELETE_RATING_METRIC = "delete:ratingMetric";
}
