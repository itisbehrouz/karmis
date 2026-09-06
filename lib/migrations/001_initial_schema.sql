-- KARMİS V2 Initial SQLite Schema Migration
-- Migration: 001

CREATE TABLE IF NOT EXISTS schema_migrations (
  version INTEGER PRIMARY KEY,
  applied_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  location TEXT,
  portfolio TEXT,
  linkedin TEXT,
  github TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS career_profiles (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  current_role TEXT,
  current_level TEXT NOT NULL DEFAULT 'MID',
  industry TEXT,
  years_experience REAL DEFAULT 0,
  transferable_skills TEXT DEFAULT '[]',
  domain_expertise TEXT DEFAULT '[]',
  leadership_experience TEXT DEFAULT '{}',
  measurable_achievements TEXT DEFAULT '[]',
  education TEXT DEFAULT '[]',
  certifications TEXT DEFAULT '[]',
  projects TEXT DEFAULT '[]',
  interests TEXT DEFAULT '[]',
  preferences TEXT DEFAULT '{}',
  constraints TEXT DEFAULT '{}',
  financial_goals TEXT DEFAULT '{}',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS career_targets (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  target_role TEXT NOT NULL,
  target_level TEXT NOT NULL,
  target_industry TEXT,
  target_geography TEXT,
  target_salary REAL,
  target_working_model TEXT,
  target_timeline_months INTEGER DEFAULT 12,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS skills (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'technical',
  level INTEGER NOT NULL DEFAULT 1,
  years_experience REAL DEFAULT 0,
  confidence REAL DEFAULT 0.8,
  evidence TEXT DEFAULT '[]',
  last_used TEXT,
  transferability TEXT DEFAULT 'medium',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS evidence_items (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  metric TEXT,
  date TEXT,
  skills TEXT DEFAULT '[]',
  roles TEXT DEFAULT '[]',
  source TEXT,
  strength TEXT NOT NULL DEFAULT 'MODERATE',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS jobs (
  id TEXT PRIMARY KEY,
  company TEXT NOT NULL,
  title TEXT NOT NULL,
  location TEXT,
  sector TEXT,
  seniority TEXT,
  salary_benchmark TEXT,
  recommended_salary_opening TEXT,
  source_url TEXT,
  raw_description TEXT,
  requirements TEXT DEFAULT '[]',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS job_evaluations (
  id TEXT PRIMARY KEY,
  job_id TEXT NOT NULL,
  overall_score REAL NOT NULL,
  decision TEXT NOT NULL,
  threshold REAL NOT NULL DEFAULT 80,
  skill_fit REAL DEFAULT 0,
  experience_fit REAL DEFAULT 0,
  seniority_fit REAL DEFAULT 0,
  salary_fit REAL DEFAULT 0,
  career_upside REAL DEFAULT 0,
  location_fit REAL DEFAULT 0,
  work_model_fit REAL DEFAULT 0,
  industry_fit REAL DEFAULT 0,
  success_probability REAL DEFAULT 0,
  risk_score REAL DEFAULT 0,
  opportunity_cost REAL DEFAULT 0,
  reasons TEXT DEFAULT '[]',
  penalties TEXT DEFAULT '[]',
  missing_skills TEXT DEFAULT '[]',
  missing_evidence TEXT DEFAULT '[]',
  created_at TEXT NOT NULL,
  FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS applications (
  id TEXT PRIMARY KEY,
  company TEXT NOT NULL,
  position TEXT NOT NULL,
  score REAL DEFAULT 0,
  link TEXT,
  date TEXT NOT NULL,
  source TEXT,
  status TEXT NOT NULL DEFAULT 'SAVED',
  contact TEXT,
  last_contact_date TEXT,
  notes TEXT,
  evidence_used TEXT DEFAULT '[]',
  salary_offered REAL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS application_events (
  id TEXT PRIMARY KEY,
  application_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  note TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS career_scenarios (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  path TEXT NOT NULL,
  income_range_min REAL DEFAULT 0,
  income_range_max REAL DEFAULT 0,
  income_upside TEXT,
  risk_level TEXT,
  skill_growth TEXT,
  network_growth TEXT,
  success_probability REAL DEFAULT 0,
  time_months INTEGER DEFAULT 12,
  capital_required REAL DEFAULT 0,
  optionality TEXT,
  notes TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS action_plans (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  plan_type TEXT NOT NULL,
  objective TEXT NOT NULL,
  actions TEXT NOT NULL,
  expected_result TEXT,
  evidence_produced TEXT,
  success_metric TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
