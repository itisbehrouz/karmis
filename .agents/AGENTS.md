# Workspace Rules for Career Ops

## 1. Job Posting Evaluation Rule ("bu ilanı araştır" / URL / Text)
Whenever the user requests to evaluate or research a job posting (e.g., "bu ilanı araştır", "bunu da değerlendir", or provides a job URL/text for analysis):
- **Concise Chat Response Mandate:** The agent MUST output **ONLY the "1. Hızlı Okuma Özet Tablosu (Quick-Read Summary Table)"** in the chat response. Do NOT output sections 2 through 8 in the chat.
  - **Quick-Read Summary Table Structure:**
    - Rendered as a comprehensive Markdown Table containing:
      1. `Şirket & Lokasyon`
      2. `Sektör & Yapı`
      3. `Aday Uyum Puanı` (% ve kısa gerekçe)
      4. `Kıdem Seviyesi`
      5. `Maaş Benchmark'ı`
      6. `Önerilen Açılış`
      7. `Karar` (**≥ 80% BAŞVURULACAK / < 80% PAS GEÇİLECEK**)
      8. `LinkedIn Outreach Notu` (Max 300 chars)
      9. `En Kritik 5 ATS Anahtar Kelimesi`
- **Scoring & Penalties:**
  - **Threshold:** Roles scoring **≥ 80%** are recommended for application. Roles scoring **< 80%** are SKIPPED.
  - **Filter Penalties:**
    a) **Mevzuat & Yasal Uyum / Vatandaşlık Filtresi (-20% ile -100% / Disqualification):** Roles requiring statutory security clearance (MSB / KGB / Savunma Sanayii 5202 Sayılı Kanun) or strict legal T.C. citizenship restrictions are penalized or directly skipped.
    b) **Kıdem Altı / Downleveling Filtresi (-20% ile -35% Penalty):** Junior, 0-3 year Associate, or IC developer roles without leadership are penalized.
    c) **Fonksiyonel Satış / Saha Yükü Filtresi (-25% Penalty):** Quota-bearing B2B sales, cold prospecting hunter roles, or heavy field travel roles are penalized.
- **Background Caching for App Modals:** When registering or saving the application, the agent generates and caches the full evaluation report, tailored CV, cover letter, interview intelligence, and salary data directly into SQLite (`lib/db.js` `saveReport`) so that all details can be viewed seamlessly inside the KARMİS Dashboard (`http://localhost:3005`).

---

## 2. Application Registration & Master-Slave Architecture Rule ("başvurdum" / "kaydet")
Whenever the user confirms applying to a role (e.g., "başvurdum", "kaydet", "ekle", "başvuruyu tamamladım"):
- **Master-Slave Architecture (Single Source of Truth):**
  - **Master Database (SQLite `data/karmis.db`):** SQLite is the sole, absolute single source of truth. All CRUD operations (create, update status, edit notes, delete) and all API/Dashboard queries operate strictly on SQLite.
  - **Slave Export Artifact (CSV `data/Aktif_Basvurular_Takip_Tablosu.csv`):** The CSV file is strictly a one-way, automatically generated snapshot export created from SQLite. The application NEVER reads from CSV at runtime.
- **Automated Local DB & Report Caching:** The agent MUST automatically:
  1. Insert the application into SQLite (`lib/db.js` `insertApplication`).
  2. Upsert the company profile knowledge (`db.upsertCompany`).
  3. Cache the full evaluation report into the `reports` table in SQLite (`db.saveReport`) so that all 5 dashboard modals (8 Maddelik Rapor, Terzi CV & Cover Letter, Mülakat & 30-60-90 Planı, Maaş Danışmanı, Sil) load immediately without delay.
- **Strict Master CSV Table Generation:** Automatically regenerate `data/Aktif_Basvurular_Takip_Tablosu.csv` from SQLite maintaining:
  - Exact **10 columns** in precise order:
    1. `Şirket Adı` (Bold, e.g. `**Colin's**`)
    2. `Pozisyon`
    3. `Uyum Oranı` (e.g. `%92`)
    4. `İlan Linki` (e.g. `https://www.linkedin.com/jobs/view/...`)
    5. `Başvuru Tarihi` (YYYY-MM-DD)
    6. `Kanal / Kaynak` (e.g. `LinkedIn`, `Kariyer.net`, `Şirket Portalı`)
    7. `Başvuru Durumu` (`Applied`, `Screening`, `Interviewing`, `Offer`, `Rejected`, `Passed`)
    8. `Görüşülen Kişi / İK`
    9. `Son İletişim Tarihi` (YYYY-MM-DD)
    10. `Notlar & Sonraki Adım`
  - **Strict Newest-First Sorting:** Sorted chronologically with most recent application at the top.
- **Autonomous Execution:** Do NOT pause to ask for user permission before saving to local database/CSV.

---

## 3. ATS Email & Feedback Ingestion Rule ("böyle bir mail geldi" / Screenshots)
Whenever the user shares an email screenshot or text regarding an application update (rejection, interview invite, screening request):
- **Autonomous Identification:** Parse the email to identify the company name, position, ATS provider (e.g. JazzHR, Workday, Greenhouse, Lever, SmartRecruiters), and decision date.
- **Status Reconciliation:**
  - If the application exists in `karmis.db`: Update the application status (e.g. `Rejected`, `Interviewing`) and update `last_contact_date`.
  - If the application is external/not found: Explain to the user and offer to log the application as `Rejected / Closed` in the tracking database to maintain complete statistical metrics.

---

## 4. Special Characters & Apostrophe Safety Rule (RFC 3986 `safeParam`)
- **Single Quote & Special Character Safety:** Whenever generating HTML attributes, inline `onclick` handlers, or passing company/position strings (e.g. `Colin's`, `L'Oreal`, or titles with parentheses `(Mali İşler)`):
  - The agent MUST ALWAYS use `safeParam(str)` (`encodeURIComponent(str || '').replace(/'/g, '%27')`) in frontend code.
  - All JavaScript modal and API functions MUST decode (`decodeURIComponent(encodedParam)`) and re-encode for fetch calls.
  - Never allow raw single quotes or unescaped strings inside HTML attribute click handlers to prevent JavaScript `SyntaxError` breaks.

---

## 5. Automatic Dashboard Web Server Auto-Start Rule
- **Initialization Trigger:** At the very start of every new Antigravity session/conversation, the agent MUST automatically verify and launch the KARMİS Dashboard HTTP Server (`node lib/server.js`) on Port `3005` if it is not already running.
- **Port Conflict Rule:** Ensure Port `3005` is exclusively dedicated to the KARMİS Executive Dashboard.

---

## 6. Google Drive CSV Sync Rule ("ABSG" / "ABDG" / "Aktif Başvuru dosyasını güncelle")
- **Manual Trigger Only:** The agent MUST NOT automatically export or sync the Google Drive `Aktif_Basvurular_Takip_Tablosu.csv` file after adding or updating job applications during routine evaluations.
- **Explicit Request Required:** The agent MUST ONLY export/sync the Google Drive CSV file when the user explicitly requests it using phrases such as "Aktif Başvuru dosyasını güncelle", "Aktif başvuru takip tablosunu senkronize et", or the shortcut abbreviations **"ABSG"** or **"ABDG"**.

---

## 7. Strict Flowbite Icons Mandate Rule
- **Exclusive Icon System:** All icons across the user interface and project MUST exclusively use official **Flowbite SVG Icons**.
- **No Emojis or Third-Party Icon Fonts:** Using raw emojis (e.g. ⭐, 🎯, 🌐, ✦, ✓, 🤝, ✕, ⏳, 💤, 📋) or external font icons as visual indicators in buttons, select options, badges, or headers is STRICTLY PROHIBITED. All visual symbols must be rendered using clean, official Flowbite SVG Icons (`<svg class="w-* h-*" aria-hidden="true" ...>`).

