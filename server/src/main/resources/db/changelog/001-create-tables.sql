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
    'GOOGLE','LOCAL'
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

CREATE TABLE SESSIONS(
    id UUID PRIMARY KEY default gen_random_uuid(),
    user_id UUID not null references users(id) on delete cascade,
    initial_session_id UUID references sessions(id) on delete cascade default null,
    refresh_token text not null,
    expires_at timestamptz not null,
    revoked boolean default false,
    CONSTRAINT unique_refresh_token UNIQUE(refresh_token)
);