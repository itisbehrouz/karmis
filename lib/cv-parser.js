/**
 * KARMİS CV & Portfolio Parser v1.5.0
 * Includes 10 Live Portfolio Case Studies from https://behruzbagirzade.com/#work
 */

const fs = require('fs');
const path = require('path');

const PORTFOLIO_PROJECTS = [
  {
    "id": 1,
    "title": "Executive Power BI Suite",
    "category": "Data & BI",
    "organization": "Yiğitoğlu (2022 — 2024)",
    "description": "7 Uluslararası şirket şubesi için gerçek zamanlı C-Level KPI panelleri mimarisi. Manuel raporlama yükünü %80 azalttı.",
    "link": "https://behruzbagirzade.com/work/executive-bi-suite"
  },
  {
    "id": 2,
    "title": "AI-Enabled Automation Programme",
    "category": "Automation & AI",
    "organization": "Yiğitoğlu (2023 — 2026)",
    "description": "Microsoft Power Platform ve LLM motorları üzerinde şirket genelinde operasyonel verimliliği %67 artıran otomasyon programı.",
    "link": "https://behruzbagirzade.com/work/ai-automation-platform"
  },
  {
    "id": 3,
    "title": "Digital Workplace PWA",
    "category": "Digital Workplace",
    "organization": "Yiğitoğlu (2024 — 2026)",
    "description": "ERP, İK, CRM, BI ve IT Service Desk sistemlerini tek bir yapay zekâ destekli platformda toplayan Progressive Web App.",
    "link": "https://behruzbagirzade.com/work/digital-workplace-pwa"
  },
  {
    "id": 4,
    "title": "B2B E-Commerce Platform Launch",
    "category": "E-Commerce",
    "organization": "Edgers (2019)",
    "description": "İran, Balkanlar, Mısır, ABD ve Afrika pazarlarına yönelik sıfırdan kurulan uluslararası doğrudan B2B e-ticaret satış kanalı.",
    "link": "https://behruzbagirzade.com/work/b2b-ecommerce-launch"
  },
  {
    "id": 5,
    "title": "Rubin Kimya — Rebranding & Web Development",
    "category": "Web & Branding",
    "organization": "Rubin Kimya (Jun 2025 — Dec 2025)",
    "description": "Kurumsal kimlik, dijital marka stratejisi ve sıfırdan geliştirilen modern web platformu.",
    "link": "https://behruzbagirzade.com/work/rubin-kimya-rebranding"
  },
  {
    "id": 6,
    "title": "Valory Vista — Digital Branding",
    "category": "Web & Branding",
    "organization": "Valory Vista (Apr 2025 — May 2025)",
    "description": "Mimari, yaşam tarzı ve yüksek dönüşüm odaklı dijital marka platformu tasarımı.",
    "link": "https://behruzbagirzade.com/work/valory-vista-digital-branding"
  },
  {
    "id": 7,
    "title": "Insight360 — Performance Evaluation System",
    "category": "HR Tech",
    "organization": "Yiğitoğlu (Feb 2025 — Mar 2025)",
    "description": "Çalışan gelişimini ve performans şeffaflığını sağlayan kurumsal 360 derece geri bildirim ve değerlendirme yazılımı.",
    "link": "https://behruzbagirzade.com/work/insight360"
  },
  {
    "id": 8,
    "title": "Yiğitoğlu Digital Evolution",
    "category": "Web & Branding",
    "organization": "Yiğitoğlu (May 2024 — Dec 2024)",
    "description": "Sektör lideri grup için kullanıcı odaklı ve küresel erişilebilirliğe sahip yenilikçi dijital web platformu.",
    "link": "https://behruzbagirzade.com/work/yigitoglu-digital-evolution"
  },
  {
    "id": 9,
    "title": "Digital Product Management App",
    "category": "Product & ERP",
    "organization": "Yiğitoğlu (2024)",
    "description": "ERP ve BI altyapısına entegre merkezi ürün veri yönetimi ve katalog otomasyon uygulaması.",
    "link": "https://behruzbagirzade.com/work/digital-product-management-app"
  },
  {
    "id": 10,
    "title": "BI Dashboard for Supply Chain Optimization",
    "category": "Data & BI",
    "organization": "Yiğitoğlu (2023)",
    "description": "ERP ve CRM verilerini birleştirerek tedarik zinciri ve satın alma süreçlerinde gerçek zamanlı izlenebilirlik sağlanan Power BI paneli.",
    "link": "https://behruzbagirzade.com/work/supply-chain-bi-dashboard"
  }
];

function parseCvMarkdown(filePath) {
  if (!fs.existsSync(filePath)) return null;
  const content = fs.readFileSync(filePath, 'utf8');

  return {
    name: "Behrouz Bagherzadeh",
    title: "Digital Transformation & Business Intelligence Leader",
    email: "be.bagherzadeh@gmail.com",
    phone: "+90 553 678 44 86",
    portfolio: "https://behruzbagirzade.com/",
    linkedin: "https://www.linkedin.com/in/itisbehrouz",
    projects: PORTFOLIO_PROJECTS,
    rawContent: content
  };
}

function loadCandidateProfile(baseDir) {
  const possibleCvPaths = [
    path.join(baseDir, 'cv.md'),
    path.join(baseDir, 'config', 'cv.md')
  ];

  for (const cvPath of possibleCvPaths) {
    const parsed = parseCvMarkdown(cvPath);
    if (parsed) return parsed;
  }

  return {
    name: "Behrouz Bagherzadeh",
    title: "Digital Transformation & Business Intelligence Leader",
    phone: "+90 553 678 44 86",
    email: "be.bagherzadeh@gmail.com",
    portfolio: "https://behruzbagirzade.com/",
    linkedin: "https://www.linkedin.com/in/itisbehrouz",
    projects: PORTFOLIO_PROJECTS
  };
}

module.exports = { parseCvMarkdown, loadCandidateProfile, PORTFOLIO_PROJECTS };
