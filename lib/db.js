/**
 * KARMİS V2 Database Manager
 * SQLite persistence layer using better-sqlite3 with automated schema migrations.
 */

const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');
const { parseTrackingCsv, HEADERS, cleanString } = require('./tracker');

let dbInstance = null;

function getDbPath() {
  if (process.env.KARMIS_DB_PATH) {
    return process.env.KARMIS_DB_PATH;
  }
  const dataDir = path.join(__dirname, '..', 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  return path.join(dataDir, 'karmis.db');
}

function initDb(customPath = null) {
  const dbPath = customPath || getDbPath();
  const db = new Database(dbPath);

  // Enable foreign keys and WAL mode for better concurrency
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  runMigrations(db);
  seedFromCsvIfEmpty(db);

  dbInstance = db;
  return db;
}

function getDb() {
  if (!dbInstance) {
    initDb();
  }
  return dbInstance;
}

function runMigrations(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version INTEGER PRIMARY KEY,
      applied_at TEXT NOT NULL
    );
  `);

  const migrationsDir = path.join(__dirname, 'migrations');
  if (!fs.existsSync(migrationsDir)) return;

  const migrationFiles = fs.readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql'))
    .sort();

  const appliedVersions = new Set(
    db.prepare('SELECT version FROM schema_migrations').all().map(r => r.version)
  );

  for (const file of migrationFiles) {
    const match = file.match(/^(\d+)_/);
    if (!match) continue;
    const version = parseInt(match[1], 10);

    if (!appliedVersions.has(version)) {
      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
      db.transaction(() => {
        db.exec(sql);
        db.prepare('INSERT INTO schema_migrations (version, applied_at) VALUES (?, ?)').run(
          version,
          new Date().toISOString()
        );
      })();
    }
  }
}

function seedFromCsvIfEmpty(db) {
  const countRow = db.prepare('SELECT COUNT(*) as count FROM applications').get();
  if (countRow && countRow.count > 0) return;

  const csvPath = path.join(__dirname, '..', 'data', 'Aktif_Basvurular_Takip_Tablosu.csv');
  if (!fs.existsSync(csvPath)) return;

  const rows = parseTrackingCsv(csvPath);
  if (rows.length === 0) return;

  const insertStmt = db.prepare(`
    INSERT INTO applications (
      id, company, position, score, link, date, source, status, contact, last_contact_date, notes, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  db.transaction(() => {
    const now = new Date().toISOString();
    for (const r of rows) {
      const id = 'app_' + Math.random().toString(36).substring(2, 10);
      const scoreNum = parseFloat((r.score || '').replace(/[^\d.]/g, '')) || 0;
      insertStmt.run(
        id,
        r.company || 'Unknown',
        r.position || 'Unknown',
        scoreNum,
        r.link || '',
        r.date || now.split('T')[0],
        r.source || 'Portal',
        r.status || 'SAVED',
        r.contact || '',
        r.lastContactDate || '',
        r.notes || '',
        now,
        now
      );
    }
  })();
}

function exportApplicationsToCsv(customCsvPath = null) {
  const db = getDb();
  const apps = db.prepare('SELECT * FROM applications ORDER BY date DESC, company ASC').all();

  const configured = getSetting('csv_path');
  const targetPath = customCsvPath || configured || path.join(__dirname, '..', 'data', 'Aktif_Basvurular_Takip_Tablosu.csv');
  const dir = path.dirname(targetPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const lines = [HEADERS.join(',')];
  for (const a of apps) {
    const compStr = `**${cleanString(a.company)}**`;
    const posStr = cleanString(a.position).includes(',') ? `"${cleanString(a.position)}"` : cleanString(a.position);
    const scoreStr = a.score ? `%${Math.round(a.score)}` : '%0';
    const notesStr = cleanString(a.notes).includes(',') ? `"${cleanString(a.notes)}"` : cleanString(a.notes);

    const row = [
      compStr,
      posStr,
      scoreStr,
      cleanString(a.link),
      cleanString(a.date),
      cleanString(a.source),
      cleanString(a.status),
      cleanString(a.contact),
      cleanString(a.last_contact_date),
      notesStr
    ].join(',');

    lines.push(row);
  }

  fs.writeFileSync(targetPath, lines.join('\n'), 'utf8');
  return targetPath;
}

function getSetting(key, defaultValue = null) {
  const db = getDb();
  const row = db.prepare('SELECT value FROM settings WHERE key = ?').get(key);
  return row ? row.value : defaultValue;
}

function setSetting(key, value) {
  const db = getDb();
  const now = new Date().toISOString();
  db.prepare(`
    INSERT OR REPLACE INTO settings (key, value, updated_at)
    VALUES (?, ?, ?)
  `).run(key, String(value), now);
  return { key, value };
}

function getAllSettings() {
  const db = getDb();
  const rows = db.prepare('SELECT key, value FROM settings').all();
  const res = {};
  for (const r of rows) {
    res[r.key] = r.value;
  }
  return res;
}

function closeDb() {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
  }
}

module.exports = {
  initDb,
  getDb,
  getDbPath,
  getSetting,
  setSetting,
  getAllSettings,
  closeDb,
  runMigrations,
  exportApplicationsToCsv
};
