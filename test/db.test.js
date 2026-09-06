const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const { initDb, closeDb, exportApplicationsToCsv } = require('../lib/db');

test('SQLite Database - Migration & Schema Creation', () => {
  const db = initDb(':memory:');

  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all().map(t => t.name);

  assert.ok(tables.includes('schema_migrations'));
  assert.ok(tables.includes('users'));
  assert.ok(tables.includes('career_profiles'));
  assert.ok(tables.includes('career_targets'));
  assert.ok(tables.includes('skills'));
  assert.ok(tables.includes('evidence_items'));
  assert.ok(tables.includes('jobs'));
  assert.ok(tables.includes('job_evaluations'));
  assert.ok(tables.includes('applications'));
  assert.ok(tables.includes('career_scenarios'));
  assert.ok(tables.includes('action_plans'));
  assert.ok(tables.includes('experiences'));
  assert.ok(tables.includes('achievements'));

  const appCols = db.prepare("PRAGMA table_info(applications)").all().map(c => c.name);
  assert.ok(appCols.includes('decision'));
  assert.ok(appCols.includes('outcome'));
  assert.ok(appCols.includes('follow_up'));
  assert.ok(appCols.includes('interview'));

  const targetCols = db.prepare("PRAGMA table_info(career_targets)").all().map(c => c.name);
  assert.ok(targetCols.includes('target_skills'));

  closeDb();
});

test('SQLite Database - CSV Sync Compatibility (ABSG / ABDG)', () => {
  const db = initDb(':memory:');
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO applications (id, company, position, score, link, date, source, status, contact, last_contact_date, notes, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run('app_sync_1', 'Ticimax', 'Director', 92, 'https://example.com', '2026-09-06', 'Portal', 'Applied', 'IK Team', '2026-09-06', 'High fit', now, now);

  const tmpCsv = path.join(__dirname, 'temp_sync_test.csv');
  exportApplicationsToCsv(tmpCsv);

  assert.ok(fs.existsSync(tmpCsv));
  const content = fs.readFileSync(tmpCsv, 'utf8');
  assert.ok(content.includes('**Ticimax**'));
  assert.ok(content.includes('%92'));
  assert.ok(content.includes('Şirket Adı,Pozisyon,Uyum Oranı'));

  fs.unlinkSync(tmpCsv);
  closeDb();
});

test('SQLite Database - Settings Persistence & Retrieval', () => {
  const db = initDb(':memory:');
  const { getSetting, setSetting, getAllSettings } = require('../lib/db');

  assert.strictEqual(getSetting('ai_provider', 'local'), 'local');

  setSetting('ai_provider', 'openai');
  assert.strictEqual(getSetting('ai_provider'), 'openai');

  setSetting('privacy_mode', 'local_only');
  const all = getAllSettings();
  assert.strictEqual(all.ai_provider, 'openai');
  assert.strictEqual(all.privacy_mode, 'local_only');

  // Verify exportApplicationsToCsv uses configured csv_path automatically
  const customSync = path.join(__dirname, 'temp_setting_sync.csv');
  setSetting('csv_path', customSync);
  const resPath = exportApplicationsToCsv();
  assert.strictEqual(resPath, customSync);
  assert.ok(fs.existsSync(customSync));
  fs.unlinkSync(customSync);

  closeDb();
});

