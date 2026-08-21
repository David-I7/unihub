package com.unihub.app.domain;

public final class Permissions {
    private Permissions() {}

    // Global
    public static final String MANAGE_USERS = "manage:users";
    public static final String CREATE_COMMUNITY = "create:community";
    public static final String MANAGE_TEACHERS = "manage:teachers";
    public static final String MANAGE_RATING_METRICS = "manage:ratingMetrics";
    public static final String MODERATE_TEACHER_RATINGS = "moderate:teacherRatings";

    // Community Admin
    public static final String MANAGE_COMMUNITY = "manage:community";
    public static final String MANAGE_ACADEMIC_STRUCTURE = "manage:academicStructure";
    public static final String MANAGE_COMMUNITY_MEMBERS = "manage:communityMembers";
    public static final String MODERATE_COMMUNITY = "moderate:community";

    // Community Collaboration
    public static final String MANAGE_CONTENT = "manage:content";
    public static final String RATE_TEACHER = "rate:teacher";
}
