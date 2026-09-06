# KARMİS V2 Architecture Audit

## 1. Executive Summary

This document provides the technical audit for KARMİS.
KARMİS evolves from a job application evaluation script into a personal career decision engine.
This audit analyzes the current code, lists technical debt, and defines the target architecture for V2.

## 2. Current Architecture Overview

The existing repository (V1) consists of five main components:

1. **Command Line Interface (`bin/karmis.js`)**:
   A Node.js script that parses CLI arguments.
   It invokes evaluation, report generation, interview prep, tracking, or the HTTP server.

2. **Evaluation Engine (`lib/evaluator.js`)**:
   A deterministic rule set.
   It compares incoming job parameters with a hardcoded dictionary (`COMPANY_KNOWLEDGE`).
   It applies three penalty filters: regulatory compliance, junior downleveling, and field sales quotas.

3. **Asset & Report Generators (`lib/report-generator.js`, `lib/interview-prep.js`, `lib/svg-chart.js`, `lib/pdf-generator.js`)**:
   Generators that produce Markdown reports, STAR interview questions, and white-background SVG bar charts.

4. **Application Tracker (`lib/tracker.js`)**:
   A flat-file CSV parser and writer for `data/Aktif_Basvurular_Takip_Tablosu.csv`.
   It enforces a 10-column schema with newest-first row sorting.

5. **Local Web Dashboard (`lib/server.js`, `dashboard/index.html`)**:
   A Node.js HTTP server on port 3005 that serves a single-page HTML application.
   It reads and updates CSV records and displays evaluation reports.

## 3. Current Capabilities

- Generates job evaluations with match scores and binary decisions (`BAŞVURULACAK` or `PAS GEÇİLECEK`).
- Generates 8-section Markdown reports with embedded SVG charts.
- Parses candidate profiles from local Markdown files (`cv.md`).
- Produces STAR interview preparation tables.
- Updates application records in a local CSV file.
- Provides a local web interface for application monitoring and status editing.

## 4. Weaknesses and Technical Debt

The audit identified eleven architectural weaknesses:

1. **Absence of a Persistent Relational Database**:
   Although `package.json` specifies `better-sqlite3`, the codebase stores state in a flat CSV file.
   There is no relational schema, transaction support, or migration system.

2. **Hardcoded Domain Knowledge**:
   `lib/evaluator.js` contains a static map for seven specific Turkish enterprises.
   If a user evaluates another company, the engine falls back to generic placeholders.

3. **Hardcoded Candidate Identity**:
   `lib/cv-parser.js` and `lib/report-generator.js` default to a single user profile.
   The engine lacks domain neutrality across non-technical industries.

4. **Binary Decision Constraint**:
   The engine only outputs `APPLY` or `PASS`.
   It lacks a `MAYBE` decision state for ambiguous opportunities.

5. **Single Aggregate Score**:
   The current evaluator reduces evaluation to one number.
   It does not expose separate scores for skill fit, experience fit, seniority fit, salary fit, career upside, or opportunity cost.

6. **Absence of Career DNA and Target State**:
   The system does not model the user's current baseline against a desired future career state.
   It cannot compute skill gaps or development timelines.

7. **No Evidence Model**:
   Achievements and metrics are static strings.
   The system cannot match job requirements to verified evidence items.

8. **No Forward Decision Logic**:
   The system cannot suggest the single next best action for the user.
   It cannot generate 30-60-90 day execution plans.

9. **No Career Scenario Simulation**:
   Users cannot compare career options (stay, promote, switch company, freelance, start business).

10. **Test Coverage Deficit**:
    `npm test` executes `node lib/evaluator.js`, which does not run any assertions.
    The codebase lacks automated regression tests.

11. **Tightly Coupled Presentation**:
    Reporting logic mixes data computation with Markdown and HTML string construction.

## 5. Proposed V2 Architecture

V2 adopts a modular, local-first, layered architecture:

```text
┌─────────────────────────────────────────────────────────────┐
│                       Presentation Layer                    │
│   CLI (bin/karmis.js)     │     Web Dashboard (Port 3005)   │
└───────────────────────────┬─────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────┐
│                        Engine Layer                         │
│  - Career DNA Engine (lib/dna.js)                           │
│  - Skill Taxonomy & Gap Engine (lib/skills.js)              │
│  - Multi-Dimensional Job Evaluator (lib/evaluator.js)       │
│  - Expanded Risk Engine (lib/risk.js)                       │
│  - Evidence Wallet & Matcher (lib/evidence.js)              │
│  - Next Best Move Engine (lib/decision.js)                  │
│  - Career Simulator & Salary Trajectory (lib/simulator.js)  │
│  - Career Analytics & Learning Loop (lib/analytics.js)      │
└───────────────────────────┬─────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────┐
│                   Data & Persistence Layer                  │
│  - SQLite Database Manager (lib/db.js)                      │
│  - Schema Migrations (lib/migrations/*.sql)                 │
│  - CSV Sync Compatibility Layer (lib/tracker.js)            │
└───────────────────────────┬─────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────┐
│                  AI Isolation Layer (Optional)              │
│  - Adapter Interface (lib/ai/provider.js)                   │
│  - Providers: local.js, openai.js, anthropic.js             │
└─────────────────────────────────────────────────────────────┘
```

### Architectural Principles
- **Deterministic Core**: All scores, filters, and decisions run deterministically without network calls.
- **Optional AI Layer**: AI functions only for text summarization, normalization, and drafts. The engine functions fully offline.
- **Domain Neutrality**: The skill and career models support all professions (law, medicine, sales, engineering, finance, operations).
- **Privacy by Default**: Data remains in local SQLite storage. No telemetry or external data transfer occurs.

## 6. Database Schema and Migration Strategy

The persistent store will use `better-sqlite3` with a dedicated database file at `data/karmis.db`.
A migration table (`schema_migrations`) will track version numbers.

### Core Tables:
1. `users`: User identity and system settings.
2. `career_profiles`: Career DNA (seniority, industry, years of experience, constraints, preferences).
3. `career_targets`: Target role, target level, target salary, target timeline, target geography.
4. `skills`: Normalized skills with categories, levels (1-5), and confidence scores.
5. `experiences`: Chronological work history and achievements.
6. `evidence_items`: Evidence wallet items (projects, metrics, certifications, publications).
7. `jobs`: Evaluated job postings with company and role metadata.
8. `job_evaluations`: Multi-dimensional evaluation scores and risk details.
9. `applications`: Job application tracking states with stage history.
10. `career_scenarios`: Simulation runs comparing career paths.
11. `action_plans`: Generated 30-60-90 day execution plans.

### Backwards Compatibility Strategy:
- The existing CSV file (`data/Aktif_Basvurular_Takip_Tablosu.csv`) remains supported.
- An automatic migration script imports existing CSV entries into the SQLite `applications` table upon first launch.
- The `ABSG` / `ABDG` sync commands continue to export SQLite data into the required 10-column CSV format.

## 7. Testing Strategy

1. **Unit Test Suite**:
   Create a comprehensive test runner using Node.js built-in `node:test` and `node:assert`.
   Zero external test framework dependencies required.

2. **Core Engine Tests**:
   - Multi-dimensional scoring correctness.
   - 17 risk rules in the risk engine.
   - Three-state decision rules (`APPLY`, `PASS`, `MAYBE`).
   - Skill gap calculation across all seniority tiers.
   - Evidence strength and requirement matching.
   - Career simulation calculations and confidence intervals.
   - Application analytics rate metrics.

3. **Edge Case Tests**:
   - Zero skills profile.
   - Missing salary or target.
   - Overqualified candidate evaluation.
   - Lateral career changer evaluation.
   - Student and intern transition evaluation.
   - Malformed job description text.

4. **Integration Tests**:
   - Full end-to-end execution of the 11-step career loop.
   - SQLite migration integrity.
   - CLI command execution across all commands.

## 8. Implementation Phases

- **Phase 1**: Architecture Audit & Base Infrastructure (`docs/`, `lib/db.js`, schema migrations).
- **Phase 2**: Career DNA & Career Target Models (`lib/dna.js`).
- **Phase 3**: Skill Taxonomy & Skill Gap Engine (`lib/skills.js`).
- **Phase 4**: Multi-Dimensional Job Evaluator & Risk Engine (`lib/evaluator.js`, `lib/risk.js`).
- **Phase 5**: Evidence Wallet & Evidence Matcher (`lib/evidence.js`).
- **Phase 6**: Next Best Move & 30-60-90 Day Plan Generator (`lib/decision.js`).
- **Phase 7**: Career Simulator & Salary Trajectory (`lib/simulator.js`).
- **Phase 8**: Career Analytics & Learning Loop (`lib/analytics.js`).
- **Phase 9**: AI Isolation Layer (`lib/ai/`).
- **Phase 10**: CLI Expansion & Dashboard Upgrade (`bin/karmis.js`, `lib/server.js`, `dashboard/index.html`).
- **Phase 11**: Full Test Suite, Comprehensive Documentation & Verification.
