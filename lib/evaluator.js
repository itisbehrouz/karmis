/**
 * KARMİS Company Intelligence & Evaluation Engine v1.9.0
 * Generates accurate company-specific operational metrics, sectors, locations,
 * ATS keywords, and STAR interview questions without hardcoded Roche defaults.
 */

const COMPANY_KNOWLEDGE = {
  "Ticimax": {
    sector: "E-Ticaret Altyapısı & Bilişim",
    location: "İstanbul (Ataşehir)",
    seniority: "Executive / Information Security Director",
    salaryBenchmark: "160.000 TL - 220.000 TL Net / Ay",
    salaryOpening: "180.000 TL - 200.000 TL Net / Ay",
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
    ]
  },
  "The Coca-Cola Company": {
    sector: "Hızlı Tüketim (FMCG) & İçecek",
    location: "İstanbul (İstinye / Hibrit)",
    seniority: "Senior Director / EME Regional Scope",
    salaryBenchmark: "220.000 TL - 320.000 TL Net / Ay",
    salaryOpening: "250.000 TL - 280.000 TL Net / Ay",
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
    ]
  },
  "hrmade (Finans Müşterisi)": {
    sector: "Finans & Bankacılık Teknolojileri",
    location: "İstanbul (Levent / Hibrit)",
    seniority: "Süreç Yönetimi Müdürü",
    salaryBenchmark: "150.000 TL - 210.000 TL Net / Ay",
    salaryOpening: "170.000 TL - 190.000 TL Net / Ay",
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
    ]
  },
  "Shell & Turcas Petrol A.Ş.": {
    sector: "Enerji, Akaryakıt & Perakende",
    location: "İstanbul (Ataşehir / Hibrit)",
    seniority: "Information & Digital Technology Manager",
    salaryBenchmark: "200.000 TL - 280.000 TL Net / Ay",
    salaryOpening: "220.000 TL - 250.000 TL Net / Ay",
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
    ]
  },
  "FLO Group": {
    sector: "Perakende & E-Ticaret",
    location: "İstanbul (Bağcılar / Hibrit)",
    seniority: "Strategy & Transformation Executive",
    salaryBenchmark: "170.000 TL - 240.000 TL Net / Ay",
    salaryOpening: "190.000 TL - 210.000 TL Net / Ay",
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
    ]
  },
  "ING Hubs Türkiye": {
    sector: "Global Finans & Bankacılık Teknolojileri",
    location: "İstanbul (Maslak / Hibrit)",
    seniority: "Product Manager (Analytics)",
    salaryBenchmark: "160.000 TL - 230.000 TL Net / Ay",
    salaryOpening: "180.000 TL - 200.000 TL Net / Ay",
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
    ]
  },
  "Novartis": {
    sector: "İlaç & Biyoteknoloji",
    location: "İstanbul (Kavacık / Hibrit)",
    seniority: "Execution Excellence Head",
    salaryBenchmark: "210.000 TL - 300.000 TL Net / Ay",
    salaryOpening: "240.000 TL - 270.000 TL Net / Ay",
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
    ]
  }
};

function evaluateJobPosting(jobDetails = {}, candidateProfile = {}, config = {}) {
  const threshold = config.matchThreshold || 80;
  const companyName = jobDetails.company || "Kurumsal Şirket";
  const known = COMPANY_KNOWLEDGE[companyName] || {};

  let baseScore = 90;
  const penaltyDetails = [];

  if (jobDetails.hasHeavyRegulatory) {
    const penalty = config.filters?.penalties?.regulatoryCompliance || -25;
    baseScore += penalty;
    penaltyDetails.push({ rule: "Mevzuat & Yasal Uyum Filtresi", penalty, reason: "İçerikte ağır mevzuat, TCMB/BDDK veya resmi yasal evrak yükümlülüğü tespit edildi." });
  }

  if (jobDetails.isJuniorDownleveling) {
    const penalty = config.filters?.penalties?.downlevelingJunior || -30;
    baseScore += penalty;
    penaltyDetails.push({ rule: "Kıdem Altı / Downleveling Filtresi", penalty, reason: "Pozisyon liderlik taşımayan 0-3 yıl seviyesinde kıdem altı geliştirici rolüdür." });
  }

  if (jobDetails.isFieldSalesQuota) {
    const penalty = config.filters?.penalties?.fieldQuotaSales || -25;
    baseScore += penalty;
    penaltyDetails.push({ rule: "Fonksiyonel Satış / Saha Yükü Filtresi", penalty, reason: "Rol doğrudan soğuk satış kotası veya ağır saha seyahat yükü barındırmaktadır." });
  }

  const score = Math.max(0, Math.min(100, baseScore));
  const decision = score >= threshold ? "BAŞVURULACAK" : "PAS GEÇİLECEK";

  return {
    jobTitle: jobDetails.jobTitle || jobDetails.title || "Teknoloji & Analitik Yöneticisi",
    company: companyName,
    location: known.location || jobDetails.location || "İstanbul (Hibrit)",
    sector: known.sector || jobDetails.sector || "Teknoloji & Kurumsal Danışmanlık",
    seniority: known.seniority || jobDetails.seniority || "Executive / Yönetsel Liderlik",
    salaryBenchmark: known.salaryBenchmark || "160.000 TL - 240.000 TL Net / Ay",
    recommendedSalaryOpening: known.salaryOpening || "180.000 TL - 210.000 TL Net / Ay",
    score,
    threshold,
    decision,
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

module.exports = { evaluateJobPosting, COMPANY_KNOWLEDGE };
