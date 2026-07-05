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
    'LOCAL',
    'GOOGLE'
);

CREATE TABLE USER_IDENTITIES(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID not null references users(id),
    provider AUTH_PROVIDER not null,
    created_at timestamptz default now(),
    CONSTRAINT unique_indentity UNIQUE(user_id, provider)
);

CREATE TABLE REFRESH_TOKENS(
    id UUID PRIMARY KEY default gen_random_uuid(),
    user_id UUID not null references users(id),
    token_hash text not null,
    expires_at timestamptz not null,
    revoked_at timestamptz default null
);