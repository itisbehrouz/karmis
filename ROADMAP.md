# Karmis Development Roadmap

This roadmap tracks feature development and automated job intelligence capabilities for **Karmis**.

---

## 🎯 Active Milestones

### Milestone 1: Core Evaluation & Scoring Engine
- [x] **Evaluation Engine:** Implement `lib/evaluator.js` with weighted scoring and penalty logic *(Status: done, Priority: high)*
- [x] **SQLite Integration:** Store evaluated postings in `karmis.db` *(Status: done, Priority: high)*
- [x] **SVG Chart Generator:** Generate standalone SVG company graphs *(Status: done, Priority: medium)*

---

### Milestone 2: Multi-Language CV & Template Pipeline
- [x] **Candidate Profile:** Normalize English (`cv.md`) and Turkish (`cv_tr.md`) profiles *(Status: done, Priority: high)*
- [/] **ATS Keyword Extractor:** Auto-extract required technical keywords from postings *(Status: in_progress, Priority: high)*
- [ ] **STAR Question Generator:** Generate custom behavioral interview preparation cards *(Status: planned, Priority: medium)*

---

### Milestone 3: Web Dashboard & Automated Scraper
- [ ] **Live Dashboard:** Express/React local web dashboard for visual application tracking *(Status: planned, Priority: medium)*
- [ ] **Portal Feed Ingestion:** Ingest job feeds directly from YML portals *(Status: planned, Priority: low)*
