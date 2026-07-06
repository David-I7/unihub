--liquibase formatted sql
--changeset David:001

CREATE EXTENSION pgcrypto;

CREATE TABLE USERS(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email text not null UNIQUE,
    username text not null UNIQUE,
    password text default null,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

CREATE TYPE AUTH_PROVIDER AS ENUM (
    'GOOGLE'
);

CREATE TABLE USER_IDENTITIES(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID not null references users(id) on delete cascade,
    provider_subject text not null,
    provider_email text not null,
    provider AUTH_PROVIDER not null,
    created_at timestamptz default now(),
    CONSTRAINT unique_identity_provider_subject UNIQUE(provider, provider_subject)
);

CREATE TYPE SESSION_REVOKE_REASON AS ENUM(
   'LOGOUT',
   'SESSION_EXPIRED',
   'PASSWORD_RESET',
   'ROTATED',
   'REUSE_DETECTED'
);

CREATE TABLE SESSIONS(
    id UUID PRIMARY KEY default gen_random_uuid(),
    user_id UUID not null references users(id) on delete cascade,
    refresh_token text not null,
    expires_at timestamptz not null,
    revoked boolean default false,
    revoked_reason SESSION_REVOKE_REASON default null,
    CONSTRAINT UNIQUE unique_refresh_token(refresh_token)
);