#!/usr/bin/env node

/**
 * KARMİS CLI Engine v2.0.0
 * Open-Source Career Architecture & Job Application Evaluator
 * Usage: karmis <init|eval|report|interview|track|dashboard|help> [options]
 */

const fs = require('fs');
const path = require('path');
const { evaluateJobPosting } = require('../lib/evaluator');
const { generateMarkdownReport } = require('../lib/report-generator');
const { generateInterviewPrep, renderInterviewMarkdown } = require('../lib/interview-prep');
const { addApplicationEntry } = require('../lib/tracker');
const { startServer } = require('../lib/server');

const args = process.argv.slice(2);
const command = args[0];
const target = args[1];

// ANSI Colors for high-contrast terminal output
const green = (s) => `\x1b[32m\x1b[1m${s}\x1b[0m`;
const red = (s) => `\x1b[31m\x1b[1m${s}\x1b[0m`;
const yellow = (s) => `\x1b[33m\x1b[1m${s}\x1b[0m`;
const cyan = (s) => `\x1b[36m\x1b[1m${s}\x1b[0m`;
const bold = (s) => `\x1b[1m${s}\x1b[0m`;

if (!command || command === 'help' || command === '--help' || command === '-h') {
  console.log(`
${cyan('=====================================================')}
 ${bold('KARMİS — Open-Source Career Intelligence Engine')}
${cyan('=====================================================')}

${bold('Usage:')}
  karmis init                     - Initialize candidate profile and template resume
  karmis dashboard                - Launch local web application tracker (Port 3005)
  karmis eval <file|text>         - Evaluate a job description, compute match score & ATS gaps
  karmis report <file|text>       - Generate comprehensive Markdown evaluation report
  karmis interview <comp> <role>  - Generate 5 STAR behavioral interview questions
  karmis track <comp> <role>      - Add a new application entry to tracker
  karmis apply <comp> <role>      - Save application and cache intelligence report to SQLite
  karmis db:migrate               - Initialize and verify local SQLite database
  karmis help                     - Display this help message

${bold('Examples:')}
  karmis init
  karmis eval "Senior Backend Engineer with Node.js, TypeScript, PostgreSQL, and Docker"
  karmis eval samples/job-posting-sample.json
  karmis dashboard
`);
  process.exit(0);
}

if (command === 'init') {
  const rootDir = process.cwd();
  const configDir = path.join(rootDir, 'config');
  const profileTarget = path.join(configDir, 'profile.json');
  const profileExample = path.join(__dirname, '..', 'config', 'profile.example.json');
  const resumeTarget = path.join(rootDir, 'resume.md');
  const resumeTemplate = path.join(__dirname, '..', 'templates', 'cv.example.md');

  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
  }

  let createdProfile = false;
  if (!fs.existsSync(profileTarget) && fs.existsSync(profileExample)) {
    fs.copyFileSync(profileExample, profileTarget);
    createdProfile = true;
  }

  let createdResume = false;
  if (!fs.existsSync(resumeTarget) && fs.existsSync(resumeTemplate)) {
    fs.copyFileSync(resumeTemplate, resumeTarget);
    createdResume = true;
  }

  console.log(`\n${green('✔ KARMİS initialized successfully!')}`);
  if (createdProfile) console.log(`  - Created ${cyan('config/profile.json')} (Edit with your skills & contact)`);
  if (createdResume) console.log(`  - Created ${cyan('resume.md')} (Sample resume template)`);
  console.log(`\nNext step: Run ${cyan('karmis eval "Job Description"')} or ${cyan('karmis dashboard')}\n`);
  process.exit(0);
} else if (command === 'dashboard') {
  startServer();
} else if (command === 'apply') {
  const company = args[1] || 'Acme Systems';
  const role = args[2] || 'Senior Engineer';
  const score = args[3] || '%90';
  const link = args[4] || '';
  const contact = args[5] || '-';
  const notes = args[6] || 'Application submitted.';

  const db = require('../lib/db');
  db.insertApplication({
    company,
    position: role,
    score,
    link,
    date: new Date().toISOString().split('T')[0],
    source: 'LinkedIn',
    status: 'Applied',
    contact,
    lastContactDate: new Date().toISOString().split('T')[0],
    notes
  });
  console.log(`${green('[KARMİS]')} Application recorded: ${company} — ${role}`);
  process.exit(0);
} else if (command === 'db:migrate') {
  const db = require('../lib/db');
  db.seedDatabase();
  console.log(`${green('[KARMİS DB]')} SQLite database verified: ${db.DB_PATH}`);
  console.log(`Total Applications: ${db.getAllApplications().length}`);
  process.exit(0);
} else if (command === 'db:export') {
  const db = require('../lib/db');
  db.exportToCsv();
  console.log(`${green('[KARMİS DB]')} CSV synchronized: ${db.CSV_PATH}`);
  process.exit(0);
} else if (command === 'eval') {
  let payload = {};
  if (target && fs.existsSync(target)) {
    try {
      payload = JSON.parse(fs.readFileSync(target, 'utf8'));
    } catch (e) {
      payload = { description: fs.readFileSync(target, 'utf8') };
    }
  } else if (target) {
    payload = { description: args.slice(1).join(' ') };
  } else {
    payload = { title: 'General Technology Role' };
  }

  const result = evaluateJobPosting(payload);
  const badge = result.decision === 'APPLY' ? green(`[APPLY: ${result.score}%]`) : red(`[PASS: ${result.score}%]`);

  console.log(`\n-----------------------------------------------------`);
  console.log(` ${bold('KARMİS EVALUATION:')} ${result.company} — ${result.jobTitle}`);
  console.log(`-----------------------------------------------------`);
  console.log(`Decision:         ${badge} (Threshold: ${result.threshold}%)`);
  console.log(`Matched Skills:   ${result.matchedKeywords.length > 0 ? green(result.matchedKeywords.join(', ')) : 'None'}`);
  console.log(`Missing ATS Gaps: ${result.missingAtsKeywords.length > 0 ? yellow(result.missingAtsKeywords.join(', ')) : green('None')}`);
  if (result.penaltyDetails.length > 0) {
    console.log(`Risk Penalties:   ${red(result.penaltyDetails.map(p => `${p.rule} (${p.penalty}%)`).join(', '))}`);
  }
  console.log(`-----------------------------------------------------\n`);
  process.exit(0);
} else if (command === 'report') {
  let payload = {};
  if (target && fs.existsSync(target)) {
    try {
      payload = JSON.parse(fs.readFileSync(target, 'utf8'));
    } catch (e) {
      payload = { description: fs.readFileSync(target, 'utf8') };
    }
  } else if (target) {
    payload = { description: args.slice(1).join(' ') };
  }
  const evalResult = evaluateJobPosting(payload);
  const reportMd = generateMarkdownReport(evalResult);
  console.log(reportMd);
  process.exit(0);
} else if (command === 'interview') {
  const company = args[1] || 'Acme Systems';
  const role = args[2] || 'Senior Software Engineer';
  const prep = generateInterviewPrep(company, role);
  console.log(renderInterviewMarkdown(prep));
  process.exit(0);
} else if (command === 'track') {
  const company = args[1] || 'Acme Systems';
  const role = args[2] || 'Senior Software Engineer';
  const res = addApplicationEntry({ company, position: role, score: 90, status: 'Applied' });
  console.log(`${green('[KARMİS]')} Application recorded to tracker: ${res.csvPath}`);
  process.exit(0);
} else {
  const evalResult = evaluateJobPosting({ description: args.join(' ') });
  console.log(generateMarkdownReport(evalResult));
}
