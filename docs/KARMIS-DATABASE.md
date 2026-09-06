# KARMİS V2 Database Architecture

## 1. Storage Overview

KARMİS V2 stores all application state in a local SQLite database (`data/karmis.db`).
The system uses the `better-sqlite3` driver.
It operates in Write-Ahead Logging (WAL) mode with foreign keys enabled.

## 2. Migration System

Database changes run through numbered SQL scripts in `lib/migrations/`.
The `schema_migrations` table tracks applied versions.
Each migration runs inside a single database transaction.

### Applied Migrations:
- `001_initial_schema.sql`: Creates core entities for users, profiles, targets, skills, evidence, jobs, evaluations, applications, scenarios, and plans.

## 3. Schema Entities

### `users`
Stores candidate identity and contact references.
Columns: `id`, `name`, `email`, `phone`, `location`, `portfolio`, `linkedin`, `github`, `created_at`, `updated_at`.

### `career_profiles`
Stores the Career DNA state.
Columns: `id`, `user_id`, `current_role`, `current_level`, `industry`, `years_experience`, `transferable_skills`, `domain_expertise`, `leadership_experience`, `measurable_achievements`, `education`, `certifications`, `projects`, `interests`, `preferences`, `constraints`, `financial_goals`.

### `career_targets`
Stores the target career definition.
Columns: `id`, `user_id`, `target_role`, `target_level`, `target_industry`, `target_geography`, `target_salary`, `target_working_model`, `target_timeline_months`.

### `skills`
Stores normalized individual competencies.
Columns: `id`, `user_id`, `name`, `category`, `level`, `years_experience`, `confidence`, `evidence`, `last_used`, `transferability`.

### `evidence_items`
Stores the Evidence Wallet entries.
Columns: `id`, `user_id`, `title`, `description`, `metric`, `date`, `skills`, `roles`, `source`, `strength`.

### `jobs` and `job_evaluations`
Stores analyzed positions and the 11-dimension scoring outcomes.

### `applications`
Stores job applications and status history.
Columns: `id`, `company`, `position`, `score`, `link`, `date`, `source`, `status`, `contact`, `last_contact_date`, `notes`, `evidence_used`, `salary_offered`.

## 4. CSV Synchronization Layer

The database synchronizes with `data/Aktif_Basvurular_Takip_Tablosu.csv`.
The table preserves 10 columns:
1. `Şirket Adı`
2. `Pozisyon`
3. `Uyum Oranı`
4. `İlan Linki`
5. `Başvuru Tarihi`
6. `Kanal / Kaynak`
7. `Başvuru Durumu`
8. `Görüşülen Kişi / İK`
9. `Son İletişim Tarihi`
10. `Notlar & Sonraki Adım`

All exported rows sort newest date first.
