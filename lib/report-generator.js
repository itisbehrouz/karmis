/**
 * KARMİS Report Generator v1.5.0
 * Render 10 Portfolio Case Studies from https://behruzbagirzade.com/#work
 */

const fs = require('fs');
const path = require('path');
const { generateSvgChart } = require('./svg-chart');
const { generateInterviewPrep } = require('./interview-prep');
const { loadCandidateProfile } = require('./cv-parser');

function generateMarkdownReport(evaluation, baseDir = path.join(__dirname, '..')) {
  const profile = loadCandidateProfile(baseDir);
  const chartSvg = generateSvgChart(evaluation.company, evaluation.metrics);
  const decisionBadge = evaluation.score >= evaluation.threshold ? '**≥ 80% BAŞVURULACAK**' : '**< 80% PAS GEÇİLECEK**';

  const penaltiesBlock = evaluation.penaltyDetails && evaluation.penaltyDetails.length > 0
    ? evaluation.penaltyDetails.map(p => `| ${p.rule} | ${p.penalty}% Ceza | ${p.reason} |`).join('\n')
    : '| Filtre Kontrolleri | Geçti (%' + evaluation.score + ') | Mevzuat, kıdem altı veya saha satış riski bulunmamaktadır. |';

  const interviewPrep = generateInterviewPrep(evaluation.company, evaluation.jobTitle);
  const fence = '\`\`\`';

  return `# KARMİS İlan Değerlendirme Raporu: ${evaluation.company} - ${evaluation.jobTitle}

### 1. Hızlı Okuma Özet Tablosu
| Kriter / Metrik | Detay ve Analiz |
|---|---|
| **Şirket & Lokasyon** | **${evaluation.company}** | ${evaluation.location} |
| **Sektör & Yapı** | ${evaluation.sector} |
| **Aday Uyum Puanı** | **%${evaluation.score}** (Eşik: %${evaluation.threshold}) |
| **Kıdem Seviyesi** | ${evaluation.seniority} |
| **Maaş Benchmark'ı** | ${evaluation.salaryBenchmark} |
| **Önerilen Açılış** | ${evaluation.recommendedSalaryOpening} |
| **Karar & Aksiyon** | ${decisionBadge} |
| **LinkedIn Outreach Notu** | Sayın İK Lideri, ${evaluation.company} bünyesindeki ${evaluation.jobTitle} pozisyonuna yönelik 15+ yıl dijital dönüşüm ve AI tecrübemle ilgileniyorum: ${profile.portfolio} |
| **En Kritik 5 ATS Keyword** | ${evaluation.atsKeywords.slice(0, 5).join(', ')} |

---

### 2. Sade & Açık Mavi Görsel Şirket Rakamları Grafiği
${chartSvg}

---

### 3. Şirket Operasyonel Rakamlar Tablosu
| Gösterge Metriği | Rakam / Değer | Kapsam ve Açıklama |
|---|---|---|
${evaluation.metrics.map(m => `| ${m.label} | **${m.value}** | ${m.unit} |`).join('\n')}

---

### 4. Aday Uyum Puanı (% ve Detaylar / Risk Matrisi)
| Kriter / Uyum Katmanı | Etki / Puan | Detaylı Analiz & Gerekçe |
|---|---|---|
| Veri Mimarisi & Power BI | +30% Boost | 15+ yıl kurumsal veri mimarisi, Power BI ve SQL ambarı yönetimi. |
| AI Entegrasyonu (GenAI / LLM) | +25% Boost | Gemini, Co-Pilot, Claude araçlarının karar destek süreçlerine entegrasyonu. |
| Ticari Mükemmellik & Analitik | +20% Boost | Müşteri segmentasyonu, CRM ve pazar analitiği yetkinliği. |
${penaltiesBlock}

---

### 5. Portföy Projeleri & Kilit Vaka Çalışmaları (behruzbagirzade.com/#work)
| No | Proje / Case Study | Kategori & Kurum | Proje Tanımı & Sağlanan Katma Değer | Portföy Bağlantısı |
|---|---|---|---|---|
${profile.projects.map(p => `| **${p.id}** | **${p.title}** | ${p.category} · ${p.organization} | ${p.description} | [Proje İncele](${p.link}) |`).join('\n')}

---

### 6. Executive Cover Letter & İK E-Posta Metni
${fence}text
Dear ${evaluation.company} Talent Acquisition & Leadership Team,

I am writing to express my strong interest in the ${evaluation.jobTitle} role at ${evaluation.company}.

With over 15 years of experience leading enterprise Digital Transformation, Data Architecture, and Business Intelligence initiatives, I specialize in connecting Commercial Excellence with advanced analytics, interactive Power BI dashboard architecture, and AI-driven automation.

Throughout my career, I have delivered 10 major enterprise case studies—including an Executive Power BI Suite across 7 international entities, an AI-Enabled Automation Programme lifting productivity by 67%, and a unified Digital Workplace PWA. Detailed case studies can be reviewed at: ${profile.portfolio}#work

Warm regards,
${profile.name}
${profile.title}
Phone: ${profile.phone} | Email: ${profile.email}
Portfolio: ${profile.portfolio} | LinkedIn: ${profile.linkedin}
${fence}

---

### 7. LinkedIn Executive Outreach Metni
${fence}text
Sayın İK Lideri, ${evaluation.company} bünyesindeki ${evaluation.jobTitle} pozisyonuna yönelik 15+ yıl dijital dönüşüm, veri mimarisi ve AI deneyimimle ilgileniyorum. Portföy projemdeki 10 vaka çalışmasını inceleyebilirsiniz: ${profile.portfolio}#work
${fence}

---

### 8. Mülakat Hazırlık Asistanı (STAR Metodu)
| Mülakat Sorusu | Durum & Görev (Situation & Task) | Eylem (Action) | Sonuç (Result) |
|---|---|---|---|
${interviewPrep.questions.map(q => `| ${q.question} | ${q.situation} | ${q.action} | ${q.result} |`).join('\n')}

---

### 9. ATS CV Anahtar Kelime Optimizasyon Matrisi
| ATS Anahtar Kelimesi | CV'de Vurgulanacak Alan | İlan Eşleşme Gerekçesi |
|---|---|---|
${evaluation.atsKeywords.map(kw => `| ${kw} | Özet & Uzmanlık Alanları | İlan şartları ve teknik gereksinimlerle tam uyum. |`).join('\n')}
`;
}

module.exports = { generateMarkdownReport };
