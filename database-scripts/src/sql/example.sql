-- Clear existing data
DELETE FROM application_skill;
DELETE FROM actions;
DELETE FROM application;
DELETE FROM skill;

-- jobs
INSERT INTO application (id, name, position, company, homepage, link, status, create_date, ad, application) VALUES
  ('job-1', 'Acme Corp Frontend Role', 'Senior Frontend Engineer', 'Acme Corp', 'https://acmecorp.com', 'https://acmecorp.com/careers/123', 'applied', 1744390800, 'Looking for a senior frontend engineer with React experience...', 'Dear Hiring Team, I am excited to apply...'),
  ('job-2', 'Globex Backend Engineer', 'Backend Engineer', 'Globex', 'https://globex.io', 'https://globex.io/jobs/456', 'interviewing', 1744827000, 'We are hiring a backend engineer to scale our platform...', 'Dear Globex Team, With my background in distributed systems...'),
  ('job-3', 'Initech Full Stack', 'Full Stack Developer', 'Initech', 'https://initech.dev', 'https://initech.dev/open-roles/789', 'saved', 1746118500, NULL, NULL),
  ('job-4', 'Umbrella Corp SWE', 'Software Engineer', 'Umbrella Corp', 'https://umbrella.com', 'https://umbrella.com/careers/321', 'rejected', 1742928000, 'Seeking a software engineer to join our platform team...', 'Dear Umbrella Team, I would love to contribute...');

-- actions (linked to jobs)
INSERT INTO actions (id, application_id, title, date, note) VALUES
  ('act-1', 'job-1', 'Submitted application', 1744348800, 'Applied via company portal. Used the resume-1 variant'),
  ('act-2', 'job-1', 'Follow-up email sent', 1744953600, 'Sent a follow-up to the recruiter after one week. No response yet'),
  ('act-3', 'job-2', 'Phone screen', 1745212800, 'Had a 30-min intro call with the recruiter. Went well, moving to technical round'),
  ('act-4', 'job-2', 'Technical interview', 1745817600, 'System design + coding round with two engineers. Discussed Kafka and REST design patterns'),
  ('act-5', 'job-4', 'Submitted application', 1742899200, 'Applied via LinkedIn Easy Apply'),
  ('act-6', 'job-4', 'Received rejection', 1743638400, 'Got automated rejection email. Position was filled internally');

-- skills
INSERT INTO skill (id, name) VALUES
  ('skill-1', 'React'),
  ('skill-2', 'TypeScript'),
  ('skill-3', 'CSS / Tailwind'),
  ('skill-4', 'Node.js'),
  ('skill-5', 'PostgreSQL'),
  ('skill-6', 'AWS'),
  ('skill-7', 'GraphQL'),
  ('skill-8', 'Go'),
  ('skill-9', 'Java'),
  ('skill-10', 'Spring Boot');

-- application_skill (linking jobs and skills)
INSERT INTO application_skill (id, application_id, skill_id) VALUES
  ('app-skill-1', 'job-1', 'skill-1'),
  ('app-skill-2', 'job-1', 'skill-2'),
  ('app-skill-3', 'job-1', 'skill-3'),
  ('app-skill-4', 'job-2', 'skill-4'),
  ('app-skill-5', 'job-2', 'skill-5'),
  ('app-skill-6', 'job-2', 'skill-6'),
  ('app-skill-7', 'job-3', 'skill-7'),
  ('app-skill-8', 'job-3', 'skill-8'),
  ('app-skill-9', 'job-4', 'skill-9'),
  ('app-skill-10', 'job-4', 'skill-10');
