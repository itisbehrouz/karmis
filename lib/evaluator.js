/**
 * KARMİS Dynamic Job Intelligence & Evaluation Engine v2.0.0
 * Open-Source Dynamic Skill Matcher, ATS Gap Analyzer & Risk Assessment Engine.
 * Zero hardcoded personal or proprietary company data.
 */

const { loadCandidateProfile } = require('./cv-parser');

const TECH_TAXONOMY = [
  // Languages
  { name: "TypeScript", aliases: ["typescript", "ts"] },
  { name: "JavaScript", aliases: ["javascript", "vanilla js", "ecmascript"] },
  { name: "Python", aliases: ["python", "py"] },
  { name: "Go", aliases: ["golang", "go"] },
  { name: "Rust", aliases: ["rust"] },
  { name: "Java", aliases: ["java", "jvm"] },
  { name: "C++", aliases: ["c++", "cpp"] },
  { name: "C#", aliases: ["c#", "csharp", ".net"] },
  { name: "SQL", aliases: ["sql", "rdbms", "relational database"] },
  
  // Frontend
  { name: "React", aliases: ["react", "reactjs", "react.js"] },
  { name: "Next.js", aliases: ["nextjs", "next.js", "next"] },
  { name: "Vue", aliases: ["vue", "vuejs", "vue.js"] },
  { name: "Angular", aliases: ["angular", "angularjs"] },
  { name: "Tailwind CSS", aliases: ["tailwind", "tailwindcss"] },
  
  // Backend & Architecture
  { name: "Node.js", aliases: ["nodejs", "node.js", "node"] },
  { name: "Express", aliases: ["express", "expressjs"] },
  { name: "NestJS", aliases: ["nestjs"] },
  { name: "FastAPI", aliases: ["fastapi"] },
  { name: "Django", aliases: ["django"] },
  { name: "REST APIs", aliases: ["rest api", "restful", "restful api", "rest apis"] },
  { name: "GraphQL", aliases: ["graphql"] },
  { name: "Microservices", aliases: ["microservices", "microservice", "distributed systems"] },
  { name: "System Design", aliases: ["system design", "system architecture", "solutions architecture"] },
  
  // Databases & Caching
  { name: "PostgreSQL", aliases: ["postgresql", "postgres"] },
  { name: "MySQL", aliases: ["mysql"] },
  { name: "SQLite", aliases: ["sqlite", "sqlite3"] },
  { name: "MongoDB", aliases: ["mongodb", "mongo"] },
  { name: "Redis", aliases: ["redis"] },
  { name: "Elasticsearch", aliases: ["elasticsearch", "elastic"] },
  
  // Cloud & DevOps
  { name: "Docker", aliases: ["docker", "containerization", "containers"] },
  { name: "Kubernetes", aliases: ["kubernetes", "k8s"] },
  { name: "AWS", aliases: ["aws", "amazon web services"] },
  { name: "GCP", aliases: ["gcp", "google cloud", "google cloud platform"] },
  { name: "Azure", aliases: ["azure", "microsoft azure"] },
  { name: "CI/CD", aliases: ["ci/cd", "continuous integration", "github actions", "gitlab ci"] },
  { name: "Terraform", aliases: ["terraform", "iac", "infrastructure as code"] },
  { name: "Linux", aliases: ["linux", "unix", "bash", "shell"] },
  
  // AI & Data
  { name: "LLM Integration", aliases: ["llm", "large language models", "genai", "generative ai", "openai", "claude", "gemini"] },
  { name: "Machine Learning", aliases: ["machine learning", "ml", "deep learning", "pytorch", "tensorflow"] },
  { name: "Data Pipelines", aliases: ["data pipeline", "etl", "data engineering", "spark", "airflow"] },
  { name: "Power BI", aliases: ["power bi", "powerbi", "dax", "business intelligence"] },
  
  // Methodologies
  { name: "Agile / Scrum", aliases: ["agile", "scrum", "kanban", "sprint"] },
  { name: "Testing / TDD", aliases: ["unit testing", "tdd", "jest", "vitest", "playwright", "cypress"] },
  { name: "Git", aliases: ["git", "github", "version control"] }
];

function extractSkillsFromText(text = "") {
  if (!text || typeof text !== "string") return [];
  const lower = text.toLowerCase();
  const detected = [];

  TECH_TAXONOMY.forEach(tech => {
    const isMatched = tech.aliases.some(alias => {
      // Word boundary match
      const escaped = alias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`(^|[^a-zA-Z0-9_#+])${escaped}([^a-zA-Z0-9_#+]|$)`, 'i');
      return regex.test(lower);
    });
    if (isMatched && !detected.includes(tech.name)) {
      detected.push(tech.name);
    }
  });

  return detected;
}

const COMPANY_KNOWLEDGE = {};

function findCompanyKnowledge(rawCompanyName) {
  if (!rawCompanyName) return null;
  try {
    const db = require('./db');
    if (typeof db.getCompany === 'function') {
      const dbComp = db.getCompany(rawCompanyName);
      if (dbComp) return dbComp;
    }
  } catch (e) {}

  const clean = rawCompanyName.replace(/\*\*/g, '').trim().toLowerCase();
  for (const [key, data] of Object.entries(COMPANY_KNOWLEDGE)) {
    if (key.toLowerCase() === clean) return data;
  }
  return null;
}

function evaluateJobPosting(jobDetails = {}, candidateProfile = null, config = {}) {
  const threshold = config.matchThreshold || 80;
  const companyName = (jobDetails.company || "Target Company").replace(/\*\*/g, '').trim();
  const positionTitle = (jobDetails.position || jobDetails.jobTitle || jobDetails.title || "Software & Technology Professional").trim();
  const rawText = [
    positionTitle,
    jobDetails.description || "",
    jobDetails.requirements || "",
    Array.isArray(jobDetails.requiredSkills) ? jobDetails.requiredSkills.join(" ") : ""
  ].join(" ");

  // Load candidate profile if not provided
  const profile = candidateProfile || loadCandidateProfile();
  const candidateSkills = Array.isArray(profile.skills) ? profile.skills : [];

  // Extract skills from job description or details
  let extractedJobSkills = [];
  if (Array.isArray(jobDetails.requiredSkills) && jobDetails.requiredSkills.length > 0) {
    extractedJobSkills = jobDetails.requiredSkills;
  } else {
    extractedJobSkills = extractSkillsFromText(rawText);
  }

  // If no specific skills could be extracted, use general standard requirements
  if (extractedJobSkills.length === 0) {
    extractedJobSkills = ["Software Architecture", "API Design", "Database Management", "Git", "Problem Solving"];
  }

  // Calculate Overlap
  const matchedKeywords = [];
  const missingAtsKeywords = [];

  const normCandidateSkills = candidateSkills.map(s => s.toLowerCase());

  extractedJobSkills.forEach(req => {
    const reqLower = req.toLowerCase();
    const hasSkill = normCandidateSkills.some(cs => cs.includes(reqLower) || reqLower.includes(cs));
    if (hasSkill) {
      matchedKeywords.push(req);
    } else {
      missingAtsKeywords.push(req);
    }
  });

  // Base Match Score calculation
  let baseScore = 80;
  if (extractedJobSkills.length > 0) {
    const matchRatio = matchedKeywords.length / extractedJobSkills.length;
    baseScore = Math.round(50 + (matchRatio * 45)); // 50% to 95% range
  }

  // Risk & Penalty rules
  const penaltyDetails = [];
  const textLower = rawText.toLowerCase();

  // 1. Regulatory / Compliance Penalty
  const hasComplianceRisk = jobDetails.hasHeavyRegulatory ||
    textLower.includes("tcmb") || textLower.includes("bddk") ||
    textLower.includes("sarbanes-oxley") || textLower.includes("heavy compliance");
  if (hasComplianceRisk) {
    const penalty = config.filters?.penalties?.regulatoryCompliance || -20;
    baseScore += penalty;
    penaltyDetails.push({
      rule: "Compliance & Heavy Regulation Risk",
      penalty,
      reason: "High regulatory or audit overhead detected in requirements."
    });
  }

  // 2. Downleveling / Junior Role for Senior Candidate
  const isDownleveling = jobDetails.isJuniorDownleveling ||
    (/\b(intern|internship|junior|entry level|0-1 year|0-2 years)\b/i.test(textLower) && (profile.yearsOfExperience || 8) >= 5);
  if (isDownleveling) {
    const penalty = config.filters?.penalties?.downlevelingJunior || -25;
    baseScore += penalty;
    penaltyDetails.push({
      rule: "Downleveling / Seniority Mismatch",
      penalty,
      reason: "Role is junior or entry-level relative to candidate seniority."
    });
  }

  // 3. Cold Sales / Field Quota Penalty
  const isColdSales = jobDetails.isFieldSalesQuota ||
    textLower.includes("cold calling") || textLower.includes("sales quota") ||
    textLower.includes("saha satış") || textLower.includes("commission only");
  if (isColdSales) {
    const penalty = config.filters?.penalties?.fieldQuotaSales || -25;
    baseScore += penalty;
    penaltyDetails.push({
      rule: "Direct Sales / Cold Outreach Burden",
      penalty,
      reason: "Role includes heavy cold calling or direct field sales quotas."
    });
  }

  const score = Math.max(0, Math.min(100, baseScore));
  const decision = score >= threshold ? "APPLY" : "PASS";

  const defaultMetrics = [
    { label: "Role Alignment", value: `${matchedKeywords.length}/${extractedJobSkills.length}`, unit: "Core Tech Match", heightRatio: 0.95 },
    { label: "Match Score", value: `${score}%`, unit: "Calculated Score", heightRatio: score / 100 },
    { label: "Missing ATS", value: `${missingAtsKeywords.length}`, unit: "Skill Gaps", heightRatio: Math.max(0.2, (5 - missingAtsKeywords.length) / 5) },
    { label: "Threshold", value: `${threshold}%`, unit: "Minimum Goal", heightRatio: 0.8 }
  ];

  return {
    jobTitle: positionTitle,
    company: companyName,
    location: jobDetails.location || "Remote / Hybrid",
    sector: jobDetails.sector || "Software & Technology Services",
    seniority: jobDetails.seniority || (score >= 80 ? "Senior / Staff" : "Mid-Level"),
    salaryBenchmark: jobDetails.salaryBenchmark || "Market Competitive",
    recommendedSalaryOpening: jobDetails.salaryOpening || "Upper Quartile Benchmark",
    score,
    threshold,
    decision,
    penaltyDetails,
    metrics: defaultMetrics,
    atsKeywords: extractedJobSkills,
    matchedKeywords,
    missingAtsKeywords
  };
}

module.exports = {
  evaluateJobPosting,
  extractSkillsFromText,
  TECH_TAXONOMY,
  COMPANY_KNOWLEDGE,
  findCompanyKnowledge
};
