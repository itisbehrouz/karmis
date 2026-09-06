const assert = require('assert');
const { evaluateJobPosting, extractSkillsFromText } = require('../lib/evaluator');

console.log('Running KARMİS Test Suite...');

// 1. Test Skill Extraction
const sampleText = "We are seeking a Senior Backend Engineer with deep knowledge of Node.js, TypeScript, PostgreSQL, and Docker.";
const skills = extractSkillsFromText(sampleText);
assert(skills.includes('Node.js'), 'Must extract Node.js');
assert(skills.includes('TypeScript'), 'Must extract TypeScript');
assert(skills.includes('PostgreSQL'), 'Must extract PostgreSQL');
assert(skills.includes('Docker'), 'Must extract Docker');
console.log('✔ Skill extraction test passed');

// 2. Test High Match Scoring
const candidateWithSkills = {
  name: 'Test Candidate',
  skills: ['Node.js', 'TypeScript', 'PostgreSQL', 'Docker', 'React']
};
const evalHigh = evaluateJobPosting(
  { title: 'Senior Backend Engineer', description: sampleText },
  candidateWithSkills
);
assert.strictEqual(evalHigh.decision, 'APPLY', 'Expected decision to be APPLY');
assert(evalHigh.score >= 80, 'Score must be >= 80% for full skill match');
assert.strictEqual(evalHigh.missingAtsKeywords.length, 0, 'No missing keywords expected');
console.log(`✔ High match test passed (Score: ${evalHigh.score}%)`);

// 3. Test Low Match / Gap Detection
const candidateWithoutSkills = {
  name: 'Junior Candidate',
  skills: ['HTML', 'CSS']
};
const evalLow = evaluateJobPosting(
  { title: 'Senior Backend Engineer', description: sampleText },
  candidateWithoutSkills
);
assert.strictEqual(evalLow.decision, 'PASS', 'Expected decision to be PASS');
assert(evalLow.score < 80, 'Score must be < 80% for low match');
assert(evalLow.missingAtsKeywords.length > 0, 'Must report missing ATS keywords');
console.log(`✔ Gap detection test passed (Score: ${evalLow.score}%, Missing: ${evalLow.missingAtsKeywords.length})`);

// 4. Test Penalty Rules
const evalDownlevel = evaluateJobPosting(
  { title: 'Junior Intern Developer', description: 'Entry level intern with 0-1 year experience' },
  { yearsOfExperience: 8, skills: [] }
);
assert(evalDownlevel.penaltyDetails.length > 0, 'Must trigger downleveling penalty');
assert.strictEqual(evalDownlevel.decision, 'PASS', 'Downleveling must produce PASS recommendation');
console.log('✔ Penalty rules test passed');

console.log('\nAll KARMİS tests passed successfully!');
