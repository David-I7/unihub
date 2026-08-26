--liquibase formatted sql
--changeset David:002 validCheckSum:9:8afdd2a7dff1bec50cd9d94e965a48f7 validCheckSum:9:734fa4fc2c06994d7971b9362e17be77

CREATE TABLE TEACHERS(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name text not null,
    last_name text not null,
    average_rating real not null default 0.0 check (average_rating between 0 and 5),
    ratings_count int not null default 0,
    created_at timestamptz not null default now(),
    UNIQUE (last_name,first_name)
);

CREATE TABLE TEACHER_RATINGS(
    id bigserial PRIMARY KEY,
    user_id UUID not null REFERENCES USERS(id),
    teacher_id UUID not null REFERENCES TEACHERS(id) ON DELETE CASCADE,
    created_at timestamptz not null default now(),
    title text not null,
    description text,
    UNIQUE (teacher_id, user_id)
);

CREATE TABLE RATING_METRICS(
  id serial PRIMARY KEY,
  name text not null UNIQUE,
  description text
);

CREATE TABLE TEACHER_RATING_VALUES(
  teacher_rating_id bigint not null REFERENCES TEACHER_RATINGS(id) ON DELETE CASCADE,
  rating_metric_id int not null REFERENCES RATING_METRICS(id) ON DELETE CASCADE,
  value int not null check (value in (1,2,3,4,5)),
  PRIMARY KEY (teacher_rating_id, rating_metric_id)
);

CREATE TABLE COMMUNITIES(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name text not null UNIQUE,
    slug text not null UNIQUE,
    description text not null,
    members_count int not null default 0,
    owner_id UUID not null REFERENCES USERS(id),
    background_color text not null default '#2563eb',
    verified boolean not null default false,
    created_at timestamptz not null default now()
);

CREATE TABLE COMMUNITY_MEMBERS(
   community_id UUID REFERENCES COMMUNITIES(id) ON DELETE CASCADE,
   user_id UUID REFERENCES USERS(id) ON DELETE CASCADE,
   role_id UUID not null REFERENCES ROLES(id),
   joined_at timestamptz not null default now(),
   PRIMARY KEY (community_id, user_id)
);

CREATE TYPE STUDY_YEAR_NAME AS ENUM(
  'YEAR_1', 'YEAR_2', 'YEAR_3','YEAR_4'
);

CREATE TABLE STUDY_YEARS(
   id serial PRIMARY KEY,
   study_year_name STUDY_YEAR_NAME not null,
   community_id UUID not null REFERENCES COMMUNITIES(id) ON DELETE CASCADE,
   created_at timestamptz not null default now(),
   UNIQUE (community_id, study_year_name)
);

CREATE TABLE COURSES(
    id bigserial PRIMARY KEY,
    name text not null,
    slug text not null,
    abbreviation text not null,
    study_year_id int not null REFERENCES STUDY_YEARS(id) ON DELETE CASCADE,
    semester int not null check (semester in (1,2)),
    archived boolean not null default false,
    credit_points int not null default 5,
    description text,
    created_at timestamptz not null default now(),
    UNIQUE (study_year_id, name),
    UNIQUE (study_year_id, slug)
);

CREATE TABLE COURSE_TEACHERS(
    course_id bigint REFERENCES COURSES(id) ON DELETE CASCADE,
    teacher_id UUID REFERENCES TEACHERS(id) ON DELETE CASCADE,
    PRIMARY KEY (course_id, teacher_id)
);

CREATE TABLE TEACHER_COMMUNITIES(
    teacher_id UUID NOT NULL REFERENCES TEACHERS(id) ON DELETE CASCADE,
    community_id UUID NOT NULL REFERENCES COMMUNITIES(id) ON DELETE CASCADE,
    created_at timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY (teacher_id, community_id)
);

CREATE TABLE FOLDERS(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name text not null,
    owner_id UUID REFERENCES USERS(id) ON DELETE set null,
    course_id bigint not null REFERENCES COURSES(id) ON DELETE CASCADE,
    parent_folder_id UUID REFERENCES FOLDERS(id) ON DELETE CASCADE,
    created_at timestamptz not null default now()
);

CREATE TYPE COMMUNICATION_CHANNEL AS ENUM(
  'COURSE', 'COMMUNITY', 'GENERAL'
);

CREATE TABLE POSTS(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID not null REFERENCES USERS(id),
    channel COMMUNICATION_CHANNEL not null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    likes_count int not null default 0,
    comments_count int not null default 0,
    pinned boolean not null default false,
    title text not null,
    description text not null
);

CREATE TABLE COMMENTS(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID not null REFERENCES USERS(id),
    post_id UUID not null REFERENCES POSTS(id) ON DELETE CASCADE,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    content text not null
);

CREATE TABLE POST_LIKES(
    post_id UUID REFERENCES POSTS(id) ON DELETE CASCADE,
    user_id UUID REFERENCES USERS(id),
    PRIMARY KEY (post_id, user_id)
);

CREATE TABLE COMMUNITY_POSTS(
    post_id UUID PRIMARY KEY REFERENCES POSTS(id) ON DELETE CASCADE,
    community_id UUID REFERENCES COMMUNITIES(id) ON DELETE CASCADE
);

CREATE TABLE COMMUNITY_COMMENT(
    comment_id UUID PRIMARY KEY REFERENCES COMMENTS(id) ON DELETE CASCADE,
    community_post_id UUID REFERENCES COMMUNITY_POSTS(post_id) ON DELETE CASCADE
);

CREATE TABLE COURSE_POSTS(
    post_id UUID PRIMARY KEY REFERENCES POSTS(id) ON DELETE CASCADE,
    course_id bigint REFERENCES COURSES(id) ON DELETE CASCADE
);

CREATE TABLE COURSE_COMMENT(
    comment_id UUID PRIMARY KEY REFERENCES COMMENTS(id) ON DELETE CASCADE,
    course_post_id UUID REFERENCES COURSE_POSTS(post_id) ON DELETE CASCADE
);

CREATE TYPE RESOURCE_TYPE AS ENUM(
  'MATERIAL_FILE', 'MATERIAL_LINK'
);

CREATE TABLE RESOURCES(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id bigint not null REFERENCES COURSES(id) ON DELETE CASCADE,
    folder_id UUID REFERENCES FOLDERS(id) ON DELETE CASCADE,
    owner_id UUID not null REFERENCES USERS(id) ON DELETE CASCADE,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    title text not null,
    type RESOURCE_TYPE not null,
    description text
);

CREATE TABLE MATERIAL_FILES(
    id UUID PRIMARY KEY REFERENCES RESOURCES(id) ON DELETE CASCADE,
    storage_key text not null,
    media_type text not null,
    size bigint not null
);

CREATE TYPE MATERIAL_LINK_TYPE AS ENUM(
  'VIDEO', 'DRIVE', 'GITHUB', 'OTHER'
);

CREATE TABLE MATERIAL_LINKS(
    id UUID PRIMARY KEY REFERENCES RESOURCES(id) ON DELETE CASCADE,
    url text not null,
    link_type MATERIAL_LINK_TYPE not null
);

CREATE TYPE EVENT_TYPE AS ENUM(
  'EXAM', 'LECTURE', 'ASSIGNMENT'
);

CREATE TYPE EVENT_LOCATION AS ENUM(
  'ONLINE', 'IN_PERSON', 'HYBRID'
);

CREATE TABLE EVENTS(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title text not null,
    description text,
    type EVENT_TYPE not null,
    start_time timestamptz not null,
    end_time timestamptz,
    duration_minutes int,
    location EVENT_LOCATION not null,
    location_details text,
    course_id bigint not null REFERENCES COURSES(id) ON DELETE CASCADE,
    community_id UUID not null REFERENCES COMMUNITIES(id) ON DELETE CASCADE,
    owner_id UUID not null REFERENCES USERS(id) ON DELETE CASCADE,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

CREATE TYPE REMINDER_STATUS AS ENUM(
  'PENDING', 'SENT', 'CANCELLED'
);

CREATE TABLE EVENT_REMINDERS(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID not null REFERENCES USERS(id) ON DELETE CASCADE,
    event_id UUID not null REFERENCES EVENTS(id) ON DELETE CASCADE,
    offset_minutes int not null,
    remind_at timestamptz not null,
    status REMINDER_STATUS not null default 'PENDING',
    created_at timestamptz not null default now(),
    UNIQUE (user_id, event_id, offset_minutes)
);

CREATE TYPE NOTIFICATION_TYPE AS ENUM(
  'EVENT_REMINDER', 'EVENT_UPDATED', 'EVENT_CANCELLED', 'SYSTEM'
);

CREATE TABLE NOTIFICATIONS(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID not null REFERENCES USERS(id) ON DELETE CASCADE,
    title text not null,
    message text not null,
    type NOTIFICATION_TYPE not null,
    event_id UUID REFERENCES EVENTS(id) ON DELETE SET NULL,
    is_read boolean not null default false,
    created_at timestamptz not null default now()
);

-- Indexes
CREATE INDEX idx_courses_study_year_archived ON courses(study_year_id, archived);
CREATE INDEX idx_teacher_communities_community ON teacher_communities(community_id, teacher_id);
CREATE INDEX idx_community_posts_community_id ON community_posts(community_id);
CREATE INDEX idx_course_posts_course_id ON course_posts(course_id);
CREATE INDEX idx_posts_pinned_created_at ON posts(pinned DESC, created_at DESC);
CREATE INDEX idx_comments_post_id_created_at ON comments(post_id, created_at ASC);
CREATE INDEX idx_resources_course_folder_created_at ON resources(course_id, folder_id, created_at DESC);
CREATE INDEX idx_folders_course_parent_name ON folders(course_id, parent_folder_id, name ASC);
CREATE INDEX idx_events_community_start_time ON events(community_id, start_time ASC, type);
CREATE INDEX idx_events_course_start_time ON events(course_id, start_time ASC, type);
CREATE INDEX idx_event_reminders_pending_remind_at ON event_reminders(status, remind_at ASC);
CREATE INDEX idx_notifications_user_unread ON notifications(user_id, is_read, created_at DESC);
