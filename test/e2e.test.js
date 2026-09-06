const test = require('node:test');
const assert = require('node:assert');
const { initDb, closeDb } = require('../lib/db');
const { saveCareerDna, getCareerDna } = require('../lib/dna');
const { analyzeSkillGaps, createSkill } = require('../lib/skills');
const { saveEvidenceItem, getEvidenceWallet, matchRequirementsToEvidence } = require('../lib/evidence');
const { determineNextBestMove, generateActionPlan } = require('../lib/decision');
const { evaluateJobPosting } = require('../lib/evaluator');
const { calculateCareerAnalytics } = require('../lib/analytics');
const { DECISIONS, SKILL_RATINGS } = require('../lib/constants');

test('E2E Realistic Career Decision Loop: Junior Product Analyst -> Senior Product Manager', async () => {
  // Use in-memory SQLite database
  const db = initDb(':memory:');
  db.prepare('DELETE FROM applications').run();
  const userId = 'usr_e2e_analyst';

  // 1. Create Career DNA
  const initialDna = {
    identity: {
      name: 'Elena Rostova',
      title: 'Junior Product Analyst',
      email: 'elena@example.com',
      location: 'Berlin / Hybrid'
    },
    currentRole: 'Junior Product Analyst',
    currentLevel: 'JUNIOR',
    yearsOfExperience: 2,
    industry: 'Technology & SaaS',
    skills: [
      createSkill({ name: 'SQL', category: 'technical', level: 4, yearsExperience: 2, confidence: 0.95 }),
      createSkill({ name: 'Analytics', category: 'analytical', level: 4, yearsExperience: 2, confidence: 0.9 }),
      createSkill({ name: 'Product Discovery', category: 'domain', level: 3, yearsExperience: 1.5, confidence: 0.8 }),
      createSkill({ name: 'Communication', category: 'communication', level: 3, yearsExperience: 2, confidence: 0.85 }),
      // Weak / Missing competencies
      createSkill({ name: 'Leadership', category: 'leadership', level: 1, yearsExperience: 0.5, confidence: 0.6 }),
      createSkill({ name: 'Product Strategy', category: 'business', level: 1, yearsExperience: 0.5, confidence: 0.5 })
    ],
    financialGoals: {
      currentSalary: 2000,
      targetSalary: 4000,
      currency: 'EUR'
    },
    targetCareerState: {
      targetRole: 'Senior Product Manager',
      targetLevel: 'SENIOR',
      targetIndustry: 'Technology & SaaS',
      targetGeography: 'Berlin / Remote',
      targetSalary: 4000,
      targetWorkingModel: 'hybrid',
      targetTimelineMonths: 24
    }
  };

  // 2. Define Target & Save DNA
  const savedDna = saveCareerDna(initialDna, userId);
  assert.strictEqual(savedDna.currentLevel, 'JUNIOR');
  assert.strictEqual(savedDna.targetCareerState.targetRole, 'Senior Product Manager');
  assert.strictEqual(savedDna.financialGoals.targetSalary, 4000);

  // 3. Calculate Gaps
  const targetReqs = [
    { name: 'SQL', targetLevel: 4, importance: 'high' },
    { name: 'Analytics', targetLevel: 4, importance: 'high' },
    { name: 'Product Discovery', targetLevel: 4, importance: 'high' },
    { name: 'Leadership', targetLevel: 4, importance: 'critical' },
    { name: 'Product Strategy', targetLevel: 4, importance: 'critical' },
    { name: 'Stakeholder Management', targetLevel: 4, importance: 'high' }
  ];

  const gapAnalysis = analyzeSkillGaps(savedDna.skills, targetReqs);
  assert.ok(gapAnalysis.overallSkillScore < 70, 'Junior should have significant gap against Senior PM');
  assert.ok(gapAnalysis.gaps.some(g => g.skillName === 'Leadership' && g.gapSize >= 3));
  assert.ok(gapAnalysis.gaps.some(g => g.skillName === 'Stakeholder Management' && g.rating === SKILL_RATINGS.MISSING));

  // 4. Create Actions & Next Best Move
  const nextMove = determineNextBestMove(savedDna, []);
  assert.ok(nextMove.action, 'Engine must propose a concrete next move');
  assert.ok(nextMove.why, 'Engine must explain the root cause bottleneck');

  // 5. Analyze a Job Posting
  const seniorPmJob = {
    company: 'Fintech Unicorn SE',
    title: 'Senior Product Manager',
    seniorityLevel: 'SENIOR',
    salaryOffered: 4200,
    requiredSkills: [
      { name: 'Product Discovery', targetLevel: 4, importance: 'high' },
      { name: 'Leadership', targetLevel: 4, importance: 'critical' },
      { name: 'Product Strategy', targetLevel: 4, importance: 'critical' }
    ]
  };

  const evaluation = evaluateJobPosting(seniorPmJob, savedDna);

  // 6. Produce APPLY/PASS/MAYBE
  assert.ok([DECISIONS.PASS, DECISIONS.MAYBE].includes(evaluation.decisionCode), 'Candidate with 2 years experience and low leadership should not get instant unqualified APPLY for Senior PM');
  assert.ok(evaluation.dimensions.seniorityFit < 80);

  // 7. Store Evidence & Identify Missing Evidence
  saveEvidenceItem({
    title: 'Product Funnel Analytics Overhaul',
    description: 'Rebuilt SQL queries and conversion funnels, increasing sign-up completion by 22%',
    metric: '+22% conversion lift',
    skills: ['SQL', 'Analytics', 'Product Discovery'],
    strength: 'STRONG'
  }, userId);

  const evidenceWallet = getEvidenceWallet(userId);
  assert.strictEqual(evidenceWallet.length, 1);

  const evidenceMatch = matchRequirementsToEvidence(
    ['SQL', 'Leadership', 'Stakeholder Management'],
    savedDna.skills,
    evidenceWallet
  );

  assert.strictEqual(evidenceMatch.matchedCount, 1); // SQL
  assert.strictEqual(evidenceMatch.missingEvidenceCount, 1); // Leadership (has skill level 1, but no evidence)
  assert.strictEqual(evidenceMatch.missingSkillsCount, 1); // Stakeholder Management (completely absent)

  // 8. Create Action Plan
  const actionPlan = generateActionPlan(savedDna);
  assert.ok(actionPlan.thirtyDay.actions.length > 0);
  assert.ok(actionPlan.sixtyDay.actions.length > 0);
  assert.ok(actionPlan.ninetyDay.actions.length > 0);

  // 9. Track Application
  const now = new Date().toISOString();
  db.prepare(`
    INSERT INTO applications (
      id, company, position, score, link, date, source, status, contact, last_contact_date, notes, salary_offered, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    'app_e2e_1', 'Fintech Unicorn SE', 'Senior Product Manager', evaluation.score,
    'https://fintech.example/jobs/1', '2026-09-01', 'Direct', 'Applied', 'Recruiter John', '2026-09-01', 'Initial stretch application', 4200, now, now
  );

  // 10. Record Outcome
  db.prepare(`
    UPDATE applications SET
      status = 'REJECTED', notes = 'Rejected: Needs demonstrated 5+ years leadership and strategy experience', updated_at = ?
    WHERE id = 'app_e2e_1'
  `).run(now);

  const updatedApp = db.prepare('SELECT * FROM applications WHERE id = ?').get('app_e2e_1');
  assert.strictEqual(updatedApp.status, 'REJECTED');

  // 11. Update Analytics
  const analytics = calculateCareerAnalytics();
  assert.strictEqual(analytics.totalApplications, 1);
  assert.strictEqual(analytics.rejectedCount, 1);
  assert.strictEqual(analytics.offerRate, 0);

  closeDb();
});
