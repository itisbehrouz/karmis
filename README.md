# KARMİS V2 — Personal Career Decision Engine

Know where you are. Know where you can go. Know what to do next.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Tests: 56 passed](https://img.shields.io/badge/Tests-56%20passed-success.svg)](#11-testing)
[![Privacy: Local--First](https://img.shields.io/badge/Privacy-Local--First%20(SQLite)-brightgreen.svg)](#9-privacy)
[![Node.js: >=18.0.0](https://img.shields.io/badge/Node.js-%3E%3D18.0.0-blue.svg)](package.json)
[![No Telemetry](https://img.shields.io/badge/Telemetry-Zero-lightgrey.svg)](#9-privacy)

<p align="center">
  <img src="docs/assets/social-preview.jpg" alt="KARMİS V2 — Personal Career Decision Engine" width="100%" />
</p>

KARMİS is an open-source, privacy-first career decision engine.
It models your career state, calculates skill gaps, evaluates job postings across 11 dimensions, and recommends your single highest-value next action.

---

## 1. What KARMİS is

KARMİS is an open-source, privacy-first personal career decision engine.
It replaces generic advice with evidence-based decision logic.
It evaluates career choices locally on your machine with SQLite.

## 2. Who it is for

KARMİS is domain-neutral. It serves professionals across all industries:
- Software Engineering & Data
- Accounting & Finance
- Sales & Marketing
- Healthcare & Medicine
- Operations, HR & Law
- Students, Interns & Entry-Level Employees
- Managers & C-Level Executives
- Freelancers, Consultants & Career Changers

## 3. Why it exists

Job search platforms encourage mass low-quality applications.
Generic career advice provides vague motivational statements.
KARMİS enforces five engineering principles:
1. **Decision over generation**: Concrete choices instead of text output.
2. **Evidence over claims**: Quantified case studies instead of buzzword lists.
3. **Outcomes over predictions**: Real application results instead of speculative certainty.
4. **Actions over advice**: Practical tasks instead of generic coaching.
5. **Ranges over fake precision**: Realistic scenarios instead of false single numbers.

---

## 4. Core features

- **Career DNA & Target State**: Models identity, competencies, constraints, and target career levels.
- **Skill Gap Engine**: Identifies missing competencies and recommends verifiable learning actions.
- **11-Dimension Job Evaluator**: Analyzes jobs by Skill, Experience, Seniority, Salary, Upside, Location, Work Model, Industry, Probability, Risk, and Opportunity Cost.
- **Three-State Decision Engine**: Generates `APPLY`, `PASS`, or `MAYBE` recommendations with explicit reasoning.
- **Expanded Risk Engine**: Detects 17 distinct career risks including downleveling, underpayment, cold calling quotas, and bureaucracy.
- **Evidence Wallet**: Stores verified achievements and distinguishes missing skills from missing evidence.
- **Next Best Move**: Identifies your single highest-leverage career action and generates 30/60/90-day plans.
- **Career Scenario Simulator**: Compares 8 career paths (Stay, Promote, Switch Company, Pivot, Specialize, Freelance, Consult, Start Business).
- **Application Tracker & Analytics**: Tracks recruitment funnels and calibrates success rates via a personal learning loop.
- **Local Web Dashboard**: High-density local control panel with Flowbite SVG icons and zero telemetry.

---

## 5. Architecture

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
│  - Providers: local.js (default offline), openai, anthropic │
└─────────────────────────────────────────────────────────────┘
```

---

## 6. Installation

### Prerequisites
- Node.js 18.x or higher
- npm 9.x or higher

### Setup
```bash
# Clone the repository
git clone https://github.com/itisbehrouz/karmis.git

# Enter project folder
cd karmis

# Install dependencies
npm install

# Initialize local database and baseline Career DNA
node bin/karmis.js init
```

---

## 7. CLI

```bash
# Display general help
node bin/karmis.js help

# Initialize Career DNA and database
node bin/karmis.js init

# Inspect or import Career DNA
node bin/karmis.js profile
node bin/karmis.js profile import my-cv.json

# Display baseline vs target state
node bin/karmis.js career

# Run skill gap analysis
node bin/karmis.js gap

# Inspect Evidence Wallet
node bin/karmis.js evidence
node bin/karmis.js evidence add "Enterprise BI Suite" "+45% reporting velocity"

# Calculate single highest-leverage next move
node bin/karmis.js next

# Compare 8 career paths
node bin/karmis.js simulate

# Evaluate job posting (11 dimensions)
node bin/karmis.js analyze "The Coca-Cola Company"
node bin/karmis.js job path/to/job.json

# Manage applications and synchronize CSV (ABSG)
node bin/karmis.js applications
node bin/karmis.js applications sync

# View recruitment funnel analytics
node bin/karmis.js analytics

# Launch local web dashboard
node bin/karmis.js dashboard
```

---

## 8. Dashboard

Launch the local web dashboard:
```bash
node bin/karmis.js dashboard
```
Open `http://localhost:3005` in your browser.

The dashboard answers five questions immediately:
1. **Where am I?** (Career DNA and current seniority level)
2. **Where am I going?** (Career Target and timeline)
3. **What is blocking me?** (Skill Gaps and missing evidence)
4. **Which opportunities are worth pursuing?** (11-dimension job decision engine)
5. **What should I do next?** (Next Best Move and 30-day action plan)

---

## 9. Privacy

- **Local-Only**: Data stays inside `data/karmis.db` on your local machine.
- **Offline Operations**: All calculations run locally without network requests.
- **Zero Telemetry**: No tracking scripts or analytics collection.
- **AI Optionality**: Operates completely without API keys.

See [docs/KARMIS-PRIVACY.md](docs/KARMIS-PRIVACY.md) for details.

---

## 10. Development

KARMİS uses standard Node.js without heavy frontend build tools.
The architecture separates business logic into modular engines.
All core decision modules reside in the `lib/` directory.

Follow these instructions to set up the local development environment:
1. Clone the repository to your local system.
2. Install the project dependencies with `npm install`.
3. Initialize the local SQLite database with `node bin/karmis.js init`.
4. Start the dashboard server with `node bin/karmis.js dashboard`.

Follow these engineering standards when you modify code:
- Keep business logic deterministic and independent of external networks.
- Keep the SQLite schema versioned through `lib/migrations/`.
- Isolate all optional AI text formatting behind `lib/ai/provider.js`.
- Use official Flowbite SVG icons for all user interface symbols.

---

## 11. Testing

KARMİS enforces automated test coverage across all decision engines.
The test suite uses the Node.js native test runner (`node:test`).

Run the automated test suite with this command:
```bash
npm test
```

The automated test suite validates the following subsystems:
- Multi-dimensional scoring across all 11 evaluation dimensions.
- 17 career risk rules and penalty calculations.
- 3-state decisions (`APPLY`, `PASS`, `MAYBE`).
- Clear distinction between missing skills and missing evidence.
- 8 career simulation paths and multi-step salary trajectories.
- Next Best Move bottleneck identification and action plans.
- SQLite database migrations and Google Drive CSV synchronization.
- CLI command execution and argument parsing.

---

## 12. Roadmap

KARMİS follows an open development plan divided into sequential phases:

- **Phase 1 (Complete):** Architecture audit and baseline system analysis.
- **Phase 2 (Complete):** Career DNA schema, target career state, and profile store.
- **Phase 3 (Complete):** Skill taxonomy and 5-tier gap analysis engine.
- **Phase 4 (Complete):** 11-dimension job decision engine with 17 risk filters.
- **Phase 5 (Complete):** Evidence Wallet with skill-to-evidence matching.
- **Phase 6 (Complete):** Next Best Move engine and 30/60/90-day action plans.
- **Phase 7 (Complete):** 8-path career scenario simulator and salary trajectory models.
- **Phase 8 (Complete):** Application tracker with empirical recruitment funnel analytics.
- **Phase 9 (Complete):** High-density local web dashboard with Flowbite SVG icons.
- **Phase 10 (In Progress):** Multi-profile management, advanced export formats, and local LLM fine-tuning.

See [docs/KARMIS-ROADMAP.md](docs/KARMIS-ROADMAP.md) for detailed milestone milestones and release schedules.

---

## Documentation

- [Architecture Audit](docs/KARMIS-V2-ARCHITECTURE-AUDIT.md)
- [Domain Model](docs/KARMIS-DOMAIN-MODEL.md)
- [Scoring Engine](docs/KARMIS-SCORING-ENGINE.md)
- [Database Architecture](docs/KARMIS-DATABASE.md)
- [Privacy Policy](docs/KARMIS-PRIVACY.md)
- [Product Roadmap](docs/KARMIS-ROADMAP.md)

---

## License

MIT License. See [LICENSE](LICENSE) for details.
