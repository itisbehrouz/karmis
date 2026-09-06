const test = require('node:test');
const assert = require('node:assert');
const { evaluateRisks, RISK_RULES } = require('../lib/risk');

test('Risk Engine - Detects 17 distinct risk types', () => {
  assert.strictEqual(RISK_RULES.length, 17);
});

test('Risk Engine - Downleveling Detection', () => {
  const candidate = { currentLevel: 'DIRECTOR', yearsOfExperience: 12 };
  const job = { title: 'Junior Data Analyst', seniority: 'Junior', seniorityLevel: 'JUNIOR' };

  const risk = evaluateRisks(job, candidate);
  assert.ok(risk.detectedRisks.some(r => r.id === 'downleveling'));
  assert.ok(risk.riskScore >= 25);
});

test('Risk Engine - Underpayment Detection', () => {
  const candidate = { constraints: { minSalary: 100000 }, financialGoals: { currentSalary: 120000 } };
  const job = { salaryOffered: 70000 };

  const risk = evaluateRisks(job, candidate);
  assert.ok(risk.detectedRisks.some(r => r.id === 'underpayment'));
});

test('Risk Engine - Cold Calling & Heavy Quota Detection', () => {
  const job = { rawDescription: 'Kapı kapı dolaşarak cold call ve hunting quota ile telemarketing yapacak' };
  const risk = evaluateRisks(job, {});
  assert.ok(risk.detectedRisks.some(r => r.id === 'cold_call_quotas'));
});

test('Risk Engine - Commission-Only Fatal Risk Detection', () => {
  const job = { rawDescription: 'Sabit maaş yoktur, gelir tamamen prim ve komisyon usulü olacaktır.' };
  const risk = evaluateRisks(job, {});
  assert.ok(risk.hasFatalRisk);
  assert.ok(risk.detectedRisks.some(r => r.id === 'commission_only'));
});

test('Risk Engine - Excessive Bureaucracy Detection', () => {
  const job = { rawDescription: 'TCMB ve BDDK regülasyonları resmi evrak takibi ve mevzuat onayı' };
  const risk = evaluateRisks(job, {});
  assert.ok(risk.detectedRisks.some(r => r.id === 'excessive_bureaucracy'));
});

test('Risk Engine - Edge Cases (Empty job description, clean role)', () => {
  // Edge Case 1: Empty text
  const cleanRisk1 = evaluateRisks({}, {});
  assert.strictEqual(cleanRisk1.riskScore, 0);
  assert.strictEqual(cleanRisk1.riskCount, 0);

  // Edge Case 2: Healthy, high-level role
  const candidate = { currentLevel: 'SENIOR', yearsOfExperience: 6 };
  const goodJob = { title: 'Lead Architect', seniority: 'Lead', seniorityLevel: 'LEAD', location: 'İstanbul (Hibrit)' };
  const cleanRisk2 = evaluateRisks(goodJob, candidate);
  assert.strictEqual(cleanRisk2.riskScore, 0);
});
