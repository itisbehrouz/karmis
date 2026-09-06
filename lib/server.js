/**
 * KARMİS Dashboard HTTP Server v1.8.0
 * Includes Notes Endpoint & Markdown Renderer
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const db = require('./db');
const { parseTrackingCsv, updateApplicationStatus, updateApplicationNotes } = require('./tracker');
const { generateMarkdownReport } = require('./report-generator');
const { evaluateJobPosting } = require('./evaluator');

const PORT = 3005;

function renderMarkdownToHtml(markdown) {
  let html = markdown;

  // Preserve SVG blocks before processing
  const svgs = [];
  html = html.replace(/<div[\s\S]*?<svg[\s\S]*?<\/svg>[\s\S]*?<\/div>/g, (m) => {
    svgs.push(m);
    return `___SVG_PLACEHOLDER_${svgs.length - 1}___`;
  });
  html = html.replace(/<svg[\s\S]*?<\/svg>/g, (m) => {
    svgs.push(m);
    return `___SVG_PLACEHOLDER_${svgs.length - 1}___`;
  });

  // Convert Code Blocks ```text ... ``` with Flowbite Copy button
  html = html.replace(/\`\`\`(?:text)?([\s\S]*?)\`\`\`/g, (match, p1) => {
    const cleanText = p1.trim();
    const encoded = Buffer.from(cleanText, 'utf8').toString('base64');
    return `
      <div style="position: relative; margin: 14px 0;">
        <button onclick="copyPreCode(this, '${encoded}')" style="position: absolute; right: 10px; top: 10px; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 6px; padding: 5px 10px; font-size: 11px; font-weight: 600; color: #475569; cursor: pointer; display: flex; align-items: center; gap: 5px; box-shadow: 0 1px 2px rgba(0,0,0,0.05); transition: all 0.2s;">
          <svg class="w-3.5 h-3.5" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" width="14" height="14"><path stroke-linecap="round" stroke-linejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
          Metni Kopyala
        </button>
        <pre style="background: var(--input-bg); border: 1px solid var(--card-border); border-radius: 8px; padding: 14px 16px; font-family: monospace; font-size: 12px; white-space: pre-wrap; margin: 0; line-height: 1.6;"><code>${cleanText.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>
      </div>
    `;
  });

  // Convert Horizontal Rules
  html = html.replace(/^---$/gm, '<hr style="border: 0; border-top: 1px solid var(--card-border); margin: 24px 0;">');

  // Convert Headings
  html = html.replace(/^# (.*$)/gim, '<div style="background: var(--input-bg); border-left: 4px solid var(--accent); padding: 14px 18px; border-radius: 8px; margin-bottom: 20px; font-size: 16px; font-weight: 700; color: var(--text);">$1</div>');
  html = html.replace(/^### (.*$)/gim, '<h3 style="font-size: 14px; font-weight: 700; color: var(--accent); margin: 22px 0 10px 0; text-transform: uppercase; letter-spacing: 0.5px;">$1</h3>');
  html = html.replace(/^#### (.*$)/gim, '<h4 style="font-size: 13px; font-weight: 700; color: var(--text); margin: 14px 0 6px 0;">$1</h4>');

  // Convert Bold
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

  // Convert Links [text](url)
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" style="color: var(--accent); text-decoration: none; font-weight: 600;">$1 ↗</a>');

  // Convert Markdown Tables to HTML <table>
  const lines = html.split('\n');
  let inTable = false;
  let tableHtml = '';
  let finalLines = [];

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].trim();
    if (line.startsWith('|') && line.endsWith('|')) {
      if (line.includes('---|---') || line.includes('|---|')) {
        continue;
      }

      let cells = line.split('|').slice(1, -1).map(c => {
        let cell = c.trim();
        // Badge for Approved
        if (cell.includes('≥ 80% BAŞVURULACAK')) {
          cell = cell.replace('<strong>≥ 80% BAŞVURULACAK</strong>', '<span style="background: rgba(16, 185, 129, 0.15); color: #34d399; font-weight: 700; padding: 4px 10px; border-radius: 6px; border: 1px solid rgba(16, 185, 129, 0.3);">≥ 80% BAŞVURULACAK</span>');
        }
        // Badge for Rejected
        if (cell.includes('< 80% PAS GEÇİLECEK')) {
          cell = cell.replace('<strong>< 80% PAS GEÇİLECEK</strong>', '<span style="background: rgba(239, 68, 68, 0.15); color: #f87171; font-weight: 700; padding: 4px 10px; border-radius: 6px; border: 1px solid rgba(239, 68, 68, 0.3);">&lt; 80% PAS GEÇİLECEK</span>');
        }
        // Badge for Score
        cell = cell.replace(/<strong>%(\d+)<\/strong> \(Eşik: %(\d+)\)/g, '<span style="background: rgba(37, 99, 235, 0.15); color: #60a5fa; font-weight: 700; padding: 3px 8px; border-radius: 6px; border: 1px solid rgba(37, 99, 235, 0.3);">%$1</span> <span style="font-size: 11px; color: var(--text-muted);">(Eşik: %$2)</span>');
        return cell;
      });

      if (!inTable) {
        inTable = true;
        tableHtml = '<table style="width:100%; border-collapse: collapse; margin-bottom: 20px;"><thead><tr>' + cells.map(c => `<th style="background: var(--input-bg); color: var(--text-muted); font-size: 11px; text-transform: uppercase; padding: 10px 14px; text-align: left; border: 1px solid var(--card-border);">${c}</th>`).join('') + '</tr></thead><tbody>';
      } else {
        tableHtml += '<tr>' + cells.map(c => `<td style="padding: 10px 14px; border: 1px solid var(--card-border); font-size: 12px; color: var(--text);">${c}</td>`).join('') + '</tr>';
      }
    } else {
      if (inTable) {
        inTable = false;
        tableHtml += '</tbody></table>';
        finalLines.push(tableHtml);
        tableHtml = '';
      }
      finalLines.push(line);
    }
  }

  if (inTable) {
    tableHtml += '</tbody></table>';
    finalLines.push(tableHtml);
  }

  html = finalLines.join('\n');

  // Restore SVGs
  svgs.forEach((svg, idx) => {
    html = html.replace(`___SVG_PLACEHOLDER_${idx}___`, svg);
  });

  return html;
}

const server = http.createServer((req, res) => {
  const urlObj = new URL(req.url, 'http://localhost:' + PORT);

  if (urlObj.pathname === '/' || urlObj.pathname === '/index.html') {
    const htmlPath = path.join(__dirname, '..', 'dashboard', 'index.html');
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    return res.end(fs.readFileSync(htmlPath, 'utf8'));
  }

  if (urlObj.pathname === '/favicon.svg' || urlObj.pathname === '/favicon.ico') {
    const faviconPath = path.join(__dirname, '..', 'dashboard', 'favicon.svg');
    if (fs.existsSync(faviconPath)) {
      res.writeHead(200, { 'Content-Type': 'image/svg+xml' });
      return res.end(fs.readFileSync(faviconPath));
    }
  }

  if (urlObj.pathname === '/api/applications') {
    const db = require('./db');
    const apps = db.getAllApplications();
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    return res.end(JSON.stringify(apps));
  }

  if (urlObj.pathname === '/api/applications/update' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        const db = require('./db');
        if (data.id) {
          db.updateApplicationStatusById(data.id, data.newStatus);
        } else {
          db.updateApplicationStatus(data.company, data.position, data.newStatus);
        }
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true }));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  if (urlObj.pathname === '/api/applications/update-notes' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        let data;
        try {
          data = JSON.parse(body);
        } catch (parseErr) {
          data = JSON.parse(body.replace(/\r?\n/g, ' '));
        }
        const cleanNotes = (data.newNotes || '').replace(/\r?\n/g, ' | ').replace(/"/g, "'").trim();
        const db = require('./db');
        if (data.id) {
          db.updateApplicationNotesById(data.id, cleanNotes);
        } else {
          db.updateApplicationNotes(data.company, data.position, cleanNotes);
        }
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, notes: cleanNotes }));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  if (urlObj.pathname === '/api/applications/delete' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        const db = require('./db');
        if (data.id) {
          db.deleteApplicationById(data.id);
        } else if (data.company && data.position) {
          db.deleteApplication(data.company, data.position);
        }
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true }));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  if (urlObj.pathname === '/api/reports') {
    const company = urlObj.searchParams.get('company') || 'Roche Türkiye';
    const position = urlObj.searchParams.get('position') || 'Business Insights & Analytics Partner';
    const db = require('./db');
    
    // 1. Check if an evaluated report is already stored in SQLite
    const savedReport = db.getReport(company, position);
    if (savedReport && savedReport.htmlContent && savedReport.htmlContent.length > 50) {
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      return res.end(JSON.stringify(savedReport));
    }

    // 2. Dynamic generation from updated company intelligence
    delete require.cache[require.resolve('./evaluator')];
    delete require.cache[require.resolve('./report-generator')];
    delete require.cache[require.resolve('./svg-chart')];
    delete require.cache[require.resolve('./interview-prep')];
    const { evaluateJobPosting } = require('./evaluator');
    const { generateMarkdownReport } = require('./report-generator');

    const evalRes = evaluateJobPosting({ company, jobTitle: position });
    const reportMd = generateMarkdownReport(evalRes, path.join(__dirname, '..'));
    const reportHtml = renderMarkdownToHtml(reportMd);

    const reportPayload = {
      company,
      position,
      score: evalRes.score,
      markdown: reportMd,
      htmlContent: reportHtml,
      coverLetter: "Dear " + company + " Talent Acquisition Team...",
      linkedinNote: "Sayın İK Lideri, " + company + " bünyesindeki " + position + " pozisyonuna yönelik başvurumla ilgileniyorum."
    };

    // Cache in SQLite
    try {
      db.saveReport(reportPayload);
    } catch (e) {}

    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    return res.end(JSON.stringify(reportPayload));
  }

  if (urlObj.pathname === '/api/cadence') {
    delete require.cache[require.resolve('./cadence')];
    const { calculateCadence } = require('./cadence');
    const result = calculateCadence();
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    return res.end(JSON.stringify(result));
  }

  if (urlObj.pathname === '/api/cadence/email') {
    delete require.cache[require.resolve('./cadence')];
    const { generateCadenceEmail } = require('./cadence');
    const company = urlObj.searchParams.get('company') || 'Kurumsal Şirket';
    const position = urlObj.searchParams.get('position') || 'Yönetici';
    const type = urlObj.searchParams.get('type') || 'day_7';
    const contact = urlObj.searchParams.get('contact') || '';
    const email = generateCadenceEmail(company, position, type, contact);
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    return res.end(JSON.stringify(email));
  }

  if (urlObj.pathname === '/api/tailored-cv') {
    delete require.cache[require.resolve('./tailored-cv')];
    const { generateTailoredCv, renderTailoredCvHtml, renderTailoredCvPlain } = require('./tailored-cv');
    const company = urlObj.searchParams.get('company') || 'Kurumsal Şirket';
    const position = urlObj.searchParams.get('position') || 'Teknoloji Yöneticisi';
    const reqLang = urlObj.searchParams.get('lang') || null;
    const { lang, cv, coverLetter } = generateTailoredCv(company, position, reqLang);
    const cvHtml = renderTailoredCvHtml(cv, company, position);
    const cvPlain = renderTailoredCvPlain(cv, company, position);
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    return res.end(JSON.stringify({
      company,
      position,
      lang,
      cv,
      cvHtml,
      cvPlain,
      coverLetter
    }));
  }

  if (urlObj.pathname === '/api/salary-advisor') {
    delete require.cache[require.resolve('./salary-advisor')];
    const { getSalaryAdvice } = require('./salary-advisor');
    const company = urlObj.searchParams.get('company') || 'Kurumsal Şirket';
    const position = urlObj.searchParams.get('position') || 'Teknoloji Yöneticisi';
    const advice = getSalaryAdvice(company, position);
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    return res.end(JSON.stringify(advice));
  }

  if (urlObj.pathname === '/api/interview-intelligence') {
    delete require.cache[require.resolve('./interview-prep')];
    const { generateInterviewPrep, renderInterviewMarkdown } = require('./interview-prep');
    const company = urlObj.searchParams.get('company') || 'Kurumsal Şirket';
    const position = urlObj.searchParams.get('position') || 'Teknoloji Yöneticisi';
    const prep = generateInterviewPrep(company, position);
    const markdown = renderInterviewMarkdown(prep);
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    return res.end(JSON.stringify({
      company,
      position,
      prep,
      markdown
    }));
  }

  if (urlObj.pathname === '/api/jobs/quick-import' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        delete require.cache[require.resolve('./job-parser')];
        const { quickImportJob } = require('./job-parser');
        const payload = JSON.parse(body);
        const result = quickImportJob(payload);
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify(result));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: err.message }));
      }
    });
    return;
  }

  if (urlObj.pathname === '/api/bookmarklet') {
    delete require.cache[require.resolve('./job-parser')];
    const { getBookmarkletCode } = require('./job-parser');
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    return res.end(JSON.stringify({ code: getBookmarkletCode() }));
  }

  res.writeHead(404);
  res.end('Not Found');
});

function startServer() {
  server.listen(PORT, () => {
    console.log(`
=====================================================
 KARMİS Executive Dashboard Live on Port ${PORT}
=====================================================
URL: http://localhost:${PORT}
`);
  });
}

module.exports = { startServer, PORT };

if (require.main === module) {
  startServer();
}
