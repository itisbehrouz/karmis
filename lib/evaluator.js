/**
 * KARMİS V2 Multi-Dimensional Job Analysis & Decision Engine
 * Evaluates jobs across 11 distinct dimensions with 3-state decisions (APPLY / PASS / MAYBE).
 * Preserves complete backwards compatibility with V1 evaluation and COMPANY_KNOWLEDGE.
 */

const { CAREER_LEVELS, DECISIONS } = require('./constants');
const { analyzeSkillGaps } = require('./skills');
const { evaluateRisks } = require('./risk');
const { matchRequirementsToEvidence, getEvidenceWallet } = require('./evidence');
const { getCareerDna } = require('./dna');

const COMPANY_KNOWLEDGE = {
  "Ticimax": {
    sector: "E-Ticaret Altyapısı & Bilişim",
    location: "İstanbul (Ataşehir)",
    seniority: "Executive / Information Security Director",
    salaryBenchmark: "160.000 TL - 220.000 TL Net / Ay",
    salaryOpening: "180.000 TL - 200.000 TL Net / Ay",
    salaryMid: 190000,
    metrics: [
      { label: "E-Ticaret Ciro Hacmi", value: "45 Milyar TL", unit: "İşlenen Yıllık Hacim", heightRatio: 0.95 },
      { label: "Aktif E-Ticaret Mağazası", value: "15.000+", unit: "Kurumsal Altyapı", heightRatio: 0.85 },
      { label: "Yazılım & BT Ekibi", value: "350+ Uzman", unit: "R&D & Siber Güvenlik", heightRatio: 0.75 },
      { label: "Sistem Kullanılabilirliği", value: "99.99%", unit: "PCI DSS Level 1 Uptime", heightRatio: 0.98 }
    ],
    atsKeywords: [
      "Information Security & Compliance",
      "PCI-DSS Level 1 & ISO 27001",
      "E-Commerce Cloud Infrastructure",
      "Risk Management & Incident Response",
      "Cybersecurity Strategy & Governance"
    ],
    requiredSkills: [
      { name: "Information Security", targetLevel: 5, importance: "critical" },
      { name: "Cloud Infrastructure", targetLevel: 4, importance: "high" },
      { name: "Risk Management", targetLevel: 4, importance: "high" },
      { name: "Agile Leadership", targetLevel: 4, importance: "medium" }
    ]
  },
  "The Coca-Cola Company": {
    sector: "Hızlı Tüketim (FMCG) & İçecek",
    location: "İstanbul (İstinye / Hibrit)",
    seniority: "Senior Director / EME Regional Scope",
    salaryBenchmark: "220.000 TL - 320.000 TL Net / Ay",
    salaryOpening: "250.000 TL - 280.000 TL Net / Ay",
    salaryMid: 270000,
    metrics: [
      { label: "Global Ciro", value: "45 Milyar USD", unit: "Fortune 500 Global FMCG", heightRatio: 0.95 },
      { label: "Çalışan Sayısı", value: "79.000+", unit: "Küresel İş Gücü", heightRatio: 0.85 },
      { label: "Bölgesel Erişim", value: "200+ Ülke", unit: "EME Bölgesel Kapsam", heightRatio: 0.9 },
      { label: "Dijital Dönüşüm", value: "15+ Yıl", unit: "Power BI & AI Yönetişimi", heightRatio: 0.8 }
    ],
    atsKeywords: [
      "Digital Transformation (DT) Strategy",
      "EME Regional Scope & Governance",
      "Enterprise Power BI & Data Analytics",
      "Agile Tech Delivery Velocity",
      "Cross-Functional Team Leadership"
    ],
    requiredSkills: [
      { name: "Digital Transformation", targetLevel: 5, importance: "critical" },
      { name: "Power BI", targetLevel: 5, importance: "high" },
      { name: "Leadership", targetLevel: 5, importance: "critical" },
      { name: "Data Strategy", targetLevel: 4, importance: "high" }
    ]
  },
  "hrmade (Finans Müşterisi)": {
    sector: "Finans & Bankacılık Teknolojileri",
    location: "İstanbul (Levent / Hibrit)",
    seniority: "Süreç Yönetimi Müdürü",
    salaryBenchmark: "150.000 TL - 210.000 TL Net / Ay",
    salaryOpening: "170.000 TL - 190.000 TL Net / Ay",
    salaryMid: 180000,
    metrics: [
      { label: "Şube & Birim Ağı", value: "120+ Birim", unit: "Çoklu Finansal Kurum", heightRatio: 0.85 },
      { label: "Çalışan Hacmi", value: "6.500+", unit: "Finansal Operasyon", heightRatio: 0.8 },
      { label: "Süreç Verimliliği", value: "%67 Artış", unit: "BPMN & RPA Otomasyonu", heightRatio: 0.9 },
      { label: "Yönetilen Ekip", value: "6-7 Uzman", unit: "Süreç & Analitik Ekibi", heightRatio: 0.75 }
    ],
    atsKeywords: [
      "BPMN Process Architecture",
      "RPA & Workflow Automation",
      "Financial Operations & Compliance",
      "Cross-Branch Efficiency Optimization",
      "KPI & Performance Dashboard Architecture"
    ],
    requiredSkills: [
      { name: "BPMN Process Architecture", targetLevel: 4, importance: "critical" },
      { name: "RPA Automation", targetLevel: 4, importance: "high" },
      { name: "Analytics", targetLevel: 4, importance: "high" }
    ]
  },
  "Shell & Turcas Petrol A.Ş.": {
    sector: "Enerji, Akaryakıt & Perakende",
    location: "İstanbul (Ataşehir / Hibrit)",
    seniority: "Information & Digital Technology Manager",
    salaryBenchmark: "200.000 TL - 280.000 TL Net / Ay",
    salaryOpening: "220.000 TL - 250.000 TL Net / Ay",
    salaryMid: 240000,
    metrics: [
      { label: "Global Ciro", value: "380 Milyar USD", unit: "Fortune 50 Enerji Dev", heightRatio: 0.98 },
      { label: "İstasyon Ağı", value: "1.000+ İstasyon", unit: "Perakende & IoT Ağı", heightRatio: 0.9 },
      { label: "Çalışan Sayısı", value: "90.000+", unit: "Global Enerji Kadrosu", heightRatio: 0.85 },
      { label: "BT Yönetim Bütçesi", value: "15M USD", unit: "SAP, IoT & Analytics BT", heightRatio: 0.8 }
    ],
    atsKeywords: [
      "IT & Digital Technology Management",
      "Energy & Retail Operations Tech",
      "Power BI & Real-Time Analytics",
      "IoT & Infrastructure Governance",
      "Information Security & Risk Strategy"
    ],
    requiredSkills: [
      { name: "Digital Technology", targetLevel: 5, importance: "critical" },
      { name: "Power BI", targetLevel: 4, importance: "high" },
      { name: "IoT Governance", targetLevel: 4, importance: "medium" }
    ]
  },
  "FLO Group": {
    sector: "Perakende & E-Ticaret",
    location: "İstanbul (Bağcılar / Hibrit)",
    seniority: "Strategy & Transformation Executive",
    salaryBenchmark: "170.000 TL - 240.000 TL Net / Ay",
    salaryOpening: "190.000 TL - 210.000 TL Net / Ay",
    salaryMid: 205000,
    metrics: [
      { label: "Perakende Ciro", value: "30 Milyar TL", unit: "Bölgesel Perakende Lideri", heightRatio: 0.9 },
      { label: "Mağaza Ağı", value: "800+ Mağaza", unit: "Çoklu Kanal (Omnichannel)", heightRatio: 0.88 },
      { label: "İş Gücü", value: "15.000+", unit: "Perakende & E-Ticaret", heightRatio: 0.8 },
      { label: "İhracat Pazarı", value: "25+ Ülke", unit: "Küresel Büyüme Hacmi", heightRatio: 0.75 }
    ],
    atsKeywords: [
      "Retail Strategy & Transformation",
      "Omnichannel E-Commerce Analytics",
      "Power BI & Growth Analytics",
      "Supply Chain Optimization",
      "Agile Project Management"
    ],
    requiredSkills: [
      { name: "Retail Strategy", targetLevel: 5, importance: "critical" },
      { name: "Analytics", targetLevel: 4, importance: "high" },
      { name: "Omnichannel", targetLevel: 4, importance: "high" }
    ]
  },
  "ING Hubs Türkiye": {
    sector: "Global Finans & Bankacılık Teknolojileri",
    location: "İstanbul (Maslak / Hibrit)",
    seniority: "Product Manager (Analytics)",
    salaryBenchmark: "160.000 TL - 230.000 TL Net / Ay",
    salaryOpening: "180.000 TL - 200.000 TL Net / Ay",
    salaryMid: 195000,
    metrics: [
      { label: "Global Gelir", value: "18 Milyar EUR", unit: "ING Group Global Banking", heightRatio: 0.9 },
      { label: "Global İş Gücü", value: "60.000+", unit: "Uluslararası Bankacılık", heightRatio: 0.85 },
      { label: "Pazar Kapsamı", value: "40+ Ülke", unit: "Global Tech Delivery Hub", heightRatio: 0.8 },
      { label: "Analitik Squad", value: "10+ Squad", unit: "Retail Banking Analytics", heightRatio: 0.75 }
    ],
    atsKeywords: [
      "Analytics Product Management",
      "Retail Banking Data Strategy",
      "Agile & Scrum Squad Leadership",
      "Power BI & AI Product Discovery",
      "Financial Data Governance"
    ],
    requiredSkills: [
      { name: "Product Management", targetLevel: 4, importance: "critical" },
      { name: "Analytics", targetLevel: 4, importance: "high" },
      { name: "Agile", targetLevel: 4, importance: "medium" }
    ]
  },
  "Novartis": {
    sector: "İlaç & Biyoteknoloji",
    location: "İstanbul (Kavacık / Hibrit)",
    seniority: "Execution Excellence Head",
    salaryBenchmark: "210.000 TL - 300.000 TL Net / Ay",
    salaryOpening: "240.000 TL - 270.000 TL Net / Ay",
    salaryMid: 255000,
    metrics: [
      { label: "Global Ciro", value: "45 Milyar USD", unit: "Küresel Biyoteknoloji", heightRatio: 0.95 },
      { label: "Çalışan Sayısı", value: "76.000+", unit: "Global Sağlık İş Gücü", heightRatio: 0.85 },
      { label: "Yıllık Ar-Ge", value: "9 Milyar USD", unit: "Sağlık & İnovasyon", heightRatio: 0.8 },
      { label: "Pazar Erişimi", value: "140+ Ülke", unit: "Saha Mükemmelliği", heightRatio: 0.9 }
    ],
    atsKeywords: [
      "Commercial & Field Execution Excellence",
      "Data Analytics & AI Adoption",
      "Pharma Commercial Strategy",
      "Cross-Functional Team Leadership",
      "Strategic Governance & Compliance"
    ],
    requiredSkills: [
      { name: "Commercial Excellence", targetLevel: 5, importance: "critical" },
      { name: "Data Analytics", targetLevel: 4, importance: "high" },
      { name: "Pharma Strategy", targetLevel: 4, importance: "high" }
    ]
  }
};

function evaluateJobPosting(jobDetails = {}, candidateProfile = {}, config = {}) {
  const job = jobDetails || {};
  const cand = candidateProfile || {};
  const cfg = config || {};
  const threshold = cfg.matchThreshold || 80;
  const companyName = job.company || "Kurumsal Şirket";
  const known = COMPANY_KNOWLEDGE[companyName] || {};

  // Resolve candidate DNA
  let candidateDna = cand;
  if (!candidateDna || Object.keys(candidateDna).length === 0 || !candidateDna.currentLevel) {
    try {
      candidateDna = getCareerDna();
    } catch (e) {
      candidateDna = {
        currentLevel: 'LEAD',
        yearsOfExperience: 15,
        skills: [],
        preferences: { remotePreference: 'hybrid', travelTolerancePercent: 20 },
        constraints: { minSalary: 120000 }
      };
    }
  }

  // 1. Requirements & Skill Gap Analysis
  const requiredSkills = job.requiredSkills || known.requiredSkills || [
    { name: job.jobTitle || job.title || 'Core Competency', targetLevel: 4, importance: 'critical' }
  ];
  const skillGapResult = analyzeSkillGaps(candidateDna.skills || [], requiredSkills);
  const skillFit = skillGapResult.overallSkillScore;

  // 2. Experience Fit (0-100)
  const candidateYears = candidateDna.yearsOfExperience || 10;
  const requiredYears = job.minYearsExperience || (
    /15\+/i.test(job.rawDescription || '') ? 15 :
    /10\+/i.test(job.rawDescription || '') ? 10 :
    /5\+/i.test(job.rawDescription || '') ? 5 : 3
  );
  let isOverqualified = false;
  let experienceFit = 90;
  if (candidateYears < requiredYears) {
    experienceFit = Math.max(30, Math.round((candidateYears / requiredYears) * 100));
  } else if (candidateYears > requiredYears + 8 && /junior|associate|entry/i.test(job.seniority || job.title || '')) {
    experienceFit = 60; // Overqualified penalty
    isOverqualified = true;
  }

  // 3. Seniority Fit (0-100)
  const candRank = CAREER_LEVELS[candidateDna.currentLevel]?.rank || 7;
  const jobRank = job.seniorityLevel
    ? (CAREER_LEVELS[job.seniorityLevel]?.rank || 7)
    : (/director|executive|head|vp|c_level/i.test(known.seniority || job.seniority || job.title || '') ? 8 : 6);
  const rankDiff = jobRank - candRank;
  let seniorityFit = 85;
  if (rankDiff === 0) {
    seniorityFit = 100;
  } else if (rankDiff === 1) {
    seniorityFit = 90;
  } else if (rankDiff === 2) {
    seniorityFit = 65; // Stretch leap across tiers
  } else if (rankDiff > 2) {
    seniorityFit = 45; // Excessive leap
  } else if (rankDiff === -1) {
    seniorityFit = 75; // Minor step down
  } else if (rankDiff <= -2) {
    seniorityFit = 40; // Severe downleveling
  }

  // 4. Salary Fit (0-100)
  const targetSalary = candidateDna.financialGoals?.targetSalary || candidateDna.constraints?.minSalary || 180000;
  const jobSalaryMid = job.salaryMid || known.salaryMid || (
    job.salaryOffered || 180000
  );
  let salaryFit = 85;
  if (targetSalary > 0 && jobSalaryMid > 0) {
    const ratio = jobSalaryMid / targetSalary;
    if (ratio >= 1.0) salaryFit = 95;
    else if (ratio >= 0.85) salaryFit = 80;
    else if (ratio >= 0.70) salaryFit = 60;
    else salaryFit = 40;
  }

  // 5. Career Upside (0-100)
  let careerUpside = 80;
  if (rankDiff === 1 || rankDiff === 2) careerUpside += 15;
  if (rankDiff < 0) careerUpside -= 20;
  if (known.sector || job.sector) careerUpside += 5;
  careerUpside = Math.max(20, Math.min(100, careerUpside));

  // 6. Location & Working Model Fit
  const locationText = known.location || job.location || "İstanbul (Hibrit)";
  let locationFit = 90;
  let workModelFit = 90;
  if (/remote|uzaktan/i.test(locationText)) {
    locationFit = 100;
    workModelFit = 100;
  } else if (/hibrit|hybrid/i.test(locationText)) {
    locationFit = 90;
    workModelFit = 90;
  } else if (candidateDna.preferences?.remotePreference === 'remote') {
    workModelFit = 45;
  }

  // 7. Industry Fit
  const candidateIndustry = (candidateDna.industry || '').toLowerCase();
  const jobSector = (known.sector || job.sector || '').toLowerCase();
  let industryFit = 85;
  if (candidateIndustry && jobSector && (candidateIndustry.includes(jobSector) || jobSector.includes(candidateIndustry))) {
    industryFit = 95;
  }

  // 8. Risk Engine Analysis
  const riskAnalysis = evaluateRisks(job, candidateDna);
  const riskScore = riskAnalysis.riskScore;

  // 9. Success Probability (0-100)
  const successProbability = Math.max(10, Math.min(99, Math.round(
    (skillFit * 0.40) + (experienceFit * 0.30) + (seniorityFit * 0.30) - (riskScore * 0.20)
  )));

  // 10. Opportunity Cost (0-100)
  // Higher if underpaid, downleveling, or high travel
  let opportunityCost = 25;
  if (rankDiff < 0) opportunityCost += 25;
  if (salaryFit < 70) opportunityCost += 30;
  if (riskScore > 40) opportunityCost += 20;
  opportunityCost = Math.min(100, opportunityCost);

  // 11. Legacy V1 Penalty Logic for strict rule compatibility
  let legacyBaseScore = 90;
  const penaltyDetails = [];

  if (job.hasHeavyRegulatory || riskAnalysis.detectedRisks.some(r => r.id === 'excessive_bureaucracy')) {
    const penalty = cfg.filters?.penalties?.regulatoryCompliance || -25;
    legacyBaseScore += penalty;
    penaltyDetails.push({ rule: "Mevzuat & Yasal Uyum Filtresi", penalty, reason: "İçerikte ağır mevzuat, TCMB/BDDK veya resmi yasal evrak yükümlülüğü tespit edildi." });
  }

  if (job.isJuniorDownleveling || riskAnalysis.detectedRisks.some(r => r.id === 'downleveling')) {
    const penalty = cfg.filters?.penalties?.downlevelingJunior || -30;
    legacyBaseScore += penalty;
    penaltyDetails.push({ rule: "Kıdem Altı / Downleveling Filtresi", penalty, reason: "Pozisyon liderlik taşımayan 0-3 yıl seviyesinde kıdem altı geliştirici rolüdür." });
  }

  if (job.isFieldSalesQuota || riskAnalysis.detectedRisks.some(r => r.id === 'cold_call_quotas')) {
    const penalty = cfg.filters?.penalties?.fieldQuotaSales || -25;
    legacyBaseScore += penalty;
    penaltyDetails.push({ rule: "Fonksiyonel Satış / Saha Yükü Filtresi", penalty, reason: "Rol doğrudan soğuk satış kotası veya ağır saha seyahat yükü barındırmaktadır." });
  }

  // Multi-dimensional Weighted Final Score calculation:
  // Weighted positive factors minus risk deductions
  const compositePositive = (
    (skillFit * 0.25) +
    (experienceFit * 0.15) +
    (seniorityFit * 0.15) +
    (salaryFit * 0.15) +
    (careerUpside * 0.10) +
    (locationFit * 0.05) +
    (workModelFit * 0.05) +
    (industryFit * 0.10)
  );

  // Subtract net risk penalty
  const riskDeduction = Math.round(riskScore * 0.40);
  const multiDimScore = Math.max(0, Math.min(100, Math.round(compositePositive - riskDeduction)));

  // Reconcile with legacy score for 100% backward compliance
  const finalScore = penaltyDetails.length > 0
    ? Math.min(multiDimScore, Math.max(0, Math.min(100, legacyBaseScore)))
    : multiDimScore;

  // Evidence Matching
  let evidenceWallet = [];
  try {
    evidenceWallet = getEvidenceWallet();
  } catch (e) {
    evidenceWallet = [];
  }
  const evidenceMatching = matchRequirementsToEvidence(
    known.atsKeywords || job.requirements || ['Core Expertise'],
    candidateDna.skills || [],
    evidenceWallet
  );

  // 3-State Decision: APPLY / PASS / MAYBE
  let decisionCode = DECISIONS.PASS;
  let decision = "PAS GEÇİLECEK";
  const positiveReasons = [];
  const negativeReasons = [];

  // Positive criteria
  if (skillFit >= 80) positiveReasons.push(`Güçlü yetkinlik uyumu (%${skillFit})`);
  if (experienceFit >= 80) positiveReasons.push(`Deneyim ve kıdem örtüşmesi (%${experienceFit})`);
  if (seniorityFit >= 80) positiveReasons.push(`Kıdem ve kademe uyumu (%${seniorityFit})`);
  if (salaryFit >= 80) positiveReasons.push('Tatmin edici ücret ve benchmark uyumu');
  if (careerUpside >= 75) positiveReasons.push('Yüksek kariyer sıçraması ve yönetsel etki alanı');
  if (locationFit >= 90 && workModelFit >= 90) positiveReasons.push('Lokasyon ve çalışma modeli beklentileriyle tam uyumlu');
  if (industryFit >= 90) positiveReasons.push('Hedef sektör ve pazar deneyimiyle doğrudan örtüşüyor');
  if (evidenceMatching.coverageScore >= 75) positiveReasons.push(`Yüksek kanıt güvencesi: İstenen yetkinliklerin %${evidenceMatching.coverageScore}'i doğrulanmış vaka çalışmalarıyla destekleniyor`);

  // Negative & objection criteria
  if (isOverqualified) {
    negativeReasons.push('Aday pozisyon için aşırı kıdemli (overqualified / kıdem altı çalışma riski)');
  }
  if (riskAnalysis.detectedRisks.length > 0) {
    for (const r of riskAnalysis.detectedRisks) {
      negativeReasons.push(r.reason || r.name);
    }
  }
  if (salaryFit < 70) {
    negativeReasons.push(`Ücret paketi hedefin belirgin altında (%${salaryFit} uyum)`);
  }
  if (seniorityFit < 65 && !isOverqualified) {
    negativeReasons.push(`Kıdem ve seviye uyumsuzluğu (Kıdem uyumu: %${seniorityFit})`);
  }
  if (skillFit < 70) {
    negativeReasons.push(`Kritik yetkinlik açıkları mevcut (Yetkinlik uyumu: %${skillFit})`);
  }
  if (careerUpside < 65) {
    negativeReasons.push('Düşük kariyer gelişimi ve sınırlı yönetsel ilerleme potansiyeli');
  }
  if (locationFit < 70 || workModelFit < 70) {
    negativeReasons.push('Çalışma modeli veya ofis konumu adayın kısıtlarıyla çelişiyor');
  }
  if (opportunityCost >= 50) {
    negativeReasons.push(`Fırsat maliyeti çok yüksek (%${opportunityCost}); alternatif kariyer yollarını bloke edebilir`);
  }

  if (riskAnalysis.hasFatalRisk) {
    decisionCode = DECISIONS.PASS;
    decision = "PAS GEÇİLECEK";
    if (!negativeReasons.some(r => r.includes('fatal'))) {
      negativeReasons.push("Kritik fatal risk (sözleşme veya komisyon riski) tespit edildi.");
    }
  } else if (finalScore >= threshold && riskScore < 35 && opportunityCost < 50) {
    decisionCode = DECISIONS.APPLY;
    decision = "BAŞVURULACAK";
  } else if (finalScore >= 68 && riskScore < 50 && opportunityCost < 65) {
    decisionCode = DECISIONS.MAYBE;
    decision = "DEĞERLENDİRİLEBİLİR (MAYBE)";
  } else {
    decisionCode = DECISIONS.PASS;
    decision = "PAS GEÇİLECEK";
  }

  return {
    jobTitle: job.jobTitle || job.title || "Teknoloji & Analitik Yöneticisi",
    company: companyName,
    location: locationText,
    sector: known.sector || job.sector || "Teknoloji & Kurumsal Danışmanlık",
    seniority: known.seniority || job.seniority || "Executive / Yönetsel Liderlik",
    salaryBenchmark: known.salaryBenchmark || "160.000 TL - 240.000 TL Net / Ay",
    recommendedSalaryOpening: known.salaryOpening || "180.000 TL - 210.000 TL Net / Ay",
    score: finalScore,
    threshold,
    decision,
    decisionCode,
    dimensions: {
      skillFit,
      experienceFit,
      seniorityFit,
      salaryFit,
      careerUpside,
      locationFit,
      workModelFit,
      industryFit,
      successProbability,
      risk: riskScore,
      opportunityCost
    },
    reasons: {
      positive: positiveReasons,
      negative: negativeReasons
    },
    riskDetails: riskAnalysis,
    evidenceMatching,
    penaltyDetails,
    metrics: known.metrics || [
      { label: "Operasyonel Hacim", value: "50+ Proje", unit: "Kurumsal Dönüşüm Hacmi", heightRatio: 0.9 },
      { label: "İş Gücü Kapasitesi", value: "500+ Çalışan", unit: "Uzman Kadro", heightRatio: 0.8 },
      { label: "Yıllık Büyüme", value: "%35 Büyüme", unit: "Dijital & Analitik Yatırım", heightRatio: 0.85 },
      { label: "Sistem Başarısı", value: "99.9% Uptime", unit: "Kesintisiz Altyapı", heightRatio: 0.95 }
    ],
    atsKeywords: known.atsKeywords || [
      "Digital Transformation & Tech Leadership",
      "Power BI & Enterprise Analytics",
      "AI & Automation Integration (LLM/GenAI)",
      "Agile & Cross-Functional Governance",
      "Data Strategy & Information Security"
    ]
  };
}

module.exports = {
  evaluateJobPosting,
  COMPANY_KNOWLEDGE
};
