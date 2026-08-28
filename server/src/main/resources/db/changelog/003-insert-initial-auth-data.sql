--liquibase formatted sql
--changeset David:003
/*
========================================================================================================================
                                          AUTHORIZATION REFERENCE & PERMISSION INDEX
========================================================================================================================

------------------------------------------------------------------------------------------------------------------------
1. ABSTRACT ACTION LEGEND
------------------------------------------------------------------------------------------------------------------------
Pattern: <action>:<resource>

  Action   | Definition
  ---------+------------------------------------------------------------------------------------------------------------
  create   | Provisions and persists a new entity instance. The caller becomes the recorded owner.
  update   | Modifies attributes or state of an existing entity. Scoped to the resource owner unless administrative.
  delete   | Permanently removes an entity. Scoped to the resource owner unless administrative.
  archive  | Soft-deactivates an entity without data loss, marking it inactive or read-only.
  moderate | Overrides ownership checks to delete or alter content created by other users for policy enforcement.
  pin      | Flags an entity as highlighted or sticky within its container.
  verify   | Grants platform-level verified status.

------------------------------------------------------------------------------------------------------------------------
2. STANDARDIZED ROLE-PERMISSION MATRIX
------------------------------------------------------------------------------------------------------------------------
  Permission                 | ROOT | ADMIN | COMMUNITY_OWNER | COMMUNITY_ADMIN | COMMUNITY_MEMBER | USER
  ---------------------------+------+-------+-----------------+-----------------+------------------+------
  update:userRole            |  X   |       |                 |                 |                  |
  delete:user                |  X   |       |                 |                 |                  |
  create:community           |  X   |   X   |                 |                 |                  |  X
  update:community           |  X   |   X   |        X        |                 |                  |
  delete:community           |  X   |   X   |        X        |                 |                  |
  create:joinCode            |  X   |   X   |        x        |        x        |                  |
  update:joinCode            |  X   |   X   |        X        |        x        |                  |
  delete:joinCode            |  X   |   X   |        X        |        x        |                  |
  verify:community           |  X   |   X   |                 |                 |                  |
  update:memberRole          |  X   |   X   |        X        |                 |                  |
  delete:member              |  X   |   X   |        X        |        X        |                  |
  create:studyYear           |  X   |   X   |        X        |        X        |                  |
  delete:studyYear           |  X   |   X   |        X        |                 |                  |
  create:course              |  X   |   X   |        X        |        X        |                  |
  update:course              |  X   |   X   |        X        |        X        |                  |
  archive:course             |  X   |   X   |        X        |        X        |                  |
  create:folder              |  X   |   X   |        X        |        X        |        X         |
  update:folder              |  X   |   X   |        X        |        X        |        X         |
  delete:folder              |  X   |   X   |        X        |        X        |        X         |
  moderate:folder            |  X   |   X   |        X        |        X        |                  |
  create:material            |  X   |   X   |        X        |        X        |        X         |
  update:material            |  X   |   X   |        X        |        X        |        X         |
  delete:material            |  X   |   X   |        X        |        X        |        X         |
  moderate:material          |  X   |   X   |        X        |        X        |                  |
  create:post                |  X   |   X   |        X        |        X        |        X         |
  update:post                |  X   |   X   |        X        |        X        |        X         |
  delete:post                |  X   |   X   |        X        |        X        |        X         |
  moderate:post              |  X   |   X   |        X        |        X        |                  |
  pin:post                   |  X   |   X   |        X        |        X        |                  |
  create:comment             |  X   |   X   |        X        |        X        |        X         |
  update:comment             |  X   |   X   |        X        |        X        |        X         |
  delete:comment             |  X   |   X   |        X        |        X        |        X         |
  moderate:comment           |  X   |   X   |        X        |        X        |                  |
  create:event               |  X   |   X   |        X        |        X        |        X         |
  update:event               |  X   |   X   |        X        |        X        |        X         |
  delete:event               |  X   |   X   |        X        |        X        |        X         |
  moderate:event             |  X   |   X   |        X        |        X        |                  |
  create:reminder            |  X   |   X   |        X        |        X        |        X         |
  delete:reminder            |  X   |   X   |        X        |        X        |        X         |
  create:teacher             |  X   |   X   |        X        |        X        |        X         |
  update:teacher             |  X   |   X   |        X        |        X        |                  |
  delete:teacher             |  X   |   X   |        X        |        X        |                  |
  create:teacherRating       |  X   |   X   |        X        |        X        |        X         |
  update:teacherRating       |  X   |   X   |        X        |        X        |        X         |
  delete:teacherRating       |  X   |   X   |        X        |        X        |        X         |
  moderate:teacherRating     |  X   |   X   |        X        |        X        |                  |
  create:ratingMetric        |  X   |   X   |                 |                 |                  |
  update:ratingMetric        |  X   |   X   |                 |                 |                  |
  delete:ratingMetric        |  X   |   X   |                 |                 |                  |
========================================================================================================================
*/

-- =====================================================================================================================
-- 1. INSERT PERMISSIONS
-- =====================================================================================================================
INSERT INTO PERMISSIONS (id, name, description) VALUES
-- Platform & user management
(gen_random_uuid(), 'update:userRole', 'Promote or demote platform administrators (ROOT only)'),
(gen_random_uuid(), 'delete:user', 'Delete any platform user account (ROOT only)'),
(gen_random_uuid(), 'create:community', 'Create and provision a new community'),
(gen_random_uuid(), 'update:community', 'Update community settings, branding, and description'),
(gen_random_uuid(), 'delete:community', 'Permanently delete a community'),
(gen_random_uuid(), 'verify:community', 'Toggle platform verified status on a community'),

-- Community membership
(gen_random_uuid(), 'create:joinCode', 'Generate an invite join code for a community'),
(gen_random_uuid(), 'delete:joinCode', 'Delete or revoke a join code for a community'),
(gen_random_uuid(), 'create:member', 'Directly add a user to a community without a join code'),
(gen_random_uuid(), 'update:memberRole', 'Promote or demote members to and from community administrator'),
(gen_random_uuid(), 'delete:member', 'Remove or kick a member from a community'),

-- Academic structure
(gen_random_uuid(), 'create:studyYear', 'Add a study year to a community'),
(gen_random_uuid(), 'delete:studyYear', 'Delete a study year from a community'),
(gen_random_uuid(), 'create:course', 'Create a course within a study year'),
(gen_random_uuid(), 'update:course', 'Update course details and assigned teachers'),
(gen_random_uuid(), 'archive:course', 'Archive or unarchive a course'),

-- Course content (folders and materials)
(gen_random_uuid(), 'create:folder', 'Create a folder inside a course'),
(gen_random_uuid(), 'update:folder', 'Rename own folder'),
(gen_random_uuid(), 'delete:folder', 'Delete own folder'),
(gen_random_uuid(), 'moderate:folder', 'Delete any folder within the community'),
(gen_random_uuid(), 'create:material', 'Upload a file or add a link resource to a course'),
(gen_random_uuid(), 'update:material', 'Update own material metadata or link URL'),
(gen_random_uuid(), 'delete:material', 'Delete own material'),
(gen_random_uuid(), 'moderate:material', 'Delete any material within the community'),

-- Discussions (posts and comments)
(gen_random_uuid(), 'create:post', 'Create a discussion post in a community or course'),
(gen_random_uuid(), 'update:post', 'Edit own post'),
(gen_random_uuid(), 'delete:post', 'Delete own post'),
(gen_random_uuid(), 'moderate:post', 'Delete any post within the community'),
(gen_random_uuid(), 'pin:post', 'Pin or unpin a post within the community'),
(gen_random_uuid(), 'create:comment', 'Comment on a post'),
(gen_random_uuid(), 'update:comment', 'Edit own comment'),
(gen_random_uuid(), 'delete:comment', 'Delete own comment'),
(gen_random_uuid(), 'moderate:comment', 'Delete any comment within the community'),

-- Calendar events & reminders
(gen_random_uuid(), 'create:event', 'Create an exam, lecture, or assignment event'),
(gen_random_uuid(), 'update:event', 'Edit own event'),
(gen_random_uuid(), 'delete:event', 'Delete own event'),
(gen_random_uuid(), 'moderate:event', 'Edit or delete any event within the community'),
(gen_random_uuid(), 'create:reminder', 'Set an offset reminder for an event'),
(gen_random_uuid(), 'delete:reminder', 'Delete own reminder'),

-- Teachers, ratings & metrics
(gen_random_uuid(), 'create:teacher', 'Create a teacher profile'),
(gen_random_uuid(), 'update:teacher', 'Edit teacher details and assignments'),
(gen_random_uuid(), 'delete:teacher', 'Delete or unlink a teacher'),
(gen_random_uuid(), 'create:teacherRating', 'Submit a teacher rating'),
(gen_random_uuid(), 'update:teacherRating', 'Edit own teacher rating'),
(gen_random_uuid(), 'delete:teacherRating', 'Delete own teacher rating'),
(gen_random_uuid(), 'moderate:teacherRating', 'Delete any teacher rating within the community'),
(gen_random_uuid(), 'create:ratingMetric', 'Create an evaluation metric for teachers'),
(gen_random_uuid(), 'update:ratingMetric', 'Edit a rating metric'),
(gen_random_uuid(), 'delete:ratingMetric', 'Delete a rating metric');

-- =====================================================================================================================
-- 2. INSERT ROLES
-- =====================================================================================================================
INSERT INTO ROLES (id, name, description) VALUES
(gen_random_uuid(), 'ROOT', 'Superadministrator with full platform and system access'),
(gen_random_uuid(), 'ADMIN', 'Platform administrator with access to manage communities, teachers, metrics, and global moderation'),
(gen_random_uuid(), 'USER', 'Default authenticated user role'),
(gen_random_uuid(), 'COMMUNITY_OWNER', 'Creator and owner of a community with full control over the community'),
(gen_random_uuid(), 'COMMUNITY_ADMIN', 'Community administrator and moderator managing academic structure, members, and content'),
(gen_random_uuid(), 'COMMUNITY_MEMBER', 'Active student member in a community with permissions to create content, posts, events, and rate teachers');

-- =====================================================================================================================
-- 3. INSERT ROLE_PERMISSIONS MAPPINGS
-- =====================================================================================================================

-- ROOT: All permissions (including update:userRole and delete:user)
INSERT INTO ROLE_PERMISSIONS (role_id, permission_id)
SELECT r.id, p.id
FROM ROLES r, PERMISSIONS p
WHERE r.name = 'ROOT';

-- ADMIN: All permissions except update:userRole and delete:user
INSERT INTO ROLE_PERMISSIONS (role_id, permission_id)
SELECT r.id, p.id
FROM ROLES r, PERMISSIONS p
WHERE r.name = 'ADMIN'
  AND p.name NOT IN ('update:userRole', 'delete:user');

-- COMMUNITY_OWNER: Full management of community, academic structure, moderation, content, and teachers
INSERT INTO ROLE_PERMISSIONS (role_id, permission_id)
SELECT r.id, p.id
FROM ROLES r, PERMISSIONS p
WHERE r.name = 'COMMUNITY_OWNER'
  AND p.name IN (
    'update:community',
    'delete:community',
    'create:joinCode',
    'delete:joinCode',
    'create:member',
    'update:memberRole',
    'delete:member',
    'create:studyYear',
    'delete:studyYear',
    'create:course',
    'update:course',
    'archive:course',
    'create:folder',
    'update:folder',
    'delete:folder',
    'moderate:folder',
    'create:material',
    'update:material',
    'delete:material',
    'moderate:material',
    'create:post',
    'update:post',
    'delete:post',
    'moderate:post',
    'pin:post',
    'create:comment',
    'update:comment',
    'delete:comment',
    'moderate:comment',
    'create:event',
    'update:event',
    'delete:event',
    'moderate:event',
    'create:reminder',
    'delete:reminder',
    'create:teacher',
    'update:teacher',
    'delete:teacher',
    'create:teacherRating',
    'update:teacherRating',
    'delete:teacherRating',
    'moderate:teacherRating'
  );

-- COMMUNITY_ADMIN: Academic structure, member removal, content moderation, discussions, events, and teachers
INSERT INTO ROLE_PERMISSIONS (role_id, permission_id)
SELECT r.id, p.id
FROM ROLES r, PERMISSIONS p
WHERE r.name = 'COMMUNITY_ADMIN'
  AND p.name IN (
    'create:joinCode',
    'delete:joinCode',
    'create:member',
    'delete:member',
    'create:studyYear',
    'create:course',
    'update:course',
    'archive:course',
    'create:folder',
    'update:folder',
    'delete:folder',
    'moderate:folder',
    'create:material',
    'update:material',
    'delete:material',
    'moderate:material',
    'create:post',
    'update:post',
    'delete:post',
    'moderate:post',
    'pin:post',
    'create:comment',
    'update:comment',
    'delete:comment',
    'moderate:comment',
    'create:event',
    'update:event',
    'delete:event',
    'moderate:event',
    'create:reminder',
    'delete:reminder',
    'create:teacher',
    'update:teacher',
    'delete:teacher',
    'create:teacherRating',
    'update:teacherRating',
    'delete:teacherRating',
    'moderate:teacherRating'
  );

-- COMMUNITY_MEMBER: Collaborative content/post creation, event scheduling, and teacher rating
INSERT INTO ROLE_PERMISSIONS (role_id, permission_id)
SELECT r.id, p.id
FROM ROLES r, PERMISSIONS p
WHERE r.name = 'COMMUNITY_MEMBER'
  AND p.name IN (
    'create:folder',
    'update:folder',
    'delete:folder',
    'create:material',
    'update:material',
    'delete:material',
    'create:post',
    'update:post',
    'delete:post',
    'create:comment',
    'update:comment',
    'delete:comment',
    'create:event',
    'update:event',
    'delete:event',
    'create:reminder',
    'delete:reminder',
    'create:teacher',
    'create:teacherRating',
    'update:teacherRating',
    'delete:teacherRating'
  );

-- USER: Platform user with permission to create a new community
INSERT INTO ROLE_PERMISSIONS (role_id, permission_id)
SELECT r.id, p.id
FROM ROLES r, PERMISSIONS p
WHERE r.name = 'USER'
  AND p.name IN (
    'create:community'
  );

-- Insert root user
INSERT INTO USERS (id,email,username,password,created_at,updated_at,role_id)
SELECT '1704ba53-75d6-478a-94e5-4618ac372540'::uuid,'iosubdavid77@gmail.com','iosub_david','$2a$10$Qs8AxLip4mLGbvv0asUghudNUPnxBVtADVkPGaGSVO7IJv6q5SCbm',now(),now(),id as role_id from roles where name = 'ROOT';

INSERT INTO USER_IDENTITIES (id,user_id,provider_subject,provider_email,provider,created_at) VALUES
    ('acf21e8d-3d53-4acf-87c9-d97eb5601111'::uuid,'1704ba53-75d6-478a-94e5-4618ac372540'::uuid,'iosubdavid77@gmail.com','iosubdavid77@gmail.com','LOCAL',now());
