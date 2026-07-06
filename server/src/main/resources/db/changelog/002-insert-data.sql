--liquibase formatted sql
--changeset David:002

insert into users (email,username) values ('david@gmail.com','david');
insert into user_identities (user_id,provider)
SELECT id,'LOCAL' as provider from users where username = 'david';