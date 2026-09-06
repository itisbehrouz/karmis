/**
 * KARMİS PDF Report Generator
 * Converts HTML/SVG reports to A4 PDF using Playwright.
 */

const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

async function generatePdfReport(markdownContent, outputPath) {
  const htmlContent = `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <title>KARMİS Değerlendirme Raporu</title>
  <style>
    @page { size: A4; margin: 12mm; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #1e293b; background: #ffffff; font-size: 11px; line-height: 1.5; margin: 0; padding: 0; }
    h1 { font-size: 18px; color: #0f172a; border-bottom: 3px solid #2563eb; padding-bottom: 8px; margin-bottom: 16px; }
    h3 { font-size: 13px; color: #1e3a8a; border-left: 4px solid #2563eb; padding-left: 8px; margin-top: 16px; margin-bottom: 8px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 12px; font-size: 10px; }
    th, td { border: 1px solid #cbd5e1; padding: 6px 8px; text-align: left; }
    th { background: #f1f5f9; color: #0f172a; font-weight: 600; }
    tr:nth-child(even) td { background: #f8fafc; }
    svg { display: block; margin: 12px auto; max-width: 100%; height: auto; }
    pre { background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 6px; padding: 8px; font-family: monospace; font-size: 9.5px; white-space: pre-wrap; word-break: break-word; }
  </style>
</head>
<body>
  ${markdownContent
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/\| (.*) \|/g, '<!-- table row -->')}
</body>
</html>`;

  const outDir = path.dirname(outputPath);
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.setContent(htmlContent, { waitUntil: 'networkidle' });
  await page.pdf({
    path: outputPath,
    format: 'A4',
    margin: { top: '12mm', right: '12mm', bottom: '12mm', left: '12mm' },
    printBackground: true
  });
  await browser.close();

  return outputPath;
}

module.exports = { generatePdfReport };
