const test = require('node:test');
const assert = require('node:assert');
const { simulateCareerPaths, calculateSalaryTrajectory } = require('../lib/simulator');

test('Career Simulator - Compares 8 Career Paths', () => {
  const sim = simulateCareerPaths();
  assert.strictEqual(sim.scenarios.length, 8);

  const stay = sim.scenarios.find(s => s.path === 'STAY');
  assert.ok(stay);
  assert.strictEqual(stay.risk, 'Low');
  assert.ok(stay.successProbability >= 80);

  const biz = sim.scenarios.find(s => s.path === 'START_BUSINESS');
  assert.ok(biz);
  assert.strictEqual(biz.incomeUpside, 'Unlimited');
  assert.ok(biz.riskScore > 70);
});

test('Salary Trajectory - Multi-Step Range Calculations', () => {
  const traj = calculateSalaryTrajectory(2000, 4000, 24, 'EUR');
  assert.strictEqual(traj.baselineMonthly, 2000);
  assert.strictEqual(traj.targetMonthly, 4000);
  assert.strictEqual(traj.timelineMonths, 24);
  assert.strictEqual(traj.paths.length, 6);

  // Check all 6 paths exist
  const pathIds = traj.paths.map(p => p.id);
  assert.ok(pathIds.includes('promotion'));
  assert.ok(pathIds.includes('job_change'));
  assert.ok(pathIds.includes('specialization'));
  assert.ok(pathIds.includes('management'));
  assert.ok(pathIds.includes('freelance'));
  assert.ok(pathIds.includes('business'));

  // Check intervals (0, 6, 12, 18, 24 months)
  const jobChange = traj.paths.find(p => p.id === 'job_change');
  assert.ok(jobChange);
  assert.strictEqual(jobChange.points.length, 5);
  assert.ok(jobChange.points[4].amount >= 4000);

  // Verify each point contains valid ranges (min <= expected <= max)
  for (const path of traj.paths) {
    for (const point of path.points) {
      assert.strictEqual(typeof point.min, 'number');
      assert.strictEqual(typeof point.max, 'number');
      assert.strictEqual(typeof point.expected, 'number');
      assert.ok(point.min <= point.max, `${path.id} min (${point.min}) should be <= max (${point.max})`);
      assert.ok(point.range.includes('EUR'));
    }
  }
});
