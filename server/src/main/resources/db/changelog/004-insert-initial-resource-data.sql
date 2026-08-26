--liquibase formatted sql
--changeset David:004

-- Insert Rating Metrics
INSERT INTO rating_metrics (name,description) VALUES
('Teaching ability', 'Evaluates the teacher''s ability to effectively deliver content and engage students'),
('Punctuality', 'Evaluates the teacher''s ability to meet student needs on time'),
('Communication', 'Evaluates the teacher''s ability to effectively communicate with students'),
('Knowledge', 'Evaluates the teacher''s depth of knowledge in the subject area'),
('Fairness', 'Evaluates the teacher''s ability to treat all students fairly and without bias');

-- Insert Teachers
INSERT INTO teachers (first_name,last_name) VALUES
('Daniel','Dragulici'),
('Radu','Munteanu'),
('Liviu','Dinu'),
('Alexandru','Gica'),
('Irina','Ciocan'),
('Iulia-Banu','Demergian'),
('Andrei','Halanay'),
('Monica','Tataram'),
('Claudia','Muresean'),
('Mihail','Cherciu'),
('Vasile','Preda'),
('Denis','Enachescu'),
('Ioana','Leustean'),
('Andrei','Sipos'),
('Sorin','Stupariu'),
('Cristian','Kevorhian'),
('Horia','Georgescu'),
('Radu','Boriga'),
('Laurentiu', 'Vasile'),
('Horatiu', 'Cheval'),
('Stefan', 'Popescu'),
('Sorina','Predut'),
('Florentina','Suter'),
('Adela','Georgescu'),
('Iuliana','Munteanu'),
('Diana','Ionita');

-- Insert Community
INSERT INTO communities (id, name, description, members_count,owner_id, created_at, verified, slug)
SELECT gen_random_uuid(), 'FMI - Informatica ID', 'Comunitatea studentilor FMI Informatica ID', 1, id, now(), true, 'fmi-info-id'
FROM users
WHERE username = 'iosub_david';

INSERT INTO community_members (community_id, user_id, role_id)
SELECT c.id, u.id, r.id FROM communities c, users u, roles r
WHERE c.name = 'FMI - Informatica ID' AND u.username = 'iosub_david' AND r.name = 'COMMUNITY_OWNER';

-- Insert Study Years
INSERT INTO study_years (study_year_name, community_id, created_at)
SELECT 'YEAR_1', id, now() FROM communities WHERE name = 'FMI - Informatica ID';

INSERT INTO study_years (study_year_name, community_id, created_at)
SELECT 'YEAR_2', id, now() FROM communities WHERE name = 'FMI - Informatica ID';

-- Insert Courses (Year 1)
INSERT INTO courses (name, slug, abbreviation, study_year_id, semester, description, created_at)
SELECT 'Arhitectura sistemelor de calcul', 'arhitectura-sistemelor-de-calcul', 'ASC', sy.id, 1, 'Daca luati minim 5 la proiect, nu este necesar sa va prezentati la examen.', now()
FROM study_years sy JOIN communities comm ON sy.community_id = comm.id
WHERE comm.name = 'FMI - Informatica ID' AND sy.study_year_name = 'YEAR_1';

INSERT INTO courses (name, slug, abbreviation, study_year_id, semester, description, created_at)
SELECT 'Calcul diferential si integral', 'calcul-diferential-si-integral', 'CDI', sy.id, 1, NULL, now()
FROM study_years sy JOIN communities comm ON sy.community_id = comm.id
WHERE comm.name = 'FMI - Informatica ID' AND sy.study_year_name = 'YEAR_1';

INSERT INTO courses (name, slug, abbreviation, study_year_id, semester, description, created_at)
SELECT 'Instrumente si tehnici de baza in Informatica', 'instrumente-si-tehnici-de-baza-in-informatica', 'ITBI', sy.id, 1, 'Daca luati minim 5 la proiect, nu este necesar sa va prezentati la examen.', now()
FROM study_years sy JOIN communities comm ON sy.community_id = comm.id
WHERE comm.name = 'FMI - Informatica ID' AND sy.study_year_name = 'YEAR_1';

INSERT INTO courses (name, slug, abbreviation, study_year_id, semester, description, created_at)
SELECT 'Programarea algoritmilor', 'programarea-algoritmilor', 'PA', sy.id, 1, NULL, now()
FROM study_years sy JOIN communities comm ON sy.community_id = comm.id
WHERE comm.name = 'FMI - Informatica ID' AND sy.study_year_name = 'YEAR_1';

INSERT INTO courses (name, slug, abbreviation, study_year_id, semester, description, created_at)
SELECT 'Structuri algebrice in informatica', 'structuri-algebrice-in-informatica', 'SAIF', sy.id, 1, 'La sfarsitul fiecarei lectii, se va da un test pentru puncte bonus la examen, pe baza lucrurilor discutate. Din fiecare test se poate obtine maximum 0.8p bonus, pentru un total de 3.2p.

Nota: este usor sa treceti la aceasta materia asta daca primiti puncte bonus😉', now()
FROM study_years sy JOIN communities comm ON sy.community_id = comm.id
WHERE comm.name = 'FMI - Informatica ID' AND sy.study_year_name = 'YEAR_1';

INSERT INTO courses (name, slug, abbreviation, study_year_id, semester, description, created_at)
SELECT 'Tehnici web', 'tehnici-web', 'TW', sy.id, 1, 'Nota la aceasta materie se poate obtine in doua moduri:

1. Daca obtineti nota 10 doar din prezentarea proiectului personal, atunci nu mai trebuie sa va prezentati la examen.
2. Daca nu obtineti nota 10 din prezentare, trebuie sa aveti minimum 5 la prezentarea proiectului si minimum 5 la examen, care va fi pe baza proiectului prezentat la curs.

Nota: dupa ce terminati cursul, profesoara nu va va mai raspunde la mesaje pana cu o saptamana inainte de sesiune.', now()
FROM study_years sy JOIN communities comm ON sy.community_id = comm.id
WHERE comm.name = 'FMI - Informatica ID' AND sy.study_year_name = 'YEAR_1';

INSERT INTO courses (name, slug, abbreviation, study_year_id, semester, description, created_at)
SELECT 'Baze de date', 'baze-de-date', 'BD', sy.id, 2, 'Nota la aceasta materie se obtine pe baza prezentarii proiectului. Nu faceti un proiect complex daca nu stiti foarte bine ce ati scris acolo, deoarece o sa fiti intrebati exact din partea complexa.

Ca sa luati 5, trebuie sa stiti sa faceti niste selecturi pe proiectul vostru in timpul prezentarii.', now()
FROM study_years sy JOIN communities comm ON sy.community_id = comm.id
WHERE comm.name = 'FMI - Informatica ID' AND sy.study_year_name = 'YEAR_1';

INSERT INTO courses (name, slug, abbreviation, study_year_id, semester, description, created_at)
SELECT 'Geometrie si algebra liniara', 'geometrie-si-algebra-liniara', 'GAL', sy.id, 2, NULL, now()
FROM study_years sy JOIN communities comm ON sy.community_id = comm.id
WHERE comm.name = 'FMI - Informatica ID' AND sy.study_year_name = 'YEAR_1';

INSERT INTO courses (name, slug, abbreviation, study_year_id, semester, description, created_at)
SELECT 'Limbaje formale si automate', 'limbaje-formale-si-automate', 'LFA', sy.id, 2, 'Nota la examenul acesta se calculeaza astfel:

1. Nota obtinuta la tema
2. Nota obtinuta la partea de teorie a examenului scris
3. Nota obtinuta la partea de probleme a examenului scris
4. Punctele bonus obtinute pentru raspunsurile date pe parcursul lectiilor

 Trebuie sa obtineti minim 5 la toate 3 componente ca sa treceti.', now()
FROM study_years sy JOIN communities comm ON sy.community_id = comm.id
WHERE comm.name = 'FMI - Informatica ID' AND sy.study_year_name = 'YEAR_1';

INSERT INTO courses (name, slug, abbreviation, study_year_id, semester, description, created_at)
SELECT 'Logica matematica si computationala', 'logica-matematica-si-computationala', 'LMC', sy.id, 2, 'Daca faceti temele colective, porniti din start cu nota 4. Trebuie sa luati doar 0.5p la examen ca sa treceti.', now()
FROM study_years sy JOIN communities comm ON sy.community_id = comm.id
WHERE comm.name = 'FMI - Informatica ID' AND sy.study_year_name = 'YEAR_1';

INSERT INTO courses (name, slug, abbreviation, study_year_id, semester, description, created_at)
SELECT 'Programare orientata pe obiecte', 'programare-orientata-pe-obiecte', 'POO', sy.id, 2, 'Nota se obtine pe baza unui proiect. Daca alegeti sa il trimiteti domnului M. Cherciu, atunci va trebui sa il prezentati timp de 3-5 minute.', now()
FROM study_years sy JOIN communities comm ON sy.community_id = comm.id
WHERE comm.name = 'FMI - Informatica ID' AND sy.study_year_name = 'YEAR_1';

INSERT INTO courses (name, slug, abbreviation, study_year_id, semester, description, created_at)
SELECT 'Structuri de date', 'structuri-de-date', 'SDD', sy.id, 2, 'Daca faceti temele colective, porniti din start cu nota 4. Trebuie sa luati doar 0.5p la examen ca sa treceti.', now()
FROM study_years sy JOIN communities comm ON sy.community_id = comm.id
WHERE comm.name = 'FMI - Informatica ID' AND sy.study_year_name = 'YEAR_1';

-- Insert Courses (Year 2)
INSERT INTO courses (name, slug, abbreviation, study_year_id, semester, description, created_at)
SELECT 'Algoritmi fundamentali', 'algoritmi-fundamentali', 'AF', sy.id, 1, NULL, now()
FROM study_years sy JOIN communities comm ON sy.community_id = comm.id
WHERE comm.name = 'FMI - Informatica ID' AND sy.study_year_name = 'YEAR_2';

INSERT INTO courses (name, slug, abbreviation, study_year_id, semester, description, created_at)
SELECT 'Dezvoltarea aplicatiilor web', 'dezvoltarea-aplicatiilor-web', 'DAW', sy.id, 1, NULL, now()
FROM study_years sy JOIN communities comm ON sy.community_id = comm.id
WHERE comm.name = 'FMI - Informatica ID' AND sy.study_year_name = 'YEAR_2';

INSERT INTO courses (name, slug, abbreviation, study_year_id, semester, description, created_at)
SELECT 'Probabilitati si statistica', 'probabilitati-si-statistica', 'PS', sy.id, 1, NULL, now()
FROM study_years sy JOIN communities comm ON sy.community_id = comm.id
WHERE comm.name = 'FMI - Informatica ID' AND sy.study_year_name = 'YEAR_2';

INSERT INTO courses (name, slug, abbreviation, study_year_id, semester, description, created_at)
SELECT 'Programare functionala', 'programare-functionala', 'PF', sy.id, 1, NULL, now()
FROM study_years sy JOIN communities comm ON sy.community_id = comm.id
WHERE comm.name = 'FMI - Informatica ID' AND sy.study_year_name = 'YEAR_2';

INSERT INTO courses (name, slug, abbreviation, study_year_id, semester, description, created_at)
SELECT 'Sisteme de gestiune a bazelor de date', 'sisteme-de-gestiune-a-bazelor-de-date', 'SGBD', sy.id, 1, NULL, now()
FROM study_years sy JOIN communities comm ON sy.community_id = comm.id
WHERE comm.name = 'FMI - Informatica ID' AND sy.study_year_name = 'YEAR_2';

INSERT INTO courses (name, slug, abbreviation, study_year_id, semester, description, created_at)
SELECT 'Sisteme de operare', 'sisteme-de-operare', 'SO', sy.id, 1, NULL, now()
FROM study_years sy JOIN communities comm ON sy.community_id = comm.id
WHERE comm.name = 'FMI - Informatica ID' AND sy.study_year_name = 'YEAR_2';

INSERT INTO courses (name, slug, abbreviation, study_year_id, semester, description, created_at)
SELECT 'Algoritmi avansati', 'algoritmi-avansati', 'AA', sy.id, 2, NULL, now()
FROM study_years sy JOIN communities comm ON sy.community_id = comm.id
WHERE comm.name = 'FMI - Informatica ID' AND sy.study_year_name = 'YEAR_2';

INSERT INTO courses (name, slug, abbreviation, study_year_id, semester, description, created_at)
SELECT 'Fundamentele limbajelor de programare', 'fundamentele-limbajelor-de-programare', 'FLP', sy.id, 2, NULL, now()
FROM study_years sy JOIN communities comm ON sy.community_id = comm.id
WHERE comm.name = 'FMI - Informatica ID' AND sy.study_year_name = 'YEAR_2';

INSERT INTO courses (name, slug, abbreviation, study_year_id, semester, description, created_at)
SELECT 'Inteligenta artificiala', 'inteligenta-artificiala', 'IA', sy.id, 2, NULL, now()
FROM study_years sy JOIN communities comm ON sy.community_id = comm.id
WHERE comm.name = 'FMI - Informatica ID' AND sy.study_year_name = 'YEAR_2';

INSERT INTO courses (name, slug, abbreviation, study_year_id, semester, description, created_at)
SELECT 'Metode de dezvoltare software', 'metode-de-dezvoltare-software', 'MDS', sy.id, 2, NULL, now()
FROM study_years sy JOIN communities comm ON sy.community_id = comm.id
WHERE comm.name = 'FMI - Informatica ID' AND sy.study_year_name = 'YEAR_2';

INSERT INTO courses (name, slug, abbreviation, study_year_id, semester, description, created_at)
SELECT 'Programare avansata pe obiecte in Java', 'programare-avansata-pe-obiecte-in-java', 'PAO', sy.id, 2, NULL, now()
FROM study_years sy JOIN communities comm ON sy.community_id = comm.id
WHERE comm.name = 'FMI - Informatica ID' AND sy.study_year_name = 'YEAR_2';

INSERT INTO courses (name, slug, abbreviation, study_year_id, semester, description, created_at)
SELECT 'Retele de calculatoare', 'retele-de-calculatoare', 'RC', sy.id, 2, NULL, now()
FROM study_years sy JOIN communities comm ON sy.community_id = comm.id
WHERE comm.name = 'FMI - Informatica ID' AND sy.study_year_name = 'YEAR_2';

-- Insert Course Teachers
INSERT INTO course_teachers (course_id, teacher_id)
SELECT c.id, t.id
FROM courses c
         JOIN study_years sy ON c.study_year_id = sy.id
         JOIN communities comm ON sy.community_id = comm.id
         JOIN teachers t ON (t.last_name = 'Dragulici' AND t.first_name = 'Daniel')
WHERE comm.name = 'FMI - Informatica ID' AND c.name = 'Arhitectura sistemelor de calcul';

INSERT INTO course_teachers (course_id, teacher_id)
SELECT c.id, t.id
FROM courses c
         JOIN study_years sy ON c.study_year_id = sy.id
         JOIN communities comm ON sy.community_id = comm.id
         JOIN teachers t ON (t.last_name = 'Munteanu' AND t.first_name = 'Radu')
WHERE comm.name = 'FMI - Informatica ID' AND c.name = 'Calcul diferential si integral';

INSERT INTO course_teachers (course_id, teacher_id)
SELECT c.id, t.id
FROM courses c
         JOIN study_years sy ON c.study_year_id = sy.id
         JOIN communities comm ON sy.community_id = comm.id
         JOIN teachers t ON (t.last_name = 'Dragulici' AND t.first_name = 'Daniel')
WHERE comm.name = 'FMI - Informatica ID' AND c.name = 'Instrumente si tehnici de baza in Informatica';

INSERT INTO course_teachers (course_id, teacher_id)
SELECT c.id, t.id
FROM courses c
         JOIN study_years sy ON c.study_year_id = sy.id
         JOIN communities comm ON sy.community_id = comm.id
         JOIN teachers t ON (t.last_name = 'Dinu' AND t.first_name = 'Liviu')
WHERE comm.name = 'FMI - Informatica ID' AND c.name = 'Programarea algoritmilor';

INSERT INTO course_teachers (course_id, teacher_id)
SELECT c.id, t.id
FROM courses c
         JOIN study_years sy ON c.study_year_id = sy.id
         JOIN communities comm ON sy.community_id = comm.id
         JOIN teachers t ON (t.last_name = 'Gica' AND t.first_name = 'Alexandru')
WHERE comm.name = 'FMI - Informatica ID' AND c.name = 'Structuri algebrice in informatica';

INSERT INTO course_teachers (course_id, teacher_id)
SELECT c.id, t.id
FROM courses c
         JOIN study_years sy ON c.study_year_id = sy.id
         JOIN communities comm ON sy.community_id = comm.id
         JOIN teachers t ON (t.last_name = 'Ciocan' AND t.first_name = 'Irina')
WHERE comm.name = 'FMI - Informatica ID' AND c.name = 'Tehnici web';

INSERT INTO course_teachers (course_id, teacher_id)
SELECT c.id, t.id
FROM courses c
         JOIN study_years sy ON c.study_year_id = sy.id
         JOIN communities comm ON sy.community_id = comm.id
         JOIN teachers t ON (t.last_name = 'Demergian' AND t.first_name = 'Iulia-Banu')
WHERE comm.name = 'FMI - Informatica ID' AND c.name = 'Baze de date';

INSERT INTO course_teachers (course_id, teacher_id)
SELECT c.id, t.id
FROM courses c
         JOIN study_years sy ON c.study_year_id = sy.id
         JOIN communities comm ON sy.community_id = comm.id
         JOIN teachers t ON (t.last_name = 'Halanay' AND t.first_name = 'Andrei')
WHERE comm.name = 'FMI - Informatica ID' AND c.name = 'Geometrie si algebra liniara';

INSERT INTO course_teachers (course_id, teacher_id)
SELECT c.id, t.id
FROM courses c
         JOIN study_years sy ON c.study_year_id = sy.id
         JOIN communities comm ON sy.community_id = comm.id
         JOIN teachers t ON (t.last_name = 'Tataram' AND t.first_name = 'Monica')
WHERE comm.name = 'FMI - Informatica ID' AND c.name = 'Limbaje formale si automate';

INSERT INTO course_teachers (course_id, teacher_id)
SELECT c.id, t.id
FROM courses c
         JOIN study_years sy ON c.study_year_id = sy.id
         JOIN communities comm ON sy.community_id = comm.id
         JOIN teachers t ON (t.last_name = 'Muresean' AND t.first_name = 'Claudia')
WHERE comm.name = 'FMI - Informatica ID' AND c.name = 'Logica matematica si computationala';

INSERT INTO course_teachers (course_id, teacher_id)
SELECT c.id, t.id
FROM courses c
         JOIN study_years sy ON c.study_year_id = sy.id
         JOIN communities comm ON sy.community_id = comm.id
         JOIN teachers t ON (t.last_name = 'Cherciu' AND t.first_name = 'Mihail')
WHERE comm.name = 'FMI - Informatica ID' AND c.name = 'Programare orientata pe obiecte';

INSERT INTO course_teachers (course_id, teacher_id)
SELECT c.id, t.id
FROM courses c
         JOIN study_years sy ON c.study_year_id = sy.id
         JOIN communities comm ON sy.community_id = comm.id
         JOIN teachers t ON (t.last_name = 'Dragulici' AND t.first_name = 'Daniel')
WHERE comm.name = 'FMI - Informatica ID' AND c.name = 'Programare orientata pe obiecte';

INSERT INTO course_teachers (course_id, teacher_id)
SELECT c.id, t.id
FROM courses c
         JOIN study_years sy ON c.study_year_id = sy.id
         JOIN communities comm ON sy.community_id = comm.id
         JOIN teachers t ON (t.last_name = 'Muresean' AND t.first_name = 'Claudia')
WHERE comm.name = 'FMI - Informatica ID' AND c.name = 'Structuri de date';

INSERT INTO course_teachers (course_id, teacher_id)
SELECT c.id, t.id
FROM courses c
         JOIN study_years sy ON c.study_year_id = sy.id
         JOIN communities comm ON sy.community_id = comm.id
         JOIN teachers t ON (t.last_name = 'Enachescu' AND t.first_name = 'Denis')
WHERE comm.name = 'FMI - Informatica ID' AND c.name = 'Algoritmi fundamentali';

INSERT INTO course_teachers (course_id, teacher_id)
SELECT c.id, t.id
FROM courses c
         JOIN study_years sy ON c.study_year_id = sy.id
         JOIN communities comm ON sy.community_id = comm.id
         JOIN teachers t ON (t.last_name = 'Vasile' AND t.first_name = 'Laurentiu')
WHERE comm.name = 'FMI - Informatica ID' AND c.name = 'Dezvoltarea aplicatiilor web';

INSERT INTO course_teachers (course_id, teacher_id)
SELECT c.id, t.id
FROM courses c
         JOIN study_years sy ON c.study_year_id = sy.id
         JOIN communities comm ON sy.community_id = comm.id
         JOIN teachers t ON (t.last_name = 'Preda' AND t.first_name = 'Vasile')
WHERE comm.name = 'FMI - Informatica ID' AND c.name = 'Probabilitati si statistica';

INSERT INTO course_teachers (course_id, teacher_id)
SELECT c.id, t.id
FROM courses c
         JOIN study_years sy ON c.study_year_id = sy.id
         JOIN communities comm ON sy.community_id = comm.id
         JOIN teachers t ON (t.last_name = 'Leustean' AND t.first_name = 'Ioana')
WHERE comm.name = 'FMI - Informatica ID' AND c.name = 'Programare functionala';

INSERT INTO course_teachers (course_id, teacher_id)
SELECT c.id, t.id
FROM courses c
         JOIN study_years sy ON c.study_year_id = sy.id
         JOIN communities comm ON sy.community_id = comm.id
         JOIN teachers t ON (t.last_name = 'Cheval' AND t.first_name = 'Horatiu')
WHERE comm.name = 'FMI - Informatica ID' AND c.name = 'Programare functionala';

INSERT INTO course_teachers (course_id, teacher_id)
SELECT c.id, t.id
FROM courses c
         JOIN study_years sy ON c.study_year_id = sy.id
         JOIN communities comm ON sy.community_id = comm.id
         JOIN teachers t ON (t.last_name = 'Sipos' AND t.first_name = 'Andrei')
WHERE comm.name = 'FMI - Informatica ID' AND c.name = 'Programare functionala';

INSERT INTO course_teachers (course_id, teacher_id)
SELECT c.id, t.id
FROM courses c
         JOIN study_years sy ON c.study_year_id = sy.id
         JOIN communities comm ON sy.community_id = comm.id
         JOIN teachers t ON (t.last_name = 'Vasile' AND t.first_name = 'Laurentiu')
WHERE comm.name = 'FMI - Informatica ID' AND c.name = 'Sisteme de gestiune a bazelor de date';

INSERT INTO course_teachers (course_id, teacher_id)
SELECT c.id, t.id
FROM courses c
         JOIN study_years sy ON c.study_year_id = sy.id
         JOIN communities comm ON sy.community_id = comm.id
         JOIN teachers t ON (t.last_name = 'Dragulici' AND t.first_name = 'Daniel')
WHERE comm.name = 'FMI - Informatica ID' AND c.name = 'Sisteme de operare';

INSERT INTO course_teachers (course_id, teacher_id)
SELECT c.id, t.id
FROM courses c
         JOIN study_years sy ON c.study_year_id = sy.id
         JOIN communities comm ON sy.community_id = comm.id
         JOIN teachers t ON (t.last_name = 'Stupariu' AND t.first_name = 'Sorin')
WHERE comm.name = 'FMI - Informatica ID' AND c.name = 'Algoritmi avansati';

INSERT INTO course_teachers (course_id, teacher_id)
SELECT c.id, t.id
FROM courses c
         JOIN study_years sy ON c.study_year_id = sy.id
         JOIN communities comm ON sy.community_id = comm.id
         JOIN teachers t ON (t.last_name = 'Popescu' AND t.first_name = 'Stefan')
WHERE comm.name = 'FMI - Informatica ID' AND c.name = 'Algoritmi avansati';

INSERT INTO course_teachers (course_id, teacher_id)
SELECT c.id, t.id
FROM courses c
         JOIN study_years sy ON c.study_year_id = sy.id
         JOIN communities comm ON sy.community_id = comm.id
         JOIN teachers t ON (t.last_name = 'Sipos' AND t.first_name = 'Andrei')
WHERE comm.name = 'FMI - Informatica ID' AND c.name = 'Fundamentele limbajelor de programare';

INSERT INTO course_teachers (course_id, teacher_id)
SELECT c.id, t.id
FROM courses c
         JOIN study_years sy ON c.study_year_id = sy.id
         JOIN communities comm ON sy.community_id = comm.id
         JOIN teachers t ON (t.last_name = 'Enachescu' AND t.first_name = 'Denis')
WHERE comm.name = 'FMI - Informatica ID' AND c.name = 'Inteligenta artificiala';

INSERT INTO course_teachers (course_id, teacher_id)
SELECT c.id, t.id
FROM courses c
         JOIN study_years sy ON c.study_year_id = sy.id
         JOIN communities comm ON sy.community_id = comm.id
         JOIN teachers t ON (t.last_name = 'Kevorhian' AND t.first_name = 'Cristian')
WHERE comm.name = 'FMI - Informatica ID' AND c.name = 'Metode de dezvoltare software';

INSERT INTO course_teachers (course_id, teacher_id)
SELECT c.id, t.id
FROM courses c
         JOIN study_years sy ON c.study_year_id = sy.id
         JOIN communities comm ON sy.community_id = comm.id
         JOIN teachers t ON (t.last_name = 'Boriga' AND t.first_name = 'Radu')
WHERE comm.name = 'FMI - Informatica ID' AND c.name = 'Programare avansata pe obiecte in Java';

INSERT INTO course_teachers (course_id, teacher_id)
SELECT c.id, t.id
FROM courses c
         JOIN study_years sy ON c.study_year_id = sy.id
         JOIN communities comm ON sy.community_id = comm.id
         JOIN teachers t ON (t.last_name = 'Georgescu' AND t.first_name = 'Horia')
WHERE comm.name = 'FMI - Informatica ID' AND c.name = 'Retele de calculatoare';

-- Insert Teacher Communities
INSERT INTO teacher_communities (teacher_id, community_id)
SELECT DISTINCT ct.teacher_id, sy.community_id
FROM course_teachers ct
JOIN courses c ON ct.course_id = c.id
JOIN study_years sy ON c.study_year_id = sy.id;

-- Insert Folders for Courses
INSERT INTO folders (id, name, course_id, created_at, owner_id)
SELECT '35f6d7f5-545b-51a6-acaa-175d69b0de5c'::uuid, 'Materiale', c.id, now(), u.id
FROM courses c, users u, study_years sy, communities comm
WHERE c.study_year_id = sy.id AND sy.community_id = comm.id
  AND comm.name = 'FMI - Informatica ID' AND c.name = 'Arhitectura sistemelor de calcul';

INSERT INTO folders (id, name, course_id, created_at, owner_id)
SELECT 'eb68cae4-f8ef-5276-970d-7f5761d64057'::uuid, 'Examene', c.id, now(), u.id
FROM courses c, users u, study_years sy, communities comm
WHERE c.study_year_id = sy.id AND sy.community_id = comm.id
  AND comm.name = 'FMI - Informatica ID' AND c.name = 'Arhitectura sistemelor de calcul';

INSERT INTO folders (id, name, course_id, created_at, owner_id)
SELECT '3974654c-e940-5b4d-a7e3-76657f118864'::uuid, 'Teme', c.id, now(), u.id
FROM courses c, users u, study_years sy, communities comm
WHERE c.study_year_id = sy.id AND sy.community_id = comm.id
  AND comm.name = 'FMI - Informatica ID' AND c.name = 'Arhitectura sistemelor de calcul';

INSERT INTO folders (id, name, course_id, created_at, owner_id)
SELECT '8f364c62-916c-5141-a410-e13dff33084f'::uuid, 'Materiale', c.id, now(), u.id
FROM courses c, users u, study_years sy, communities comm
WHERE c.study_year_id = sy.id AND sy.community_id = comm.id
  AND comm.name = 'FMI - Informatica ID' AND c.name = 'Calcul diferential si integral';

INSERT INTO folders (id, name, course_id, created_at, owner_id)
SELECT 'a9e68b16-84c5-5698-8dd0-da7c73bcbe75'::uuid, 'Examene', c.id, now(), u.id
FROM courses c, users u, study_years sy, communities comm
WHERE c.study_year_id = sy.id AND sy.community_id = comm.id
  AND comm.name = 'FMI - Informatica ID' AND c.name = 'Calcul diferential si integral';

INSERT INTO folders (id, name, course_id, created_at, owner_id)
SELECT 'a4c30f75-f9f5-5b28-a277-848dfede830b'::uuid, 'Materiale', c.id, now(), u.id
FROM courses c, users u, study_years sy, communities comm
WHERE c.study_year_id = sy.id AND sy.community_id = comm.id
  AND comm.name = 'FMI - Informatica ID' AND c.name = 'Instrumente si tehnici de baza in Informatica';

INSERT INTO folders (id, name, course_id, created_at, owner_id)
SELECT 'cc4ef83c-4cde-5974-9147-2728d60d9adb'::uuid, 'Examene', c.id, now(), u.id
FROM courses c, users u, study_years sy, communities comm
WHERE c.study_year_id = sy.id AND sy.community_id = comm.id
  AND comm.name = 'FMI - Informatica ID' AND c.name = 'Instrumente si tehnici de baza in Informatica';

INSERT INTO folders (id, name, course_id, created_at, owner_id)
SELECT 'ec329b8c-e0d9-5d1e-a21f-a5648087783d'::uuid, 'Teme', c.id, now(), u.id
FROM courses c, users u, study_years sy, communities comm
WHERE c.study_year_id = sy.id AND sy.community_id = comm.id
  AND comm.name = 'FMI - Informatica ID' AND c.name = 'Instrumente si tehnici de baza in Informatica';

INSERT INTO folders (id, name, course_id, created_at, owner_id)
SELECT '57e22219-d5c7-5e9b-a607-4d5a2b4b5c31'::uuid, 'Materiale', c.id, now(), u.id
FROM courses c, users u, study_years sy, communities comm
WHERE c.study_year_id = sy.id AND sy.community_id = comm.id
  AND comm.name = 'FMI - Informatica ID' AND c.name = 'Programarea algoritmilor';

INSERT INTO folders (id, name, course_id, created_at, owner_id)
SELECT 'c9cef1c1-3f4a-518a-92eb-3b6f482c6f4d'::uuid, 'Examene', c.id, now(), u.id
FROM courses c, users u, study_years sy, communities comm
WHERE c.study_year_id = sy.id AND sy.community_id = comm.id
  AND comm.name = 'FMI - Informatica ID' AND c.name = 'Programarea algoritmilor';

INSERT INTO folders (id, name, course_id, created_at, owner_id)
SELECT 'eb35afe4-3f24-52f6-95a6-3157e22afca2'::uuid, 'Materiale', c.id, now(), u.id
FROM courses c, users u, study_years sy, communities comm
WHERE c.study_year_id = sy.id AND sy.community_id = comm.id
  AND comm.name = 'FMI - Informatica ID' AND c.name = 'Structuri algebrice in informatica';

INSERT INTO folders (id, name, course_id, created_at, owner_id)
SELECT 'bb8e35b3-4c5d-533b-af0c-77d0213ce534'::uuid, 'Examene', c.id, now(), u.id
FROM courses c, users u, study_years sy, communities comm
WHERE c.study_year_id = sy.id AND sy.community_id = comm.id
  AND comm.name = 'FMI - Informatica ID' AND c.name = 'Structuri algebrice in informatica';

INSERT INTO folders (id, name, course_id, created_at, owner_id)
SELECT 'af2fec30-b46e-5459-bec1-5d4f776b256f'::uuid, 'Examene', c.id, now(), u.id
FROM courses c, users u, study_years sy, communities comm
WHERE c.study_year_id = sy.id AND sy.community_id = comm.id
  AND comm.name = 'FMI - Informatica ID' AND c.name = 'Tehnici web';

INSERT INTO folders (id, name, course_id, created_at, owner_id)
SELECT '0bea39fc-1412-5dab-b1d8-c34fa1601c16'::uuid, 'Examene', c.id, now(), u.id
FROM courses c, users u, study_years sy, communities comm
WHERE c.study_year_id = sy.id AND sy.community_id = comm.id
  AND comm.name = 'FMI - Informatica ID' AND c.name = 'Baze de date';

INSERT INTO folders (id, name, course_id, created_at, owner_id)
SELECT '1fc619ee-1f40-5de8-aede-961ede74cff6'::uuid, 'Materiale', c.id, now(), u.id
FROM courses c, users u, study_years sy, communities comm
WHERE c.study_year_id = sy.id AND sy.community_id = comm.id
  AND comm.name = 'FMI - Informatica ID' AND c.name = 'Geometrie si algebra liniara';

INSERT INTO folders (id, name, course_id, created_at, owner_id)
SELECT '2822d7db-1b2a-5dbb-b08f-e894f82f0590'::uuid, 'Examene', c.id, now(), u.id
FROM courses c, users u, study_years sy, communities comm
WHERE c.study_year_id = sy.id AND sy.community_id = comm.id
  AND comm.name = 'FMI - Informatica ID' AND c.name = 'Geometrie si algebra liniara';

INSERT INTO folders (id, name, course_id, created_at, owner_id)
SELECT 'ae7c4151-809c-5a61-99de-fa17c865bbc1'::uuid, 'Materiale', c.id, now(), u.id
FROM courses c, users u, study_years sy, communities comm
WHERE c.study_year_id = sy.id AND sy.community_id = comm.id
  AND comm.name = 'FMI - Informatica ID' AND c.name = 'Limbaje formale si automate';

INSERT INTO folders (id, name, course_id, created_at, owner_id)
SELECT '0dcfccad-987a-5fd6-be57-104d2740c9f8'::uuid, 'Examene', c.id, now(), u.id
FROM courses c, users u, study_years sy, communities comm
WHERE c.study_year_id = sy.id AND sy.community_id = comm.id
  AND comm.name = 'FMI - Informatica ID' AND c.name = 'Limbaje formale si automate';

INSERT INTO folders (id, name, course_id, created_at, owner_id)
SELECT '8ea1db2b-44e6-5025-bac4-e64d58871753'::uuid, 'Teme', c.id, now(), u.id
FROM courses c, users u, study_years sy, communities comm
WHERE c.study_year_id = sy.id AND sy.community_id = comm.id
  AND comm.name = 'FMI - Informatica ID' AND c.name = 'Limbaje formale si automate';

INSERT INTO folders (id, name, course_id, created_at, owner_id)
SELECT '6c2459ac-96f0-5662-979a-33f0c103244e'::uuid, 'Materiale', c.id, now(), u.id
FROM courses c, users u, study_years sy, communities comm
WHERE c.study_year_id = sy.id AND sy.community_id = comm.id
  AND comm.name = 'FMI - Informatica ID' AND c.name = 'Logica matematica si computationala';

INSERT INTO folders (id, name, course_id, created_at, owner_id)
SELECT '7f8d88c0-9a96-5231-ada6-cafe37ad65f8'::uuid, 'Examene', c.id, now(), u.id
FROM courses c, users u, study_years sy, communities comm
WHERE c.study_year_id = sy.id AND sy.community_id = comm.id
  AND comm.name = 'FMI - Informatica ID' AND c.name = 'Logica matematica si computationala';

INSERT INTO folders (id, name, course_id, created_at, owner_id)
SELECT '2b863ae6-80de-5e0c-aad5-b91a5a637693'::uuid, 'Teme', c.id, now(), u.id
FROM courses c, users u, study_years sy, communities comm
WHERE c.study_year_id = sy.id AND sy.community_id = comm.id
  AND comm.name = 'FMI - Informatica ID' AND c.name = 'Logica matematica si computationala';

INSERT INTO folders (id, name, course_id, created_at, owner_id)
SELECT 'a3531d08-6838-5581-a366-ff7d0342fa00'::uuid, 'Materiale', c.id, now(), u.id
FROM courses c, users u, study_years sy, communities comm
WHERE c.study_year_id = sy.id AND sy.community_id = comm.id
  AND comm.name = 'FMI - Informatica ID' AND c.name = 'Programare orientata pe obiecte';

INSERT INTO folders (id, name, course_id, created_at, owner_id)
SELECT '6d95a562-5b21-57e6-96a3-783fbce44137'::uuid, 'Teme', c.id, now(), u.id
FROM courses c, users u, study_years sy, communities comm
WHERE c.study_year_id = sy.id AND sy.community_id = comm.id
  AND comm.name = 'FMI - Informatica ID' AND c.name = 'Programare orientata pe obiecte';

INSERT INTO folders (id, name, course_id, created_at, owner_id)
SELECT '8aa82ca0-1c94-535b-a59b-17855ff147b8'::uuid, 'Materiale', c.id, now(), u.id
FROM courses c, users u, study_years sy, communities comm
WHERE c.study_year_id = sy.id AND sy.community_id = comm.id
  AND comm.name = 'FMI - Informatica ID' AND c.name = 'Structuri de date';

INSERT INTO folders (id, name, course_id, created_at, owner_id)
SELECT 'e4e35737-598f-5778-a0ed-0bfb05e07197'::uuid, 'Examene', c.id, now(), u.id
FROM courses c, users u, study_years sy, communities comm
WHERE c.study_year_id = sy.id AND sy.community_id = comm.id
  AND comm.name = 'FMI - Informatica ID' AND c.name = 'Structuri de date';

INSERT INTO folders (id, name, course_id, created_at, owner_id)
SELECT '9f351148-216f-586b-864b-cc63ca82c8fe'::uuid, 'Teme', c.id, now(), u.id
FROM courses c, users u, study_years sy, communities comm
WHERE c.study_year_id = sy.id AND sy.community_id = comm.id
  AND comm.name = 'FMI - Informatica ID' AND c.name = 'Structuri de date';

-- Insert Material Links (Resources + Material Links)
INSERT INTO resources (id, title, type, description, course_id, folder_id, owner_id, created_at, updated_at)
SELECT '28a48535-ba57-5f18-862d-f4862a3fa70c'::uuid, 'Materiale curs', 'MATERIAL_LINK', NULL, f.course_id, '35f6d7f5-545b-51a6-acaa-175d69b0de5c'::uuid, u.id, '2026-07-01 09:08:16.376+00', '2026-07-01 09:08:16.376+00'
FROM folders f, users u WHERE f.id = '35f6d7f5-545b-51a6-acaa-175d69b0de5c'::uuid;
INSERT INTO material_links (id, url, link_type) VALUES ('28a48535-ba57-5f18-862d-f4862a3fa70c'::uuid, 'https://github.com/David-I7/fmi_info_id_materials/tree/main/year%201/semester%201/ASC/curs', 'GITHUB');

INSERT INTO resources (id, title, type, description, course_id, folder_id, owner_id, created_at, updated_at)
SELECT 'c2fb173f-3658-571e-adee-4eda7c7a4b25'::uuid, 'Exemple examene', 'MATERIAL_LINK', NULL, f.course_id, 'eb68cae4-f8ef-5276-970d-7f5761d64057'::uuid, u.id, '2026-07-01 09:10:27.977+00', '2026-07-01 09:10:27.977+00'
FROM folders f, users u WHERE f.id = 'eb68cae4-f8ef-5276-970d-7f5761d64057'::uuid;
INSERT INTO material_links (id, url, link_type) VALUES ('c2fb173f-3658-571e-adee-4eda7c7a4b25'::uuid, 'https://github.com/David-I7/fmi_info_id_materials/tree/main/year%201/semester%201/ASC/examen', 'GITHUB');

INSERT INTO resources (id, title, type, description, course_id, folder_id, owner_id, created_at, updated_at)
SELECT '9d381713-8928-5ff1-a613-3c1773e4b7c8'::uuid, 'Materiale mips', 'MATERIAL_LINK', NULL, f.course_id, '35f6d7f5-545b-51a6-acaa-175d69b0de5c'::uuid, u.id, '2026-07-01 09:10:27.977+00', '2026-07-01 09:10:27.977+00'
FROM folders f, users u WHERE f.id = '35f6d7f5-545b-51a6-acaa-175d69b0de5c'::uuid;
INSERT INTO material_links (id, url, link_type) VALUES ('9d381713-8928-5ff1-a613-3c1773e4b7c8'::uuid, 'https://github.com/David-I7/fmi_info_id_materials/tree/main/year%201/semester%201/ASC/laborator', 'GITHUB');

INSERT INTO resources (id, title, type, description, course_id, folder_id, owner_id, created_at, updated_at)
SELECT '69d7f429-257f-5ae9-84fb-326071702854'::uuid, 'Materiale curs', 'MATERIAL_LINK', NULL, f.course_id, '8f364c62-916c-5141-a410-e13dff33084f'::uuid, u.id, '2026-07-01 09:08:16.376+00', '2026-07-01 09:08:16.376+00'
FROM folders f, users u WHERE f.id = '8f364c62-916c-5141-a410-e13dff33084f'::uuid;
INSERT INTO material_links (id, url, link_type) VALUES ('69d7f429-257f-5ae9-84fb-326071702854'::uuid, 'https://github.com/David-I7/fmi_info_id_materials/tree/main/year%201/semester%201/CDI/curs', 'GITHUB');

INSERT INTO resources (id, title, type, description, course_id, folder_id, owner_id, created_at, updated_at)
SELECT '5dc84f22-850d-5534-822c-eab0ed50fed0'::uuid, 'Exemple examene', 'MATERIAL_LINK', NULL, f.course_id, 'a9e68b16-84c5-5698-8dd0-da7c73bcbe75'::uuid, u.id, '2026-07-01 09:10:27.977+00', '2026-07-01 09:10:27.977+00'
FROM folders f, users u WHERE f.id = 'a9e68b16-84c5-5698-8dd0-da7c73bcbe75'::uuid;
INSERT INTO material_links (id, url, link_type) VALUES ('5dc84f22-850d-5534-822c-eab0ed50fed0'::uuid, 'https://github.com/David-I7/fmi_info_id_materials/tree/main/year%201/semester%201/CDI/examen', 'GITHUB');

INSERT INTO resources (id, title, type, description, course_id, folder_id, owner_id, created_at, updated_at)
SELECT 'f5cea941-427b-5ced-b2db-28f5df8cd67e'::uuid, 'Inregistrari cursuri', 'MATERIAL_LINK', NULL, f.course_id, '8f364c62-916c-5141-a410-e13dff33084f'::uuid, u.id, '2026-07-01 08:50:00.545+00', '2026-07-01 08:50:00.545+00'
FROM folders f, users u WHERE f.id = '8f364c62-916c-5141-a410-e13dff33084f'::uuid;
INSERT INTO material_links (id, url, link_type) VALUES ('f5cea941-427b-5ced-b2db-28f5df8cd67e'::uuid, 'https://youtube.com/playlist?list=PLutQjStBkVhXghinmVbyAjvdrgQAaEl7q&si=d3UQ0Q-5PsP__tdT', 'VIDEO');

INSERT INTO resources (id, title, type, description, course_id, folder_id, owner_id, created_at, updated_at)
SELECT '335dd8a4-0208-56c7-a644-17c4d7fcbce3'::uuid, 'Materiale curs', 'MATERIAL_LINK', NULL, f.course_id, 'a4c30f75-f9f5-5b28-a277-848dfede830b'::uuid, u.id, '2026-07-01 09:08:16.376+00', '2026-07-01 09:08:16.376+00'
FROM folders f, users u WHERE f.id = 'a4c30f75-f9f5-5b28-a277-848dfede830b'::uuid;
INSERT INTO material_links (id, url, link_type) VALUES ('335dd8a4-0208-56c7-a644-17c4d7fcbce3'::uuid, 'https://github.com/David-I7/fmi_info_id_materials/tree/main/year%201/semester%201/ITBI/curs', 'GITHUB');

INSERT INTO resources (id, title, type, description, course_id, folder_id, owner_id, created_at, updated_at)
SELECT '1ef03067-8c9f-5d10-bde1-e30a3b6ce80b'::uuid, 'Exemple examene', 'MATERIAL_LINK', NULL, f.course_id, 'cc4ef83c-4cde-5974-9147-2728d60d9adb'::uuid, u.id, '2026-07-01 09:10:27.977+00', '2026-07-01 09:10:27.977+00'
FROM folders f, users u WHERE f.id = 'cc4ef83c-4cde-5974-9147-2728d60d9adb'::uuid;
INSERT INTO material_links (id, url, link_type) VALUES ('1ef03067-8c9f-5d10-bde1-e30a3b6ce80b'::uuid, 'https://github.com/David-I7/fmi_info_id_materials/tree/main/year%201/semester%201/ITBI/examen', 'GITHUB');

INSERT INTO resources (id, title, type, description, course_id, folder_id, owner_id, created_at, updated_at)
SELECT '2b1e5deb-1cfc-5ad8-80e0-c9048dab4ec3'::uuid, 'Materiale curs', 'MATERIAL_LINK', NULL, f.course_id, '57e22219-d5c7-5e9b-a607-4d5a2b4b5c31'::uuid, u.id, '2026-07-01 09:08:16.376+00', '2026-07-01 09:08:16.376+00'
FROM folders f, users u WHERE f.id = '57e22219-d5c7-5e9b-a607-4d5a2b4b5c31'::uuid;
INSERT INTO material_links (id, url, link_type) VALUES ('2b1e5deb-1cfc-5ad8-80e0-c9048dab4ec3'::uuid, 'https://github.com/David-I7/fmi_info_id_materials/tree/main/year%201/semester%201/PA/curs', 'GITHUB');

INSERT INTO resources (id, title, type, description, course_id, folder_id, owner_id, created_at, updated_at)
SELECT 'a8103a34-9534-5ce1-b43d-37789270f6d9'::uuid, 'Exemple examene', 'MATERIAL_LINK', NULL, f.course_id, 'c9cef1c1-3f4a-518a-92eb-3b6f482c6f4d'::uuid, u.id, '2026-07-01 09:10:27.977+00', '2026-07-01 09:10:27.977+00'
FROM folders f, users u WHERE f.id = 'c9cef1c1-3f4a-518a-92eb-3b6f482c6f4d'::uuid;
INSERT INTO material_links (id, url, link_type) VALUES ('a8103a34-9534-5ce1-b43d-37789270f6d9'::uuid, 'https://github.com/David-I7/fmi_info_id_materials/tree/main/year%201/semester%201/PA/examen', 'GITHUB');

INSERT INTO resources (id, title, type, description, course_id, folder_id, owner_id, created_at, updated_at)
SELECT 'a1bbb9a7-ff1a-5c2a-a2c1-34a77d245836'::uuid, 'Inregistrari cursuri', 'MATERIAL_LINK', NULL, f.course_id, 'eb35afe4-3f24-52f6-95a6-3157e22afca2'::uuid, u.id, '2026-07-01 08:50:00.545+00', '2026-07-01 08:50:00.545+00'
FROM folders f, users u WHERE f.id = 'eb35afe4-3f24-52f6-95a6-3157e22afca2'::uuid;
INSERT INTO material_links (id, url, link_type) VALUES ('a1bbb9a7-ff1a-5c2a-a2c1-34a77d245836'::uuid, 'https://youtube.com/playlist?list=PLutQjStBkVhWgjW5NDnIoY6lbkT3ayrSA&si=Sueym3m4MDqrUzNg', 'VIDEO');

INSERT INTO resources (id, title, type, description, course_id, folder_id, owner_id, created_at, updated_at)
SELECT 'b1bbfe9b-ace7-55dc-be82-c2d83af64d11'::uuid, 'Materiale curs', 'MATERIAL_LINK', NULL, f.course_id, 'eb35afe4-3f24-52f6-95a6-3157e22afca2'::uuid, u.id, '2026-07-01 08:53:20.863+00', '2026-07-01 08:53:20.863+00'
FROM folders f, users u WHERE f.id = 'eb35afe4-3f24-52f6-95a6-3157e22afca2'::uuid;
INSERT INTO material_links (id, url, link_type) VALUES ('b1bbfe9b-ace7-55dc-be82-c2d83af64d11'::uuid, 'https://github.com/David-I7/fmi_info_id_materials/tree/main/year%201/semester%201/SAIF/curs', 'GITHUB');

INSERT INTO resources (id, title, type, description, course_id, folder_id, owner_id, created_at, updated_at)
SELECT '6184d9e0-a9fc-5e8c-accf-0afc2425b8c3'::uuid, 'Exemple examene', 'MATERIAL_LINK', NULL, f.course_id, 'bb8e35b3-4c5d-533b-af0c-77d0213ce534'::uuid, u.id, '2026-07-01 08:54:17.574+00', '2026-07-01 08:54:17.574+00'
FROM folders f, users u WHERE f.id = 'bb8e35b3-4c5d-533b-af0c-77d0213ce534'::uuid;
INSERT INTO material_links (id, url, link_type) VALUES ('6184d9e0-a9fc-5e8c-accf-0afc2425b8c3'::uuid, 'https://github.com/David-I7/fmi_info_id_materials/tree/main/year%201/semester%201/SAIF/examen', 'GITHUB');

INSERT INTO resources (id, title, type, description, course_id, folder_id, owner_id, created_at, updated_at)
SELECT 'f9e3d720-0489-536a-9bdd-323da2775e16'::uuid, 'Materiale curs', 'MATERIAL_LINK', NULL, f.course_id, '1fc619ee-1f40-5de8-aede-961ede74cff6'::uuid, u.id, '2026-07-01 09:08:16.376+00', '2026-07-01 09:08:16.376+00'
FROM folders f, users u WHERE f.id = '1fc619ee-1f40-5de8-aede-961ede74cff6'::uuid;
INSERT INTO material_links (id, url, link_type) VALUES ('f9e3d720-0489-536a-9bdd-323da2775e16'::uuid, 'https://github.com/David-I7/fmi_info_id_materials/tree/main/year%201/semester%202/Algebra%20Liniara/curs', 'GITHUB');

INSERT INTO resources (id, title, type, description, course_id, folder_id, owner_id, created_at, updated_at)
SELECT '688a67ff-4be3-556d-b4cc-422b8d352686'::uuid, 'Exemple examene', 'MATERIAL_LINK', NULL, f.course_id, '2822d7db-1b2a-5dbb-b08f-e894f82f0590'::uuid, u.id, '2026-07-01 09:10:27.977+00', '2026-07-01 09:10:27.977+00'
FROM folders f, users u WHERE f.id = '2822d7db-1b2a-5dbb-b08f-e894f82f0590'::uuid;
INSERT INTO material_links (id, url, link_type) VALUES ('688a67ff-4be3-556d-b4cc-422b8d352686'::uuid, 'https://github.com/David-I7/fmi_info_id_materials/tree/main/year%201/semester%202/Algebra%20Liniara/examen', 'GITHUB');

INSERT INTO resources (id, title, type, description, course_id, folder_id, owner_id, created_at, updated_at)
SELECT '3d82d116-9b58-5abf-9478-9c5a4b643784'::uuid, 'Inregistrari cursuri', 'MATERIAL_LINK', NULL, f.course_id, '1fc619ee-1f40-5de8-aede-961ede74cff6'::uuid, u.id, '2026-07-01 08:50:00.545+00', '2026-07-01 08:50:00.545+00'
FROM folders f, users u WHERE f.id = '1fc619ee-1f40-5de8-aede-961ede74cff6'::uuid;
INSERT INTO material_links (id, url, link_type) VALUES ('3d82d116-9b58-5abf-9478-9c5a4b643784'::uuid, 'https://www.youtube.com/playlist?list=PLutQjStBkVhX50CzMUmnjufCYepdLi-8Y', 'VIDEO');

INSERT INTO resources (id, title, type, description, course_id, folder_id, owner_id, created_at, updated_at)
SELECT '71b86357-d0d7-55c2-99a8-1f4e37d4d844'::uuid, 'Materiale curs', 'MATERIAL_LINK', NULL, f.course_id, 'ae7c4151-809c-5a61-99de-fa17c865bbc1'::uuid, u.id, '2026-07-01 09:08:16.376+00', '2026-07-01 09:08:16.376+00'
FROM folders f, users u WHERE f.id = 'ae7c4151-809c-5a61-99de-fa17c865bbc1'::uuid;
INSERT INTO material_links (id, url, link_type) VALUES ('71b86357-d0d7-55c2-99a8-1f4e37d4d844'::uuid, 'https://github.com/David-I7/fmi_info_id_materials/tree/main/year%201/semester%202/LFA/curs', 'GITHUB');

INSERT INTO resources (id, title, type, description, course_id, folder_id, owner_id, created_at, updated_at)
SELECT '8981c6ad-10b7-5934-8745-ad03f1da349d'::uuid, 'Exemple examene', 'MATERIAL_LINK', NULL, f.course_id, '0dcfccad-987a-5fd6-be57-104d2740c9f8'::uuid, u.id, '2026-07-01 09:10:27.977+00', '2026-07-01 09:10:27.977+00'
FROM folders f, users u WHERE f.id = '0dcfccad-987a-5fd6-be57-104d2740c9f8'::uuid;
INSERT INTO material_links (id, url, link_type) VALUES ('8981c6ad-10b7-5934-8745-ad03f1da349d'::uuid, 'https://github.com/David-I7/fmi_info_id_materials/tree/main/year%201/semester%202/LFA/examen', 'GITHUB');

INSERT INTO resources (id, title, type, description, course_id, folder_id, owner_id, created_at, updated_at)
SELECT 'bf3728a7-cd1a-56ae-8a65-29d1ba616343'::uuid, 'Inregistrari cursuri', 'MATERIAL_LINK', NULL, f.course_id, 'ae7c4151-809c-5a61-99de-fa17c865bbc1'::uuid, u.id, '2026-07-01 08:50:00.545+00', '2026-07-01 08:50:00.545+00'
FROM folders f, users u WHERE f.id = 'ae7c4151-809c-5a61-99de-fa17c865bbc1'::uuid;
INSERT INTO material_links (id, url, link_type) VALUES ('bf3728a7-cd1a-56ae-8a65-29d1ba616343'::uuid, 'https://youtube.com/playlist?list=PLutQjStBkVhVGg5wtPV6aAR8WR_GFwDeh&si=UKJsF-BcMHjOoZ0Z', 'VIDEO');

INSERT INTO resources (id, title, type, description, course_id, folder_id, owner_id, created_at, updated_at)
SELECT '4897f70b-0165-5a44-8a66-9f7e51008d03'::uuid, 'Materiale curs', 'MATERIAL_LINK', NULL, f.course_id, '6c2459ac-96f0-5662-979a-33f0c103244e'::uuid, u.id, '2026-07-01 09:08:16.376+00', '2026-07-01 09:08:16.376+00'
FROM folders f, users u WHERE f.id = '6c2459ac-96f0-5662-979a-33f0c103244e'::uuid;
INSERT INTO material_links (id, url, link_type) VALUES ('4897f70b-0165-5a44-8a66-9f7e51008d03'::uuid, 'https://github.com/David-I7/fmi_info_id_materials/tree/main/year%201/semester%202/LMC/curs', 'GITHUB');

INSERT INTO resources (id, title, type, description, course_id, folder_id, owner_id, created_at, updated_at)
SELECT '5ed40275-de5a-5310-8da1-f5fd58e543e3'::uuid, 'Exemple examene', 'MATERIAL_LINK', NULL, f.course_id, '7f8d88c0-9a96-5231-ada6-cafe37ad65f8'::uuid, u.id, '2026-07-01 09:10:27.977+00', '2026-07-01 09:10:27.977+00'
FROM folders f, users u WHERE f.id = '7f8d88c0-9a96-5231-ada6-cafe37ad65f8'::uuid;
INSERT INTO material_links (id, url, link_type) VALUES ('5ed40275-de5a-5310-8da1-f5fd58e543e3'::uuid, 'https://github.com/David-I7/fmi_info_id_materials/tree/main/year%201/semester%202/LMC/examen', 'GITHUB');

INSERT INTO resources (id, title, type, description, course_id, folder_id, owner_id, created_at, updated_at)
SELECT '6d3c949e-eaff-592c-9f29-de71fa8fd490'::uuid, 'Materiale curs', 'MATERIAL_LINK', NULL, f.course_id, 'a3531d08-6838-5581-a366-ff7d0342fa00'::uuid, u.id, '2026-07-01 09:08:16.376+00', '2026-07-01 09:08:16.376+00'
FROM folders f, users u WHERE f.id = 'a3531d08-6838-5581-a366-ff7d0342fa00'::uuid;
INSERT INTO material_links (id, url, link_type) VALUES ('6d3c949e-eaff-592c-9f29-de71fa8fd490'::uuid, 'https://github.com/David-I7/fmi_info_id_materials/tree/main/year%201/semester%202/POO/curs', 'GITHUB');

INSERT INTO resources (id, title, type, description, course_id, folder_id, owner_id, created_at, updated_at)
SELECT 'ac1851a5-18bc-50fe-b792-0ff2d7928cf9'::uuid, 'Lista proiecte', 'MATERIAL_LINK', NULL, f.course_id, '6d95a562-5b21-57e6-96a3-783fbce44137'::uuid, u.id, '2026-07-01 09:10:27.977+00', '2026-07-01 09:10:27.977+00'
FROM folders f, users u WHERE f.id = '6d95a562-5b21-57e6-96a3-783fbce44137'::uuid;
INSERT INTO material_links (id, url, link_type) VALUES ('ac1851a5-18bc-50fe-b792-0ff2d7928cf9'::uuid, 'https://github.com/David-I7/fmi_info_id_materials/tree/main/year%201/semester%202/POO/teme', 'GITHUB');

INSERT INTO resources (id, title, type, description, course_id, folder_id, owner_id, created_at, updated_at)
SELECT 'c003a1fb-9a27-549d-bc98-ddcd44971ab6'::uuid, 'Materiale curs', 'MATERIAL_LINK', NULL, f.course_id, '8aa82ca0-1c94-535b-a59b-17855ff147b8'::uuid, u.id, '2026-07-01 09:08:16.376+00', '2026-07-01 09:08:16.376+00'
FROM folders f, users u WHERE f.id = '8aa82ca0-1c94-535b-a59b-17855ff147b8'::uuid;
INSERT INTO material_links (id, url, link_type) VALUES ('c003a1fb-9a27-549d-bc98-ddcd44971ab6'::uuid, 'https://github.com/David-I7/fmi_info_id_materials/tree/main/year%201/semester%202/Structuri%20de%20date/curs', 'GITHUB');

INSERT INTO resources (id, title, type, description, course_id, folder_id, owner_id, created_at, updated_at)
SELECT '12dcc7d8-a676-5ec0-94e3-8a464fd49c6e'::uuid, 'Exemple examene', 'MATERIAL_LINK', NULL, f.course_id, 'e4e35737-598f-5778-a0ed-0bfb05e07197'::uuid, u.id, '2026-07-01 09:10:27.977+00', '2026-07-01 09:10:27.977+00'
FROM folders f, users u WHERE f.id = 'e4e35737-598f-5778-a0ed-0bfb05e07197'::uuid;
INSERT INTO material_links (id, url, link_type) VALUES ('12dcc7d8-a676-5ec0-94e3-8a464fd49c6e'::uuid, 'https://github.com/David-I7/fmi_info_id_materials/tree/main/year%201/semester%202/Structuri%20de%20date/examen', 'GITHUB');

-- Insert Events (Exams & Assignments)
INSERT INTO events (id, title, type, description, start_time, location, course_id, community_id, owner_id, created_at, updated_at)
SELECT '35a42333-1447-52fd-a99a-873257c56963'::uuid, 'Examen scris', 'EXAM', 'Aveti voie cu materiale scrise de mana la examen', '2026-01-20 18:00:00+00', 'IN_PERSON', c.id, comm.id, u.id, '2026-07-01 09:11:18.827+00', '2026-07-01 09:11:18.827+00'
FROM courses c, users u, study_years sy, communities comm
WHERE c.study_year_id = sy.id AND sy.community_id = comm.id
  AND comm.name = 'FMI - Informatica ID' AND c.name = 'Arhitectura sistemelor de calcul' AND u.username = 'iosub_david';

INSERT INTO events (id, title, type, description, start_time, location, course_id, community_id, owner_id, created_at, updated_at)
SELECT '15ed5abc-0370-5d4d-8ea2-875c4902de23'::uuid, 'Examen scris', 'EXAM', 'Nu aveti voie cu materiale scrise de mana la examen', '2026-01-25 12:00:00+00', 'IN_PERSON', c.id, comm.id, u.id, '2026-07-01 09:11:18.827+00', '2026-07-01 09:11:18.827+00'
FROM courses c, users u, study_years sy, communities comm
WHERE c.study_year_id = sy.id AND sy.community_id = comm.id
  AND comm.name = 'FMI - Informatica ID' AND c.name = 'Calcul diferential si integral' AND u.username = 'iosub_david';

INSERT INTO events (id, title, type, description, start_time, location, course_id, community_id, owner_id, created_at, updated_at)
SELECT 'a679d179-be17-5e11-82bc-fe01d09cd870'::uuid, 'Examen scris', 'EXAM', 'Aveti voie cu materiale scrise de mana la examen', '2026-01-25 12:00:00+00', 'IN_PERSON', c.id, comm.id, u.id, '2026-07-01 09:11:18.827+00', '2026-07-01 09:11:18.827+00'
FROM courses c, users u, study_years sy, communities comm
WHERE c.study_year_id = sy.id AND sy.community_id = comm.id
  AND comm.name = 'FMI - Informatica ID' AND c.name = 'Instrumente si tehnici de baza in Informatica' AND u.username = 'iosub_david';

INSERT INTO events (id, title, type, description, start_time, location, course_id, community_id, owner_id, created_at, updated_at)
SELECT '1d6b133b-ca8b-5fa1-b27b-2181c48eec4d'::uuid, 'Examen scris', 'EXAM', 'Nu aveti voie cu materiale scrise de mana la examen', '2026-01-31 10:00:00+00', 'IN_PERSON', c.id, comm.id, u.id, '2026-07-01 09:11:18.827+00', '2026-07-01 09:11:18.827+00'
FROM courses c, users u, study_years sy, communities comm
WHERE c.study_year_id = sy.id AND sy.community_id = comm.id
  AND comm.name = 'FMI - Informatica ID' AND c.name = 'Programarea algoritmilor' AND u.username = 'iosub_david';

INSERT INTO events (id, title, type, description, start_time, location, course_id, community_id, owner_id, created_at, updated_at)
SELECT 'bd6a020e-7f30-537f-b2bb-81f8e92aac8d'::uuid, 'Examen scris', 'EXAM', 'Nu aveti voie cu materiale scrise de mana la examen', '2026-02-07 10:00:00+00', 'IN_PERSON', c.id, comm.id, u.id, '2026-07-01 09:01:18.325+00', '2026-07-01 09:01:18.325+00'
FROM courses c, users u, study_years sy, communities comm
WHERE c.study_year_id = sy.id AND sy.community_id = comm.id
  AND comm.name = 'FMI - Informatica ID' AND c.name = 'Structuri algebrice in informatica' AND u.username = 'iosub_david';

INSERT INTO events (id, title, type, description, start_time, location, course_id, community_id, owner_id, created_at, updated_at)
SELECT 'd75fc805-3803-502e-9ba8-4b0c5dcb8461'::uuid, 'Examen pe calculator', 'EXAM', 'Puteti veni cu latopul personal', '2026-02-15 10:00:00+00', 'IN_PERSON', c.id, comm.id, u.id, '2026-07-01 09:11:18.827+00', '2026-07-01 09:11:18.827+00'
FROM courses c, users u, study_years sy, communities comm
WHERE c.study_year_id = sy.id AND sy.community_id = comm.id
  AND comm.name = 'FMI - Informatica ID' AND c.name = 'Tehnici web' AND u.username = 'iosub_david';

INSERT INTO events (id, title, type, description, start_time, location, course_id, community_id, owner_id, created_at, updated_at)
SELECT '49c48d59-f8b7-513a-a2d1-1ffdcad14391'::uuid, 'Prezentare proiect', 'EXAM', 'Prezentarea se va sustine online. Trebuie sa luat jumatate din punctaj ca sa intrati in examenul pe calculator', '2026-02-15 10:00:00+00', 'ONLINE', c.id, comm.id, u.id, '2026-07-01 09:11:18.827+00', '2026-07-01 09:11:18.827+00'
FROM courses c, users u, study_years sy, communities comm
WHERE c.study_year_id = sy.id AND sy.community_id = comm.id
  AND comm.name = 'FMI - Informatica ID' AND c.name = 'Tehnici web' AND u.username = 'iosub_david';

INSERT INTO events (id, title, type, description, start_time, location, course_id, community_id, owner_id, created_at, updated_at)
SELECT 'a1e0848d-6be3-554c-9fb6-4a9b48ca7c7f'::uuid, 'Prezentare proiect', 'EXAM', 'Prezentarea se poate sustine online sau fizic. Daca nu stapaniti materia foarte bine, va sugerez sa mergeti fizic, deoarece aveti sanse mai mari sa treceti.', '2026-06-30 10:00:00+00', 'IN_PERSON', c.id, comm.id, u.id, '2026-07-01 09:11:18.827+00', '2026-07-01 09:11:18.827+00'
FROM courses c, users u, study_years sy, communities comm
WHERE c.study_year_id = sy.id AND sy.community_id = comm.id
  AND comm.name = 'FMI - Informatica ID' AND c.name = 'Baze de date' AND u.username = 'iosub_david';

INSERT INTO events (id, title, type, description, start_time, location, course_id, community_id, owner_id, created_at, updated_at)
SELECT 'b589ce5a-8708-57d8-8af1-8f96ee76fb15'::uuid, 'Examen scris', 'EXAM', 'Aveti voie cu materiale scrise de mana la examen', '2026-06-21 10:00:00+00', 'IN_PERSON', c.id, comm.id, u.id, '2026-07-01 09:11:18.827+00', '2026-07-01 09:11:18.827+00'
FROM courses c, users u, study_years sy, communities comm
WHERE c.study_year_id = sy.id AND sy.community_id = comm.id
  AND comm.name = 'FMI - Informatica ID' AND c.name = 'Geometrie si algebra liniara' AND u.username = 'iosub_david';

INSERT INTO events (id, title, type, description, start_time, location, course_id, community_id, owner_id, created_at, updated_at)
SELECT '70629015-e8f4-5367-abb4-003a1934943f'::uuid, 'Examen scris', 'EXAM', 'Nu aveti voie cu materiale scrise de mana la examen', '2026-06-13 10:00:00+00', 'IN_PERSON', c.id, comm.id, u.id, '2026-07-01 09:11:18.827+00', '2026-07-01 09:11:18.827+00'
FROM courses c, users u, study_years sy, communities comm
WHERE c.study_year_id = sy.id AND sy.community_id = comm.id
  AND comm.name = 'FMI - Informatica ID' AND c.name = 'Limbaje formale si automate' AND u.username = 'iosub_david';

INSERT INTO events (id, title, type, description, start_time, location, course_id, community_id, owner_id, created_at, updated_at)
SELECT '7d192339-b929-56cc-ac1a-a6a107947b5c'::uuid, 'Examen scris', 'EXAM', 'Aveti voie cu materiale scrise de mana la examen', '2026-06-27 12:00:00+00', 'IN_PERSON', c.id, comm.id, u.id, '2026-07-01 09:11:18.827+00', '2026-07-01 09:11:18.827+00'
FROM courses c, users u, study_years sy, communities comm
WHERE c.study_year_id = sy.id AND sy.community_id = comm.id
  AND comm.name = 'FMI - Informatica ID' AND c.name = 'Logica matematica si computationala' AND u.username = 'iosub_david';

INSERT INTO events (id, title, type, description, start_time, location, course_id, community_id, owner_id, created_at, updated_at)
SELECT '8ac11726-059b-5898-96c4-b2c6da14f586'::uuid, 'Examen scris', 'EXAM', 'Aveti voie cu materiale scrise de mana la examen', '2026-06-28 12:00:00+00', 'IN_PERSON', c.id, comm.id, u.id, '2026-07-01 09:11:18.827+00', '2026-07-01 09:11:18.827+00'
FROM courses c, users u, study_years sy, communities comm
WHERE c.study_year_id = sy.id AND sy.community_id = comm.id
  AND comm.name = 'FMI - Informatica ID' AND c.name = 'Structuri de date' AND u.username = 'iosub_david';

INSERT INTO events (id, title, type, description, start_time, location, course_id, community_id, owner_id, created_at, updated_at)
SELECT '51365991-3559-541f-8060-2f8338c06bd6'::uuid, 'Proiect mips', 'ASSIGNMENT', NULL, '2026-01-20 18:00:00+00', 'ONLINE', c.id, comm.id, u.id, '2026-07-01 09:13:38.210+00', '2026-07-01 09:13:38.210+00'
FROM courses c, users u, study_years sy, communities comm
WHERE c.study_year_id = sy.id AND sy.community_id = comm.id
  AND comm.name = 'FMI - Informatica ID' AND c.name = 'Arhitectura sistemelor de calcul' AND u.username = 'iosub_david';

INSERT INTO events (id, title, type, description, start_time, location, course_id, community_id, owner_id, created_at, updated_at)
SELECT '9312d7ab-3f63-534a-a3c7-83877a23683d'::uuid, 'Proiect procese semnale si/sau tuburi', 'ASSIGNMENT', NULL, '2026-01-17 16:00:00+00', 'ONLINE', c.id, comm.id, u.id, '2026-07-01 09:13:38.210+00', '2026-07-01 09:13:38.210+00'
FROM courses c, users u, study_years sy, communities comm
WHERE c.study_year_id = sy.id AND sy.community_id = comm.id
  AND comm.name = 'FMI - Informatica ID' AND c.name = 'Sisteme de operare' AND u.username = 'iosub_david';

INSERT INTO events (id, title, type, description, start_time, location, course_id, community_id, owner_id, created_at, updated_at)
SELECT 'a83e36d8-2a7e-5ad5-bc6c-627ed8eb81a8'::uuid, 'Tema lfa', 'ASSIGNMENT', NULL, '2026-05-30 00:00:00+00', 'ONLINE', c.id, comm.id, u.id, '2026-07-01 09:13:38.210+00', '2026-07-01 09:13:38.210+00'
FROM courses c, users u, study_years sy, communities comm
WHERE c.study_year_id = sy.id AND sy.community_id = comm.id
  AND comm.name = 'FMI - Informatica ID' AND c.name = 'Limbaje formale si automate' AND u.username = 'iosub_david';

INSERT INTO events (id, title, type, description, start_time, location, course_id, community_id, owner_id, created_at, updated_at)
SELECT 'b7edb0ab-06d0-504e-861f-d2c1f32173ec'::uuid, 'Teme colective lmc', 'ASSIGNMENT', 'Trei teme care valoreaza 1p fiecare si trebuie trimise doar de un membru al fiecarei grupe', '2026-05-30 00:00:00+00', 'ONLINE', c.id, comm.id, u.id, '2026-07-01 09:13:38.210+00', '2026-07-01 09:13:38.210+00'
FROM courses c, users u, study_years sy, communities comm
WHERE c.study_year_id = sy.id AND sy.community_id = comm.id
  AND comm.name = 'FMI - Informatica ID' AND c.name = 'Logica matematica si computationala' AND u.username = 'iosub_david';

INSERT INTO events (id, title, type, description, start_time, location, course_id, community_id, owner_id, created_at, updated_at)
SELECT '7afffa03-284b-5eb3-9f54-aab9544222cd'::uuid, 'Proiect POO', 'ASSIGNMENT', 'Nota la proiect reprezinta nota finala trecuta in catalog', '2026-06-11 00:00:00+00', 'ONLINE', c.id, comm.id, u.id, '2026-07-01 09:13:38.210+00', '2026-07-01 09:13:38.210+00'
FROM courses c, users u, study_years sy, communities comm
WHERE c.study_year_id = sy.id AND sy.community_id = comm.id
  AND comm.name = 'FMI - Informatica ID' AND c.name = 'Programare orientata pe obiecte' AND u.username = 'iosub_david';

INSERT INTO events (id, title, type, description, start_time, location, course_id, community_id, owner_id, created_at, updated_at)
SELECT '993f711f-264a-5833-a09b-6abece8fff08'::uuid, 'Teme colective sd', 'ASSIGNMENT', 'Tema care trebuie trimisa doar de un membru al fiecarei grupe', '2026-05-30 00:00:00+00', 'ONLINE', c.id, comm.id, u.id, '2026-07-01 09:13:38.210+00', '2026-07-01 09:13:38.210+00'
FROM courses c, users u, study_years sy, communities comm
WHERE c.study_year_id = sy.id AND sy.community_id = comm.id
  AND comm.name = 'FMI - Informatica ID' AND c.name = 'Structuri de date' AND u.username = 'iosub_david';
