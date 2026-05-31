-- resume
CREATE TABLE profile (
  id           TEXT PRIMARY KEY,
  introduction TEXT
);

-- profile_skill
CREATE TABLE profile_skill (
  profile_id  TEXT, 
  skill_id    TEXT,

  PRIMARY KEY (profile_id, skill_id),

  FOREIGN KEY (profile_id) REFERENCES profile(id) ON DELETE CASCADE,
  FOREIGN KEY (skill_id) REFERENCES skill(id) ON DELETE CASCADE
);

-- history
CREATE TABLE history (
  id          TEXT PRIMARY KEY,
  company     TEXT NOT NULL,
  title       TEXT NOT NULL,
  description TEXT,
  start_date  BIGINT NOT NULL,
  end_date    BIGINT NOT NULL,
  current     BOOLEAN,

  profile_id  TEXT NOT NULL REFERENCES profile(id) ON DELETE CASCADE
);

-- Education
Create TABLE education (
  id          TEXT PRIMARY KEY,
  program     TEXT NOT NULL,
  school      TEXT NOT NULL,
  start_date  BIGINT NOT NULL,
  end_date    BIGINT NOT NULL,

  profile_id  TEXT NOT NULL REFERENCES profile(id) ON DELETE CASCADE
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
  job_id      TEXT NOT NULL REFERENCES job(id) on DELETE CASCADE,
  skill_id    TEXT NOT NULL REFERENCES skill(id) ON DELETE CASCADE
);

-- skill
CREATE TABLE skill (
  id     TEXT PRIMARY KEY,
  name   TEXT NOT NULL
);

CREATE UNIQUE INDEX uq_skill_name_normalized ON skill (lower(trim(name)));
