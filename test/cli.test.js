const test = require('node:test');
const assert = require('node:assert');
const { execSync } = require('child_process');
const path = require('path');

const cliPath = path.join(__dirname, '..', 'bin', 'karmis.js');

function runCli(args) {
  return execSync(`node "${cliPath}" ${args}`, {
    cwd: path.join(__dirname, '..'),
    encoding: 'utf8'
  });
}

test('CLI - help command', () => {
  const out = runCli('help');
  assert.ok(out.includes('KARMİS V2'));
  assert.ok(out.includes('Core Career Commands:'));
  assert.ok(out.includes('Legacy Commands (Fully Preserved):'));
});

test('CLI - init and profile commands', () => {
  const initOut = runCli('init');
  assert.ok(initOut.includes('Database and Career DNA initialized'));

  const profOut = runCli('profile show');
  assert.ok(profOut.includes('KARMİS CAREER DNA'));
});

test('CLI - career command', () => {
  const out = runCli('career');
  assert.ok(out.includes('CAREER BASELINE VS TARGET STATE'));
});

test('CLI - gap command', () => {
  const out = runCli('gap');
  assert.ok(out.includes('SKILL GAP ANALYSIS'));
});

test('CLI - evidence command', () => {
  const out = runCli('evidence list');
  assert.ok(out.includes('EVIDENCE WALLET'));
});

test('CLI - next command', () => {
  const out = runCli('next');
  assert.ok(out.includes('NEXT BEST MOVE'));
  assert.ok(out.includes('ACTION:'));
  assert.ok(out.includes('WHY:'));
});

test('CLI - simulate command', () => {
  const out = runCli('simulate');
  assert.ok(out.includes('CAREER SCENARIO SIMULATOR'));
  assert.ok(out.includes('STAY'));
  assert.ok(out.includes('START_BUSINESS'));
});

test('CLI - analyze command', () => {
  const out = runCli('analyze "The Coca-Cola Company"');
  assert.ok(out.includes('JOB DECISION ANALYSIS: The Coca-Cola Company'));
  assert.ok(out.includes('DIMENSION SCORES (0-100):'));
  assert.ok(out.includes('DECISION:'));
});

test('CLI - analyze command with text file and URL inputs', () => {
  const fs = require('fs');
  const tmpJobFile = path.join(__dirname, 'temp_job_posting.txt');
  fs.writeFileSync(tmpJobFile, 'Company: Acme Logistics\nRole: Operations Manager\nRequirements: 5+ years operations, Lean Six Sigma, SQL reporting', 'utf8');

  try {
    const fileOut = runCli(`analyze "${tmpJobFile}"`);
    assert.ok(fileOut.includes('JOB DECISION ANALYSIS: Acme Logistics - Operations Manager'));
    assert.ok(fileOut.includes('DECISION:'));

    const urlOut = runCli('analyze "https://careers.google.com/jobs/results/12345" "Staff Engineer"');
    assert.ok(urlOut.includes('JOB DECISION ANALYSIS: Careers - Staff Engineer'));
    assert.ok(urlOut.includes('DECISION:'));
  } finally {
    if (fs.existsSync(tmpJobFile)) {
      fs.unlinkSync(tmpJobFile);
    }
  }
});

test('CLI - legacy eval and interview commands', () => {
  const evalOut = runCli('eval');
  assert.ok(evalOut.includes('"jobTitle"'));

  const intOut = runCli('interview "Acme Corp" "Tech Lead"');
  assert.ok(intOut.includes('KARMİS Mülakat Hazırlık Simülasyonu'));
});

test('CLI - applications, analytics, and job report commands', () => {
  const appsOut = runCli('applications');
  assert.ok(appsOut.includes('APPLICATION TRACKER'));

  const syncOut = runCli('applications sync');
  assert.ok(syncOut.includes('Applications synchronized with CSV'));

  const anOut = runCli('analytics');
  assert.ok(anOut.includes('CAREER ANALYTICS & LEARNING LOOP'));
  assert.ok(anOut.includes('Interview Rate:'));

  const jobOut = runCli('job "The Coca-Cola Company"');
  assert.ok(jobOut.includes('# KARMİS İlan Değerlendirme Raporu'));
});


