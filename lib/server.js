/**
 * KARMİS Dashboard HTTP Server v1.8.0
 * Includes Notes Endpoint & Markdown Renderer
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { parseTrackingCsv, updateApplicationStatus, updateApplicationNotes } = require('./tracker');
const { generateMarkdownReport } = require('./report-generator');
const { evaluateJobPosting } = require('./evaluator');

const PORT = 3005;

function renderMarkdownToHtml(markdown) {
  let html = markdown;

  // Preserve SVG blocks before processing
  const svgs = [];
  html = html.replace(/<svg[\s\S]*?<\/svg>/g, (m) => {
    svgs.push(m);
    return `___SVG_PLACEHOLDER_${svgs.length - 1}___`;
  });

  // Convert Code Blocks ```text ... ```
  html = html.replace(/\`\`\`(?:text)?([\s\S]*?)\`\`\`/g, (match, p1) => {
    return `<pre><code>${p1.trim().replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>`;
  });

  // Convert Headings
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');

  // Convert Bold
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

  // Convert Links [text](url)
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" style="color:#60a5fa;">$1 ↗</a>');

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

      const cells = line.split('|').slice(1, -1).map(c => c.trim());

      if (!inTable) {
        inTable = true;
        tableHtml = '<table><thead><tr>' + cells.map(c => `<th>${c}</th>`).join('') + '</tr></thead><tbody>';
      } else {
        tableHtml += '<tr>' + cells.map(c => `<td>${c}</td>`).join('') + '</tr>';
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

  if (urlObj.pathname === '/api/applications') {
    const csvPath = path.join(__dirname, '..', 'data', 'Aktif_Basvurular_Takip_Tablosu.csv');
    const apps = parseTrackingCsv(csvPath);
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    return res.end(JSON.stringify(apps));
  }

  if (urlObj.pathname === '/api/applications/update' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      const data = JSON.parse(body);
      const csvPath = path.join(__dirname, '..', 'data', 'Aktif_Basvurular_Takip_Tablosu.csv');
      updateApplicationStatus(csvPath, data.company, data.position, data.newStatus);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true }));
    });
    return;
  }

  if (urlObj.pathname === '/api/applications/update-notes' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      const sanitizedBody = body.replace(/\r?\n/g, ' ');
      const data = JSON.parse(sanitizedBody);
      const csvPath = path.join(__dirname, '..', 'data', 'Aktif_Basvurular_Takip_Tablosu.csv');
      const cleanNotes = (data.newNotes || '').replace(/\r?\n/g, ' | ').replace(/"/g, "'").trim();
      updateApplicationNotes(csvPath, data.company, data.position, cleanNotes);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true }));
    });
    return;
  }

  if (urlObj.pathname === '/api/reports') {
    const company = urlObj.searchParams.get('company') || 'Roche Türkiye';
    const position = urlObj.searchParams.get('position') || 'Business Insights & Analytics Partner';
    const evalRes = evaluateJobPosting({ company, jobTitle: position });
    const reportMd = generateMarkdownReport(evalRes, path.join(__dirname, '..'));
    const reportHtml = renderMarkdownToHtml(reportMd);

    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    return res.end(JSON.stringify({
      company,
      position,
      markdown: reportMd,
      htmlContent: reportHtml,
      coverLetter: "Dear " + company + " Team...",
      linkedinNote: "Sayın İK Lideri, " + company + " pozisyonuyla ilgileniyorum: https://behruzbagirzade.com/#work"
    }));
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
