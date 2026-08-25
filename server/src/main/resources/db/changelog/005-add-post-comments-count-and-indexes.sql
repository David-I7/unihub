--liquibase formatted sql
--changeset David:005

ALTER TABLE posts ADD COLUMN comments_count int NOT NULL DEFAULT 0;

CREATE INDEX idx_course_offerings_study_year_id ON course_offerings(study_year_id);
CREATE INDEX idx_community_posts_community_id ON community_posts(community_id);
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX idx_posts_pinned_created_at ON posts(pinned DESC, created_at DESC);
CREATE INDEX idx_comments_post_id_created_at ON comments(post_id, created_at ASC);
