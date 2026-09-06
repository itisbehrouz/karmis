/**
 * KARMİS Master CSV Tracker v2.0.0
 * Robust CSV Engine with Quote/Newline Sanitization preventing orphaned rows
 */

const fs = require('fs');
const path = require('path');

const HEADERS = [
  'Şirket Adı', 'Pozisyon', 'Uyum Oranı', 'İlan Linki', 'Başvuru Tarihi',
  'Kanal / Kaynak', 'Başvuru Durumu', 'Görüşülen Kişi / İK', 'Son İletişim Tarihi', 'Notlar & Sonraki Adım'
];

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

function cleanString(str) {
  if (!str) return '';
  return str.replace(/^"|"$/g, '').replace(/\r?\n/g, ' | ').replace(/"/g, "'").trim();
}

function parseTrackingCsv(csvPath) {
  if (!fs.existsSync(csvPath)) return [];
  const raw = fs.readFileSync(csvPath, 'utf8');
  const lines = raw.split('\n').filter(l => l.trim().length > 0);
  if (lines.length <= 1) return [];

  const dataLines = lines.slice(1);
  const rows = [];

  for (let i = 0; i < dataLines.length; i++) {
    const cols = splitCsvLine(dataLines[i]);
    const rawComp = cleanString(cols[0]);

    // Skip broken orphaned rows that don't have position or score
    if (!cols[1] && !cols[2]) continue;

    rows.push({
      company: rawComp.replace(/\*\*/g, ''),
      position: cleanString(cols[1]),
      score: cleanString(cols[2]),
      link: cleanString(cols[3]),
      date: cleanString(cols[4]),
      source: cleanString(cols[5]),
      status: cleanString(cols[6]),
      contact: cleanString(cols[7]),
      lastContactDate: cleanString(cols[8]),
      notes: cleanString(cols[9])
    });
  }

  return rows;
}

function updateApplicationStatus(csvPath, company, position, newStatus) {
  let apps = parseTrackingCsv(csvPath);
  const now = new Date().toISOString().split('T')[0];

  apps = apps.map(app => {
    if (app.company.toLowerCase() === company.toLowerCase() && app.position.toLowerCase() === position.toLowerCase()) {
      app.status = newStatus;
      app.lastContactDate = now;
    }
    return app;
  });

  saveAppsToCsv(csvPath, apps);

  // Sync to SQLite if DB is initialized
  try {
    const { getDb } = require('./db');
    const db = getDb();
    db.prepare(`
      UPDATE applications SET
        status = ?, last_contact_date = ?, updated_at = ?
      WHERE LOWER(company) = LOWER(?) AND LOWER(position) = LOWER(?)
    `).run(newStatus, now, new Date().toISOString(), company, position);
  } catch (e) {
    // Graceful fallback
  }
}

function updateApplicationNotes(csvPath, company, position, newNotes) {
  let apps = parseTrackingCsv(csvPath);
  const now = new Date().toISOString().split('T')[0];
  const cleaned = cleanString(newNotes);

  apps = apps.map(app => {
    if (app.company.toLowerCase() === company.toLowerCase() && app.position.toLowerCase() === position.toLowerCase()) {
      app.notes = cleaned;
      app.lastContactDate = now;
    }
    return app;
  });

  saveAppsToCsv(csvPath, apps);

  // Sync to SQLite if DB is initialized
  try {
    const { getDb } = require('./db');
    const db = getDb();
    db.prepare(`
      UPDATE applications SET
        notes = ?, last_contact_date = ?, updated_at = ?
      WHERE LOWER(company) = LOWER(?) AND LOWER(position) = LOWER(?)
    `).run(cleaned, now, new Date().toISOString(), company, position);
  } catch (e) {
    // Graceful fallback
  }
}

function saveAppsToCsv(csvPath, apps) {
  // Sort Newest First
  apps.sort((a, b) => {
    if (a.date > b.date) return -1;
    if (a.date < b.date) return 1;
    return a.company.localeCompare(b.company);
  });

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

  fs.writeFileSync(csvPath, lines.join('\n'), 'utf8');
}

function addApplicationEntry(entry, baseDir = path.join(__dirname, '..'), customCsvPath = null) {
  let configuredCsv = null;
  try {
    const { getSetting } = require('./db');
    configuredCsv = getSetting('csv_path');
  } catch (e) {}

  const csvPath = customCsvPath || configuredCsv || path.join(baseDir, 'data', 'Aktif_Basvurular_Takip_Tablosu.csv');
  const dir = path.dirname(csvPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  let apps = parseTrackingCsv(csvPath);
  const now = new Date().toISOString().split('T')[0];
  const existingIdx = apps.findIndex(
    a => a.company.toLowerCase() === (entry.company || '').toLowerCase() &&
         a.position.toLowerCase() === (entry.position || '').toLowerCase()
  );

  if (existingIdx >= 0) {
    apps[existingIdx].status = entry.status || apps[existingIdx].status;
    apps[existingIdx].score = entry.score !== undefined ? String(entry.score) : apps[existingIdx].score;
    apps[existingIdx].lastContactDate = now;
    if (entry.notes) apps[existingIdx].notes = entry.notes;
  } else {
    apps.unshift({
      company: entry.company || 'Unknown',
      position: entry.position || 'Unknown',
      score: entry.score !== undefined ? (String(entry.score).includes('%') ? entry.score : `%${entry.score}`) : '%85',
      link: entry.link || '',
      date: entry.date || now,
      source: entry.source || 'Portal',
      status: entry.status || 'Applied',
      contact: entry.contact || '',
      lastContactDate: now,
      notes: entry.notes || ''
    });
  }

  saveAppsToCsv(csvPath, apps);

  // Sync to SQLite if DB is initialized
  try {
    const { getDb } = require('./db');
    const db = getDb();
    const scoreNum = parseFloat(String(entry.score || '85').replace(/[^\d.]/g, '')) || 85;
    const existing = db.prepare('SELECT id FROM applications WHERE LOWER(company) = LOWER(?) AND LOWER(position) = LOWER(?)')
      .get(entry.company, entry.position);

    if (existing) {
      db.prepare(`
        UPDATE applications SET
          status = ?, score = ?, last_contact_date = ?, updated_at = ?
        WHERE id = ?
      `).run(entry.status || 'Applied', scoreNum, now, new Date().toISOString(), existing.id);
    } else {
      const id = 'app_' + Math.random().toString(36).substring(2, 10);
      db.prepare(`
        INSERT INTO applications (
          id, company, position, score, link, date, source, status, contact, last_contact_date, notes, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        id, entry.company || 'Unknown', entry.position || 'Unknown', scoreNum,
        entry.link || '', entry.date || now, entry.source || 'Portal',
        entry.status || 'Applied', entry.contact || '', now, entry.notes || '',
        new Date().toISOString(), new Date().toISOString()
      );
    }
  } catch (e) {
    // Graceful fallback if db is not ready
  }

  return { csvPath, count: apps.length };
}

function syncCsvWithDb(customCsvPath = null) {
  const { exportApplicationsToCsv } = require('./db');
  return exportApplicationsToCsv(customCsvPath);
}

module.exports = {
  parseTrackingCsv,
  updateApplicationStatus,
  updateApplicationNotes,
  addApplicationEntry,
  syncCsvWithDb,
  HEADERS,
  cleanString,
  splitCsvLine
};
