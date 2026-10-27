--liquibase formatted sql
--changeset David:006

ALTER TABLE SESSIONS
    ADD COLUMN revoked_at timestamptz DEFAULT NULL,
    ADD COLUMN replaced_by_id UUID DEFAULT NULL REFERENCES SESSIONS(id) ON DELETE SET NULL;
