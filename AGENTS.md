# Karmis Project Rules & Agent Guidelines

KARMIS is a Node.js CLI tool for job posting evaluation and career intelligence.

## 🔌 Environment & Port Isolation Rules

- **Platform Target:** CLI & Local Evaluation Service
- **Execution Command:** `node bin/karmis.js <URL_OR_TEXT>` or `npm start`
- **Strict Port Isolation:**
  - If dashboard servers or local web viewers are started, never bind to Port `5950` (Reserved for Control Tower).
  - Never use Ports `5000` or `5001` (macOS AirPlay / System Services).

---

## 🛠️ Verification & Execution Commands

- **Run CLI:** `node bin/karmis.js <URL_OR_TEXT>`
- **Database Inspection:** SQLite database lives in `data/karmis.db` or root `karmis.db`.
- **Lint & Test:** `npm test`

---

## 🏛️ Architecture & Scoring Standards

1. **Deterministic Evaluation:**
   - The evaluator (`lib/evaluator.js`) must calculate scores using bounded weights (`0` to `100`).
   - Downleveling penalties must never result in negative matching scores.
2. **Database Integrity:**
   - Use parameterized queries with `better-sqlite3` to prevent injection flaws.
3. **Asset Generation:**
   - Produce valid, standalone SVG charts in `lib/svg-chart.js` without external CDN dependencies.

---

## ✍️ Simple English (ASD-STE100)

- Write short, clear technical text.
- Maximum 20 words for instructions; maximum 25 words for descriptions.
- Use simple present, past, and future tenses.
- Active voice only. No contractions.
