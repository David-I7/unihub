--liquibase formatted sql
--changeset David:005

update communities set members_count = 1 where name = 'FMI - Informatica ID';