const test = require('node:test');
const assert = require('node:assert');
const { createEvidenceItem, matchRequirementsToEvidence } = require('../lib/evidence');

test('Evidence Matching - Distinguishes MISSING EVIDENCE from MISSING SKILL', () => {
  const candidateSkills = [
    { name: 'SQL', level: 4 },
    { name: 'Leadership', level: 3 }
  ];

  const evidenceItems = [
    createEvidenceItem({
      title: 'Executive BI Migration',
      description: 'SQL database architecture optimization lifting speed by 45%',
      skills: ['SQL'],
      strength: 'STRONG'
    })
  ];

  const requirements = ['SQL', 'Leadership', 'Cloud Architecture'];

  const match = matchRequirementsToEvidence(requirements, candidateSkills, evidenceItems);

  // 1. SQL has both skill and evidence
  assert.strictEqual(match.matchedCount, 1);
  assert.strictEqual(match.matched[0].requirement, 'SQL');
  assert.strictEqual(match.matched[0].strength, 'STRONG');

  // 2. Leadership has skill in profile, but NO evidence
  assert.strictEqual(match.missingEvidenceCount, 1);
  assert.strictEqual(match.missingEvidence[0].requirement, 'Leadership');
  assert.strictEqual(match.missingEvidence[0].skill, 'Leadership');

  // 3. Cloud Architecture is completely missing from skills
  assert.strictEqual(match.missingSkillsCount, 1);
  assert.strictEqual(match.missingSkills[0].requirement, 'Cloud Architecture');
});

test('Evidence Matching - False Positive Prevention & Defaults', () => {
  const candidateSkills = [{ name: 'Go', level: 4 }];
  const evidenceItems = [
    {
      title: 'Category Management Optimization',
      skills: ['Category Management']
    }
  ];

  const match = matchRequirementsToEvidence(['Category Management'], candidateSkills, evidenceItems);

  // 'Go' must NOT match 'Category Management'
  assert.strictEqual(match.matchedCount, 0);
  assert.strictEqual(match.missingSkillsCount, 1);
  assert.strictEqual(match.missingSkills[0].requirement, 'Category Management');

  // Strength defaults to MODERATE when omitted
  const match2 = matchRequirementsToEvidence(['Go'], candidateSkills, [{ title: 'Go Backend Service' }]);
  assert.strictEqual(match2.matchedCount, 1);
  assert.strictEqual(match2.matched[0].strength, 'MODERATE');
});
