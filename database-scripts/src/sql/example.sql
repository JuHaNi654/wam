-- Clear existing data
DELETE FROM application_skill;
DELETE FROM actions;
DELETE FROM job;
DELETE FROM work_history;
DELETE FROM skill;
DELETE FROM resume;

-- resume
INSERT INTO resume (id, introduction) VALUES
  ('resume-1', 'Experienced full-stack developer with 6 years building web applications using TypeScript, React, and Node.js.'),
  ('resume-2', 'Backend engineer specializing in distributed systems, API design, and cloud infrastructure.');

-- work_history (linked to resume-1)
INSERT INTO work_history (id, resume_id, title, description, start_date, end_date) VALUES
  ('wh-1', 'resume-1', 'Senior Frontend Developer', 'Led UI development for a SaaS platform serving 50k users. Migrated codebase from React class components to hooks.', 1614556800, 1730419200),
  ('wh-2', 'resume-1', 'Junior Web Developer', 'Built and maintained internal tooling dashboards using Vue.js and REST APIs.', 1527811200, 1612137600);

-- work_history (linked to resume-2)
INSERT INTO work_history (id, resume_id, title, description, start_date, end_date) VALUES
  ('wh-3', 'resume-2', 'Backend Engineer', 'Designed microservices architecture on AWS. Reduced API response times by 40% through query optimization.', 1577836800, 1735689600),
  ('wh-4', 'resume-2', 'Software Engineer Intern', 'Worked on data pipeline tooling in Python and contributed to internal CI/CD workflows.', 1559347200, 1575158400);

-- jobs
INSERT INTO job (id, name, job_title, company, homepage, link, status, create_date, job_ad, job_application) VALUES
  ('job-1', 'Acme Corp Frontend Role', 'Senior Frontend Engineer', 'Acme Corp', 'https://acmecorp.com', 'https://acmecorp.com/careers/123', 'applied', 1744390800, 'Looking for a senior frontend engineer with React experience...', 'Dear Hiring Team, I am excited to apply...'),
  ('job-2', 'Globex Backend Engineer', 'Backend Engineer', 'Globex', 'https://globex.io', 'https://globex.io/jobs/456', 'interviewing', 1744827000, 'We are hiring a backend engineer to scale our platform...', 'Dear Globex Team, With my background in distributed systems...'),
  ('job-3', 'Initech Full Stack', 'Full Stack Developer', 'Initech', 'https://initech.dev', 'https://initech.dev/open-roles/789', 'saved', 1746118500, NULL, NULL),
  ('job-4', 'Umbrella Corp SWE', 'Software Engineer', 'Umbrella Corp', 'https://umbrella.com', 'https://umbrella.com/careers/321', 'rejected', 1742928000, 'Seeking a software engineer to join our platform team...', 'Dear Umbrella Team, I would love to contribute...');

-- actions (linked to jobs)
INSERT INTO actions (id, job_id, title, description, date, note) VALUES
  ('act-1', 'job-1', 'Submitted application', 'Applied via company portal', 1744348800, 'Used the resume-1 variant'),
  ('act-2', 'job-1', 'Follow-up email sent', 'Sent a follow-up to the recruiter after one week', 1744953600, 'No response yet'),
  ('act-3', 'job-2', 'Phone screen', 'Had a 30-min intro call with the recruiter', 1745212800, 'Went well, moving to technical round'),
  ('act-4', 'job-2', 'Technical interview', 'System design + coding round with two engineers', 1745817600, 'Discussed Kafka and REST design patterns'),
  ('act-5', 'job-4', 'Submitted application', 'Applied via LinkedIn Easy Apply', 1742899200, NULL),
  ('act-6', 'job-4', 'Received rejection', 'Got automated rejection email', 1743638400, 'Position was filled internally');

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
INSERT INTO application_skill (id, job_id, skill_id) VALUES
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
