--liquibase formatted sql
--changeset David:002

CREATE TABLE TEACHERS(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name text not null,
    last_name text not null,
    average_rating real not null default 0.0 check (average_rating between 0 and 5),
    ratings_count int not null default 0,
    UNIQUE (last_name,first_name)
);

CREATE TABLE TEACHER_RATINGS(
    id bigserial PRIMARY KEY,
    user_id UUID REFERENCES USERS(id),
    teacher_id UUID REFERENCES TEACHERS(id) ON DELETE CASCADE,
    created_at timestamptz not null default now(),
    title text not null,
    description text,
    Unique (teacher_id, user_id)
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
    description text not null,
    members_count int not null default 0,
    owner_id UUID REFERENCES USERS(id),
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
   community_id UUID REFERENCES COMMUNITIES(id) ON DELETE CASCADE,
   created_at timestamptz not null default now(),
   UNIQUE (community_id, study_year_name)
);

CREATE TABLE COURSES(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name text not null,
    abbreviation text not null,
    community_id UUID REFERENCES COMMUNITIES(id) ON DELETE CASCADE,
    created_at timestamptz not null default now(),
    UNIQUE (community_id, name)
);

CREATE TYPE DIFFICULTY AS ENUM (
  'EASY', 'MEDIUM', 'HARD'
);

CREATE TABLE COURSE_OFFERINGS(
    id serial PRIMARY KEY,
    course_id UUID REFERENCES COURSES(id) ON DELETE CASCADE,
    study_year_id int REFERENCES STUDY_YEARS(id) ON DELETE CASCADE,
    semester int not null check (semester in (1,2)),
    description text,
    created_at timestamptz not null default now(),
    credit_points int not null,
    passing_difficulty DIFFICULTY not null,
    material_difficulty DIFFICULTY not null,
    UNIQUE (course_id, study_year_id)
);

CREATE TABLE COURSE_OFFERING_TEACHERS(
    course_offering_id int REFERENCES COURSE_OFFERINGS(id) ON DELETE CASCADE,
    teacher_id UUID REFERENCES TEACHERS(id) ON DELETE CASCADE,
    PRIMARY KEY (course_offering_id, teacher_id)
);

CREATE TABLE FOLDERS(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name text not null,
    owner_id UUID REFERENCES USERS(id) ON DELETE set null,
    course_offering_id int REFERENCES COURSE_OFFERINGS(id) ON DELETE CASCADE,
    parent_folder_id UUID REFERENCES FOLDERS(id) on delete cascade,
    created_at timestamptz not null default now()
);

CREATE TYPE COMMUNICATION_CHANNEL AS ENUM(
  'COURSE_OFFERING', 'COMMUNITY', 'GENERAL'
);

CREATE TABLE POSTS(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID not null REFERENCES USERS(id),
    course_offering_id int not null REFERENCES COURSE_OFFERINGS(id) ON DELETE CASCADE,
    channel COMMUNICATION_CHANNEL not null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    likes_count int not null default 0,
    pinned boolean not null default false,
    title text not null,
    description text not null
);

CREATE TABLE COMMENTS(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID not null REFERENCES USERS(id),
    post_id UUID not null REFERENCES POSTS(id) ON DELETE CASCADE,
    created_at timestamptz not null default now(),
    channel COMMUNICATION_CHANNEL not null,
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
    community_post_id UUID REFERENCES COMMUNITY_POSTS(id) ON DELETE CASCADE
);

CREATE TABLE COURSE_OFFERING_POSTS(
    post_id UUID PRIMARY KEY REFERENCES POSTS(id) ON DELETE CASCADE,
    course_offering_id UUID REFERENCES COURSE_OFFERINGS(id) ON DELETE CASCADE
);

CREATE TABLE COURSE_OFFERING_COMMENT(
    comment_id UUID PRIMARY KEY REFERENCES COMMENTS(id) ON DELETE CASCADE,
    course_offering_post_id UUID REFERENCES COURSE_OFFERING_POSTS(id) ON DELETE CASCADE
);

CREATE TABLE GENERAL_POSTS(
    post_id UUID PRIMARY KEY REFERENCES POSTS(id) ON DELETE CASCADE,
);

CREATE TABLE GENERAL_COMMENT(
    comment_id UUID PRIMARY KEY REFERENCES COMMENTS(id) ON DELETE CASCADE,
);

CREATE TYPE RESOURCE_TYPE AS ENUM(
  'MATERIAL_FILE','MATERIAL_LINK', 'ASSIGNMENT', 'EXAM', 'LECTURE'
);

CREATE TABLE RESOURCES(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    folder_id UUID not null REFERENCES FOLDERS(id) ON DELETE CASCADE,
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

CREATE TABLE ASSIGNMENTS(
    id UUID PRIMARY KEY REFERENCES RESOURCES(id) ON DELETE CASCADE,
    due_date timestamptz not null,
    estimated_duration_minutes int,
    grade_weight real not null default 0 check (grade_weight between 0 and 100)
);

CREATE TABLE EXAMS(
    id UUID PRIMARY KEY REFERENCES RESOURCES(id) ON DELETE CASCADE,
    scheduled_date timestamptz not null,
    estimated_duration_minutes int,
    grade_weight real not null check (grade_weight between 0 and 100)
);

CREATE TYPE LECTURE_LOCATION AS ENUM(
  'ONLINE', 'IN_PERSON', 'HYBRID'
);

CREATE TABLE LECTURES(
    id UUID PRIMARY KEY REFERENCES RESOURCES(id) ON DELETE CASCADE,
    start_time timestamptz not null,
    end_time timestamptz not null,
    location LECTURE_LOCATION
);

CREATE TABLE ATTACHMENTS(
    id UUID PRIMARY KEY REFERENCES RESOURCES(id) ON DELETE CASCADE,
    parent_resource_id UUID NOT NULL REFERENCES RESOURCES(id) ON DELETE CASCADE,
    resource_type RESOURCE_TYPE NOT NULL
);

CREATE TABLE community_announcements (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     community_id UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
     author_id UUID NOT NULL REFERENCES users(id),
     title TEXT NOT NULL,
     content TEXT NOT NULL,
     is_pinned BOOLEAN NOT NULL DEFAULT false,
     created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
     updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
     likes_count int not null default 0,
);

CREATE TABLE POST_LIKES(
    post_id UUID REFERENCES POSTS(id) ON DELETE CASCADE,
    user_id UUID REFERENCES USERS(id),
    PRIMARY KEY (post_id, user_id)
);




