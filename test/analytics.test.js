const test = require('node:test');
const assert = require('node:assert');
const { calculateCareerAnalytics } = require('../lib/analytics');
const { initDb, closeDb } = require('../lib/db');

test('Career Analytics - Computes Rates and Empirical Funnels', () => {
  // Use in-memory DB for test isolation
  const db = initDb(':memory:');
  db.prepare('DELETE FROM applications').run();

  const insertApp = db.prepare(`
    INSERT INTO applications (
      id, company, position, score, date, status, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const now = new Date().toISOString();
  insertApp.run('app_1', 'Google', 'Director', 90, '2026-09-01', 'Applied', now, now);
  insertApp.run('app_2', 'Apple', 'Director', 85, '2026-09-02', 'INTERVIEW', now, now);
  insertApp.run('app_3', 'Meta', 'Director', 92, '2026-09-03', 'OFFER', now, now);
  insertApp.run('app_4', 'Amazon', 'Director', 75, '2026-09-04', 'REJECTED', now, now);

  const stats = calculateCareerAnalytics();

  assert.strictEqual(stats.totalApplications, 4);
  assert.strictEqual(stats.interviewCount, 1);
  assert.strictEqual(stats.offerCount, 1);
  assert.strictEqual(stats.rejectedCount, 1);
  assert.strictEqual(stats.interviewRate, 25);
  assert.strictEqual(stats.offerRate, 25);
  assert.strictEqual(stats.averageScore, 86);

  // V2 Analytics additions: averageRisk, segment rankings, learning loop
  assert.strictEqual(typeof stats.averageRisk, 'number');
  assert.ok(Array.isArray(stats.bestPerformingRoleTypes));
  assert.ok(Array.isArray(stats.bestPerformingIndustries));
  assert.ok(Array.isArray(stats.bestPerformingSeniority));

  assert.ok(stats.bestPerformingSeniority.length > 0);
  const execSen = stats.bestPerformingSeniority.find(s => s.segment.includes('Executive'));
  assert.ok(execSen);
  assert.strictEqual(execSen.count, 4);

  assert.ok(stats.learningLoop);
  assert.strictEqual(stats.learningLoop.analyzedOutcomes, 3);
  assert.strictEqual(typeof stats.learningLoop.averagePredictedProbability, 'number');
  assert.strictEqual(typeof stats.learningLoop.calibrationDelta, 'number');
  assert.ok(stats.learningLoop.calibrationInsight.length > 10);

  closeDb();
});
