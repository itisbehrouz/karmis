# Workspace Rules for KARMİS

## Job Posting Evaluation Rule ("bu ilanı araştır" / KARMİS İlan Değerlendirme Standartları)
Whenever the user requests to evaluate or research a job posting (e.g., "bu ilanı araştır", "bunuda değerlendir", or provides a job URL/file for analysis), the agent MUST structure its response using the following standard 8 sections:

1. **Hızlı Okuma Özet Tablosu (Quick-Read Summary Table)**:
   - Must be rendered as a comprehensive Markdown Table containing: Şirket & Lokasyon, Sektör & Yapı, Aday Uyum Puanı, Kıdem Seviyesi, Maaş Benchmark'ı, Önerilen Açılış, Karar (**≥ 80% BAŞVURULACAK / < 80% PAS GEÇİLECEK**), **LinkedIn Outreach Notu** (Max 300 chars), and **En Kritik 5 ATS Anahtar Kelimesi**.
2. **Sade & Açık Mavi Görsel Şirket Rakamları Grafiği (Clean White-Background SVG Chart)**:
   - Render a minimalist SVG bar chart with a clean white background (`#ffffff`), uniform light blue bars (`#bfdbfe` fill, `#2563eb` border, rounded corners), and full un-truncated Turkish numbers (e.g. `45 Milyar USD`, `76.000`, `9 Milyar USD`, `50+ Proje`) showing strictly the **hiring company's global/local operational metrics** (revenue, employee count, project count, locations, R&D budget). **NEVER include candidate metrics in the company chart or company table.**
3. **Aday Uyum Puanı (% ve Detaylar / Candidate Match Score - High-Density Markdown Table)**:
   - Rendered as a high-density Markdown Table (Kriter / Uyum Katmanı, Etki / Puan, Detaylı Analiz & Gerekçe).
   - **Threshold:** Roles scoring **≥ 80%** are recommended for application. Roles scoring **< 80%** are SKIPPED.
   - **Filter Penalties:**
     a) **Mevzuat & Yasal Uyum Filtresi (-20% ile -30% Penalty):** Roles requiring non-core external legal/regulatory compliance (BDDK, TCMB, pharma Rx laws, legal paperwork) are penalized.
     b) **Kıdem Altı / Downleveling Filtresi (-20% ile -35% Penalty):** Junior, 0-3 year Associate, or IC developer roles without leadership are penalized.
     c) **Fonksiyonel Satış / Saha Yükü Filtresi (-25% Penalty):** Quota-bearing B2B sales, cold prospecting hunter roles, or heavy field travel roles are penalized.
4. **Detaylı Uyum & Risk Matrisi (Detailed Match & Risk Matrix)**:
   - Detailed strengths, gap analysis, legitimacy tier, pros, and cons.
5. **İnsan Kaynakları (İK) E-Posta Adresi & Executive Cover Letter**:
   - Ready-to-send personalized email application pitch text tailored to candidate profile with signature block containing candidate portfolio: `https://behruzbagirzade.com/`.
6. **LinkedIn Executive Outreach Metni**:
   - Ready-to-send short LinkedIn connection note (max 300 chars) for HR Leaders / Hiring Managers.
7. **Mülakat Hazırlık Asistanı (Interview Prep & STAR Method - High-Density Markdown Table)**:
   - Rendered as a high-density Markdown Table (Soru, Situation & Task / Durum & Görev, Action / Eylem, Result / Sonuç).
8. **ATS CV Anahtar Kelime Optimizasyonu (ATS Keywords - High-Density Markdown Table)**:
   - Rendered as a high-density Markdown Table listing Top 5 high-impact ATS keywords, CV highlight areas, and match rationale.

## Autonomous Execution & Approval Threshold Rule
- **Autonomous Execution:** For routine, low-risk operations (such as researching job links, generating evaluation reports, parsing ATS data, creating cover letters, searching contact details, preparing direct outreach texts, rendering charts, and generating interview prep notes), the agent MUST proceed autonomously without stopping to ask for user permission or confirmation.
- **Risk Threshold for Approval:** The agent MUST ONLY pause to request explicit user approval/confirmation if an operation is high-risk (e.g., destructive file/data operations, major architectural changes, external paid service invocations, or workspace policy configuration changes).

## Strict Flowbite Icons Mandate Rule
- **Exclusive Icon System:** All icons across the user interface and project MUST exclusively use official **Flowbite SVG Icons**.
- **No Emojis or Third-Party Icon Fonts:** Using raw emojis (e.g. ⭐, 🎯, 🌐, ✦, ✓, 🤝, ✕, ⏳, 💤, 📋) or external font icons as visual indicators in buttons, select options, badges, or headers is STRICTLY PROHIBITED. All visual symbols must be rendered using clean, official Flowbite SVG Icons (`<svg class="w-* h-*" aria-hidden="true" ...>`).

## Google Drive CSV Sync Rule ("ABSG" / "ABDG" / "Aktif Başvuru dosyasını güncelle")
- **Manual Trigger Only:** The agent MUST NOT automatically export or sync the Google Drive `Aktif_Basvurular_Takip_Tablosu.csv` file after adding or updating job applications during routine evaluations.
- **Explicit Request Required:** The agent MUST ONLY export/sync the Google Drive CSV file when the user explicitly requests it using phrases such as "Aktif Başvuru dosyasını güncelle", "Aktif başvuru takip tablosunu senkronize et", or the shortcut abbreviations **"ABSG"** or **"ABDG"**.
- **STRICT MASTER TABLE SCHEMA MANDATE (NEVER ALTER FORMAT):**
  The master tracking table MUST ALWAYS maintain the exact **10 columns** in this precise order:
  1. `Şirket Adı` (Bold, e.g. `**Ticimax**`)
  2. `Pozisyon`
  3. `Uyum Oranı` (e.g. `%88`, `%98`)
  4. `İlan Linki` (e.g. `[İlan Linki](URL)`)
  5. `Başvuru Tarihi` (YYYY-MM-DD)
  6. `Kanal / Kaynak` (e.g. `LinkedIn / Portal`, `Teamtailor`, `Workday`)
  7. `Başvuru Durumu` (e.g. `Applied`, `Responded`, `Interviewing`, `Rejected`)
  8. `Görüşülen Kişi / İK`
  9. `Son İletişim Tarihi` (YYYY-MM-DD)
  10. `Notlar & Sonraki Adım`
- **STRICT NEWEST-FIRST SORTING:**
  The table rows MUST ALWAYS be sorted **Newest First (Most Recent Date First)**.
\n
## Strict Local-Only Workspace Protection Rule (KARMİS-BEHRUZ Git Prohibition / Gizlilik Kuralı)
- **STRICT LOCAL-ONLY PRIVACY:** The `karmis-behruz` workspace and all files within `/Users/behrouzbagherzadeh/Developer/karmis-behruz` (including personal candidate profile `cv.md`, private application entries, custom evaluation reports, and tracking databases) MUST NEVER BE PUSHED, COMMITTED, OR UPLOADED TO ANY PUBLIC OR REMOTE GIT REPOSITORY UNDER ANY CIRCUMSTANCES.
- **NO REMOTE GIT SYNC:** The agent MUST NOT execute `git push`, `git remote add`, or any git command that exports `karmis-behruz` data to GitHub or external platforms.
