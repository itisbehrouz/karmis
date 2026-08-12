#!/usr/bin/env node

/**
 * KARMİS CLI Tool
 * Usage: npx karmis <job-url>
 */

const { evaluateJobPosting } = require('../lib/evaluator');
const { generateSvgChart } = require('../lib/svg-chart');

const args = process.argv.slice(2);
const jobUrl = args[0];

if (!jobUrl) {
  console.log('KARMİS CLI v1.0.0');
  console.log('Kullanım: npx karmis <ilan-url>');
  process.exit(0);
}

console.log(`[KARMİS] İlan analiz ediliyor: ${jobUrl}`);
// CLI logic demo
