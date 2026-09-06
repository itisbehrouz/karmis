const test = require('node:test');
const assert = require('node:assert');
const { evaluateJobPosting, COMPANY_KNOWLEDGE } = require('../lib/evaluator');
const { DECISIONS } = require('../lib/constants');

test('Job Evaluator - Evaluates all 11 dimensions', () => {
  const result = evaluateJobPosting({ company: 'The Coca-Cola Company' });

  assert.ok(result.dimensions);
  assert.strictEqual(typeof result.dimensions.skillFit, 'number');
  assert.strictEqual(typeof result.dimensions.experienceFit, 'number');
  assert.strictEqual(typeof result.dimensions.seniorityFit, 'number');
  assert.strictEqual(typeof result.dimensions.salaryFit, 'number');
  assert.strictEqual(typeof result.dimensions.careerUpside, 'number');
  assert.strictEqual(typeof result.dimensions.locationFit, 'number');
  assert.strictEqual(typeof result.dimensions.workModelFit, 'number');
  assert.strictEqual(typeof result.dimensions.industryFit, 'number');
  assert.strictEqual(typeof result.dimensions.successProbability, 'number');
  assert.strictEqual(typeof result.dimensions.risk, 'number');
  assert.strictEqual(typeof result.dimensions.opportunityCost, 'number');
});

test('Job Evaluator - 3-State Decisions (APPLY, PASS, MAYBE)', () => {
  // 1. High match -> APPLY
  const applyJob = {
    company: 'The Coca-Cola Company',
    seniorityLevel: 'DIRECTOR'
  };
  const candidateReady = {
    currentLevel: 'LEAD',
    yearsOfExperience: 15,
    skills: [
      { name: 'Digital Transformation', level: 5 },
      { name: 'Power BI', level: 5 },
      { name: 'Leadership', level: 5 },
      { name: 'Data Strategy', level: 4 }
    ],
    financialGoals: { targetSalary: 250000, currentSalary: 200000 }
  };
  const evalApply = evaluateJobPosting(applyJob, candidateReady);
  assert.strictEqual(evalApply.decisionCode, DECISIONS.APPLY);

  // 2. High risk / fatal -> PASS even if high skill
  const passJob = {
    company: 'Acme Sales Corp',
    title: 'Outbound Cold Caller',
    rawDescription: 'Tamamı komisyon usulü sadece prim odaklı kapı kapı satış'
  };
  const evalPass = evaluateJobPosting(passJob, candidateReady);
  assert.strictEqual(evalPass.decisionCode, DECISIONS.PASS);

  // 3. Borderline match -> MAYBE
  const maybeJob = {
    company: 'Medium Enterprise',
    title: 'Business Analyst',
    seniorityLevel: 'MID',
    salaryOffered: 150000,
    requiredSkills: [
      { name: 'Excel', targetLevel: 3 },
      { name: 'SQL', targetLevel: 4 }
    ]
  };
  const candidateMid = {
    currentLevel: 'MID',
    yearsOfExperience: 3,
    skills: [{ name: 'Excel', level: 4 }, { name: 'SQL', level: 3 }],
    financialGoals: { targetSalary: 160000, currentSalary: 120000 }
  };
  const evalMaybe = evaluateJobPosting(maybeJob, candidateMid);
  assert.ok([DECISIONS.MAYBE, DECISIONS.APPLY].includes(evalMaybe.decisionCode));
});

test('Job Evaluator - Backwards Compatibility with V1', () => {
  // Test legacy penalty triggers
  const legacyRegulatory = evaluateJobPosting({ company: 'Test Bank', hasHeavyRegulatory: true });
  assert.ok(legacyRegulatory.penaltyDetails.some(p => p.rule.includes('Mevzuat')));
  assert.strictEqual(legacyRegulatory.decisionCode, DECISIONS.PASS);

  const legacyJunior = evaluateJobPosting({ company: 'Test Dev', isJuniorDownleveling: true });
  assert.ok(legacyJunior.penaltyDetails.some(p => p.rule.includes('Downleveling')));

  const legacySales = evaluateJobPosting({ company: 'Test Field', isFieldSalesQuota: true });
  assert.ok(legacySales.penaltyDetails.some(p => p.rule.includes('Saha')));
});

test('Job Evaluator - Edge Cases & Robustness (Null, Overqualified, Student, No Salary)', () => {
  // Edge Case 1: Null inputs must not throw
  const nullResult = evaluateJobPosting(null, null);
  assert.ok(nullResult);
  assert.strictEqual(typeof nullResult.score, 'number');
  assert.strictEqual(nullResult.decisionCode, DECISIONS.PASS);
  assert.ok(Array.isArray(nullResult.reasons.negative));

  // Edge Case 2: Empty objects
  const emptyResult = evaluateJobPosting({}, {});
  assert.ok(emptyResult);
  assert.strictEqual(typeof emptyResult.dimensions.skillFit, 'number');

  // Edge Case 3: Overqualified candidate
  const overqualifiedResult = evaluateJobPosting(
    { title: 'Junior Data Clerk', minYearsExperience: 1, seniority: 'Junior' },
    { currentLevel: 'DIRECTOR', yearsOfExperience: 18, skills: [] }
  );
  assert.strictEqual(overqualifiedResult.decisionCode, DECISIONS.PASS);
  assert.ok(overqualifiedResult.reasons.negative.some(r => r.includes('overqualified') || r.includes('kıdem altı')));

  // Edge Case 4: Student candidate
  const studentResult = evaluateJobPosting(
    { title: 'Executive Director of Transformation', minYearsExperience: 12 },
    { currentLevel: 'STUDENT', yearsOfExperience: 0, skills: [] }
  );
  assert.strictEqual(studentResult.decisionCode, DECISIONS.PASS);
  assert.ok(studentResult.reasons.negative.length > 0);

  // Edge Case 5: No salary specified
  const noSalaryResult = evaluateJobPosting(
    { title: 'Analyst', salaryOffered: null },
    { financialGoals: {}, constraints: {} }
  );
  assert.strictEqual(typeof noSalaryResult.dimensions.salaryFit, 'number');
  assert.ok(noSalaryResult.dimensions.salaryFit >= 0);
});
