--liquibase formatted sql
--changeset David:005

-- =====================================================================================================================
-- 1. INSERT MOCK USERS & IDENTITIES (24 Fake Users)
-- =====================================================================================================================
INSERT INTO USERS (id, email, username, password, email_verified, role_id, created_at, updated_at)
SELECT u.id, u.email, u.username, '$2a$10$Qs8AxLip4mLGbvv0asUghudNUPnxBVtADVkPGaGSVO7IJv6q5SCbm', true, r.id, now() - (u.idx || ' days')::interval, now() - (u.idx || ' days')::interval
FROM (VALUES
    ('f0000001-0000-0000-0000-000000000001'::uuid, 'alex.popa@mock.unihub.ro', 'alex_popa', 24),
    ('f0000001-0000-0000-0000-000000000002'::uuid, 'maria.ionescu@mock.unihub.ro', 'maria_ionescu', 23),
    ('f0000001-0000-0000-0000-000000000003'::uuid, 'andrei.radu@mock.unihub.ro', 'andrei_radu', 22),
    ('f0000001-0000-0000-0000-000000000004'::uuid, 'elena.dumitru@mock.unihub.ro', 'elena_dumitru', 21),
    ('f0000001-0000-0000-0000-000000000005'::uuid, 'vlad.stanescu@mock.unihub.ro', 'vlad_stanescu', 20),
    ('f0000001-0000-0000-0000-000000000006'::uuid, 'ana.stoica@mock.unihub.ro', 'ana_stoica', 19),
    ('f0000001-0000-0000-0000-000000000007'::uuid, 'cristian.marin@mock.unihub.ro', 'cristian_marin', 18),
    ('f0000001-0000-0000-0000-000000000008'::uuid, 'diana.gheorghe@mock.unihub.ro', 'diana_gheorghe', 17),
    ('f0000001-0000-0000-0000-000000000009'::uuid, 'mihai.florea@mock.unihub.ro', 'mihai_florea', 16),
    ('f0000001-0000-0000-0000-000000000010'::uuid, 'ioana.toma@mock.unihub.ro', 'ioana_toma', 15),
    ('f0000001-0000-0000-0000-000000000011'::uuid, 'stefan.barbu@mock.unihub.ro', 'stefan_barbu', 14),
    ('f0000001-0000-0000-0000-000000000012'::uuid, 'laura.matei@mock.unihub.ro', 'laura_matei', 13),
    ('f0000001-0000-0000-0000-000000000013'::uuid, 'bogdan.voinea@mock.unihub.ro', 'bogdan_voinea', 12),
    ('f0000001-0000-0000-0000-000000000014'::uuid, 'raluca.diaconu@mock.unihub.ro', 'raluca_diaconu', 11),
    ('f0000001-0000-0000-0000-000000000015'::uuid, 'victor.neagu@mock.unihub.ro', 'victor_neagu', 10),
    ('f0000001-0000-0000-0000-000000000016'::uuid, 'simona.pop@mock.unihub.ro', 'simona_pop', 9),
    ('f0000001-0000-0000-0000-000000000017'::uuid, 'gabriel.stan@mock.unihub.ro', 'gabriel_stan', 8),
    ('f0000001-0000-0000-0000-000000000018'::uuid, 'andreea.rusu@mock.unihub.ro', 'andreea_rusu', 7),
    ('f0000001-0000-0000-0000-000000000019'::uuid, 'dan.iacob@mock.unihub.ro', 'dan_iacob', 6),
    ('f0000001-0000-0000-0000-000000000020'::uuid, 'monica.lungu@mock.unihub.ro', 'monica_lungu', 5),
    ('f0000001-0000-0000-0000-000000000021'::uuid, 'paul.costea@mock.unihub.ro', 'paul_costea', 4),
    ('f0000001-0000-0000-0000-000000000022'::uuid, 'camelia.sandu@mock.unihub.ro', 'camelia_sandu', 3),
    ('f0000001-0000-0000-0000-000000000023'::uuid, 'adrian.crisan@mock.unihub.ro', 'adrian_crisan', 2),
    ('f0000001-0000-0000-0000-000000000024'::uuid, 'oana.precup@mock.unihub.ro', 'oana_precup', 1)
) AS u(id, email, username, idx)
CROSS JOIN roles r
WHERE r.name = 'USER';

INSERT INTO USER_IDENTITIES (id, user_id, provider_subject, provider_email, provider, created_at)
SELECT gen_random_uuid(), u.id, u.email, u.email, 'LOCAL'::auth_provider, u.created_at
FROM USERS u
WHERE u.email LIKE '%@mock.unihub.ro';


-- =====================================================================================================================
-- 2. INSERT NEW COMMUNITY & README
-- =====================================================================================================================
INSERT INTO COMMUNITIES (id, name, slug, description, readme, members_count, owner_id, background_color, verified, created_at)
VALUES (
    'a0000001-0000-0000-0000-000000000001'::uuid,
    'Politehnica - Automatica si Calculatoare',
    'acs-upb',
    'Comunitatea studentilor si cadrelor didactice din Facultatea de Automatica si Calculatoare, Universitatea Nationala de Stiinta si Tehnologie Politehnica Bucuresti.',
    '# Facultatea de Automatica si Calculatoare (ACS - UPB)

Bine ati venit pe spatiul oficial al comunitatii **Automatica si Calculatoare**!

Acest hub este dedicat tuturor studentilor de la programele de licenta si masterat (CTI - Calculatoare si Tehnologia Informatiei & IS - Ingineria Sistemelor).

---

## Regulament & Bune Practici

1. **Colaborare academica:** Incurajam discutiile si rezolvarea in echipa a problemelor conceptuale. Nu distribuiti cod sursa identic pentru temele evaluate individual prin sisteme anti-plagiat (ex. Moodle Moss).
2. **Materiale si Resurse:** Toti membrii pot incarca slide-uri, carti si solutii orientative in folderele asociate cursurilor.
3. **Respect si Profesionalism:** Pastrati un limbaj civilizat in sectiunile de comentarii, evaluari de profesori si postari publice.

---

## Structura Anilor de Studiu

- **Anul 1:** Trunchi comun de inginerie (Programare in C, Analiza, Algebra, Structuri de Date, Proiectare Logica).
- **Anul 2:** Fundamente software si hardware (Sisteme de Operare, APD, Retele, Baze de Date, POO).
- **Anul 3:** Specializare pe directii (Calculatoare, Tehnologia Informatiei, Inginerie Software).
- **Anul 4:** Tehnologii avansate, Cloud, Inteligenta Artificiala si Elaborarea Lucrarii de Licenta / Diplomă.

---

## Link-uri Utile & Platforme

- **Site Oficial Facultate:** [https://acs.pub.ro](https://acs.pub.ro)
- **Platforma Moodle ACS:** [https://curs.upb.ro](https://curs.upb.ro)
- **Portal Studentesc UPB:** [https://students.pub.ro](https://students.pub.ro)
- **Ghid de Conectare VPN UPB:** Accesibil prin contul de student pe serverele campusului.

---
*Pentru sugestii sau solicitari administrative, contactati administratorii comunitatii in sectiunea de discutii.*',
    25,
    '1704ba53-75d6-478a-94e5-4618ac372540'::uuid,
    '#4f46e5',
    true,
    now() - interval '30 days'
);


-- =====================================================================================================================
-- 3. ENROLL COMMUNITY MEMBERS (25 Members: 1 Owner, 3 Admins, 21 Members)
-- =====================================================================================================================
-- Root user as COMMUNITY_OWNER
INSERT INTO COMMUNITY_MEMBERS (community_id, user_id, role_id, joined_at)
SELECT 'a0000001-0000-0000-0000-000000000001'::uuid, '1704ba53-75d6-478a-94e5-4618ac372540'::uuid, r.id, now() - interval '30 days'
FROM roles r WHERE r.name = 'COMMUNITY_OWNER';

-- 3 COMMUNITY_ADMINS
INSERT INTO COMMUNITY_MEMBERS (community_id, user_id, role_id, joined_at)
SELECT 'a0000001-0000-0000-0000-000000000001'::uuid, u.id, r.id, now() - interval '28 days'
FROM (VALUES
    ('f0000001-0000-0000-0000-000000000001'::uuid),
    ('f0000001-0000-0000-0000-000000000002'::uuid),
    ('f0000001-0000-0000-0000-000000000003'::uuid)
) AS u(id)
CROSS JOIN roles r WHERE r.name = 'COMMUNITY_ADMIN';

-- 21 COMMUNITY_MEMBERS
INSERT INTO COMMUNITY_MEMBERS (community_id, user_id, role_id, joined_at)
SELECT 'a0000001-0000-0000-0000-000000000001'::uuid, u.id, r.id, now() - (u.idx || ' days')::interval
FROM (VALUES
    ('f0000001-0000-0000-0000-000000000004'::uuid, 25),
    ('f0000001-0000-0000-0000-000000000005'::uuid, 24),
    ('f0000001-0000-0000-0000-000000000006'::uuid, 23),
    ('f0000001-0000-0000-0000-000000000007'::uuid, 22),
    ('f0000001-0000-0000-0000-000000000008'::uuid, 21),
    ('f0000001-0000-0000-0000-000000000009'::uuid, 20),
    ('f0000001-0000-0000-0000-000000000010'::uuid, 19),
    ('f0000001-0000-0000-0000-000000000011'::uuid, 18),
    ('f0000001-0000-0000-0000-000000000012'::uuid, 17),
    ('f0000001-0000-0000-0000-000000000013'::uuid, 16),
    ('f0000001-0000-0000-0000-000000000014'::uuid, 15),
    ('f0000001-0000-0000-0000-000000000015'::uuid, 14),
    ('f0000001-0000-0000-0000-000000000016'::uuid, 13),
    ('f0000001-0000-0000-0000-000000000017'::uuid, 12),
    ('f0000001-0000-0000-0000-000000000018'::uuid, 11),
    ('f0000001-0000-0000-0000-000000000019'::uuid, 10),
    ('f0000001-0000-0000-0000-000000000020'::uuid, 9),
    ('f0000001-0000-0000-0000-000000000021'::uuid, 8),
    ('f0000001-0000-0000-0000-000000000022'::uuid, 7),
    ('f0000001-0000-0000-0000-000000000023'::uuid, 6),
    ('f0000001-0000-0000-0000-000000000024'::uuid, 5)
) AS u(id, idx)
CROSS JOIN roles r WHERE r.name = 'COMMUNITY_MEMBER';


-- =====================================================================================================================
-- 4. INSERT COMMUNITY JOIN CODES
-- =====================================================================================================================
INSERT INTO COMMUNITY_JOIN_CODES (id, community_id, code, created_by, max_uses, uses_count, expires_at, created_at)
VALUES
    ('c0000001-0000-0000-0000-000000000001'::uuid, 'a0000001-0000-0000-0000-000000000001'::uuid, 'ACS2026', '1704ba53-75d6-478a-94e5-4618ac372540'::uuid, 100, 24, now() + interval '90 days', now() - interval '30 days'),
    ('c0000001-0000-0000-0000-000000000002'::uuid, 'a0000001-0000-0000-0000-000000000001'::uuid, 'CTI2026', '1704ba53-75d6-478a-94e5-4618ac372540'::uuid, 50, 10, now() + interval '60 days', now() - interval '20 days'),
    ('c0000001-0000-0000-0000-000000000003'::uuid, 'a0000001-0000-0000-0000-000000000001'::uuid, 'UPBDEV', '1704ba53-75d6-478a-94e5-4618ac372540'::uuid, NULL, 0, NULL, now() - interval '10 days');


-- =====================================================================================================================
-- 5. INSERT STUDY YEARS (YEAR_1, YEAR_2, YEAR_3, YEAR_4)
-- =====================================================================================================================
INSERT INTO STUDY_YEARS (study_year_name, community_id, created_at)
VALUES
    ('YEAR_1', 'a0000001-0000-0000-0000-000000000001'::uuid, now() - interval '30 days'),
    ('YEAR_2', 'a0000001-0000-0000-0000-000000000001'::uuid, now() - interval '30 days'),
    ('YEAR_3', 'a0000001-0000-0000-0000-000000000001'::uuid, now() - interval '30 days'),
    ('YEAR_4', 'a0000001-0000-0000-0000-000000000001'::uuid, now() - interval '30 days');


-- =====================================================================================================================
-- 6. INSERT TEACHERS (25 Teachers)
-- =====================================================================================================================
INSERT INTO TEACHERS (id, first_name, last_name, community_id, estimated_birth_date, average_rating, ratings_count, created_at)
VALUES
    ('b0000001-0000-0000-0000-000000000001'::uuid, 'Adrian', 'Petrescu', 'a0000001-0000-0000-0000-000000000001'::uuid, '1965-03-12'::date, 4.8, 14, now() - interval '30 days'),
    ('b0000001-0000-0000-0000-000000000002'::uuid, 'Elena', 'Tirziman', 'a0000001-0000-0000-0000-000000000001'::uuid, '1975-07-24'::date, 4.5, 4, now() - interval '29 days'),
    ('b0000001-0000-0000-0000-000000000003'::uuid, 'Costin', 'Boiangiu', 'a0000001-0000-0000-0000-000000000001'::uuid, '1972-11-09'::date, 4.7, 3, now() - interval '29 days'),
    ('b0000001-0000-0000-0000-000000000004'::uuid, 'Valentin', 'Cristea', 'a0000001-0000-0000-0000-000000000001'::uuid, '1958-05-18'::date, 4.6, 3, now() - interval '28 days'),
    ('b0000001-0000-0000-0000-000000000005'::uuid, 'Nirvana', 'Popescu', 'a0000001-0000-0000-0000-000000000001'::uuid, '1976-02-14'::date, 4.2, 2, now() - interval '28 days'),
    ('b0000001-0000-0000-0000-000000000006'::uuid, 'Florin', 'Pop', 'a0000001-0000-0000-0000-000000000001'::uuid, '1979-09-30'::date, 4.9, 2, now() - interval '27 days'),
    ('b0000001-0000-0000-0000-000000000007'::uuid, 'Ciprian', 'Dobre', 'a0000001-0000-0000-0000-000000000001'::uuid, '1980-04-22'::date, 4.4, 1, now() - interval '27 days'),
    ('b0000001-0000-0000-0000-000000000008'::uuid, 'Alin', 'Moldoveanu', 'a0000001-0000-0000-0000-000000000001'::uuid, '1974-08-16'::date, 4.6, 1, now() - interval '26 days'),
    ('b0000001-0000-0000-0000-000000000009'::uuid, 'Marius', 'Leordeanu', 'a0000001-0000-0000-0000-000000000001'::uuid, '1981-12-05'::date, 4.8, 1, now() - interval '26 days'),
    ('b0000001-0000-0000-0000-000000000010'::uuid, 'Razvan', 'Deaconescu', 'a0000001-0000-0000-0000-000000000001'::uuid, '1982-01-19'::date, 5.0, 4, now() - interval '25 days'),
    ('b0000001-0000-0000-0000-000000000011'::uuid, 'Bogdan', 'Nitulescu', 'a0000001-0000-0000-0000-000000000001'::uuid, '1969-06-11'::date, 0.0, 0, now() - interval '25 days'),
    ('b0000001-0000-0000-0000-000000000012'::uuid, 'Mihaela', 'Caramihai', 'a0000001-0000-0000-0000-000000000001'::uuid, '1971-10-27'::date, 0.0, 0, now() - interval '24 days'),
    ('b0000001-0000-0000-0000-000000000013'::uuid, 'Carmen', 'Odubasteanu', 'a0000001-0000-0000-0000-000000000001'::uuid, '1977-03-15'::date, 0.0, 0, now() - interval '24 days'),
    ('b0000001-0000-0000-0000-000000000014'::uuid, 'Radu', 'Hobincu', 'a0000001-0000-0000-0000-000000000001'::uuid, '1986-09-08'::date, 0.0, 0, now() - interval '23 days'),
    ('b0000001-0000-0000-0000-000000000015'::uuid, 'Catalin', 'Leordeanu', 'a0000001-0000-0000-0000-000000000001'::uuid, '1983-05-20'::date, 0.0, 0, now() - interval '23 days'),
    ('b0000001-0000-0000-0000-000000000016'::uuid, 'Lorina', 'Negreanu', 'a0000001-0000-0000-0000-000000000001'::uuid, '1968-12-03'::date, 0.0, 0, now() - interval '22 days'),
    ('b0000001-0000-0000-0000-000000000017'::uuid, 'Andrei', 'Olaru', 'a0000001-0000-0000-0000-000000000001'::uuid, '1985-07-11'::date, 0.0, 0, now() - interval '22 days'),
    ('b0000001-0000-0000-0000-000000000018'::uuid, 'Emil', 'Simion', 'a0000001-0000-0000-0000-000000000001'::uuid, '1973-11-29'::date, 0.0, 0, now() - interval '21 days'),
    ('b0000001-0000-0000-0000-000000000019'::uuid, 'Dorina', 'Petrescu', 'a0000001-0000-0000-0000-000000000001'::uuid, '1967-04-05'::date, 0.0, 0, now() - interval '21 days'),
    ('b0000001-0000-0000-0000-000000000020'::uuid, 'George', 'Pantelimon', 'a0000001-0000-0000-0000-000000000001'::uuid, '1970-08-14'::date, 0.0, 0, now() - interval '20 days'),
    ('b0000001-0000-0000-0000-000000000021'::uuid, 'Ioana', 'Fagarasan', 'a0000001-0000-0000-0000-000000000001'::uuid, '1978-02-28'::date, 0.0, 0, now() - interval '20 days'),
    ('b0000001-0000-0000-0000-000000000022'::uuid, 'Sergiu', 'Stancu', 'a0000001-0000-0000-0000-000000000001'::uuid, '1984-10-17'::date, 0.0, 0, now() - interval '19 days'),
    ('b0000001-0000-0000-0000-000000000023'::uuid, 'Dan', 'Tudose', 'a0000001-0000-0000-0000-000000000001'::uuid, '1982-06-25'::date, 0.0, 0, now() - interval '19 days'),
    ('b0000001-0000-0000-0000-000000000024'::uuid, 'Anca', 'Morar', 'a0000001-0000-0000-0000-000000000001'::uuid, '1987-03-09'::date, 0.0, 0, now() - interval '18 days'),
    ('b0000001-0000-0000-0000-000000000025'::uuid, 'Vlad', 'Posea', 'a0000001-0000-0000-0000-000000000001'::uuid, '1981-11-14'::date, 0.0, 0, now() - interval '18 days');


-- =====================================================================================================================
-- 7. INSERT COURSES (Year 1: 14 courses, Year 2: 6 courses, Year 3: 4 courses, Year 4: 4 courses)
-- =====================================================================================================================
-- YEAR 1 (Semester 1: 7 courses, Semester 2: 7 courses - total 14 courses)
INSERT INTO COURSES (name, slug, abbreviation, study_year_id, semester, archived, credit_points, description, readme, created_at)
SELECT c.name, c.slug, c.abbreviation, sy.id, c.semester, c.archived, c.credit_points, c.description, c.readme, now() - interval '30 days'
FROM (VALUES
    -- Semester 1
    ('Programarea calculatoarelor', 'programarea-calculatoarelor', 'PC', 1, false, 5, 'Curs introductiv in limbajul C, pointeri, structuri dinamice si bune practici de programare modulara.', '# Programarea Calculatoarelor (PC)

Cursul de baza pentru studentii din anul I. Se studiaza:
- Sintaxa si semantica limbajului C (standard C99/C11)
- Alocare dinamica si gestiunea manuala a memoriei
- Pointeri, functii cu numar variabil de argumente
- Structuri de date liniare (liste inlantuite, stive, cozi)', 1),
    ('Structuri de date si algoritmi', 'structuri-de-date-si-algoritmi', 'SDA', 1, false, 5, 'Algoritmi fundamentali de sortare, cautare, arbori binari de cautare, tabele de dispersie si grafuri.', '# Structuri de Date si Algoritmi

Materia esentiala pentru interviuri tehnice si fundamente algoritmice.', 2),
    ('Proiectare logica', 'proiectare-logica', 'PL', 1, false, 4, 'Circuite combinationale si secventiale, algebra booleana, automate finite si limbaje de descriere hardware.', NULL, 3),
    ('Analiza matematica', 'analiza-matematica', 'AM', 1, false, 5, 'Calcul diferential si integral in mai multe variabile, siruri si serii de functii, integrale curbilinii.', NULL, 4),
    ('Algebra liniara si geometrie', 'algebra-liniara-si-geometrie', 'ALG', 1, false, 4, 'Spatii vectoriale, transformari liniare, valori proprii, forme patratice si geometrie analitica.', NULL, 5),
    ('Fizica', 'fizica', 'FIZ', 1, false, 4, 'Elemente de mecanica cuantica, fizica starii solide si semiconductori.', NULL, 6),
    ('Limba engleza I', 'limba-engleza-1', 'ENG1', 1, false, 3, 'Vocabular tehnic de specialitate si redactare academica.', NULL, 7),
    -- Semester 2
    ('Programare orientata pe obiecte', 'programare-orientata-pe-obiecte', 'POO', 2, false, 5, 'Concepte fundamentale OOP in C++ si Java: incapsulare, mostenire, polimorfism, design patterns si template-uri.', NULL, 8),
    ('Metode numerice', 'metode-numerice', 'MN', 2, false, 4, 'Rezolvarea numerica a sistemelor liniare, interpolare, aproximari spline si integrare numerica in MATLAB/Octave.', NULL, 9),
    ('Teoria circuitelor electrice', 'teoria-circuitelor-electrice', 'TCE', 2, false, 4, 'Regimuri tranzitorii, teoreme fundamentale de retea, circuite in curent alternativ monofazat si trifazat.', NULL, 10),
    ('Structuri de date avansate', 'structuri-de-date-avansate', 'SDA2', 2, false, 5, 'Arbori AVL, Red-Black, B-Trees, Heap-uri Fibonacci si algoritmi avansati pe grafuri.', NULL, 11),
    ('Arhitectura sistemelor de calcul', 'arhitectura-sistemelor-de-calcul', 'ASC', 2, false, 5, 'Setul de instructiuni MIPS/x86, pipeline, ierarhia memoriei cache si optimizari hardware.', '# Arhitectura Sistemelor de Calcul

Studiul aprofundat al organizarii hardware a procesoarelor moderne.', 12),
    ('Electronica digitala', 'electronica-digitala', 'ED', 2, true, 4, 'Familia logica CMOS/TTL, circuite integrate pe scara larga si memorii semiconductoare.', NULL, 13),
    ('Comunicare profesionala', 'comunicare-profesionala', 'CP', 2, false, 3, 'Prezentari tehnice, negociere si dinamica echipelor in proiecte software.', NULL, 14)
) AS c(name, slug, abbreviation, semester, archived, credit_points, description, readme, sort_order)
JOIN STUDY_YEARS sy ON sy.community_id = 'a0000001-0000-0000-0000-000000000001'::uuid AND sy.study_year_name = 'YEAR_1';

-- YEAR 2 (6 courses)
INSERT INTO COURSES (name, slug, abbreviation, study_year_id, semester, archived, credit_points, description, readme, created_at)
SELECT c.name, c.slug, c.abbreviation, sy.id, c.semester, c.archived, c.credit_points, c.description, c.readme, now() - interval '30 days'
FROM (VALUES
    ('Sisteme de operare', 'sisteme-de-operare', 'SO', 1, false, 5, 'Gestiunea proceselor, fire de executie, sincronizare (mutex, semafoare), memorie virtuala si sisteme de fisiere pe Linux/Windows.', NULL),
    ('Algoritmi paraleli si distribuiti', 'algoritmi-paraleli-si-distribuiti', 'APD', 1, false, 5, 'Programare multithreading cu Java Threads, OpenMP, MPI si modele de calcul distribuit.', NULL),
    ('Baze de date', 'baze-de-date', 'BD', 1, false, 5, 'Modelare relationala, normalizare (1NF-BCNF), interogari SQL complexe si tranzactii ACID.', NULL),
    ('Retele de calculatoare', 'retele-de-calculatoare', 'RC', 2, false, 5, 'Modelul OSI/TCP-IP, protocoale de rutare, programare cu socket-uri in C si analiza de pachete cu Wireshark.', NULL),
    ('Teoria semnalelor', 'teoria-semnalelor', 'TS', 2, false, 4, 'Transformata Fourier, Laplace, filtrare digitala si prelucrarea semnalelor audio/video.', NULL),
    ('Inteligenta artificiala', 'inteligenta-artificiala', 'IA', 2, false, 5, 'Algoritmi de cautare (A*, Minimax), reprezentarea cunostintelor, retele bayesiene si invatare automata introductiva.', NULL)
) AS c(name, slug, abbreviation, semester, archived, credit_points, description, readme)
JOIN STUDY_YEARS sy ON sy.community_id = 'a0000001-0000-0000-0000-000000000001'::uuid AND sy.study_year_name = 'YEAR_2';

-- YEAR 3 (4 courses)
INSERT INTO COURSES (name, slug, abbreviation, study_year_id, semester, archived, credit_points, description, readme, created_at)
SELECT c.name, c.slug, c.abbreviation, sy.id, c.semester, c.archived, c.credit_points, c.description, c.readme, now() - interval '30 days'
FROM (VALUES
    ('Compilatoare', 'compilatoare', 'CPL', 1, false, 5, 'Analiza lexicala, sintactica (LL, LR), verificare semantica si generare de cod intermediar/asamblare.', NULL),
    ('Sisteme incorporate', 'sisteme-incorporate', 'SI', 1, false, 5, 'Microcontrollere ARM, protocoale I2C/SPI/UART, timere si sisteme de operare in timp real (FreeRTOS).', NULL),
    ('Grafica pe calculator', 'grafica-pe-calculator', 'EGC', 2, false, 5, 'Pipeline-ul grafic OpenGL, transformari 3D, iluminare Phong si shadere GLSL.', NULL),
    ('Securitate software', 'securitate-software', 'SAS', 2, false, 5, 'Vulnerabilitati de memorie (buffer overflow, ROP), criptografie aplicata si audit de cod.', NULL)
) AS c(name, slug, abbreviation, semester, archived, credit_points, description, readme)
JOIN STUDY_YEARS sy ON sy.community_id = 'a0000001-0000-0000-0000-000000000001'::uuid AND sy.study_year_name = 'YEAR_3';

-- YEAR 4 (4 courses)
INSERT INTO COURSES (name, slug, abbreviation, study_year_id, semester, archived, credit_points, description, readme, created_at)
SELECT c.name, c.slug, c.abbreviation, sy.id, c.semester, c.archived, c.credit_points, c.description, c.readme, now() - interval '30 days'
FROM (VALUES
    ('Cloud computing', 'cloud-computing', 'CC', 1, false, 5, 'Arhitecturi serverless, containere Docker, Kubernetes si sisteme distribuite de procesare pe AWS/GCP.', NULL),
    ('Invatare automata avansata', 'invatare-automata-avansata', 'AML', 1, false, 5, 'Retele neuronale adanci (CNN, Transformer, GAN) si aplicatii practice in PyTorch.', NULL),
    ('Proiect de diploma', 'proiect-de-diploma', 'DIPLOMA', 2, false, 10, 'Cercetare, proiectare si implementare a lucrarii de finalizare a studiilor universitare de licenta.', NULL),
    ('Management de proiect', 'management-de-proiect', 'MP', 2, false, 4, 'Metodologii Agile (Scrum, Kanban), estimarea riscurilor si bugetare in proiecte software.', NULL)
) AS c(name, slug, abbreviation, semester, archived, credit_points, description, readme)
JOIN STUDY_YEARS sy ON sy.community_id = 'a0000001-0000-0000-0000-000000000001'::uuid AND sy.study_year_name = 'YEAR_4';


-- =====================================================================================================================
-- 8. INSERT COURSE_TEACHERS MAPPINGS
-- =====================================================================================================================
INSERT INTO COURSE_TEACHERS (course_id, teacher_id)
SELECT c.id, t.id
FROM courses c
JOIN study_years sy ON c.study_year_id = sy.id
JOIN teachers t ON t.community_id = 'a0000001-0000-0000-0000-000000000001'::uuid
WHERE sy.community_id = 'a0000001-0000-0000-0000-000000000001'::uuid
  AND (
      (c.slug = 'programarea-calculatoarelor' AND t.last_name IN ('Tirziman', 'Posea'))
   OR (c.slug = 'structuri-de-date-si-algoritmi' AND t.last_name IN ('Tirziman', 'Leordeanu'))
   OR (c.slug = 'proiectare-logica' AND t.last_name IN ('Hobincu', 'Popescu'))
   OR (c.slug = 'analiza-matematica' AND t.last_name = 'Petrescu' AND t.first_name = 'Dorina')
   OR (c.slug = 'algebra-liniara-si-geometrie' AND t.last_name = 'Nitulescu')
   OR (c.slug = 'fizica' AND t.last_name = 'Pantelimon')
   OR (c.slug = 'programare-orientata-pe-obiecte' AND t.last_name = 'Odubasteanu')
   OR (c.slug = 'metode-numerice' AND t.last_name = 'Nitulescu')
   OR (c.slug = 'teoria-circuitelor-electrice' AND t.last_name = 'Stancu')
   OR (c.slug = 'arhitectura-sistemelor-de-calcul' AND t.last_name = 'Petrescu' AND t.first_name = 'Adrian')
   OR (c.slug = 'sisteme-de-operare' AND t.last_name = 'Deaconescu')
   OR (c.slug = 'algoritmi-paraleli-si-distribuiti' AND t.last_name IN ('Pop', 'Cristea'))
   OR (c.slug = 'baze-de-date' AND t.last_name = 'Posea')
   OR (c.slug = 'retele-de-calculatoare' AND t.last_name IN ('Deaconescu', 'Dobre'))
   OR (c.slug = 'inteligenta-artificiala' AND t.last_name IN ('Boiangiu', 'Leordeanu'))
   OR (c.slug = 'compilatoare' AND t.last_name = 'Negreanu')
   OR (c.slug = 'sisteme-incorporate' AND t.last_name = 'Tudose')
   OR (c.slug = 'grafica-pe-calculator' AND t.last_name = 'Moldoveanu')
   OR (c.slug = 'securitate-software' AND t.last_name IN ('Simion', 'Deaconescu'))
   OR (c.slug = 'cloud-computing' AND t.last_name IN ('Pop', 'Cristea'))
   OR (c.slug = 'invatare-automata-avansata' AND t.last_name IN ('Leordeanu', 'Boiangiu'))
  );


-- =====================================================================================================================
-- 9. INSERT TEACHER RATINGS & VALUES (14 ratings on Prof. Adrian Petrescu to test 2 pages)
-- =====================================================================================================================
INSERT INTO TEACHER_RATINGS (id, user_id, teacher_id, title, description, is_anonymous, created_at)
VALUES
    (101, 'f0000001-0000-0000-0000-000000000001'::uuid, 'b0000001-0000-0000-0000-000000000001'::uuid, 'Un profesor de exceptie', 'Explica arhitectura calculatoarelor cu o claritate extraordinara. Materialele sunt excelente.', false, now() - interval '20 days'),
    (102, 'f0000001-0000-0000-0000-000000000002'::uuid, 'b0000001-0000-0000-0000-000000000001'::uuid, 'Cursuri captivante si foarte bine structurate', 'MIPS si pipeline-ul devin logice dupa explicatiile de la curs. Examenul este corect.', false, now() - interval '19 days'),
    (103, 'f0000001-0000-0000-0000-000000000003'::uuid, 'b0000001-0000-0000-0000-000000000001'::uuid, 'Punctual si foarte corect la notare', 'Aprecieaza efortul si raspunde la orice intrebare atat la curs cat si pe email.', true, now() - interval '18 days'),
    (104, 'f0000001-0000-0000-0000-000000000004'::uuid, 'b0000001-0000-0000-0000-000000000001'::uuid, 'Recomand cu mare caldura', 'Unul dintre cei mai buni profesori din facultate. Pasiunea pentru hardware se simte la fiecare lectie.', false, now() - interval '17 days'),
    (105, 'f0000001-0000-0000-0000-000000000005'::uuid, 'b0000001-0000-0000-0000-000000000001'::uuid, 'Explicatii riguroase si utile', 'Daca mergi la cursuri si rezolvi laboratoarele la timp, nota 10 este perfect realizabila.', false, now() - interval '16 days'),
    (106, 'f0000001-0000-0000-0000-000000000006'::uuid, 'b0000001-0000-0000-0000-000000000001'::uuid, 'Foarte deschis la intrebari', 'O atmosfera foarte placuta la curs. Nu te simti intimidat sa pui intrebari.', true, now() - interval '15 days'),
    (107, 'f0000001-0000-0000-0000-000000000007'::uuid, 'b0000001-0000-0000-0000-000000000001'::uuid, 'Materiale de curs de nota 10', 'Slide-urile si temele practice pe simulatorul MARS sunt foarte bine gandite.', false, now() - interval '14 days'),
    (108, 'f0000001-0000-0000-0000-000000000008'::uuid, 'b0000001-0000-0000-0000-000000000001'::uuid, 'Standard inalt de predare', 'Un curs dificil dar care te invata cu adevarat cum functioneaza un procesor.', false, now() - interval '13 days'),
    (109, 'f0000001-0000-0000-0000-000000000009'::uuid, 'b0000001-0000-0000-0000-000000000001'::uuid, 'Examen echilibrat', 'Subiectele la examen testeaza exact ceea ce s-a predat la curs si laborator.', false, now() - interval '12 days'),
    (110, 'f0000001-0000-0000-0000-000000000010'::uuid, 'b0000001-0000-0000-0000-000000000001'::uuid, 'Excelent profesor', 'Respect maxim pentru domnul profesor Petrescu.', true, now() - interval '11 days'),
    (111, 'f0000001-0000-0000-0000-000000000011'::uuid, 'b0000001-0000-0000-0000-000000000001'::uuid, 'Feedback rapid la teme', 'Punctajele au fost afisate rapid si intotdeauna argumentate.', false, now() - interval '10 days'),
    (112, 'f0000001-0000-0000-0000-000000000012'::uuid, 'b0000001-0000-0000-0000-000000000001'::uuid, 'Curs foarte util pentru orice inginer', 'Intelegi cum se executa codul la nivel de registru si instructiune.', false, now() - interval '9 days'),
    (113, 'f0000001-0000-0000-0000-000000000013'::uuid, 'b0000001-0000-0000-0000-000000000001'::uuid, 'Corectitudine maxima', 'Fara favoritism, notare transparenta conform baremului.', false, now() - interval '8 days'),
    (114, 'f0000001-0000-0000-0000-000000000014'::uuid, 'b0000001-0000-0000-0000-000000000001'::uuid, 'Super experienta', 'Mi-a placut enorm acest curs.', true, now() - interval '7 days'),

    -- Ratings for other teachers
    (115, 'f0000001-0000-0000-0000-000000000001'::uuid, 'b0000001-0000-0000-0000-000000000010'::uuid, 'Legenda facultatii', 'Cursul de Sisteme de Operare este impecabil organizat. Laboratoarele sunt fantastice.', false, now() - interval '15 days'),
    (116, 'f0000001-0000-0000-0000-000000000002'::uuid, 'b0000001-0000-0000-0000-000000000010'::uuid, 'Cel mai bun curs de SO', 'Explicatii excelente, comunitate activa, suport exceptional pe forum.', false, now() - interval '14 days'),
    (117, 'f0000001-0000-0000-0000-000000000003'::uuid, 'b0000001-0000-0000-0000-000000000010'::uuid, 'Top notch', 'Multa munca dar inveti incredibil de multe concepte practice.', false, now() - interval '13 days'),
    (118, 'f0000001-0000-0000-0000-000000000004'::uuid, 'b0000001-0000-0000-0000-000000000010'::uuid, '10/10', 'Model de bune practici pentru toata facultatea.', false, now() - interval '12 days'),

    (119, 'f0000001-0000-0000-0000-000000000005'::uuid, 'b0000001-0000-0000-0000-000000000002'::uuid, 'Foarte dedicata', 'Explica fundamentele limbajului C cu rabdare.', false, now() - interval '15 days'),
    (120, 'f0000001-0000-0000-0000-000000000006'::uuid, 'b0000001-0000-0000-0000-000000000002'::uuid, 'Curs foarte bun pentru incepatori', 'Pune accent pe intelegerea memoriei si a pointerilor.', false, now() - interval '14 days'),
    (121, 'f0000001-0000-0000-0000-000000000007'::uuid, 'b0000001-0000-0000-0000-000000000002'::uuid, 'Exigenta dar corecta', 'Trebuie sa fii atent la detalii si sa respecti standardele de cod.', false, now() - interval '13 days'),
    (122, 'f0000001-0000-0000-0000-000000000008'::uuid, 'b0000001-0000-0000-0000-000000000002'::uuid, 'Recomand', 'Un cadru didactic foarte bine pregatit.', true, now() - interval '12 days');

-- Insert Metric Values for each rating (5 metrics per rating)
INSERT INTO TEACHER_RATING_VALUES (teacher_rating_id, rating_metric_id, value)
SELECT r.id, m.id,
    CASE 
        WHEN r.id IN (115, 116, 117, 118) THEN 5
        WHEN r.id % 3 = 0 THEN 4
        ELSE 5
    END AS val
FROM TEACHER_RATINGS r
CROSS JOIN RATING_METRICS m
WHERE r.id BETWEEN 101 AND 122;


-- =====================================================================================================================
-- 10. INSERT FOLDERS & SUBFOLDERS
-- =====================================================================================================================
-- Folders for Programarea Calculatoarelor
INSERT INTO FOLDERS (id, name, course_id, parent_folder_id, owner_id, created_at)
SELECT f.id, f.name, c.id, f.parent_id, '1704ba53-75d6-478a-94e5-4618ac372540'::uuid, now() - interval '25 days'
FROM (VALUES
    ('d0000001-0000-0000-0000-000000000001'::uuid, 'Cursuri & Notite', NULL::uuid),
    ('d0000001-0000-0000-0000-000000000002'::uuid, 'Laboratoare Practice', NULL::uuid),
    ('d0000001-0000-0000-0000-000000000003'::uuid, 'Teme & Ghiduri', NULL::uuid),
    ('d0000001-0000-0000-0000-000000000004'::uuid, 'Examene & Modele Subiecte', NULL::uuid),
    ('d0000001-0000-0000-0000-000000000005'::uuid, 'Lucrari Practice 1-5', 'd0000001-0000-0000-0000-000000000002'::uuid),
    ('d0000001-0000-0000-0000-000000000006'::uuid, 'Lucrari Practice 6-10', 'd0000001-0000-0000-0000-000000000002'::uuid)
) AS f(id, name, parent_id)
JOIN COURSES c ON c.slug = 'programarea-calculatoarelor'
JOIN STUDY_YEARS sy ON c.study_year_id = sy.id AND sy.community_id = 'a0000001-0000-0000-0000-000000000001'::uuid;

-- Folders for Arhitectura Sistemelor de Calcul
INSERT INTO FOLDERS (id, name, course_id, parent_folder_id, owner_id, created_at)
SELECT f.id, f.name, c.id, NULL::uuid, '1704ba53-75d6-478a-94e5-4618ac372540'::uuid, now() - interval '25 days'
FROM (VALUES
    ('d0000001-0000-0000-0000-000000000007'::uuid, 'Slide-uri Curs ASC'),
    ('d0000001-0000-0000-0000-000000000008'::uuid, 'Laboratoare MIPS & MARS'),
    ('d0000001-0000-0000-0000-000000000009'::uuid, 'Arhiva Subiecte Examen')
) AS f(id, name)
JOIN COURSES c ON c.slug = 'arhitectura-sistemelor-de-calcul'
JOIN STUDY_YEARS sy ON c.study_year_id = sy.id AND sy.community_id = 'a0000001-0000-0000-0000-000000000001'::uuid;

-- Folders for Sisteme de Operare
INSERT INTO FOLDERS (id, name, course_id, parent_folder_id, owner_id, created_at)
SELECT f.id, f.name, c.id, NULL::uuid, '1704ba53-75d6-478a-94e5-4618ac372540'::uuid, now() - interval '25 days'
FROM (VALUES
    ('d0000001-0000-0000-0000-000000000010'::uuid, 'Materiale Curs SO'),
    ('d0000001-0000-0000-0000-000000000011'::uuid, 'Laboratoare Linux & Windows')
) AS f(id, name)
JOIN COURSES c ON c.slug = 'sisteme-de-operare'
JOIN STUDY_YEARS sy ON c.study_year_id = sy.id AND sy.community_id = 'a0000001-0000-0000-0000-000000000001'::uuid;


-- =====================================================================================================================
-- 11. INSERT MATERIALS & DESCRIPTIONS (Material Links & Material Files)
-- =====================================================================================================================
-- Resources for PC
INSERT INTO RESOURCES (id, title, type, description, course_id, folder_id, owner_id, created_at, updated_at)
SELECT r.id, r.title, r.type::resource_type, r.description, c.id, r.folder_id, '1704ba53-75d6-478a-94e5-4618ac372540'::uuid, now() - interval '20 days', now() - interval '20 days'
FROM (VALUES
    ('d0000002-0000-0000-0000-000000000001'::uuid, 'Repository GitHub Oficial - Exemple Curs PC', 'MATERIAL_LINK', 'Exemplele de cod rulate la curs, organizate pe capitole (pointeri, liste, fisiere binare).', 'd0000001-0000-0000-0000-000000000001'::uuid),
    ('d0000002-0000-0000-0000-000000000002'::uuid, 'Inregistrari Video Cursuri (Playlist YouTube)', 'MATERIAL_LINK', 'Inregistrarile complete ale orelor de curs pentru recapitulare si sesiune.', 'd0000001-0000-0000-0000-000000000001'::uuid),
    ('d0000002-0000-0000-0000-000000000003'::uuid, 'Documentatie Standard C Reference (cppreference)', 'MATERIAL_LINK', 'Ghid complet al functiilor standard C (stdio, stdlib, string, math).', 'd0000001-0000-0000-0000-000000000001'::uuid),
    ('d0000002-0000-0000-0000-000000000004'::uuid, 'Folder Google Drive - Carti si Manuale C', 'MATERIAL_LINK', 'Carti de referinta: The C Programming Language (K&R), Modern C (Jens Gustedt).', 'd0000001-0000-0000-0000-000000000001'::uuid),
    ('d0000002-0000-0000-0000-000000000005'::uuid, 'Ghid Valgrind si Depanare GDB', 'MATERIAL_LINK', 'Tutorial complet pentru detectarea leak-urilor de memorie si depanarea segment fault-urilor.', 'd0000001-0000-0000-0000-000000000005'::uuid),
    ('d0000002-0000-0000-0000-000000000006'::uuid, 'Fisa Disciplinei & Barem Notare PC 2026', 'MATERIAL_FILE', 'Documentul oficial cu ponderile la laborator, teme si examenul final.', 'd0000001-0000-0000-0000-000000000001'::uuid),
    ('d0000002-0000-0000-0000-000000000007'::uuid, 'Model Examen Scris PC cu Rezolvari', 'MATERIAL_FILE', 'Subiecte din sesiunile anterioare cu barem detaliat si rezolvare integrala.', 'd0000001-0000-0000-0000-000000000004'::uuid),
    ('d0000002-0000-0000-0000-000000000010'::uuid, 'Diagrama Gestiune Memorie & Pointeri C', 'MATERIAL_FILE', 'Schema grafica explicativa cu organizarea memoriei in C si alocarea dinamica.', 'd0000001-0000-0000-0000-000000000005'::uuid)
) AS r(id, title, type, description, folder_id)
JOIN COURSES c ON c.slug = 'programarea-calculatoarelor'
JOIN STUDY_YEARS sy ON c.study_year_id = sy.id AND sy.community_id = 'a0000001-0000-0000-0000-000000000001'::uuid;

-- Resources for ASC
INSERT INTO RESOURCES (id, title, type, description, course_id, folder_id, owner_id, created_at, updated_at)
SELECT r.id, r.title, r.type::resource_type, r.description, c.id, r.folder_id, '1704ba53-75d6-478a-94e5-4618ac372540'::uuid, now() - interval '20 days', now() - interval '20 days'
FROM (VALUES
    ('d0000002-0000-0000-0000-000000000008'::uuid, 'Simulator MARS MIPS & Ghid de Instalare', 'MATERIAL_LINK', 'Link catre simulatorul grafic MIPS recomandat pentru teme si laboratoare.', 'd0000001-0000-0000-0000-000000000008'::uuid),
    ('d0000002-0000-0000-0000-000000000009'::uuid, 'MIPS Instruction Reference Cheat Sheet', 'MATERIAL_FILE', 'Tabel sintetic cu toate instructiunile R, I, J, registri si coduri syscall.', 'd0000001-0000-0000-0000-000000000008'::uuid),
    ('d0000002-0000-0000-0000-000000000011'::uuid, 'Schema Arhitectura MIPS Pipeline', 'MATERIAL_FILE', 'Diagrama bloc a etajelor IF, ID, EX, MEM, WB si hazarduri de date.', 'd0000001-0000-0000-0000-000000000007'::uuid)
) AS r(id, title, type, description, folder_id)
JOIN COURSES c ON c.slug = 'arhitectura-sistemelor-de-calcul'
JOIN STUDY_YEARS sy ON c.study_year_id = sy.id AND sy.community_id = 'a0000001-0000-0000-0000-000000000001'::uuid;

-- Material Links Sub-table
INSERT INTO MATERIAL_LINKS (id, url, link_type)
VALUES
    ('d0000002-0000-0000-0000-000000000001'::uuid, 'https://github.com/upb-cs-materials/programarea-calculatoarelor', 'GITHUB'::material_link_type),
    ('d0000002-0000-0000-0000-000000000002'::uuid, 'https://youtube.com/playlist?list=PLmockupbcs001', 'VIDEO'::material_link_type),
    ('d0000002-0000-0000-0000-000000000003'::uuid, 'https://en.cppreference.com/w/c', 'DOCS'::material_link_type),
    ('d0000002-0000-0000-0000-000000000004'::uuid, 'https://drive.google.com/drive/folders/mock_pc_books_upb', 'DRIVE'::material_link_type),
    ('d0000002-0000-0000-0000-000000000005'::uuid, 'https://valgrind.org/docs/manual/quick-start.html', 'DOCS'::material_link_type),
    ('d0000002-0000-0000-0000-000000000008'::uuid, 'https://courses.missouristate.edu/kenvollmar/mars/', 'OTHER'::material_link_type);

-- Material Files Sub-table
INSERT INTO MATERIAL_FILES (id, storage_key, media_type, size)
VALUES
    ('d0000002-0000-0000-0000-000000000006'::uuid, 'communities/acs-upb/courses/programarea-calculatoarelor/materials/11111111-1111-1111-1111-111111111111/fisa_disciplinei_pc_2026.pdf', 'application/pdf', 676),
    ('d0000002-0000-0000-0000-000000000007'::uuid, 'communities/acs-upb/courses/programarea-calculatoarelor/materials/22222222-2222-2222-2222-222222222222/model_examen_pc_rezolvat.pdf', 'application/pdf', 682),
    ('d0000002-0000-0000-0000-000000000010'::uuid, 'communities/acs-upb/courses/programarea-calculatoarelor/materials/33333333-3333-3333-3333-333333333333/schema_memorie_pointeri_c.png', 'image/png', 640),
    ('d0000002-0000-0000-0000-000000000009'::uuid, 'communities/acs-upb/courses/arhitectura-sistemelor-de-calcul/materials/44444444-4444-4444-4444-444444444444/mips_reference_cheat_sheet.pdf', 'application/pdf', 691),
    ('d0000002-0000-0000-0000-000000000011'::uuid, 'communities/acs-upb/courses/arhitectura-sistemelor-de-calcul/materials/55555555-5555-5555-5555-555555555555/mips_pipeline_diagram.png', 'image/png', 903);


-- =====================================================================================================================
-- 12. INSERT POSTS (14 Community Posts, 12 Course Posts)
-- =====================================================================================================================
-- 14 Community Posts
INSERT INTO POSTS (id, owner_id, channel, created_at, updated_at, likes_count, comments_count, pinned, title, description)
VALUES
    ('e0000001-0000-0000-0000-000000000001'::uuid, '1704ba53-75d6-478a-94e5-4618ac372540'::uuid, 'COMMUNITY', now() - interval '25 days', now() - interval '25 days', 18, 24, true, 'Ghidul Bobocului - Regulament, Orare, Sali si Recomandari Utile', 'Dragi colegi din anul I,

Va uram bun venit in comunitatea ACS! Acest thread contine toate informatiile necesare pentru primele saptamani:
1. **Orarele si salile:** Consultati orarul actualizat pe platforma facultatii.
2. **Conturile de student:** Verificati adresele `@stud.acs.upb.ro` pentru acces pe Teams si Moodle.
3. **Burse si secretariat:** Detaliile despre dosarele de bursa se depun la secretariatul din corpul ED.

Lasati orice intrebari in comentarii!'),
    ('e0000001-0000-0000-0000-000000000002'::uuid, 'f0000001-0000-0000-0000-000000000001'::uuid, 'COMMUNITY', now() - interval '24 days', now() - interval '24 days', 8, 3, false, 'Inscrieri deschise pentru Hackathon-ul ACS Innovation 2026', 'Salutare tuturor! S-au deschis inscrierile pentru hackathon-ul anual organizat in corpul PRECIS. Echipe de 3-4 studenti, premii consistente si mentori din industrie.'),
    ('e0000001-0000-0000-0000-000000000003'::uuid, 'f0000001-0000-0000-0000-000000000002'::uuid, 'COMMUNITY', now() - interval '23 days', now() - interval '23 days', 5, 2, false, 'Recomandari manuale si culegeri pentru Analiza Matematica si Algebra', 'Ce culegeri de probleme recomandati pentru pregatirea examenelor din sesiune la matematica?'),
    ('e0000001-0000-0000-0000-000000000004'::uuid, 'f0000001-0000-0000-0000-000000000003'::uuid, 'COMMUNITY', now() - interval '22 days', now() - interval '22 days', 12, 4, false, 'Grup de studiu pentru Algoritmi si Structuri de Date', 'Ne strangem saptamanal in biblioteca din corpul R pentru rezolvat probleme de pe LeetCode si teme de laborator.'),
    ('e0000001-0000-0000-0000-000000000005'::uuid, 'f0000001-0000-0000-0000-000000000004'::uuid, 'COMMUNITY', now() - interval '21 days', now() - interval '21 days', 4, 1, false, 'Cum configuram VPN-ul UPB pentru acces la resursele IEEE Xplore?', 'Am scris un mic tutorial pas cu pas despre cum va conectati prin OpenVPN la reteaua universitatii.'),
    ('e0000001-0000-0000-0000-000000000006'::uuid, 'f0000001-0000-0000-0000-000000000005'::uuid, 'COMMUNITY', now() - interval '20 days', now() - interval '20 days', 9, 2, false, 'Workshop introductiv in Git & GitHub pentru studentii din anul I', 'Joi la ora 18:00 in sala EC001 organizam un workshop practic despre comenzi Git, branching si rezolvarea conflictelor.'),
    ('e0000001-0000-0000-0000-000000000007'::uuid, 'f0000001-0000-0000-0000-000000000006'::uuid, 'COMMUNITY', now() - interval '19 days', now() - interval '19 days', 7, 3, false, 'Orar consultatii profesori - Semestrul 1', 'Am centralizat intr-un tabel orarul de consultatii pentru cadrele didactice de la materiile de baza.'),
    ('e0000001-0000-0000-0000-000000000008'::uuid, 'f0000001-0000-0000-0000-000000000007'::uuid, 'COMMUNITY', now() - interval '18 days', now() - interval '18 days', 3, 0, false, 'Cazare camine Regie - Informatii si cereri de relocare', 'Secretariatul a publicat listele finale cu repartizarea locurilor de cazare in complexul studentesc.'),
    ('e0000001-0000-0000-0000-000000000009'::uuid, 'f0000001-0000-0000-0000-000000000008'::uuid, 'COMMUNITY', now() - interval '17 days', now() - interval '17 days', 6, 1, false, 'Oportunitati de Internship & Practica de Vara 2026', 'Companiile partenere au inceput selectia pentru stagiile de practica. Pregatiti-va CV-urile!'),
    ('e0000001-0000-0000-0000-000000000010'::uuid, 'f0000001-0000-0000-0000-000000000009'::uuid, 'COMMUNITY', now() - interval '16 days', now() - interval '16 days', 11, 2, false, 'Eveniment: Ziua Portilor Deschise Laboratoare Cercetare PRECIS', 'Vizite ghidate in laboratoarele de Inteligenta Artificiala, Sisteme Autonome si Robotica.'),
    ('e0000001-0000-0000-0000-000000000011'::uuid, 'f0000001-0000-0000-0000-000000000010'::uuid, 'COMMUNITY', now() - interval '15 days', now() - interval '15 days', 4, 1, false, 'Platforma software pentru automatizarea orarelor', 'Proiect open-source dezvoltat de studenti pentru sincronizarea automata a orarului cu Google Calendar.'),
    ('e0000001-0000-0000-0000-000000000012'::uuid, 'f0000001-0000-0000-0000-000000000011'::uuid, 'COMMUNITY', now() - interval '14 days', now() - interval '14 days', 8, 2, false, 'Tips & Tricks pentru prima sesiune de examene', 'Cateva sfaturi de la studentii mai mari despre cum sa va gestionati timpul si stresul in sesiune.'),
    ('e0000001-0000-0000-0000-000000000013'::uuid, 'f0000001-0000-0000-0000-000000000012'::uuid, 'COMMUNITY', now() - interval '13 days', now() - interval '13 days', 5, 0, false, 'Concursul National de Programare Universitara', 'Selectia echipelor reprezentative ale facultatii pentru faza regionala ICPC SEERC.'),
    ('e0000001-0000-0000-0000-000000000014'::uuid, 'f0000001-0000-0000-0000-000000000013'::uuid, 'COMMUNITY', now() - interval '12 days', now() - interval '12 days', 10, 3, false, 'Chestionar de evaluare a calitatii serviciilor universitare', 'Completati formularul anonim pentru a ne ajuta sa imbunatatim facilitatile din corpurile ED si PRECIS.');

INSERT INTO COMMUNITY_POSTS (post_id, community_id)
SELECT p.id, 'a0000001-0000-0000-0000-000000000001'::uuid
FROM POSTS p
WHERE p.id BETWEEN 'e0000001-0000-0000-0000-000000000001'::uuid AND 'e0000001-0000-0000-0000-000000000014'::uuid;

-- 12 Course Posts (Programarea Calculatoarelor)
INSERT INTO POSTS (id, owner_id, channel, created_at, updated_at, likes_count, comments_count, pinned, title, description)
VALUES
    ('e0000002-0000-0000-0000-000000000001'::uuid, '1704ba53-75d6-478a-94e5-4618ac372540'::uuid, 'COURSE', now() - interval '20 days', now() - interval '20 days', 9, 4, true, 'Clarificari cerinte Tema 1 - Pointeri si Alocare Dinamica', 'Buna tuturor! Atentie la eliberarea intregii memorii alocate inainte de iesirea din functiile principale. Testele automate ruleaza cu flag-ul `--leak-check=full`.'),
    ('e0000002-0000-0000-0000-000000000002'::uuid, 'f0000001-0000-0000-0000-000000000001'::uuid, 'COURSE', now() - interval '19 days', now() - interval '19 days', 3, 2, false, 'Diferenta intre `malloc()` si `calloc()` la initializarea structurilor', 'Cand este preferabil sa folosim calloc in locul unui malloc urmat de memset?'),
    ('e0000002-0000-0000-0000-000000000003'::uuid, 'f0000001-0000-0000-0000-000000000002'::uuid, 'COURSE', now() - interval '18 days', now() - interval '18 days', 4, 1, false, 'Segment fault la citirea din fisier binar cu `fread()`', 'Primesc eroare de acces memorie la citirea unui vector de structuri. Ma poate ajuta cineva?'),
    ('e0000002-0000-0000-0000-000000000004'::uuid, 'f0000001-0000-0000-0000-000000000003'::uuid, 'COURSE', now() - interval '17 days', now() - interval '17 days', 7, 3, false, 'Pointeri la functii si utilizarea lor cu `qsort()`', 'Un exemplu practic despre cum scriem functia de comparare pentru sortarea unui vector de studenti dupa medie si nume.'),
    ('e0000002-0000-0000-0000-000000000005'::uuid, 'f0000001-0000-0000-0000-000000000004'::uuid, 'COURSE', now() - interval '16 days', now() - interval '16 days', 2, 0, false, 'Gestiunea buffer-ului `stdin` dupa `scanf()`', 'De ce ramane newline-ul in buffer si cum il consumam corect inainte de `fgets()`?'),
    ('e0000002-0000-0000-0000-000000000006'::uuid, 'f0000001-0000-0000-0000-000000000005'::uuid, 'COURSE', now() - interval '15 days', now() - interval '15 days', 5, 2, false, 'Reimplementare lista simplu inlantuita generica cu `void*`', 'Cum putem crea o lista in C care sa poata stoca orice tip de date prin alocare de blocuri generice.'),
    ('e0000002-0000-0000-0000-000000000007'::uuid, 'f0000001-0000-0000-0000-000000000006'::uuid, 'COURSE', now() - interval '14 days', now() - interval '14 days', 6, 1, false, 'Optimizari de compilare cu GCC: `-O2` vs `-O3` si efecte secundare', 'Discutie despre ce optimizari aplica compilatorul si de ce comportamentul nedefinit poate crea bug-uri ascunse.'),
    ('e0000002-0000-0000-0000-000000000008'::uuid, 'f0000001-0000-0000-0000-000000000007'::uuid, 'COURSE', now() - interval '13 days', now() - interval '13 days', 3, 0, false, 'Operatii pe biti: masti si shiftari in exercitiile de colocviu', 'Un set de exercitii rezolvate pentru setarea, stergerea si testarea bitilor individuali dintr-un intreg.'),
    ('e0000002-0000-0000-0000-000000000009'::uuid, 'f0000001-0000-0000-0000-000000000008'::uuid, 'COURSE', now() - interval '12 days', now() - interval '12 days', 4, 1, false, 'Matrice dinamice alocate ca vector de pointeri vs tablou continuu', 'Comparatie de performanta si localitate spatiala intre cele doua metode clasice de alocare 2D in C.'),
    ('e0000002-0000-0000-0000-000000000010'::uuid, 'f0000001-0000-0000-0000-000000000009'::uuid, 'COURSE', now() - interval '11 days', now() - interval '11 days', 8, 2, false, 'Model de subiect pentru colocviul practic de laborator', 'Un model complet cu 3 probleme: siruri de caractere, liste inlantuite si procesare de fisiere text.'),
    ('e0000002-0000-0000-0000-000000000011'::uuid, 'f0000001-0000-0000-0000-000000000010'::uuid, 'COURSE', now() - interval '10 days', now() - interval '10 days', 5, 1, false, 'Recursivitate pe stiva vs iteratie: cand riscam Stack Overflow?', 'Analiza a adancimii stivei de apeluri si cum rescriem recursivitatea pe coada (tail-recursion).'),
    ('e0000002-0000-0000-0000-000000000012'::uuid, 'f0000001-0000-0000-0000-000000000011'::uuid, 'COURSE', now() - interval '9 days', now() - interval '9 days', 6, 0, false, 'Reguli de stil de cod si Makefile automatizat', 'Cum scriem un Makefile robust cu reguli de build, clean si run automat pentru testare rapida.');

INSERT INTO COURSE_POSTS (post_id, course_id)
SELECT p.id, c.id
FROM POSTS p
CROSS JOIN COURSES c
JOIN STUDY_YEARS sy ON c.study_year_id = sy.id AND sy.community_id = 'a0000001-0000-0000-0000-000000000001'::uuid
WHERE c.slug = 'programarea-calculatoarelor'
  AND p.id BETWEEN 'e0000002-0000-0000-0000-000000000001'::uuid AND 'e0000002-0000-0000-0000-000000000012'::uuid;

-- Likes for Posts
INSERT INTO POST_LIKES (post_id, user_id)
SELECT 'e0000001-0000-0000-0000-000000000001'::uuid, u.id
FROM USERS u
WHERE u.email LIKE '%@mock.unihub.ro'
LIMIT 18;

-- 24 Comments on the Pinned Community Post (e0000001-0000-0000-0000-000000000001) to test 2 pages of comments
INSERT INTO COMMENTS (id, owner_id, post_id, content, created_at, updated_at)
VALUES
    ('c0000001-0000-0000-0000-000000000001'::uuid, 'f0000001-0000-0000-0000-000000000001'::uuid, 'e0000001-0000-0000-0000-000000000001'::uuid, 'Multumim mult pentru ghid! Este extrem de util pentru noi.', now() - interval '24 days', now() - interval '24 days'),
    (gen_random_uuid(), 'f0000001-0000-0000-0000-000000000002'::uuid, 'e0000001-0000-0000-0000-000000000001'::uuid, 'Unde putem gasi harta corpurilor ED, PR si PRECIS?', now() - interval '24 days', now() - interval '24 days'),
    (gen_random_uuid(), 'f0000001-0000-0000-0000-000000000003'::uuid, 'e0000001-0000-0000-0000-000000000001'::uuid, 'Harta este afisata la intrarea principala si pe site-ul facultatii.', now() - interval '23 days', now() - interval '23 days'),
    (gen_random_uuid(), 'f0000001-0000-0000-0000-000000000004'::uuid, 'e0000001-0000-0000-0000-000000000001'::uuid, 'Pana la ce data se depun cererile de bursa?', now() - interval '23 days', now() - interval '23 days'),
    (gen_random_uuid(), 'f0000001-0000-0000-0000-000000000005'::uuid, 'e0000001-0000-0000-0000-000000000001'::uuid, 'Cererile se depun pana vineri la ora 14:00 la secretariat.', now() - interval '22 days', now() - interval '22 days'),
    (gen_random_uuid(), 'f0000001-0000-0000-0000-000000000006'::uuid, 'e0000001-0000-0000-0000-000000000001'::uuid, 'Exista laboratoare deschise pentru studiu individual dupa ore?', now() - interval '22 days', now() - interval '22 days'),
    (gen_random_uuid(), 'f0000001-0000-0000-0000-000000000007'::uuid, 'e0000001-0000-0000-0000-000000000001'::uuid, 'Da, salile de lectura din corpul R sunt deschise pana la 22:00.', now() - interval '21 days', now() - interval '21 days'),
    (gen_random_uuid(), 'f0000001-0000-0000-0000-000000000008'::uuid, 'e0000001-0000-0000-0000-000000000001'::uuid, 'Super initiativa cu aceasta platforma!', now() - interval '21 days', now() - interval '21 days'),
    (gen_random_uuid(), 'f0000001-0000-0000-0000-000000000009'::uuid, 'e0000001-0000-0000-0000-000000000001'::uuid, 'Cum ne conectam la reteaua Eduroam din campus?', now() - interval '20 days', now() - interval '20 days'),
    (gen_random_uuid(), 'f0000001-0000-0000-0000-000000000010'::uuid, 'e0000001-0000-0000-0000-000000000001'::uuid, 'Folositi credentialele contului institutional (adresa de email @stud.acs.upb.ro).', now() - interval '20 days', now() - interval '20 days'),
    (gen_random_uuid(), 'f0000001-0000-0000-0000-000000000011'::uuid, 'e0000001-0000-0000-0000-000000000001'::uuid, 'Mult succes tuturor bobocilor in acest semestru!', now() - interval '19 days', now() - interval '19 days'),
    (gen_random_uuid(), 'f0000001-0000-0000-0000-000000000012'::uuid, 'e0000001-0000-0000-0000-000000000001'::uuid, 'Cand se aleg reprezentantii de an si grupa?', now() - interval '19 days', now() - interval '19 days'),
    (gen_random_uuid(), 'f0000001-0000-0000-0000-000000000013'::uuid, 'e0000001-0000-0000-0000-000000000001'::uuid, 'Alegerile vor avea loc saptamana viitoare la intalnirea cu decanatul.', now() - interval '18 days', now() - interval '18 days'),
    (gen_random_uuid(), 'f0000001-0000-0000-0000-000000000014'::uuid, 'e0000001-0000-0000-0000-000000000001'::uuid, 'Excelent structurat.', now() - interval '18 days', now() - interval '18 days'),
    (gen_random_uuid(), 'f0000001-0000-0000-0000-000000000015'::uuid, 'e0000001-0000-0000-0000-000000000001'::uuid, 'Aveti recomandari de distributii Linux pentru materiile din anul 1?', now() - interval '17 days', now() - interval '17 days'),
    (gen_random_uuid(), 'f0000001-0000-0000-0000-000000000016'::uuid, 'e0000001-0000-0000-0000-000000000001'::uuid, 'Ubuntu 24.04 LTS sau Fedora sunt ideale si compatibile cu masinile din lab.', now() - interval '17 days', now() - interval '17 days'),
    (gen_random_uuid(), 'f0000001-0000-0000-0000-000000000017'::uuid, 'e0000001-0000-0000-0000-000000000001'::uuid, 'Multumim pentru sprijin!', now() - interval '16 days', now() - interval '16 days'),
    (gen_random_uuid(), 'f0000001-0000-0000-0000-000000000018'::uuid, 'e0000001-0000-0000-0000-000000000001'::uuid, 'Unde putem semna contractele de studii?', now() - interval '16 days', now() - interval '16 days'),
    (gen_random_uuid(), 'f0000001-0000-0000-0000-000000000019'::uuid, 'e0000001-0000-0000-0000-000000000001'::uuid, 'Contractele se semneaza online pe platforma students.pub.ro.', now() - interval '15 days', now() - interval '15 days'),
    (gen_random_uuid(), 'f0000001-0000-0000-0000-000000000020'::uuid, 'e0000001-0000-0000-0000-000000000001'::uuid, 'Foarte bun rezumatul.', now() - interval '15 days', now() - interval '15 days'),
    (gen_random_uuid(), 'f0000001-0000-0000-0000-000000000021'::uuid, 'e0000001-0000-0000-0000-000000000001'::uuid, 'Se pot echivala certificatele de limba engleza (Cambridge, TOEFL)?', now() - interval '14 days', now() - interval '14 days'),
    (gen_random_uuid(), 'f0000001-0000-0000-0000-000000000022'::uuid, 'e0000001-0000-0000-0000-000000000001'::uuid, 'Da, aduceti certificatul in original la prima ora de seminar.', now() - interval '14 days', now() - interval '14 days'),
    (gen_random_uuid(), 'f0000001-0000-0000-0000-000000000023'::uuid, 'e0000001-0000-0000-0000-000000000001'::uuid, 'Ne vedem la cursuri!', now() - interval '13 days', now() - interval '13 days'),
    (gen_random_uuid(), 'f0000001-0000-0000-0000-000000000024'::uuid, 'e0000001-0000-0000-0000-000000000001'::uuid, 'Mult succes tuturor in noul an universitar!', now() - interval '13 days', now() - interval '13 days'),
    ('c0000002-0000-0000-0000-000000000001'::uuid, 'f0000001-0000-0000-0000-000000000004'::uuid, 'e0000002-0000-0000-0000-000000000001'::uuid, 'Atentie si la eliberarea memoriei pentru pointerii intermediari.', now() - interval '16 hours', now() - interval '16 hours'),
    ('c0000002-0000-0000-0000-000000000002'::uuid, 'f0000001-0000-0000-0000-000000000001'::uuid, 'e0000002-0000-0000-0000-000000000005'::uuid, 'Folositi un while(getchar() != ''\n''); dupa scanf.', now() - interval '2 days', now() - interval '2 days');


-- =====================================================================================================================
-- 13. INSERT EVENTS & EVENT REMINDERS (16 Events, 4 Reminders for Root User)
-- =====================================================================================================================
INSERT INTO EVENTS (id, title, description, type, start_time, duration_hours, location, location_details, course_id, community_id, owner_id, created_at, updated_at)
SELECT e.id, e.title, e.description, e.type::event_type, e.start_time, e.duration_hours, e.location::event_location, e.location_details, c.id, 'a0000001-0000-0000-0000-000000000001'::uuid, '1704ba53-75d6-478a-94e5-4618ac372540'::uuid, now() - interval '15 days', now() - interval '15 days'
FROM (VALUES
    -- Exams
    ('a0000002-0000-0000-0000-000000000001'::uuid, 'Examen Scris Programarea Calculatoarelor', 'Examen final grila si probleme practice de cod pe foaie.', 'EXAM', now() + interval '10 days', 3.0, 'IN_PERSON', 'Amfiteatrul EC001, Corp ED', 'programarea-calculatoarelor'),
    ('a0000002-0000-0000-0000-000000000002'::uuid, 'Colocviu Practic Structuri de Date', 'Implementare structuri de date pe calculator in mediul Linux.', 'EXAM', now() + interval '14 days', 2.0, 'IN_PERSON', 'Laborator PR001, Corp PRECIS', 'structuri-de-date-si-algoritmi'),
    ('a0000002-0000-0000-0000-000000000003'::uuid, 'Examen Scris Analiza Matematica', 'Subiecte de calcul integral si serii numerice.', 'EXAM', now() + interval '18 days', 3.0, 'IN_PERSON', 'Sala AN010, Corp Rectorat', 'analiza-matematica'),
    ('a0000002-0000-0000-0000-000000000004'::uuid, 'Examen Final Arhitectura Sistemelor de Calcul', 'Probleme de set de instructiuni MIPS, pipeline si organizare memorie cache.', 'EXAM', now() + interval '22 days', 2.0, 'IN_PERSON', 'Amfiteatrul ED011, Corp ED', 'arhitectura-sistemelor-de-calcul'),
    ('a0000002-0000-0000-0000-000000000005'::uuid, 'Colocviu Proiectare Logica', 'Verificare circuite secventiale pe placi FPGA.', 'EXAM', now() + interval '8 days', 2.0, 'IN_PERSON', 'Lab EF210, Corp Electro', 'proiectare-logica'),
    ('a0000002-0000-0000-0000-000000000006'::uuid, 'Examen Scris Sisteme de Operare', 'Gestiunea proceselor, apeluri de sistem si sincronizare.', 'EXAM', now() + interval '25 days', 3.0, 'IN_PERSON', 'Amfiteatrul EC101, Corp ED', 'sisteme-de-operare'),
    -- Assignments & Project Deadlines
    ('a0000002-0000-0000-0000-000000000007'::uuid, 'Termen Limita Tema 1 - Pointeri si Memorie Dinamica', 'Incarcarea arhivelor pe Moodle pana la ora 23:59.', 'ASSIGNMENT', now() + interval '3 days', NULL, 'ONLINE', 'Platforma Moodle ACS', 'programarea-calculatoarelor'),
    ('a0000002-0000-0000-0000-000000000008'::uuid, 'Termen Limita Tema 2 - Simulator Procesor MIPS', 'Predare cod sursa MIPS Assembly pe GitHub Classroom.', 'ASSIGNMENT', now() + interval '12 days', NULL, 'ONLINE', 'GitHub Classroom', 'arhitectura-sistemelor-de-calcul'),
    ('a0000002-0000-0000-0000-000000000009'::uuid, 'Predare Proiect Baze de Date - Schema Relationala', 'Livrarea documentatiei si a scriptului SQL DDL.', 'ASSIGNMENT', now() + interval '16 days', NULL, 'ONLINE', 'Platforma Moodle', 'baze-de-date'),
    ('a0000002-0000-0000-0000-000000000010'::uuid, 'Predare Tema 1 SO - Mini-Shell Linux', 'Implementare interpretor comenzi cu procese si pipe-uri.', 'ASSIGNMENT', now() + interval '7 days', NULL, 'ONLINE', 'Sistem de testare automata SO', 'sisteme-de-operare'),
    ('a0000002-0000-0000-0000-000000000011'::uuid, 'Prezentare Proiect OOP - Aplicatie Desktop', 'Sustinerea orala a proiectului in fata asistentului.', 'ASSIGNMENT', now() + interval '20 days', 4.0, 'HYBRID', 'Sala PR705 / Teams', 'programare-orientata-pe-obiecte'),
    -- Lectures & Workshops
    ('a0000002-0000-0000-0000-000000000012'::uuid, 'Curs Special - Inteligenta Artificiala Generativa', 'Prelegere sustinuta de un cercetator invitat din industria tech.', 'LECTURE', now() + interval '5 days', 2.0, 'HYBRID', 'Amfiteatrul PRECIS PR001 + Transmisie Zoom', 'inteligenta-artificiala'),
    ('a0000002-0000-0000-0000-000000000013'::uuid, 'Workshop Securitate Cibernetica & CTF Intro', 'Exercitii practice de binary exploitation si web security.', 'LECTURE', now() + interval '6 days', 3.0, 'IN_PERSON', 'Lab PRECIS 301', 'securitate-software'),
    ('a0000002-0000-0000-0000-000000000014'::uuid, 'Seminar Pregatire Examen Analiza Matematica', 'Rezolvari de subiecte din anii trecuti si sesiune de intrebari.', 'LECTURE', now() + interval '15 days', 2.0, 'HYBRID', 'Sala AN010 + Microsoft Teams', 'analiza-matematica'),
    ('a0000002-0000-0000-0000-000000000015'::uuid, 'Prezentare Tehnica - Arhitecturi Cloud Moderne', 'Sisteme distribuite, Kubernetes si microservicii scalabile.', 'LECTURE', now() + interval '9 days', 2.0, 'ONLINE', 'Google Meet Link in anunt', 'cloud-computing'),
    ('a0000002-0000-0000-0000-000000000016'::uuid, 'Curs Festiv Deschidere An Universitar', 'Intalnirea intregii comunitati academice ACS.', 'LECTURE', now() - interval '28 days', 2.0, 'IN_PERSON', 'Aula Magna UPB', 'programarea-calculatoarelor')
) AS e(id, title, description, type, start_time, duration_hours, location, location_details, course_slug)
JOIN COURSES c ON c.slug = e.course_slug
JOIN STUDY_YEARS sy ON c.study_year_id = sy.id AND sy.community_id = 'a0000001-0000-0000-0000-000000000001'::uuid;

-- Reminders for Root User
INSERT INTO EVENT_REMINDERS (id, user_id, event_id, offset_minutes, remind_at, status, created_at)
VALUES
    (gen_random_uuid(), '1704ba53-75d6-478a-94e5-4618ac372540'::uuid, 'a0000002-0000-0000-0000-000000000001'::uuid, 1440, (now() + interval '10 days' - interval '1440 minutes'), 'PENDING', now()),
    (gen_random_uuid(), '1704ba53-75d6-478a-94e5-4618ac372540'::uuid, 'a0000002-0000-0000-0000-000000000004'::uuid, 60, (now() + interval '22 days' - interval '60 minutes'), 'PENDING', now()),
    (gen_random_uuid(), '1704ba53-75d6-478a-94e5-4618ac372540'::uuid, 'a0000002-0000-0000-0000-000000000007'::uuid, 120, (now() + interval '3 days' - interval '120 minutes'), 'PENDING', now()),
    (gen_random_uuid(), '1704ba53-75d6-478a-94e5-4618ac372540'::uuid, 'a0000002-0000-0000-0000-000000000016'::uuid, 30, (now() - interval '28 days' - interval '30 minutes'), 'SENT', now() - interval '29 days');


-- =====================================================================================================================
-- 14. INSERT NOTIFICATIONS FOR ROOT USER (25 Notifications to test infinite scroll & filters)
-- =====================================================================================================================
-- Base Notifications
INSERT INTO NOTIFICATIONS (id, user_id, type, message, category, is_read, created_at, metadata, actor_id)
VALUES
    -- 1-8: EVENT notifications
    ('f0000002-0000-0000-0000-000000000001'::uuid, '1704ba53-75d6-478a-94e5-4618ac372540'::uuid, 'EVENT_REMINDER'::NOTIFICATION_TYPE, 'The exam for Programarea calculatoarelor starts in 1h', 'EVENT'::NOTIFICATION_CATEGORY, false, now() - interval '1 hour', '{"eventId": "a0000002-0000-0000-0000-000000000001"}'::jsonb, null),
    ('f0000002-0000-0000-0000-000000000002'::uuid, '1704ba53-75d6-478a-94e5-4618ac372540'::uuid, 'EVENT_REMINDER'::NOTIFICATION_TYPE, 'The assignment for Programarea calculatoarelor is due in 2h', 'EVENT'::NOTIFICATION_CATEGORY, false, now() - interval '3 hours', '{"eventId": "a0000002-0000-0000-0000-000000000007"}'::jsonb, null),
    ('f0000002-0000-0000-0000-000000000003'::uuid, '1704ba53-75d6-478a-94e5-4618ac372540'::uuid, 'EVENT_UPDATED'::NOTIFICATION_TYPE, 'updated the event "Examen Scris Analiza Matematica"', 'EVENT'::NOTIFICATION_CATEGORY, false, now() - interval '6 hours', '{"eventId": "a0000002-0000-0000-0000-000000000003"}'::jsonb, 'f0000001-0000-0000-0000-000000000001'::uuid),
    ('f0000002-0000-0000-0000-000000000004'::uuid, '1704ba53-75d6-478a-94e5-4618ac372540'::uuid, 'EVENT_UPDATED'::NOTIFICATION_TYPE, 'updated the event "Workshop Securitate Cibernetica"', 'EVENT'::NOTIFICATION_CATEGORY, false, now() - interval '10 hours', '{"eventId": "a0000002-0000-0000-0000-000000000013"}'::jsonb, 'f0000001-0000-0000-0000-000000000002'::uuid),
    ('f0000002-0000-0000-0000-000000000005'::uuid, '1704ba53-75d6-478a-94e5-4618ac372540'::uuid, 'EVENT_CANCELLED'::NOTIFICATION_TYPE, 'cancelled the event "Consultatii Metode Numerice"', 'EVENT'::NOTIFICATION_CATEGORY, true, now() - interval '1 day', NULL, 'f0000001-0000-0000-0000-000000000003'::uuid),
    ('f0000002-0000-0000-0000-000000000006'::uuid, '1704ba53-75d6-478a-94e5-4618ac372540'::uuid, 'EVENT_REMINDER'::NOTIFICATION_TYPE, 'The exam for Structuri de date si algoritmi starts in 1d', 'EVENT'::NOTIFICATION_CATEGORY, true, now() - interval '2 days', '{"eventId": "a0000002-0000-0000-0000-000000000002"}'::jsonb, null),
    ('f0000002-0000-0000-0000-000000000007'::uuid, '1704ba53-75d6-478a-94e5-4618ac372540'::uuid, 'EVENT_UPDATED'::NOTIFICATION_TYPE, 'updated the event "Tema 2 - Simulator MIPS"', 'EVENT'::NOTIFICATION_CATEGORY, false, now() - interval '3 days', '{"eventId": "a0000002-0000-0000-0000-000000000008"}'::jsonb, 'f0000001-0000-0000-0000-000000000001'::uuid),
    ('f0000002-0000-0000-0000-000000000008'::uuid, '1704ba53-75d6-478a-94e5-4618ac372540'::uuid, 'EVENT_REMINDER'::NOTIFICATION_TYPE, 'The presentation for Cloud computing starts in 15m', 'EVENT'::NOTIFICATION_CATEGORY, true, now() - interval '4 days', '{"eventId": "a0000002-0000-0000-0000-000000000015"}'::jsonb, null),

    -- 9-20: POST notifications
    ('f0000002-0000-0000-0000-000000000009'::uuid, '1704ba53-75d6-478a-94e5-4618ac372540'::uuid, 'COMMUNITY_POST'::NOTIFICATION_TYPE, 'posted in Politehnica - Automatica si Calculatoare: "Inscrieri deschise pentru Hackathon-ul ACS."', 'POST'::NOTIFICATION_CATEGORY, false, now() - interval '5 hours', '{"postId": "e0000001-0000-0000-0000-000000000002"}'::jsonb, 'f0000001-0000-0000-0000-000000000001'::uuid),
    ('f0000002-0000-0000-0000-000000000010'::uuid, '1704ba53-75d6-478a-94e5-4618ac372540'::uuid, 'COMMUNITY_POST'::NOTIFICATION_TYPE, 'posted in Politehnica - Automatica si Calculatoare: "Sesiune de intrebari si raspunsuri pentru cursul d"', 'POST'::NOTIFICATION_CATEGORY, false, now() - interval '6 hours', '{"postId": "e0000001-0000-0000-0000-000000000003"}'::jsonb, 'f0000001-0000-0000-0000-000000000002'::uuid),
    ('f0000002-0000-0000-0000-000000000026'::uuid, '1704ba53-75d6-478a-94e5-4618ac372540'::uuid, 'COURSE_POST'::NOTIFICATION_TYPE, 'posted in Programarea calculatoarelor: "Diferenta intre malloc() si calloc()."', 'POST'::NOTIFICATION_CATEGORY, false, now() - interval '8 hours', '{"postId": "e0000002-0000-0000-0000-000000000002"}'::jsonb, 'f0000001-0000-0000-0000-000000000002'::uuid),
    ('f0000002-0000-0000-0000-000000000011'::uuid, '1704ba53-75d6-478a-94e5-4618ac372540'::uuid, 'POST_COMMENT'::NOTIFICATION_TYPE, 'commented on your post: "Ghidul Bobocului"', 'POST'::NOTIFICATION_CATEGORY, false, now() - interval '12 hours', '{"postId": "e0000001-0000-0000-0000-000000000001", "commentId": "c0000001-0000-0000-0000-000000000001"}'::jsonb, 'f0000001-0000-0000-0000-000000000003'::uuid),
    ('f0000002-0000-0000-0000-000000000012'::uuid, '1704ba53-75d6-478a-94e5-4618ac372540'::uuid, 'POST_COMMENT'::NOTIFICATION_TYPE, 'commented on your post: "thread-ul despre pointeri"', 'POST'::NOTIFICATION_CATEGORY, false, now() - interval '16 hours', '{"postId": "e0000002-0000-0000-0000-000000000001", "commentId": "c0000002-0000-0000-0000-000000000001"}'::jsonb, 'f0000001-0000-0000-0000-000000000004'::uuid),
    ('f0000002-0000-0000-0000-000000000013'::uuid, '1704ba53-75d6-478a-94e5-4618ac372540'::uuid, 'POST_LIKE'::NOTIFICATION_TYPE, 'liked your post "Ghidul Bobocului"', 'POST'::NOTIFICATION_CATEGORY, false, now() - interval '18 hours', '{"postId": "e0000001-0000-0000-0000-000000000001"}'::jsonb, 'f0000001-0000-0000-0000-000000000002'::uuid),
    ('f0000002-0000-0000-0000-000000000014'::uuid, '1704ba53-75d6-478a-94e5-4618ac372540'::uuid, 'POST_LIKE'::NOTIFICATION_TYPE, 'liked your post "Ghidul Bobocului"', 'POST'::NOTIFICATION_CATEGORY, false, now() - interval '22 hours', '{"postId": "e0000001-0000-0000-0000-000000000001"}'::jsonb, 'f0000001-0000-0000-0000-000000000001'::uuid),
    ('f0000002-0000-0000-0000-000000000015'::uuid, '1704ba53-75d6-478a-94e5-4618ac372540'::uuid, 'COMMUNITY_POST'::NOTIFICATION_TYPE, 'posted in Politehnica - Automatica si Calculatoare: "Grup de studiu"', 'POST'::NOTIFICATION_CATEGORY, true, now() - interval '1 day', '{"postId": "e0000001-0000-0000-0000-000000000004"}'::jsonb, 'f0000001-0000-0000-0000-000000000003'::uuid),
    ('f0000002-0000-0000-0000-000000000016'::uuid, '1704ba53-75d6-478a-94e5-4618ac372540'::uuid, 'COURSE_POST'::NOTIFICATION_TYPE, 'posted in Programarea calculatoarelor: "Segment fault la citirea din fisier binar."', 'POST'::NOTIFICATION_CATEGORY, false, now() - interval '2 days', '{"postId": "e0000002-0000-0000-0000-000000000003"}'::jsonb, 'f0000001-0000-0000-0000-000000000001'::uuid),
    ('f0000002-0000-0000-0000-000000000017'::uuid, '1704ba53-75d6-478a-94e5-4618ac372540'::uuid, 'POST_COMMENT'::NOTIFICATION_TYPE, 'commented on your post: "solutie pentru problema cu buffer-ul stdin"', 'POST'::NOTIFICATION_CATEGORY, true, now() - interval '2 days', '{"postId": "e0000002-0000-0000-0000-000000000005", "commentId": "c0000002-0000-0000-0000-000000000002"}'::jsonb, 'f0000001-0000-0000-0000-000000000001'::uuid),
    ('f0000002-0000-0000-0000-000000000018'::uuid, '1704ba53-75d6-478a-94e5-4618ac372540'::uuid, 'POST_LIKE'::NOTIFICATION_TYPE, 'liked your post "Ghidul Bobocului"', 'POST'::NOTIFICATION_CATEGORY, true, now() - interval '3 days', '{"postId": "e0000001-0000-0000-0000-000000000001"}'::jsonb, 'f0000001-0000-0000-0000-000000000004'::uuid),
    ('f0000002-0000-0000-0000-000000000019'::uuid, '1704ba53-75d6-478a-94e5-4618ac372540'::uuid, 'COMMUNITY_POST'::NOTIFICATION_TYPE, 'posted in Politehnica - Automatica si Calculatoare: "Concursul de programare ICPC"', 'POST'::NOTIFICATION_CATEGORY, false, now() - interval '4 days', '{"postId": "e0000001-0000-0000-0000-000000000013"}'::jsonb, 'f0000001-0000-0000-0000-000000000003'::uuid),
    ('f0000002-0000-0000-0000-000000000020'::uuid, '1704ba53-75d6-478a-94e5-4618ac372540'::uuid, 'POST_LIKE'::NOTIFICATION_TYPE, 'liked your post "Ghidul Bobocului"', 'POST'::NOTIFICATION_CATEGORY, true, now() - interval '5 days', '{"postId": "e0000001-0000-0000-0000-000000000001"}'::jsonb, 'f0000001-0000-0000-0000-000000000001'::uuid),

    -- 21-25: SYSTEM notifications
    ('f0000002-0000-0000-0000-000000000021'::uuid, '1704ba53-75d6-478a-94e5-4618ac372540'::uuid, 'SYSTEM_ANNOUNCEMENT'::NOTIFICATION_TYPE, 'Contul tau de administrator a fost configurat cu succes.', 'SYSTEM'::NOTIFICATION_CATEGORY, false, now() - interval '7 days', NULL, null),
    ('f0000002-0000-0000-0000-000000000022'::uuid, '1704ba53-75d6-478a-94e5-4618ac372540'::uuid, 'SYSTEM_MAINTENANCE'::NOTIFICATION_TYPE, 'Duminica intre 02:00 si 04:00 vor avea loc actualizari de securitate.', 'SYSTEM'::NOTIFICATION_CATEGORY, false, now() - interval '8 days', NULL, null),
    ('f0000002-0000-0000-0000-000000000023'::uuid, '1704ba53-75d6-478a-94e5-4618ac372540'::uuid, 'SYSTEM_GENERAL'::NOTIFICATION_TYPE, 'Termenii de utilizare au fost actualizati conform noilor reglementari.', 'SYSTEM'::NOTIFICATION_CATEGORY, true, now() - interval '10 days', NULL, null),
    ('f0000002-0000-0000-0000-000000000024'::uuid, '1704ba53-75d6-478a-94e5-4618ac372540'::uuid, 'SYSTEM_ANNOUNCEMENT'::NOTIFICATION_TYPE, 'Listele preliminare de bursa au fost publicate la avizier.', 'SYSTEM'::NOTIFICATION_CATEGORY, true, now() - interval '12 days', NULL, null),
    ('f0000002-0000-0000-0000-000000000025'::uuid, '1704ba53-75d6-478a-94e5-4618ac372540'::uuid, 'SYSTEM_GENERAL'::NOTIFICATION_TYPE, 'Adresa ta institutionala a fost validata cu succes.', 'SYSTEM'::NOTIFICATION_CATEGORY, true, now() - interval '15 days', NULL, null);

