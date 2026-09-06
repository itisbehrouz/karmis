const test = require('node:test');
const assert = require('node:assert');
const { determineNextBestMove, generateActionPlan } = require('../lib/decision');

test('Next Best Move - Prioritizes Active Interviews', () => {
  const candidate = { targetCareerState: { targetRole: 'Head of Engineering' } };
  const applications = [
    { company: 'Stripe', position: 'Head of Engineering', status: 'INTERVIEW' }
  ];

  const move = determineNextBestMove(candidate, applications);
  assert.strictEqual(move.actionType, 'prepare_for_interview');
  assert.ok(move.action.includes('Stripe'));
});

test('Next Best Move - Triggers Stop Applying on Low Conversion Drop-Off', () => {
  const candidate = { targetCareerState: { targetRole: 'Director' } };
  const applications = [
    { status: 'Applied' }, { status: 'Applied' }, { status: 'Applied' },
    { status: 'Applied' }, { status: 'Applied' }, { status: 'Applied' },
    { status: 'Applied' }, { status: 'Applied' }, { status: 'Applied' }
  ];

  const move = determineNextBestMove(candidate, applications);
  assert.strictEqual(move.actionType, 'stop_applying');
  assert.ok(move.why.includes('diminishing returns') || move.why.includes('bottleneck'));
});

test('Action Plan Generator - Generates 30/60/90 Day Execution Plan', () => {
  const plan = generateActionPlan();
  assert.ok(plan.thirtyDay);
  assert.ok(plan.sixtyDay);
  assert.ok(plan.ninetyDay);

  assert.strictEqual(typeof plan.thirtyDay.objective, 'string');
  assert.ok(Array.isArray(plan.thirtyDay.actions));
  assert.ok(plan.thirtyDay.actions.length >= 2);
  assert.ok(plan.thirtyDay.evidenceProduced);
  assert.ok(plan.thirtyDay.successMetric);
});

test('Next Best Move - Domain Neutrality for Non-Tech Profiles', () => {
  // An accountant targeting Finance Director with accounting target skills
  const accountantCandidate = {
    targetCareerState: {
      targetRole: 'Finance Director',
      targetLevel: 'DIRECTOR',
      targetSkills: [
        { name: 'Statutory Financial Audit & IFRS', targetLevel: 5, importance: 'critical' },
        { name: 'Corporate Tax Strategy', targetLevel: 4, importance: 'high' }
      ]
    },
    skills: [
      { name: 'Statutory Financial Audit & IFRS', level: 3, confidence: 0.9 },
      { name: 'Corporate Tax Strategy', level: 4, confidence: 0.9 }
    ],
    evidence: [
      { title: 'Led Annual Financial Audit', metric: 'Clean audit report with 0 deficiencies' },
      { title: 'Tax Strategy Optimization', metric: 'Saved 1.2M TL in corporate tax' },
      { title: 'ERP Migration', metric: 'Closed monthly books 4 days faster' }
    ]
  };

  const move = determineNextBestMove(accountantCandidate, []);
  assert.strictEqual(move.actionType, 'build_project');
  // It should focus on the accounting gap, NEVER mention hardcoded Data Strategy or AI
  assert.ok(move.bottleneck.includes('Statutory Financial Audit & IFRS'));
  assert.ok(!move.bottleneck.includes('Data Strategy'));
  assert.ok(!move.why.includes('AI & Automation'));
});

