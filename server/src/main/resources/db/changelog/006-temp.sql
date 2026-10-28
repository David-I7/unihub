insert into role_permissions values
    ((select id from roles where name = 'COMMUNITY_MEMBER'), (select id from permissions where name = 'update:teacher'));