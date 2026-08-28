--liquibase formatted sql
--changeset David:005

CREATE TABLE COMMUNITY_JOIN_CODES(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    community_id UUID NOT NULL REFERENCES COMMUNITIES(id) ON DELETE CASCADE,
    code VARCHAR(8) NOT NULL UNIQUE,
    created_by UUID REFERENCES USERS(id) ON DELETE CASCADE,
    max_uses INTEGER DEFAULT NULL,
    uses_count INTEGER NOT NULL DEFAULT 0,
    expires_at TIMESTAMPTZ DEFAULT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_community_join_codes_code ON COMMUNITY_JOIN_CODES(code);
CREATE INDEX idx_community_join_codes_community_id ON COMMUNITY_JOIN_CODES(community_id);
