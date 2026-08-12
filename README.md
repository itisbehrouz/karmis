# KARMİS — Kariyer Mimarisi ve İlan Süzgeci

KARMİS (Kariyer Mimarisi ve İlan Süzgeci) is an open-source command-line engine for career data management, job posting filtration, and automated resume-to-job matching.

---

## Technical Specifications

- **Programming Language:** JavaScript (Node.js ES Modules)
- **Database Engine:** SQLite via `better-sqlite3`
- **Interface:** Command Line Interface (CLI Binary `bin/karmis`)
- **Architecture:** Decoupled engine modules (`lib/`) and templating system (`templates/`)

---

## Core Capabilities

- **Job Posting Filtration:** Automated filtering of job announcements based on skill criteria, experience levels, and keywords.
- **Career Profile Management:** Local storage of candidate experience, education, and technical competencies.
- **Match Analysis:** High-performance local SQL queries matching candidate profiles against job posting parameters.

---

## Directory Structure

```text
├── bin/
│   └── karmis               # Executable CLI entrypoint
├── lib/                     # Core database and filtering logic modules
├── templates/               # Output report templates
├── package.json             # Project dependencies and executable configuration
└── LICENSE                  # MIT License definition
```

---

## Getting Started

### Prerequisites
- Node.js 18.x or higher

### Installation and Usage
```bash
# Install dependencies
npm install

# Run via npm start
npm start

# Link CLI binary locally
npm link
```
