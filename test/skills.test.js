const test = require('node:test');
const assert = require('node:assert');
const { normalizeSkillName, classifySkillCategory, createSkill, analyzeSkillGaps } = require('../lib/skills');
const { SKILL_RATINGS } = require('../lib/constants');

test('Skill Taxonomy - Normalization and Classification', () => {
  assert.strictEqual(normalizeSkillName('  powerbi  '), 'power bi');
  assert.strictEqual(normalizeSkillName('JS'), 'javascript');
  assert.strictEqual(normalizeSkillName('Agile'), 'agile & scrum leadership');

  assert.strictEqual(classifySkillCategory('Python'), 'technical');
  assert.strictEqual(classifySkillCategory('Executive Communication'), 'communication');
  assert.strictEqual(classifySkillCategory('BPMN Process Modeling'), 'operational');
  assert.strictEqual(classifySkillCategory('B2B Sales Quota'), 'sales');
  assert.strictEqual(classifySkillCategory('Team Leadership'), 'leadership');
});

test('Skill Gap Engine - Rating Evaluation', () => {
  const currentSkills = [
    createSkill({ name: 'SQL', level: 4, confidence: 0.9 }),
    createSkill({ name: 'Power BI', level: 3, confidence: 0.85 }),
    createSkill({ name: 'Data Strategy', level: 2, confidence: 0.8 }),
    createSkill({ name: 'Uncertain Skill', level: 3, confidence: 0.2 })
  ];

  const targetReqs = [
    { name: 'SQL', targetLevel: 4, importance: 'critical' },
    { name: 'Power BI', targetLevel: 4, importance: 'high' },
    { name: 'Data Strategy', targetLevel: 4, importance: 'high' },
    { name: 'Leadership & Team Management', targetLevel: 4, importance: 'critical' },
    { name: 'Uncertain Skill', targetLevel: 3, importance: 'medium' }
  ];

  const result = analyzeSkillGaps(currentSkills, targetReqs);

  assert.strictEqual(result.totalRequired, 5);

  const sqlGap = result.gaps.find(g => g.skillName === 'SQL');
  assert.strictEqual(sqlGap.rating, SKILL_RATINGS.STRONG);
  assert.strictEqual(sqlGap.gapSize, 0);

  const biGap = result.gaps.find(g => g.skillName === 'Power BI');
  assert.strictEqual(biGap.rating, SKILL_RATINGS.ADEQUATE);
  assert.strictEqual(biGap.gapSize, 1);

  const stratGap = result.gaps.find(g => g.skillName === 'Data Strategy');
  assert.strictEqual(stratGap.rating, SKILL_RATINGS.DEVELOPING);
  assert.strictEqual(stratGap.gapSize, 2);

  const leadGap = result.gaps.find(g => g.skillName === 'Leadership & Team Management');
  assert.strictEqual(leadGap.rating, SKILL_RATINGS.MISSING);
  assert.strictEqual(leadGap.gapSize, 4);

  const uncertGap = result.gaps.find(g => g.skillName === 'Uncertain Skill');
  assert.strictEqual(uncertGap.rating, SKILL_RATINGS.UNKNOWN);
});

test('Skill Gap Engine - Edge Cases (No skills, empty requirements)', () => {
  // Edge Case 1: Candidate with zero skills
  const zeroSkills = [];
  const reqs = [{ name: 'JavaScript', targetLevel: 3 }];
  const emptyRes = analyzeSkillGaps(zeroSkills, reqs);
  assert.strictEqual(emptyRes.overallSkillScore, 0);
  assert.strictEqual(emptyRes.missingCount, 1);

  // Edge Case 2: Zero target requirements
  const normalSkills = [createSkill({ name: 'Python', level: 4 })];
  const noReqsRes = analyzeSkillGaps(normalSkills, []);
  assert.strictEqual(noReqsRes.overallSkillScore, 100);
  assert.strictEqual(noReqsRes.totalRequired, 0);
});

test('Skill Taxonomy - Management Category and False Positive Prevention', () => {
  // 1. Management Category
  assert.strictEqual(classifySkillCategory('Project Management'), 'management');
  assert.strictEqual(classifySkillCategory('Risk Management'), 'management');
  assert.strictEqual(classifySkillCategory('Vendor Management'), 'management');
  assert.strictEqual(classifySkillCategory('Product Management'), 'management');
  assert.strictEqual(classifySkillCategory('Executive Leadership'), 'leadership');

  // 2. False Positive Prevention: short tokens must not match arbitrary substrings
  const devSkills = [
    createSkill({ name: 'Go', level: 4 }),
    createSkill({ name: 'AI', level: 5 }),
    createSkill({ name: 'C', level: 3 })
  ];

  const unrelatedReqs = [
    { name: 'Negotiation', targetLevel: 4 },
    { name: 'Retail Strategy', targetLevel: 4 },
    { name: 'Accounting & Audit', targetLevel: 4 }
  ];

  const gapResult = analyzeSkillGaps(devSkills, unrelatedReqs);
  assert.strictEqual(gapResult.missingCount, 3);
  assert.strictEqual(gapResult.strongCount, 0);
  assert.strictEqual(gapResult.developingCount, 0);

  // 3. Legitimate word-boundary match
  const legitReqs = [
    { name: 'Go Programming', targetLevel: 4 }
  ];
  const legitResult = analyzeSkillGaps(devSkills, legitReqs);
  assert.strictEqual(legitResult.strongCount, 1);
});
