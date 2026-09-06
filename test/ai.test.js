const test = require('node:test');
const assert = require('node:assert');
const { getAiProvider, LocalAiProvider, OpenAiProvider, AnthropicAiProvider } = require('../lib/ai/provider');
const { initDb, setSetting, closeDb } = require('../lib/db');

test('AI Isolation Layer - Adapter Factory & Fallbacks', async (t) => {
  initDb(':memory:');

  await t.test('getAiProvider defaults to LocalAiProvider offline', () => {
    const provider = getAiProvider('local');
    assert.ok(provider instanceof LocalAiProvider);
    assert.strictEqual(provider.name, 'local');
    assert.strictEqual(provider.isOffline, true);
  });

  await t.test('getAiProvider instantiates cloud adapters correctly', () => {
    const oai = getAiProvider('openai');
    assert.ok(oai instanceof OpenAiProvider);
    assert.strictEqual(oai.name, 'openai');

    const anthro = getAiProvider('anthropic');
    assert.ok(anthro instanceof AnthropicAiProvider);
    assert.strictEqual(anthro.name, 'anthropic');
  });

  await t.test('getAiProvider reads SQLite settings table preference', () => {
    setSetting('ai_provider', 'anthropic');
    const prov = getAiProvider();
    assert.ok(prov instanceof AnthropicAiProvider);

    setSetting('ai_provider', 'local');
    const localProv = getAiProvider();
    assert.ok(localProv instanceof LocalAiProvider);
  });

  await t.test('LocalAiProvider - extracts requirements deterministically', async () => {
    const local = new LocalAiProvider();
    const raw = `
      Required Qualifications:
      - 5+ years of experience in data analytics and SQL reporting
      - Proficient in stakeholder management and cross-functional leadership
      - Master degree in Computer Science, Economics or related field
    `;
    const reqs = await local.extractJobRequirements(raw);
    assert.ok(Array.isArray(reqs));
    assert.ok(reqs.length > 0);
    assert.ok(reqs.some(r => r.includes('analytics') || r.includes('experience') || r.includes('leadership')));
  });

  await t.test('LocalAiProvider - generates structured executive cover letter and interview prep', async () => {
    const local = new LocalAiProvider();
    const letter = await local.generateCoverLetter(
      { company: 'Acme Health', jobTitle: 'Analytics Lead' },
      { identity: { name: 'Alex Miller', title: 'Senior Data Lead', portfolio: 'https://example.com' } }
    );
    assert.ok(letter.includes('Acme Health'));
    assert.ok(letter.includes('Analytics Lead'));
    assert.ok(letter.includes('Alex Miller'));
    assert.ok(letter.includes('https://example.com'));

    const questions = await local.generateInterviewQuestions('Acme Health', 'Analytics Lead');
    assert.ok(questions);
    assert.ok(questions.questions.length > 0);

    const explanation = await local.explainDecision({
      company: 'Acme Health',
      score: 85,
      decisionCode: 'APPLY',
      decision: 'BAŞVURULACAK',
      reasons: { positive: ['High skill fit'], negative: [] }
    });
    assert.ok(explanation.includes('BAŞVURULACAK'));
    assert.ok(explanation.includes('85'));
  });

  await t.test('Cloud Adapters - fall back cleanly without API keys', async () => {
    const origOaiKey = process.env.OPENAI_API_KEY;
    const origAnthroKey = process.env.ANTHROPIC_API_KEY;
    delete process.env.OPENAI_API_KEY;
    delete process.env.ANTHROPIC_API_KEY;

    try {
      const oai = new OpenAiProvider();
      const reqs1 = await oai.extractJobRequirements('Requirements: 3 years SQL, reporting');
      assert.ok(Array.isArray(reqs1));
      assert.ok(reqs1.length > 0);

      const anthro = new AnthropicAiProvider();
      const letter = await anthro.generateCoverLetter({ company: 'TestCorp', jobTitle: 'Lead' }, { identity: { name: 'Jane' } });
      assert.ok(letter.includes('TestCorp'));
      assert.ok(letter.includes('Jane'));
    } finally {
      if (origOaiKey) process.env.OPENAI_API_KEY = origOaiKey;
      if (origAnthroKey) process.env.ANTHROPIC_API_KEY = origAnthroKey;
    }
  });

  closeDb();
});
