const test = require('node:test');
const assert = require('node:assert');
const http = require('http');
const { server } = require('../lib/server');
const { initDb, closeDb } = require('../lib/db');

function makeRequest(path, options = {}, postData = null) {
  return new Promise((resolve, reject) => {
    const reqOptions = {
      hostname: '127.0.0.1',
      port: 3099,
      path,
      method: options.method || 'GET',
      headers: options.headers || {}
    };

    const req = http.request(reqOptions, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        let json = null;
        try {
          json = JSON.parse(data);
        } catch {
          // not json
        }
        resolve({ statusCode: res.statusCode, headers: res.headers, body: data, json });
      });
    });

    req.on('error', reject);

    if (postData) {
      req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    }
    req.end();
  });
}

test('HTTP Server & API Endpoints', async (t) => {
  initDb(':memory:');

  await new Promise(resolve => server.listen(3099, '127.0.0.1', resolve));

  await t.test('GET / - serves dashboard HTML with required views and icons', async () => {
    const res = await makeRequest('/');
    assert.strictEqual(res.statusCode, 200);
    assert.ok(res.body.includes('CAREER HEALTH'));
    assert.ok(res.body.includes('WHERE AM I?'));
    assert.ok(res.body.includes('WHERE AM I GOING?'));
    assert.ok(res.body.includes('WHAT IS BLOCKING ME?'));
    assert.ok(res.body.includes('WHAT SHOULD I DO NEXT?'));
    assert.ok(res.body.includes('id="view-settings"'));
    assert.ok(res.body.includes('switchTab(\'settings\''));
  });

  await t.test('GET /api/settings - returns local configuration and privacy status', async () => {
    const res = await makeRequest('/api/settings');
    assert.strictEqual(res.statusCode, 200);
    assert.ok(res.json);
    assert.ok(res.json.aiProvider);
    assert.ok(res.json.dbPath);
    assert.strictEqual(res.json.privacyMode, 'local_only');
    assert.ok(res.json.telemetry.includes('disabled'));
  });

  await t.test('POST /api/settings - updates local preferences', async () => {
    const updateRes = await makeRequest('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { aiProvider: 'openai', csvPath: '/tmp/test_tracker.csv' });

    assert.strictEqual(updateRes.statusCode, 200);
    assert.strictEqual(updateRes.json.success, true);
    assert.strictEqual(updateRes.json.settings.ai_provider, 'openai');
    assert.strictEqual(updateRes.json.settings.csv_path, '/tmp/test_tracker.csv');

    // Verify GET reflects update
    const getRes = await makeRequest('/api/settings');
    assert.strictEqual(getRes.json.aiProvider, 'openai');
    assert.strictEqual(getRes.json.csvPath, '/tmp/test_tracker.csv');
  });

  await t.test('POST /api/settings - rejects invalid provider or unwritable path', async () => {
    const badProviderRes = await makeRequest('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { aiProvider: 'unsupported_engine' });
    assert.strictEqual(badProviderRes.statusCode, 400);
    assert.ok(badProviderRes.json.error.includes('Invalid AI provider'));

    const badPathRes = await makeRequest('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { csvPath: '/proc/invalid_forbidden_dir/track.csv' });
    assert.strictEqual(badPathRes.statusCode, 400);
    assert.ok(badPathRes.json.error.includes('CSV path directory is not accessible'));
  });

  await t.test('POST /api/sync-csv - exports to configured CSV path and handles sync', async () => {
    const tmpSync = '/tmp/karmis_server_sync_test.csv';
    await makeRequest('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { csvPath: tmpSync });

    const syncRes = await makeRequest('/api/sync-csv', { method: 'POST' });
    assert.strictEqual(syncRes.statusCode, 200);
    assert.strictEqual(syncRes.json.success, true);
    assert.strictEqual(syncRes.json.csvPath, tmpSync);

    const fs = require('fs');
    assert.ok(fs.existsSync(tmpSync));
    const content = fs.readFileSync(tmpSync, 'utf8');
    assert.ok(content.includes('Şirket Adı,Pozisyon,Uyum Oranı'));
    fs.unlinkSync(tmpSync);
  });

  await t.test('POST /api/applications/update - synchronizes status to SQLite and CSV', async () => {
    // Add an application first
    await makeRequest('/api/applications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { company: 'TestCorp', position: 'Lead Analyst', status: 'APPLIED', score: 88 });

    // Update status
    const updateRes = await makeRequest('/api/applications/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { company: 'TestCorp', position: 'Lead Analyst', newStatus: 'INTERVIEW' });
    assert.strictEqual(updateRes.statusCode, 200);
    assert.strictEqual(updateRes.json.success, true);

    // Verify GET /api/applications returns the updated status
    const appsRes = await makeRequest('/api/applications');
    assert.strictEqual(appsRes.statusCode, 200);
    const updated = appsRes.json.find(a => a.company === 'TestCorp' && a.position === 'Lead Analyst');
    assert.ok(updated);
    assert.strictEqual(updated.status, 'INTERVIEW');
  });

  await t.test('POST /api/analyze - evaluates job across all 11 dimensions', async () => {
    const res = await makeRequest('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { company: 'Acme Global', title: 'Director of Analytics', rawDescription: 'Lead enterprise data team' });

    assert.strictEqual(res.statusCode, 200);
    assert.ok(res.json.dimensions);
    const d = res.json.dimensions;
    assert.ok(typeof d.skillFit === 'number');
    assert.ok(typeof d.experienceFit === 'number');
    assert.ok(typeof d.seniorityFit === 'number');
    assert.ok(typeof d.salaryFit === 'number');
    assert.ok(typeof d.careerUpside === 'number');
    assert.ok(typeof d.locationFit === 'number');
    assert.ok(typeof d.workModelFit === 'number');
    assert.ok(typeof d.industryFit === 'number');
    assert.ok(typeof d.successProbability === 'number');
    assert.ok(typeof d.risk === 'number');
    assert.ok(typeof d.opportunityCost === 'number');
  });

  await t.test('GET /api/reports - returns styled HTML when text/html requested', async () => {
    const res = await makeRequest('/api/reports?company=AcmeCorp&position=Director', {
      headers: { 'Accept': 'text/html' }
    });
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.headers['content-type'], 'text/html; charset=utf-8');
    assert.ok(res.body.includes('<!DOCTYPE html>'));
    assert.ok(res.body.includes('KARMİS İlan Raporu'));
  });

  await t.test('GET /api/dna, /api/gaps, /api/next, /api/simulate', async () => {
    const dnaRes = await makeRequest('/api/dna');
    assert.strictEqual(dnaRes.statusCode, 200);
    assert.ok(dnaRes.json.currentLevel);

    const gapsRes = await makeRequest('/api/gaps');
    assert.strictEqual(gapsRes.statusCode, 200);
    assert.ok(typeof gapsRes.json.overallSkillScore === 'number');

    const nextRes = await makeRequest('/api/next');
    assert.strictEqual(nextRes.statusCode, 200);
    assert.ok(nextRes.json.move);
    assert.ok(nextRes.json.plan);

    const simRes = await makeRequest('/api/simulate');
    assert.strictEqual(simRes.statusCode, 200);
    assert.ok(simRes.json.sim.scenarios.length > 0);
  });

  await new Promise(resolve => server.close(resolve));
  closeDb();
});
