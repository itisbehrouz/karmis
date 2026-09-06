# KARMİS V2 Privacy & Data Sovereignty

## 1. Core Principle

KARMİS operates on a strict privacy-first and local-only philosophy.
Your career history, compensation figures, and job applications belong to you.
The application never transmits personal data to external servers without explicit manual action.

## 2. Local-Only Storage

- **Database**: All records reside inside `data/karmis.db` on your local filesystem.
- **Offline Operations**: Scoring, gap calculations, risk analysis, and simulations execute locally.
- **Zero Telemetry**: KARMİS contains zero analytics tracking, zero telemetry scripts, and zero phone-home calls.

## 3. Git Protection Rules

The repository `.gitignore` strictly blocks sensitive career files:
- `cv.md` and candidate profiles
- SQLite database files (`*.db`, `data/`)
- Configuration files containing credentials (`config.json`, `.env`)
- Application tracking CSV files (`data/*.csv`)
- Generated reports and logs (`artifacts/`, `logs/`)

Never commit private career files to public repositories.

## 4. AI Isolation & Optionality

KARMİS functions completely without an external AI API key.
The default provider is `LocalAiProvider`.
If you configure an `OPENAI_API_KEY` or `ANTHROPIC_API_KEY`, data transmission occurs only for the specific prompt you request.
All decision scoring remains deterministic and executed locally.
