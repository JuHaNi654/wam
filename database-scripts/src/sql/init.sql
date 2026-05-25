-- work_history
CREATE TABLE work_history (
  id          TEXT PRIMARY KEY,
  resume_id   TEXT NOT NULL REFERENCES resume(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  description TEXT,
  start_date  BIGINT,
  end_date    BIGINT
);

-- resume
CREATE TABLE resume (
  id           TEXT PRIMARY KEY,
  introduction TEXT
);

-- job
CREATE TABLE job (
  id               TEXT PRIMARY KEY,
  name             TEXT NOT NULL,
  job_title        TEXT,
  company          TEXT,
  homepage         TEXT,
  link             TEXT,
  status           TEXT NOT NULL DEFAULT 'saved' CHECK (status IN ('saved', 'applied', 'interviewing', 'offered', 'rejected', 'withdrawn')),
  create_date      BIGINT NOT NULL,
  job_ad           TEXT,
  job_application  TEXT
);

-- actions
CREATE TABLE actions (
  id          TEXT PRIMARY KEY,
  job_id      TEXT NOT NULL REFERENCES job(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  description TEXT,
  date        BIGINT NOT NULL,
  note        TEXT
);

CREATE TABLE application_skill (
  id          TEXT PRIMARY KEY,
  job_id      TEXT NOT NULL REFERENCES job(id),
  skill_id    TEXT NOT NULL REFERENCES skill(id)
);

-- skill
CREATE TABLE skill (
  id     TEXT PRIMARY KEY,
  name   TEXT NOT NULL
);

CREATE UNIQUE INDEX uq_skill_name_normalized ON skill (lower(trim(name)));
