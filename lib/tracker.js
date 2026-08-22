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

  apps = apps.map(app => {
    if (app.company.toLowerCase() === company.toLowerCase() && app.position.toLowerCase() === position.toLowerCase()) {
      app.status = newStatus;
      app.lastContactDate = new Date().toISOString().split('T')[0];
    }
    return app;
  });

  saveAppsToCsv(csvPath, apps);
}

function updateApplicationNotes(csvPath, company, position, newNotes) {
  let apps = parseTrackingCsv(csvPath);

  apps = apps.map(app => {
    if (app.company.toLowerCase() === company.toLowerCase() && app.position.toLowerCase() === position.toLowerCase()) {
      app.notes = cleanString(newNotes);
      app.lastContactDate = new Date().toISOString().split('T')[0];
    }
    return app;
  });

  saveAppsToCsv(csvPath, apps);
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

function addApplicationEntry(entry, baseDir = path.join(__dirname, '..')) {
  const csvPath = path.join(baseDir, 'data', 'Aktif_Basvurular_Takip_Tablosu.csv');
  updateApplicationStatus(csvPath, entry.company, entry.position, entry.status || 'Applied');
  return { csvPath };
}

module.exports = {
  parseTrackingCsv,
  updateApplicationStatus,
  updateApplicationNotes,
  addApplicationEntry,
  HEADERS,
  splitCsvLine
};
