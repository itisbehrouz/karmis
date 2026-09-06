/**
 * KARMİS Report Generator v2.0.0
 * Generates Markdown Job Evaluation Reports, Charts & Interview Assets
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

  const reversePurpose = [
    'Teknik ve operasyonel darboğazları anlayarak proaktif çözüm üretme vizyonunu sergilemek.',
    'Yapay zekâ ve otomasyon araçlarının şirket içi kullanım olgunluğunu ölçmek.',
    'İlk 90 günlük liderlik ve başarı metriklerini netleştirmek.',
    'Müşteri geri bildirim döngüsü ve fonksiyonlar arası koordinasyon kültürünü anlamak.',
    'Ekip içi teknik gelişim ve kurumsal sertifikasyon desteğini analiz etmek.'
  ];

  const reverseQuestionsTable = (interviewPrep.reverseQuestions || []).map((rq, idx) => 
    `| **${idx + 1}** | **${rq}** | ${reversePurpose[idx] || 'Liderlik ve süreç olgunluğunu analiz etmek.'} |`
  ).join('\n');

  const p1Goals = (interviewPrep.plan90Days?.phase1?.goals || []).map(g => `• ${g}`).join('<br>');
  const p2Goals = (interviewPrep.plan90Days?.phase2?.goals || []).map(g => `• ${g}`).join('<br>');
  const p3Goals = (interviewPrep.plan90Days?.phase3?.goals || []).map(g => `• ${g}`).join('<br>');

  return `# KARMİS İlan Değerlendirme Raporu: ${evaluation.company} - ${evaluation.jobTitle}

### 1. Hızlı Okuma Özet Tablosu
| Kriter / Metrik | Detay ve Analiz |
|---|---|
| **Şirket & Lokasyon** | **${evaluation.company}** — ${evaluation.location} |
| **Sektör & Yapı** | ${evaluation.sector} |
| **Aday Uyum Puanı** | **%${evaluation.score}** (Eşik: %${evaluation.threshold}) |
| **Kıdem Seviyesi** | ${evaluation.seniority} |
| **Maaş Benchmark'ı** | ${evaluation.salaryBenchmark} |
| **Önerilen Açılış** | ${evaluation.recommendedSalaryOpening} |
| **Karar & Aksiyon** | ${decisionBadge} |
| **LinkedIn Outreach Notu** | Sayın İK Lideri, ${evaluation.company} bünyesindeki ${evaluation.jobTitle} pozisyonuna yönelik başvurumla ilgileniyorum. ${profile.portfolio || profile.linkedin || ''} |
| **En Kritik 5 ATS Keyword** | ${evaluation.atsKeywords.slice(0, 5).join(', ')} |

---

### 2. Şirket Rakamları Grafiği
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
| Sistem & Yazılım Mimarisi | +30% Boost | Temel teknik yetkinlikler ve sistem mimarisi gereksinimleri ile eşleşme. |
| AI & Otomasyon Entegrasyonu | +25% Boost | Modern araçlar, API entegrasyonları ve verimlilik artırıcı çözümler. |
| Çapraz Fonksiyonel Liderlik | +20% Boost | Paydaş yönetimi ve teknik koordinasyon yetkinliği. |
${penaltiesBlock}

---

### 5. İK E-Posta Metni & Executive Cover Letter
${fence}text
Dear ${evaluation.company} Talent Acquisition Team,

I am writing to express my strong interest in the ${evaluation.jobTitle} position at ${evaluation.company}.

With extensive experience leading engineering, software architecture, and technology initiatives, I specialize in designing scalable systems, accelerating product delivery, and aligning technology roadmap with key organizational outcomes.

Throughout my career, I have successfully governed high-impact platforms, automated critical workflows, and fostered collaborative engineering environments. I would welcome the opportunity to discuss how my expertise can drive ${evaluation.company}'s goals.

Warm regards,
${profile.name || 'Candidate'}
${profile.title || 'Technology Professional'}
${[profile.email ? `Email: ${profile.email}` : null, profile.phone ? `Phone: ${profile.phone}` : null, profile.portfolio ? `Portfolio: ${profile.portfolio}` : null, profile.linkedin ? `LinkedIn: ${profile.linkedin}` : null].filter(Boolean).join(' | ')}
${fence}

---

### 6. LinkedIn Executive Outreach Metni
${fence}text
Sayın İK Lideri, ${evaluation.company} bünyesindeki ${evaluation.jobTitle} pozisyonuna yönelik başvurumla ilgileniyorum. Yetkinliklerimi ve deneyimlerimi profilim üzerinden inceleyebilirsiniz: ${profile.portfolio || profile.linkedin || 'LinkedIn'}
${fence}

---

### 7. Mülakat Hazırlık Asistanı (STAR Metodu)
| Mülakat Sorusu | Durum & Görev (Situation & Task) | Eylem (Action) | Sonuç (Result) |
|---|---|---|---|
${interviewPrep.questions.map(q => `| ${q.question} | ${q.situation} | ${q.action} | ${q.result} |`).join('\n')}

---

### 8. Şirkete ve Liderliğe Sorulacak 5 Stratejik Soru ("Reverse Questions")
| No | Stratejik Soru & Odak Alanı | Mülakattaki Amacı & Sağlayacağı Değer |
|---|---|---|
${reverseQuestionsTable}

---

### 9. İlk 90 Gün Yönetici Eylem Planı (30-60-90 Day Plan)
| Faz / Zaman Dilimi | Stratejik Odak & Başlık | Temel Aksiyonlar & Hedef Çıktılar |
|---|---|---|
| **[1. Faz] 1-30 Gün** | **${interviewPrep.plan90Days?.phase1?.title || 'İlk 30 Gün'}** | ${p1Goals} |
| **[2. Faz] 31-60 Gün** | **${interviewPrep.plan90Days?.phase2?.title || '31-60 Gün'}** | ${p2Goals} |
| **[3. Faz] 61-90 Gün** | **${interviewPrep.plan90Days?.phase3?.title || '61-90 Gün'}** | ${p3Goals} |

---

### 10. ATS CV Anahtar Kelime Optimizasyon Matrisi
| ATS Anahtar Kelimesi | CV'de Vurgulanacak Alan | İlan Eşleşme Gerekçesi |
|---|---|---|
${evaluation.atsKeywords.map(kw => `| ${kw} | Özet & Uzmanlık Alanları | İlan şartları ve teknik gereksinimlerle tam uyum. |`).join('\n')}
`;
}

module.exports = { generateMarkdownReport };
