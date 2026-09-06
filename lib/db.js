/**
 * KARMİS Database Engine v1.0.0
 * Native SQLite engine (node:sqlite / better-sqlite3)
 * Provides 3 relational tables: companies, applications, reports
 * Handles automatic CSV migration and real-time auto-synchronization
 */

const fs = require('fs');
const path = require('path');

let DatabaseSync;
try {
  DatabaseSync = require('node:sqlite').DatabaseSync;
} catch (e) {
  try {
    const BSqlite = require('better-sqlite3');
    DatabaseSync = function (filepath) {
      return new BSqlite(filepath);
    };
  } catch (err) {
    throw new Error('No SQLite driver found. Please use Node.js v22+ or install better-sqlite3.');
  }
}

const DB_PATH = path.join(__dirname, '..', 'data', 'karmis.db');
const CSV_PATH = path.join(__dirname, '..', 'data', 'Aktif_Basvurular_Takip_Tablosu.csv');

let dbInstance = null;

function getDb() {
  if (!dbInstance) {
    const dataDir = path.dirname(DB_PATH);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    dbInstance = new DatabaseSync(DB_PATH);
    initTables(dbInstance);
  }
  return dbInstance;
}

function initTables(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS companies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      aliases TEXT,
      sector TEXT,
      location TEXT,
      seniority TEXT,
      salary_benchmark TEXT,
      salary_opening TEXT,
      metrics TEXT,
      ats_keywords TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS applications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      company_name TEXT NOT NULL,
      position TEXT NOT NULL,
      match_score TEXT,
      job_url TEXT,
      application_date TEXT NOT NULL,
      channel TEXT,
      status TEXT NOT NULL DEFAULT 'Applied',
      contact_person TEXT,
      last_contact_date TEXT,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS reports (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      company_name TEXT NOT NULL,
      position TEXT NOT NULL,
      match_score INTEGER,
      report_markdown TEXT,
      report_html TEXT,
      cover_letter TEXT,
      linkedin_note TEXT,
      star_prep_json TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(company_name, position)
    );

    CREATE TABLE IF NOT EXISTS job_radar (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      company TEXT NOT NULL,
      position TEXT NOT NULL,
      location TEXT,
      source TEXT,
      url TEXT,
      discovered_date TEXT NOT NULL,
      match_score INTEGER DEFAULT 85,
      status TEXT NOT NULL DEFAULT 'New',
      notes TEXT,
      is_existing_company INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(company, position)
    );

    CREATE INDEX IF NOT EXISTS idx_applications_date ON applications(application_date DESC);
    CREATE INDEX IF NOT EXISTS idx_applications_comp_pos ON applications(company_name, position);
    CREATE INDEX IF NOT EXISTS idx_companies_name ON companies(name);
    CREATE INDEX IF NOT EXISTS idx_radar_status ON job_radar(status);
    CREATE INDEX IF NOT EXISTS idx_radar_company ON job_radar(company);
    CREATE INDEX IF NOT EXISTS idx_radar_date ON job_radar(discovered_date DESC);
  `);
}

function cleanString(str) {
  if (!str) return '';
  return str.replace(/^"|"$/g, '').replace(/\r?\n/g, ' | ').replace(/"/g, "'").trim();
}

function splitCsvLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

/**
 * Migrates existing data from CSV and COMPANY_KNOWLEDGE into SQLite if empty.
 */
function seedDatabase(db = getDb()) {
  // 1. Seed Companies from COMPANY_KNOWLEDGE
  try {
    const { COMPANY_KNOWLEDGE } = require('./evaluator');
    const existingCompanies = db.prepare('SELECT COUNT(*) as count FROM companies').all()[0].count;
    
    if (existingCompanies === 0 && COMPANY_KNOWLEDGE) {
      const insertComp = db.prepare(`
        INSERT OR IGNORE INTO companies 
        (name, aliases, sector, location, seniority, salary_benchmark, salary_opening, metrics, ats_keywords)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      for (const [name, data] of Object.entries(COMPANY_KNOWLEDGE)) {
        insertComp.run(
          name,
          JSON.stringify(data.aliases || []),
          data.sector || '',
          data.location || '',
          data.seniority || '',
          data.salaryBenchmark || '',
          data.salaryOpening || '',
          JSON.stringify(data.metrics || []),
          JSON.stringify(data.atsKeywords || [])
        );
      }
    }
  } catch (err) {
    console.warn('[DB] Company knowledge seeding warning:', err.message);
  }

  // 2. Seed Applications from CSV
  const appCount = db.prepare('SELECT COUNT(*) as count FROM applications').all()[0].count;
  if (appCount === 0 && fs.existsSync(CSV_PATH)) {
    const raw = fs.readFileSync(CSV_PATH, 'utf8');
    const lines = raw.split('\n').filter(l => l.trim().length > 0);

    if (lines.length > 1) {
      const insertApp = db.prepare(`
        INSERT INTO applications 
        (company_name, position, match_score, job_url, application_date, channel, status, contact_person, last_contact_date, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const dataLines = lines.slice(1);
      for (const line of dataLines) {
        const cols = splitCsvLine(line);
        if (!cols[1] && !cols[2]) continue;

        const rawComp = cleanString(cols[0]).replace(/\*\*/g, '');
        const position = cleanString(cols[1]);
        const score = cleanString(cols[2]);
        const link = cleanString(cols[3]);
        const date = cleanString(cols[4]) || new Date().toISOString().split('T')[0];
        const source = cleanString(cols[5]);
        const status = cleanString(cols[6]) || 'Applied';
        const contact = cleanString(cols[7]);
        const lastContactDate = cleanString(cols[8]) || date;
        const notes = cleanString(cols[9]);

        insertApp.run(rawComp, position, score, link, date, source, status, contact, lastContactDate, notes);
      }
    }
  } else if (appCount === 0) {
    // Seed initial generic sample applications for fresh open-source clone
    const insertApp = db.prepare(`
      INSERT INTO applications 
      (company_name, position, match_score, job_url, application_date, channel, status, contact_person, last_contact_date, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const today = new Date().toISOString().split('T')[0];
    insertApp.run('Acme Systems', 'Senior Full Stack Engineer', '%92', 'https://example.com/jobs/acme', today, 'LinkedIn', 'Interviewing', 'Acme Talent Team', today, 'Initial technical interview scheduled.');
    insertApp.run('CloudScale Labs', 'Staff Backend Engineer', '%88', 'https://example.com/jobs/cloudscale', today, 'Company Website', 'Applied', 'Recruiting Lead', today, 'Applied with customized resume.');
    insertApp.run('TechNova AI', 'AI Platform Architect', '%85', 'https://example.com/jobs/technova', today, 'Referral', 'Applied', 'Hiring Manager', today, 'Tailored STAR preparation notes generated.');
  }
}

/**
 * Returns all applications formatted for API and Dashboard consumption.
 */
function getAllApplications() {
  const db = getDb();
  const rows = db.prepare('SELECT * FROM applications ORDER BY application_date DESC, id DESC').all();
  return rows.map(r => ({
    id: r.id,
    company: r.company_name,
    position: r.position,
    score: r.match_score,
    link: r.job_url,
    date: r.application_date,
    source: r.channel,
    status: r.status,
    contact: r.contact_person,
    lastContactDate: r.last_contact_date,
    notes: r.notes
  }));
}

/**
 * Adds a new application to SQLite and automatically synchronizes CSV.
 */
function insertApplication(entry) {
  const db = getDb();
  const today = new Date().toISOString().split('T')[0];
  const company = cleanString(entry.company).replace(/\*\*/g, '');
  const position = cleanString(entry.position);
  const score = cleanString(entry.score || '%90');
  const link = cleanString(entry.link || '');
  const date = cleanString(entry.date || today);
  const source = cleanString(entry.source || 'LinkedIn');
  const status = cleanString(entry.status || 'Applied');
  const contact = cleanString(entry.contact || '');
  const lastContactDate = cleanString(entry.lastContactDate || date);
  const notes = cleanString(entry.notes || '');

  const stmt = db.prepare(`
    INSERT INTO applications 
    (company_name, position, match_score, job_url, application_date, channel, status, contact_person, last_contact_date, notes, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
  `);

  stmt.run(company, position, score, link, date, source, status, contact, lastContactDate, notes);
  exportToCsv();
  return { success: true, company, position };
}

/**
 * Updates application status by ID in SQLite and auto-syncs CSV.
 */
function updateApplicationStatusById(id, newStatus) {
  const db = getDb();
  const today = new Date().toISOString().split('T')[0];
  const stmt = db.prepare(`
    UPDATE applications 
    SET status = ?, last_contact_date = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `);
  stmt.run(newStatus, today, id);
  exportToCsv();
  return { success: true };
}

/**
 * Updates application status in SQLite and auto-syncs CSV.
 */
function updateApplicationStatus(company, position, newStatus, id = null) {
  if (id) {
    return updateApplicationStatusById(id, newStatus);
  }

  const db = getDb();
  const cleanComp = cleanString(company).replace(/\*\*/g, '').trim();
  const cleanPos = cleanString(position).trim();
  const today = new Date().toISOString().split('T')[0];

  const stmt = db.prepare(`
    UPDATE applications 
    SET status = ?, last_contact_date = ?, updated_at = CURRENT_TIMESTAMP
    WHERE company_name = ? AND position = ?
  `);

  const info = stmt.run(newStatus, today, cleanComp, cleanPos);

  if (!info || info.changes === 0) {
    const rows = db.prepare('SELECT id, company_name, position FROM applications').all();
    const targetComp = cleanComp.toLowerCase();
    const targetPos = cleanPos.toLowerCase();
    const matched = rows.find(r => 
      r.company_name.trim().toLowerCase() === targetComp && 
      r.position.trim().toLowerCase() === targetPos
    );
    if (matched) {
      db.prepare(`
        UPDATE applications 
        SET status = ?, last_contact_date = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(newStatus, today, matched.id);
    }
  }

  exportToCsv();
  return { success: true };
}

function updateApplicationNotesById(id, newNotes) {
  const db = getDb();
  const today = new Date().toISOString().split('T')[0];
  const stmt = db.prepare(`
    UPDATE applications 
    SET notes = ?, last_contact_date = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `);
  stmt.run(cleanString(newNotes), today, id);
  exportToCsv();
  return { success: true };
}

/**
 * Updates application notes in SQLite and auto-syncs CSV.
 */
function updateApplicationNotes(company, position, newNotes, id = null) {
  if (id) {
    return updateApplicationNotesById(id, newNotes);
  }

  const db = getDb();
  const cleanComp = cleanString(company).replace(/\*\*/g, '').trim();
  const cleanPos = cleanString(position).trim();
  const today = new Date().toISOString().split('T')[0];

  const stmt = db.prepare(`
    UPDATE applications 
    SET notes = ?, last_contact_date = ?, updated_at = CURRENT_TIMESTAMP
    WHERE company_name = ? AND position = ?
  `);

  const info = stmt.run(cleanString(newNotes), today, cleanComp, cleanPos);

  if (!info || info.changes === 0) {
    const rows = db.prepare('SELECT id, company_name, position FROM applications').all();
    const targetComp = cleanComp.toLowerCase();
    const targetPos = cleanPos.toLowerCase();
    const matched = rows.find(r => 
      r.company_name.trim().toLowerCase() === targetComp && 
      r.position.trim().toLowerCase() === targetPos
    );
    if (matched) {
      db.prepare(`
        UPDATE applications 
        SET notes = ?, last_contact_date = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(cleanString(newNotes), today, matched.id);
    }
  }

  exportToCsv();
  return { success: true };
}

/**
 * Deletes an application from SQLite and auto-syncs CSV.
 */
function deleteApplication(company, position, id = null) {
  if (id) {
    return deleteApplicationById(id);
  }

  const db = getDb();
  const cleanComp = cleanString(company).replace(/\*\*/g, '').trim();
  const cleanPos = cleanString(position).trim();

  const stmt = db.prepare(`
    DELETE FROM applications 
    WHERE company_name = ? AND position = ?
  `);
  const info = stmt.run(cleanComp, cleanPos);

  if (!info || info.changes === 0) {
    const rows = db.prepare('SELECT id, company_name, position FROM applications').all();
    const targetComp = cleanComp.toLowerCase();
    const targetPos = cleanPos.toLowerCase();
    const matched = rows.find(r => 
      r.company_name.trim().toLowerCase() === targetComp && 
      r.position.trim().toLowerCase() === targetPos
    );
    if (matched) {
      deleteApplicationById(matched.id);
    }
  }

  exportToCsv();
  return { success: true };
}

function deleteApplicationById(id) {
  const db = getDb();
  const stmt = db.prepare(`DELETE FROM applications WHERE id = ?`);
  stmt.run(id);
  exportToCsv();
  return { success: true };
}

/**
 * Retrieves company intelligence profile from SQLite.
 */
function getCompany(companyName) {
  if (!companyName) return null;
  const db = getDb();
  const clean = cleanString(companyName).replace(/\*\*/g, '').trim();
  const cleanLower = clean.toLowerCase();

  // 1. Direct name match
  const row = db.prepare('SELECT * FROM companies WHERE LOWER(name) = ?').all(cleanLower)[0];
  if (row) return formatCompanyRow(row);

  // 2. Search all companies for alias match
  const allComps = db.prepare('SELECT * FROM companies').all();
  for (const c of allComps) {
    if (c.aliases) {
      try {
        const aliases = JSON.parse(c.aliases);
        if (aliases.some(a => cleanLower.includes(a.toLowerCase()) || a.toLowerCase().includes(cleanLower))) {
          return formatCompanyRow(c);
        }
      } catch (e) {}
    }
    if (cleanLower.includes(c.name.toLowerCase()) || c.name.toLowerCase().includes(cleanLower)) {
      return formatCompanyRow(c);
    }
  }

  return null;
}

function formatCompanyRow(row) {
  let aliases = [];
  let metrics = [];
  let atsKeywords = [];

  try { aliases = JSON.parse(row.aliases || '[]'); } catch (e) {}
  try { metrics = JSON.parse(row.metrics || '[]'); } catch (e) {}
  try { atsKeywords = JSON.parse(row.ats_keywords || '[]'); } catch (e) {}

  return {
    id: row.id,
    name: row.name,
    aliases,
    sector: row.sector,
    location: row.location,
    seniority: row.seniority,
    salaryBenchmark: row.salary_benchmark,
    salaryOpening: row.salary_opening,
    metrics,
    atsKeywords
  };
}

/**
 * Upserts company knowledge profile into SQLite.
 */
function upsertCompany(data) {
  const db = getDb();
  const compName = (data.name || data.company || '').replace(/\*\*/g, '').trim();
  if (!compName) return;

  const stmt = db.prepare(`
    INSERT INTO companies 
    (name, aliases, sector, location, seniority, salary_benchmark, salary_opening, metrics, ats_keywords, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(name) DO UPDATE SET
      aliases = excluded.aliases,
      sector = excluded.sector,
      location = excluded.location,
      seniority = excluded.seniority,
      salary_benchmark = excluded.salary_benchmark,
      salary_opening = excluded.salary_opening,
      metrics = excluded.metrics,
      ats_keywords = excluded.ats_keywords,
      updated_at = CURRENT_TIMESTAMP
  `);

  stmt.run(
    compName,
    JSON.stringify(data.aliases || []),
    data.sector || '',
    data.location || '',
    data.seniority || '',
    data.salaryBenchmark || '',
    data.salaryOpening || '',
    JSON.stringify(data.metrics || []),
    JSON.stringify(data.atsKeywords || [])
  );
}

/**
 * Retrieves cached evaluation report from SQLite.
 */
function getReport(company, position) {
  const db = getDb();
  const cleanComp = cleanString(company).replace(/\*\*/g, '').trim();
  const cleanPos = cleanString(position).trim();

  // 1. Try exact match first
  let row = db.prepare('SELECT * FROM reports WHERE company_name = ? AND position = ?').get(cleanComp, cleanPos);

  // 2. Try case-insensitive and normalized substring matching
  if (!row) {
    const allReports = db.prepare('SELECT * FROM reports').all();
    const cLower = cleanComp.toLowerCase();
    const pLower = cleanPos.toLowerCase();
    row = allReports.find(r => {
      const rComp = (r.company_name || '').toLowerCase();
      const rPos = (r.position || '').toLowerCase();
      const compMatches = rComp === cLower || rComp.includes(cLower) || cLower.includes(rComp);
      const posMatches = rPos === pLower || rPos.includes(pLower) || pLower.includes(rPos);
      return compMatches && posMatches;
    });
  }

  if (!row) return null;

  return {
    company: row.company_name,
    position: row.position,
    score: row.match_score,
    markdown: row.report_markdown,
    htmlContent: row.report_html,
    coverLetter: row.cover_letter,
    linkedinNote: row.linkedin_note,
    starPrep: row.star_prep_json ? JSON.parse(row.star_prep_json) : null
  };
}

/**
 * Caches evaluation report in SQLite.
 */
function saveReport(reportData) {
  const db = getDb();
  const stmt = db.prepare(`
    INSERT INTO reports 
    (company_name, position, match_score, report_markdown, report_html, cover_letter, linkedin_note, star_prep_json, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(company_name, position) DO UPDATE SET
      match_score = excluded.match_score,
      report_markdown = excluded.report_markdown,
      report_html = excluded.report_html,
      cover_letter = excluded.cover_letter,
      linkedin_note = excluded.linkedin_note,
      star_prep_json = excluded.star_prep_json,
      updated_at = CURRENT_TIMESTAMP
  `);

  stmt.run(
    cleanString(reportData.company).replace(/\*\*/g, ''),
    cleanString(reportData.position),
    reportData.score || 90,
    reportData.markdown || '',
    reportData.htmlContent || '',
    reportData.coverLetter || '',
    reportData.linkedinNote || '',
    reportData.starPrep ? JSON.stringify(reportData.starPrep) : null
  );
}

/**
 * Strict Master Table CSV Exporter
 * Maintains exact 10 columns, Newest First sorting.
 */
function exportToCsv(targetPath = CSV_PATH) {
  const apps = getAllApplications();
  const HEADERS = [
    'Şirket Adı', 'Pozisyon', 'Uyum Oranı', 'İlan Linki', 'Başvuru Tarihi',
    'Kanal / Kaynak', 'Başvuru Durumu', 'Görüşülen Kişi / İK', 'Son İletişim Tarihi', 'Notlar & Sonraki Adım'
  ];

  const lines = [HEADERS.join(',')];

  apps.forEach(a => {
    const compStr = `**${cleanString(a.company)}**`;
    const posStr = cleanString(a.position).includes(',') ? `"${cleanString(a.position)}"` : cleanString(a.position);
    const notesStr = cleanString(a.notes).includes(',') ? `"${cleanString(a.notes)}"` : cleanString(a.notes);

    const row = [
      compStr,
      posStr,
      cleanString(a.score),
      cleanString(a.link),
      cleanString(a.date),
      cleanString(a.source),
      cleanString(a.status),
      cleanString(a.contact),
      cleanString(a.lastContactDate),
      notesStr
    ].join(',');

    lines.push(row);
  });

  fs.writeFileSync(targetPath, lines.join('\n'), 'utf8');
}

/**
 * Job Radar Database Operations
 */
function getRadarLeads(filter = {}) {
  const db = getDb();
  let query = 'SELECT * FROM job_radar';
  const params = [];
  const conditions = [];

  if (filter.status && filter.status !== 'ALL') {
    conditions.push('status = ?');
    params.push(filter.status);
  } else {
    conditions.push("status != 'Archived'");
  }

  if (filter.search) {
    conditions.push('(company LIKE ? OR position LIKE ? OR location LIKE ? OR notes LIKE ?)');
    const term = `%${filter.search}%`;
    params.push(term, term, term, term);
  }

  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }

  query += ' ORDER BY discovered_date DESC, id DESC';
  return db.prepare(query).all(...params);
}

function addRadarLead(lead) {
  const db = getDb();
  const cleanComp = cleanString(lead.company).replace(/\*\*/g, '');
  const cleanPos = cleanString(lead.position);

  // 1. Check if exact company + position is already applied
  const existingApp = db.prepare('SELECT id, status FROM applications WHERE LOWER(company_name) = LOWER(?) AND LOWER(position) = LOWER(?)').get(cleanComp, cleanPos);
  if (existingApp) {
    return { skipped: true, reason: 'Already applied', existingApp };
  }

  // 2. Check if company exists in applications with any other role
  const existingCompany = db.prepare('SELECT id FROM applications WHERE LOWER(company_name) = LOWER(?)').get(cleanComp);
  const isExistingCompany = existingCompany ? 1 : 0;
  const leadNotes = isExistingCompany ? 'Aynı Şirket - Yeni Rol' : (lead.notes || '');

  const stmt = db.prepare(`
    INSERT INTO job_radar 
    (company, position, location, source, url, discovered_date, match_score, status, notes, is_existing_company)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(company, position) DO UPDATE SET
      location = excluded.location,
      source = excluded.source,
      url = excluded.url,
      match_score = excluded.match_score,
      updated_at = CURRENT_TIMESTAMP
  `);

  const dateStr = lead.discovered_date || new Date().toISOString().split('T')[0];
  stmt.run(
    cleanComp,
    cleanPos,
    cleanString(lead.location || 'İstanbul / Hibrit'),
    cleanString(lead.source || 'Web Radar'),
    cleanString(lead.url || ''),
    dateStr,
    lead.match_score || 85,
    lead.status || 'New',
    leadNotes,
    isExistingCompany
  );

  return { success: true, isExistingCompany };
}

function updateRadarStatus(id, newStatus) {
  const db = getDb();
  db.prepare('UPDATE job_radar SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(newStatus, id);
}

function convertRadarLeadToApplication(id) {
  const db = getDb();
  const lead = db.prepare('SELECT * FROM job_radar WHERE id = ?').get(id);
  if (!lead) return { error: 'Lead not found' };

  const today = new Date().toISOString().split('T')[0];
  const appData = {
    company: lead.company,
    position: lead.position,
    score: `%${lead.match_score || 88}`,
    link: lead.url || '',
    date: today,
    source: lead.source || 'İlan Radarı',
    status: 'Applied',
    contact: '-',
    lastContactDate: today,
    notes: lead.notes ? `${lead.notes} | Radardan eklendi` : 'Radardan doğrudan başvuruya aktarıldı'
  };

  insertApplication(appData);
  db.prepare("UPDATE job_radar SET status = 'Converted', updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(id);

  return { success: true, application: appData };
}

function archiveRadarLead(id) {
  const db = getDb();
  db.prepare("UPDATE job_radar SET status = 'Archived', updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(id);
}

// Automatically seed database on initial load
const db = getDb();
seedDatabase(db);

module.exports = {
  getDb,
  seedDatabase,
  getAllApplications,
  insertApplication,
  updateApplicationStatus,
  updateApplicationStatusById,
  updateApplicationNotes,
  updateApplicationNotesById,
  deleteApplication,
  deleteApplicationById,
  getCompany,
  upsertCompany,
  getReport,
  saveReport,
  exportToCsv,
  getRadarLeads,
  addRadarLead,
  updateRadarStatus,
  convertRadarLeadToApplication,
  archiveRadarLead,
  DB_PATH,
  CSV_PATH
};
