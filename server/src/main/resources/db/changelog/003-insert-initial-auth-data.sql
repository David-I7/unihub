--liquibase formatted sql
--changeset David:003
/*
========================================================================================================================
                                          AUTHORIZATION REFERENCE & PERMISSION INDEX
========================================================================================================================

------------------------------------------------------------------------------------------------------------------------
1. PERMISSIONS INDEX
------------------------------------------------------------------------------------------------------------------------

* GLOBAL / PLATFORM SCOPE:
  - manage:users
    Allows managing global platform users: promoting users to platform ADMIN, revoking administrator privileges,
    and deleting user accounts. Restricted exclusively to ROOT.
  - create:community
    Allows provisioning and creating new communities on the platform.
  - manage:teachers
    Allows creating, editing, and deleting global professor/teacher profiles across the platform.
  - manage:ratingMetrics
    Allows configuring, creating, updating, and removing the evaluation criteria and rating metrics for teachers.
  - moderate:teacherRatings
    Allows platform administrators to moderate, prune, or delete defamatory, abusive, or invalid teacher reviews.

* COMMUNITY ADMINISTRATION SCOPE:
  - manage:community
    Allows updating community metadata (name, description, branding) and deleting the community.
  - manage:academicStructure
    Allows configuring the academic organization within a community: creating, updating, and deleting study years,
    courses, course offerings (semesters), and assigning/unassigning teachers to specific course offerings.
  - manage:communityMembers
    Allows inviting, accepting, promoting, demoting, or removing members from a community.
  - moderate:community
    Allows community moderators/admins to moderate student discussions, remove flagged posts, and take down abusive content.

* COMMUNITY COLLABORATION & INTERACTION SCOPE:
  - manage:content
    Full collaborative content permission for student members and administrators. Allows creating, editing, organizing,
    and deleting course content within a community, including:
      * Folders (subfolder trees)
      * Materials (external links, GitHub repos, Drive links, video links, uploaded files, attachments)
      * Assignments (project deadlines, weights, estimated durations)
      * Exams (written exams, oral presentations, scheduled dates, weights)
      * Lectures (start/end times, locations)
      * Posts (discussion posts and course threads)
  - rate:teacher
    Allows submitting qualitative and quantitative ratings for teachers.

------------------------------------------------------------------------------------------------------------------------
2. ROLE-PERMISSION MATRIX
------------------------------------------------------------------------------------------------------------------------
  Permission                 | ROOT | ADMIN | COMMUNITY_OWNER | COMMUNITY_ADMIN | COMMUNITY_MEMBER | USER
  ---------------------------+------+-------+-----------------+-----------------+------------------+------
  manage:users               |  X   |       |                 |                 |                  |
  create:community           |  X   |   X   |                 |                 |                  |
  manage:teachers            |  X   |   X   |                 |                 |                  |
  manage:ratingMetrics       |  X   |   X   |                 |                 |                  |
  moderate:teacherRatings    |  X   |   X   |                 |                 |                  |
  manage:community           |  X   |   X   |        X        |                 |                  |
  manage:academicStructure   |  X   |   X   |        X        |        X        |                  |
  manage:communityMembers    |  X   |   X   |        X        |        X        |                  |
  moderate:community         |  X   |   X   |        X        |        X        |                  |
  manage:content             |  X   |   X   |        X        |        X        |        X         |
  rate:teacher               |  X   |   X   |        X        |        X        |        X         |
========================================================================================================================
*/

-- =====================================================================================================================
-- 1. INSERT PERMISSIONS
-- =====================================================================================================================
INSERT INTO PERMISSIONS (id, name, description) VALUES
(gen_random_uuid(), 'manage:users', 'Manage global users, assign or revoke platform administrator privileges, and delete accounts'),
(gen_random_uuid(), 'create:community', 'Create and provision new communities'),
(gen_random_uuid(), 'manage:teachers', 'Create, update, and delete global teacher profiles'),
(gen_random_uuid(), 'manage:ratingMetrics', 'Create, update, and delete teacher rating criteria and metrics'),
(gen_random_uuid(), 'moderate:teacherRatings', 'Moderate and delete teacher reviews and ratings across the platform'),
(gen_random_uuid(), 'manage:community', 'Update community details, settings, and delete community'),
(gen_random_uuid(), 'manage:academicStructure', 'Manage study years, courses, course offerings, and teacher assignments'),
(gen_random_uuid(), 'manage:communityMembers', 'Invite, manage, adjust roles, or remove members from a community'),
(gen_random_uuid(), 'moderate:community', 'Moderate community discussions, delete abusive content, and manage member posts'),
(gen_random_uuid(), 'manage:content', 'Create, edit, and delete course content including folders, materials, assignments, exams, lectures, and posts'),
(gen_random_uuid(), 'rate:teacher', 'Submit ratings and reviews for teachers associated with user communities');

-- =====================================================================================================================
-- 2. INSERT ROLES
-- =====================================================================================================================
INSERT INTO ROLES (id, name, description) VALUES
(gen_random_uuid(), 'ROOT', 'Superadministrator with full platform and system access'),
(gen_random_uuid(), 'ADMIN', 'Platform administrator with access to manage communities, teachers, metrics, and global moderation'),
(gen_random_uuid(), 'USER', 'Default authenticated user role'),
(gen_random_uuid(), 'COMMUNITY_OWNER', 'Creator and owner of a community with full control over the community'),
(gen_random_uuid(), 'COMMUNITY_ADMIN', 'Community administrator and moderator managing academic structure, members, and content'),
(gen_random_uuid(), 'COMMUNITY_MEMBER', 'Active student member in a community with permissions to create/manage content, posts, and rate teachers');

-- =====================================================================================================================
-- 3. INSERT ROLE_PERMISSIONS MAPPINGS
-- =====================================================================================================================

-- ROOT: All permissions (including manage:users)
INSERT INTO ROLE_PERMISSIONS (role_id, permission_id)
SELECT r.id, p.id
FROM ROLES r, PERMISSIONS p
WHERE r.name = 'ROOT';

-- ADMIN: All platform and community management permissions (except manage:users)
INSERT INTO ROLE_PERMISSIONS (role_id, permission_id)
SELECT r.id, p.id
FROM ROLES r, PERMISSIONS p
WHERE r.name = 'ADMIN'
  AND p.name != 'manage:users';

-- COMMUNITY_OWNER: Full authority inside the community
INSERT INTO ROLE_PERMISSIONS (role_id, permission_id)
SELECT r.id, p.id
FROM ROLES r, PERMISSIONS p
WHERE r.name = 'COMMUNITY_OWNER'
  AND p.name IN (
    'manage:community',
    'manage:academicStructure',
    'manage:communityMembers',
    'moderate:community',
    'manage:content',
    'rate:teacher'
  );

-- COMMUNITY_ADMIN: Academic structure, member management, moderation, and content management
INSERT INTO ROLE_PERMISSIONS (role_id, permission_id)
SELECT r.id, p.id
FROM ROLES r, PERMISSIONS p
WHERE r.name = 'COMMUNITY_ADMIN'
  AND p.name IN (
    'manage:academicStructure',
    'manage:communityMembers',
    'moderate:community',
    'manage:content',
    'rate:teacher'
  );

-- COMMUNITY_MEMBER: Collaborative content/post management and teacher ratings
INSERT INTO ROLE_PERMISSIONS (role_id, permission_id)
SELECT r.id, p.id
FROM ROLES r, PERMISSIONS p
WHERE r.name = 'COMMUNITY_MEMBER'
  AND p.name IN (
    'manage:content',
    'rate:teacher'
  );

--Inset root user
INSERT INTO USERS (id,email,username,password,created_at,updated_at,role_id)
SELECT '1704ba53-75d6-478a-94e5-4618ac372540'::uuid,'iosubdavid77@gmail.com','iosub_david','$2a$10$Qs8AxLip4mLGbvv0asUghudNUPnxBVtADVkPGaGSVO7IJv6q5SCbm',now(),now(),id as role_id from roles where name = 'ROOT';

INSERT INTO USER_IDENTITIES (id,user_id,provider_subject,provider_email,provider,created_at) VALUES
    ('acf21e8d-3d53-4acf-87c9-d97eb5601111'::uuid,'1704ba53-75d6-478a-94e5-4618ac372540'::uuid,'iosubdavid77@gmail.com','iosubdavid77@gmail.com','LOCAL',now());
