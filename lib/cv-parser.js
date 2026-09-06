/**
 * KARMİS CV & Profile Parser v2.0.0
 * Fully decoupled, privacy-first profile and markdown resume parser.
 * Dynamically parses candidate profile without any hardcoded personal data.
 */

const fs = require("fs");
const path = require("path");

function parseCvMarkdown(filePath) {
  if (!filePath || !fs.existsSync(filePath)) return null;
  const content = fs.readFileSync(filePath, "utf8");

  // Extract candidate name from first H1 if available
  const h1Match = content.match(/^#\s+(.+)$/m);
  const name = h1Match ? h1Match[1].replace(/[*_]/g, "").trim() : "Candidate";

  // Extract skills from bullet points or sections
  const skills = [];
  const skillMatches = content.match(/^[-*]\s+(.+)$/gm);
  if (skillMatches) {
    skillMatches.forEach((line) => {
      const clean = line.replace(/^[-*]\s+/, "").trim();
      if (clean && clean.length < 50) {
        skills.push(clean);
      }
    });
  }

  return {
    name,
    title: "Technology Professional",
    email: "candidate@example.com",
    phone: "",
    portfolio: "",
    linkedin: "",
    skills,
    projects: [],
    rawContent: content
  };
}

function loadCandidateProfile(baseDir = process.cwd()) {
  // 1. Try local profile.json if configured
  const profileJsonPath = path.join(baseDir, "config", "profile.json");
  if (fs.existsSync(profileJsonPath)) {
    try {
      const data = JSON.parse(fs.readFileSync(profileJsonPath, "utf8"));
      return {
        name: data.name || "Candidate",
        title: data.title || "Technology Professional",
        email: data.email || "candidate@example.com",
        phone: data.phone || "",
        portfolio: data.portfolio || "",
        linkedin: data.linkedin || "",
        location: data.location || "Remote",
        skills: Array.isArray(data.skills) ? data.skills : [],
        projects: Array.isArray(data.projects) ? data.projects : []
      };
    } catch (e) {
      // Fallback
    }
  }

  // 2. Try markdown resumes in search order
  const possibleCvPaths = [
    path.join(baseDir, "resume.md"),
    path.join(baseDir, "cv.md"),
    path.join(baseDir, "templates", "cv.example.md")
  ];

  for (const cvPath of possibleCvPaths) {
    const parsed = parseCvMarkdown(cvPath);
    if (parsed) return parsed;
  }

  // 3. Try example config profile
  const exampleJsonPath = path.join(baseDir, "config", "profile.example.json");
  if (fs.existsSync(exampleJsonPath)) {
    try {
      return JSON.parse(fs.readFileSync(exampleJsonPath, "utf8"));
    } catch (e) {}
  }

  // 4. Default generic candidate
  return {
    name: "Candidate Profile",
    title: "Software & Technology Professional",
    email: "candidate@example.com",
    phone: "",
    portfolio: "",
    linkedin: "",
    location: "Remote / Global",
    skills: [
      "JavaScript",
      "Node.js",
      "TypeScript",
      "SQL",
      "Docker",
      "System Architecture",
      "Git",
      "Agile Governance"
    ],
    projects: []
  };
}

module.exports = { parseCvMarkdown, loadCandidateProfile };

