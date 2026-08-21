--liquibase formatted sql
--changeset David:002

INSERT INTO rating_metrics (name,description) VALUES
('Teaching ability', 'Evaluates the teacher''s ability to effectively deliver content and engage students'),
('Punctuality', 'Evaluates the teacher''s ability to meet student needs on time'),
('Communication', 'Evaluates the teacher''s ability to effectively communicate with students'),
('Knowledge', 'Evaluates the teacher''s depth of knowledge in the subject area'),
('Fairness', 'Evaluates the teacher''s ability to treat all students fairly and without bias');

INSERT INTO teachers (first_name,last_name) VALUES
('Daniel','Dragulici'),
('Radu','Munteanu'),
('Liviu','Dinu'),
('Alexandru','Gica'),
('Irina','Ciocan'),
('Iulia-Banu','Demergian'),
('Andrei','Halanay'),
('Monica','Tataram'),
('Claudia','Mureseam'),
('Mihail','Cherciu'),
('Vasile','Preda'),
('Denis','Enachescu'),
('Ioana','Leustean'),
('Andrei','Sipos'),
('Sorin','Stupariu'),
('Cristian','Kevorhian'),
('Horia','Georgescu'),
('Radu','Boriga');
