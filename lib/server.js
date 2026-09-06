/**
 * KARMİS V2 HTTP Server & Dashboard API
 * Local REST backend supporting Career DNA, Gaps, Evidence, Next Best Move, Simulation, and Analytics.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { parseTrackingCsv, updateApplicationStatus, updateApplicationNotes, addApplicationEntry, syncCsvWithDb } = require('./tracker');
const { generateMarkdownReport } = require('./report-generator');
const { evaluateJobPosting } = require('./evaluator');
const { getCareerDna, saveCareerDna } = require('./dna');
const { analyzeSkillGaps, createSkill } = require('./skills');
const { getEvidenceWallet, saveEvidenceItem, deleteEvidenceItem } = require('./evidence');
const { determineNextBestMove, generateActionPlan } = require('./decision');
const { simulateCareerPaths, calculateSalaryTrajectory } = require('./simulator');
const { calculateCareerAnalytics } = require('./analytics');
const { initDb, getDb, getDbPath, getSetting, setSetting, getAllSettings } = require('./db');

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3005;

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

function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        reject(err);
      }
    });
  });
}

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  });
  res.end(JSON.stringify(data));
}

const server = http.createServer(async (req, res) => {
  const urlObj = new URL(req.url, 'http://localhost:' + PORT);

  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    return res.end();
  }

  try {
    // 1. Static Dashboard HTML
    if (urlObj.pathname === '/' || urlObj.pathname === '/index.html') {
      const htmlPath = path.join(__dirname, '..', 'dashboard', 'index.html');
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(fs.readFileSync(htmlPath, 'utf8'));
    }

    // 2. Career DNA & Target
    if (urlObj.pathname === '/api/dna') {
      if (req.method === 'GET') {
        return sendJson(res, 200, getCareerDna());
      }
      if (req.method === 'POST') {
        const body = await parseJsonBody(req);
        const updated = saveCareerDna(body);
        return sendJson(res, 200, updated);
      }
    }

    // 3. Skill Gaps
    if (urlObj.pathname === '/api/gaps') {
      const dna = getCareerDna();
      const targetReqs = (dna.targetCareerState?.targetSkills?.length > 0
        ? dna.targetCareerState.targetSkills
        : (dna.targetCareerState?.requiredSkills?.length > 0
          ? dna.targetCareerState.requiredSkills
          : [
              { name: dna.targetCareerState?.targetRole || 'Target Leadership', targetLevel: 4, importance: 'critical' },
              { name: 'Strategic Leadership & Direction', targetLevel: 4, importance: 'high' },
              { name: 'Stakeholder Communication & Influence', targetLevel: 4, importance: 'high' },
              { name: 'Operational Excellence & Delivery', targetLevel: 4, importance: 'medium' }
            ]
        )
      );
      const gapAnalysis = analyzeSkillGaps(dna.skills, targetReqs);
      return sendJson(res, 200, gapAnalysis);
    }

    // 4. Evidence Wallet
    if (urlObj.pathname === '/api/evidence') {
      if (req.method === 'GET') {
        return sendJson(res, 200, getEvidenceWallet());
      }
      if (req.method === 'POST') {
        const body = await parseJsonBody(req);
        const updated = saveEvidenceItem(body);
        return sendJson(res, 200, updated);
      }
      if (req.method === 'DELETE') {
        const id = urlObj.searchParams.get('id');
        const updated = deleteEvidenceItem(id);
        return sendJson(res, 200, updated);
      }
    }

    // 5. Next Best Move & Action Plan
    if (urlObj.pathname === '/api/next') {
      const dna = getCareerDna();
      const move = determineNextBestMove(dna);
      const plan = generateActionPlan(dna);
      return sendJson(res, 200, { move, plan });
    }

    // 6. Career Simulator & Salary Trajectory
    if (urlObj.pathname === '/api/simulate') {
      const dna = getCareerDna();
      const sim = simulateCareerPaths(dna);
      const traj = calculateSalaryTrajectory(
        dna.financialGoals?.currentSalary || 180000,
        dna.financialGoals?.targetSalary || 250000,
        dna.targetCareerState?.targetTimelineMonths || 24,
        dna.financialGoals?.currency || 'TRY'
      );
      return sendJson(res, 200, { sim, traj });
    }

    // 7. Career Analytics
    if (urlObj.pathname === '/api/analytics') {
      return sendJson(res, 200, calculateCareerAnalytics());
    }

    // 8. Analyze Job Posting
    if (urlObj.pathname === '/api/analyze' && req.method === 'POST') {
      const body = await parseJsonBody(req);
      const evalResult = evaluateJobPosting(body);
      return sendJson(res, 200, evalResult);
    }

    // 9. Sync CSV (ABSG / ABDG)
    if (urlObj.pathname === '/api/sync-csv' && req.method === 'POST') {
      try {
        const configuredCsv = getSetting('csv_path');
        const csvPath = syncCsvWithDb(configuredCsv);
        return sendJson(res, 200, { success: true, csvPath });
      } catch (err) {
        return sendJson(res, 400, { success: false, error: err.message });
      }
    }

    // 10. System Settings & Local Preferences
    if (urlObj.pathname === '/api/settings') {
      if (req.method === 'GET') {
        const defaultCsv = path.join(__dirname, '..', 'data', 'Aktif_Basvurular_Takip_Tablosu.csv');
        const configuredProvider = getSetting('ai_provider', process.env.KARMIS_AI_PROVIDER || 'local');
        const configuredCsv = getSetting('csv_path', defaultCsv);
        const configuredPrivacy = getSetting('privacy_mode', 'local_only');

        return sendJson(res, 200, {
          aiProvider: configuredProvider,
          dbPath: getDbPath(),
          csvPath: configuredCsv,
          privacyMode: configuredPrivacy,
          telemetry: 'disabled (100% local, zero external network telemetry)',
          availableProviders: ['local', 'openai', 'anthropic'],
          envKeys: {
            openai: !!process.env.OPENAI_API_KEY,
            anthropic: !!process.env.ANTHROPIC_API_KEY
          }
        });
      }
      if (req.method === 'POST') {
        const body = await parseJsonBody(req);
        if (body.aiProvider !== undefined) {
          const prov = String(body.aiProvider).toLowerCase().trim();
          if (!['local', 'openai', 'anthropic'].includes(prov)) {
            return sendJson(res, 400, { error: 'Invalid AI provider. Allowed: local, openai, anthropic' });
          }
          setSetting('ai_provider', prov);
          process.env.KARMIS_AI_PROVIDER = prov;
        }
        if (body.csvPath !== undefined) {
          const trimmed = String(body.csvPath).trim();
          if (trimmed.length > 0) {
            const dir = path.dirname(path.resolve(trimmed));
            try {
              if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
              }
              fs.accessSync(dir, fs.constants.W_OK);
              setSetting('csv_path', trimmed);
            } catch (pathErr) {
              return sendJson(res, 400, { error: `CSV path directory is not accessible or writable: ${pathErr.message}` });
            }
          }
        }
        if (body.privacyMode !== undefined) {
          setSetting('privacy_mode', String(body.privacyMode).trim());
        }
        return sendJson(res, 200, { success: true, settings: getAllSettings() });
      }
    }

    // 11. Application Tracker (Preserved + Enhanced)
    if (urlObj.pathname === '/api/applications') {
      if (req.method === 'GET') {
        const db = getDb();
        const apps = db.prepare('SELECT * FROM applications ORDER BY date DESC, company ASC').all();
        if (apps.length === 0) {
          const configuredCsv = getSetting('csv_path');
          const csvPath = configuredCsv || path.join(__dirname, '..', 'data', 'Aktif_Basvurular_Takip_Tablosu.csv');
          return sendJson(res, 200, parseTrackingCsv(csvPath));
        }
        return sendJson(res, 200, apps);
      }
      if (req.method === 'POST') {
        const body = await parseJsonBody(req);
        const configuredCsv = getSetting('csv_path');
        const result = addApplicationEntry(body, path.join(__dirname, '..'), configuredCsv);
        return sendJson(res, 200, { success: true, ...result });
      }
    }

    if (urlObj.pathname === '/api/applications/update' && req.method === 'POST') {
      const data = await parseJsonBody(req);
      const configuredCsv = getSetting('csv_path');
      const csvPath = configuredCsv || path.join(__dirname, '..', 'data', 'Aktif_Basvurular_Takip_Tablosu.csv');
      updateApplicationStatus(csvPath, data.company, data.position, data.newStatus);
      return sendJson(res, 200, { success: true });
    }

    if (urlObj.pathname === '/api/applications/update-notes' && req.method === 'POST') {
      const data = await parseJsonBody(req);
      const configuredCsv = getSetting('csv_path');
      const csvPath = configuredCsv || path.join(__dirname, '..', 'data', 'Aktif_Basvurular_Takip_Tablosu.csv');
      const cleanNotes = (data.newNotes || '').replace(/\r?\n/g, ' | ').replace(/"/g, "'").trim();
      updateApplicationNotes(csvPath, data.company, data.position, cleanNotes);
      return sendJson(res, 200, { success: true });
    }

    // 12. Legacy Reports API (Preserved)
    if (urlObj.pathname === '/api/reports') {
      const company = urlObj.searchParams.get('company') || 'Roche Türkiye';
      const position = urlObj.searchParams.get('position') || 'Business Insights & Analytics Partner';
      const evalRes = evaluateJobPosting({ company, jobTitle: position });
      const reportMd = generateMarkdownReport(evalRes, path.join(__dirname, '..'));
      const reportHtml = renderMarkdownToHtml(reportMd);

      const wantsHtml = req.headers.accept && req.headers.accept.includes('text/html') && urlObj.searchParams.get('format') !== 'json';
      if (wantsHtml) {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        return res.end(`<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <title>KARMİS İlan Raporu - ${company}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0b1120; color: #f8fafc; padding: 32px; line-height: 1.6; max-width: 1000px; margin: 0 auto; }
    h1, h2, h3 { color: #60a5fa; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 13px; }
    th, td { border: 1px solid #1e293b; padding: 10px 14px; text-align: left; }
    th { background: #1e293b; color: #94a3b8; }
    tr:nth-child(even) { background: rgba(30, 41, 59, 0.4); }
    pre { background: #1e293b; padding: 14px; border-radius: 8px; overflow-x: auto; color: #e2e8f0; }
    svg { max-width: 100%; height: auto; }
  </style>
</head>
<body>
  ${reportHtml}
</body>
</html>`);
      }

      return sendJson(res, 200, {
        company,
        position,
        markdown: reportMd,
        htmlContent: reportHtml,
        coverLetter: "Dear " + company + " Team...",
        linkedinNote: "Sayın İK Lideri, " + company + " pozisyonuyla ilgileniyorum: https://behruzbagirzade.com/#work"
      });
    }

    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  } catch (err) {
    console.error('[KARMİS API Error]:', err);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: err.message }));
  }
});

function startServer(customPort = null) {
  const listenPort = customPort || PORT;
  server.listen(listenPort, () => {
    console.log(`
========================================================================
 KARMİS V2 Personal Career Decision Engine Live on Port ${listenPort}
========================================================================
URL: http://localhost:${listenPort}
`);
  });
}

module.exports = { server, startServer, PORT };

if (require.main === module) {
  startServer();
}
