#!/usr/bin/env node

/**
 * KariyerMimari CLI Tool
 * Usage: npx kariyer-mimari <job-url>
 */

const { evaluateJobPosting } = require('../lib/evaluator');
const { generateSvgChart } = require('../lib/svg-chart');

const args = process.argv.slice(2);
const jobUrl = args[0];

if (!jobUrl) {
  console.log('KariyerMimari CLI v1.0.0');
  console.log('Kullanım: npx kariyer-mimari <ilan-url>');
  process.exit(0);
}

console.log(`[KariyerMimari] İlan analiz ediliyor: ${jobUrl}`);
// CLI logic demo
