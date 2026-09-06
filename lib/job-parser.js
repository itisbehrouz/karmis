/**
 * KARMİS Quick Job Importer & Browser Bookmarklet v2.0.0
 * Facilitates 1-click job ingestion from form, LinkedIn, portals, or raw text directly into SQLite and CSV.
 */

const path = require('path');
const { insertApplication, saveReport } = require('./db');
const { evaluateJobPosting } = require('./evaluator');
const { generateMarkdownReport } = require('./report-generator');

function renderSimpleMarkdownToHtml(md) {
  let html = md
    .replace(/^# (.*$)/gim, '<h1 style="font-size: 20px; font-weight: 800; margin: 0 0 16px 0; color: #1e3a8a; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px;">$1</h1>')
    .replace(/^### (.*$)/gim, '<h3 style="font-size: 14px; font-weight: 700; margin: 20px 0 10px 0; color: #2563eb; text-transform: uppercase; letter-spacing: 0.5px;">$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 style="font-size: 16px; font-weight: 700; margin: 20px 0 12px 0; color: #0f172a;">$1</h2>')
    .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/gim, '<em>$1</em>');

  html = html.replace(/(?:(?:\|[^\n]+\|[^\n]*\n?)+)/g, match => {
    const rows = match.trim().split('\n');
    if (rows.length < 2 || !rows[0].includes('|')) return match;
    let tbl = '<div style="overflow-x: auto; margin: 12px 0 20px 0;"><table style="width: 100%; border-collapse: collapse; font-size: 12px; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">';
    rows.forEach((r, idx) => {
      if (r.includes('---')) return;
      const cols = r.split('|').filter((_, cIdx, arr) => cIdx > 0 && cIdx < arr.length - 1);
      if (cols.length === 0) return;
      tbl += '<tr>';
      cols.forEach(c => {
        const tag = idx === 0 ? 'th' : 'td';
        const bg = idx === 0 ? '#f8fafc' : 'white';
        tbl += '<' + tag + ' style="padding: 8px 12px; border: 1px solid #e2e8f0; background: ' + bg + '; text-align: left;">' + c.trim() + '</' + tag + '>';
      });
      tbl += '</tr>';
    });
    tbl += '</table></div>';
    return tbl;
  });

  return html;
}

function quickImportJob(payload = {}) {
  const company = (payload.company || 'Kurumsal Şirket').replace(/\*\*/g, '').trim();
  const position = (payload.position || payload.jobTitle || payload.title || 'Teknoloji Yöneticisi').trim();
  const url = payload.url || payload.link || '';
  const source = payload.source || (url.includes('linkedin') ? 'LinkedIn' : 'Portal / Web');
  const status = payload.status || 'Applied';
  const contact = payload.contact || `${company} İK / Talent Acquisition`;

  // Evaluate match score dynamically
  const evaluation = evaluateJobPosting({
    company,
    jobTitle: position,
    location: payload.location,
    sector: payload.sector
  });

  const appEntry = {
    company,
    position,
    score: `%${evaluation.score}`,
    link: url,
    date: new Date().toISOString().split('T')[0],
    source,
    status,
    contact,
    lastContactDate: new Date().toISOString().split('T')[0],
    notes: payload.notes || `Applied ${new Date().toLocaleDateString('tr-TR')} via ${source}; ${evaluation.score}% match score`
  };

  insertApplication(appEntry);

  // Generate and save report to SQLite
  try {
    const reportMd = generateMarkdownReport(evaluation, path.join(__dirname, '..'));
    const reportHtml = renderSimpleMarkdownToHtml(reportMd);
    saveReport({
      company,
      position,
      score: evaluation.score,
      markdown: reportMd,
      htmlContent: reportHtml,
      coverLetter: `Dear ${company} Talent Acquisition Team...`,
      linkedinNote: `Sayın İK Lideri, ${company} bünyesindeki ${position} pozisyonuna yönelik başvurumla ilgileniyorum.`
    });
  } catch (e) {
    console.error('Error caching report on quick import:', e);
  }

  return {
    success: true,
    application: appEntry,
    evaluation
  };
}

function getBookmarkletCode() {
  return `javascript:(function(){
    var url = window.location.href;
    var title = document.title;
    var h1 = document.querySelector('h1')?.innerText || title;
    var comp = document.querySelector('.job-details-jobs-unified-top-card__company-name, .topcard__flavor, [data-company-name]')?.innerText || '';
    if (!comp) {
      comp = prompt('KARMİS: Şirket Adını Giriniz:', '');
    }
    if (!comp) return;
    var pos = prompt('KARMİS: Pozisyon Adını Giriniz:', h1.replace(/\\s*\\|.*/, '').trim());
    if (!pos) return;

    fetch('http://localhost:3005/api/jobs/quick-import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ company: comp, position: pos, url: url, source: 'Browser Bookmarklet' })
    })
    .then(r => r.json())
    .then(d => {
      alert('KARMİS: ' + comp + ' - ' + pos + ' veritabanına ve takip tablosuna eklendi! Uyum: ' + d.application.score);
    })
    .catch(e => {
      alert('KARMİS: Port 3005 sunucusunun çalıştığından emin olun.');
    });
  })();`;
}

module.exports = { quickImportJob, getBookmarkletCode };
