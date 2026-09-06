-- KARMİS V2 Schema Migration: 002
-- Enhance applications with decision tracking, career target skills, and detailed entities

ALTER TABLE applications ADD COLUMN decision TEXT DEFAULT 'APPLY';
ALTER TABLE applications ADD COLUMN outcome TEXT;
ALTER TABLE applications ADD COLUMN follow_up TEXT;
ALTER TABLE applications ADD COLUMN interview TEXT;

ALTER TABLE career_targets ADD COLUMN target_skills TEXT DEFAULT '[]';

CREATE TABLE IF NOT EXISTS experiences (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  company TEXT NOT NULL,
  role TEXT NOT NULL,
  start_date TEXT,
  end_date TEXT,
  is_current INTEGER DEFAULT 0,
  responsibilities TEXT DEFAULT '[]',
  achievements TEXT DEFAULT '[]',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS achievements (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  metric TEXT,
  date TEXT,
  skills TEXT DEFAULT '[]',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
