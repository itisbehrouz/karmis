#!/usr/bin/env node

/**
 * KARMİS CLI Engine v1.5.0
 * Usage: npx karmis <eval|report|interview|track|dashboard|help> [options]
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

if (!command || command === 'help' || command === '--help' || command === '-h') {
  console.log(`
=====================================================
 KARMİS — Kariyer Mimarisi & İlan İnceleme Engine
=====================================================
Kullanım:
  npx karmis dashboard                 - Canlı HTML Başvuru & Rapor Yönetim Paneli (Port 3005)
  npx karmis eval <job-json|url>      - İlanı değerlendir ve uyum puanı üret
  npx karmis report <job-json|url>    - Tam 8 maddelik Markdown değerlendirme raporu üret
  npx karmis interview <company>      - İlana özel 5 soruluk STAR mülakat simülasyonu üret
  npx karmis track <company> <role>   - Başvuru takip tablosuna yeni girdi ekle
  npx karmis help                     - Bu yardım menüsünü göster
`);
  process.exit(0);
}

if (command === 'dashboard') {
  startServer();
  // Don't exit process for dashboard daemon
} else if (command === 'eval') {
  let payload = {};
  if (target && fs.existsSync(target)) {
    payload = JSON.parse(fs.readFileSync(target, 'utf8'));
  }
  const evalResult = evaluateJobPosting(payload);
  console.log(JSON.stringify(evalResult, null, 2));
  process.exit(0);
} else if (command === 'report') {
  let payload = {};
  if (target && fs.existsSync(target)) {
    payload = JSON.parse(fs.readFileSync(target, 'utf8'));
  }
  const evalResult = evaluateJobPosting(payload);
  const reportMd = generateMarkdownReport(evalResult);
  console.log(reportMd);
  process.exit(0);
} else if (command === 'interview') {
  const company = args[1] || 'Roche Türkiye';
  const role = args[2] || 'Business Insights & Analytics Partner';
  const prep = generateInterviewPrep(company, role);
  console.log(renderInterviewMarkdown(prep));
  process.exit(0);
} else if (command === 'track') {
  const company = args[1] || 'Roche Türkiye';
  const role = args[2] || 'Business Insights & Analytics Partner';
  const res = addApplicationEntry({ company, position: role, score: 90, status: 'Applied' });
  console.log(`[KARMİS] Başvuru başarıyla takip tablosuna eklendi: ${res.csvPath}`);
  process.exit(0);
} else {
  const evalResult = evaluateJobPosting({ title: command });
  console.log(generateMarkdownReport(evalResult));
}
