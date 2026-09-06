/**
 * KARMİS V2 Anthropic Adapter
 * Optional Claude API integration. Falls back to LocalAiProvider if offline or unconfigured.
 */

const { LocalAiProvider } = require('./local');

class AnthropicAiProvider {
  constructor() {
    this.name = 'anthropic';
    this.apiKey = process.env.ANTHROPIC_API_KEY || null;
    this.localFallback = new LocalAiProvider();
  }

  async extractJobRequirements(rawText) {
    if (!this.apiKey) return this.localFallback.extractJobRequirements(rawText);
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-20241022',
          max_tokens: 500,
          messages: [
            { role: 'user', content: `Extract the top 8 required technical and leadership skills as a JSON array of strings from:\n${rawText}` }
          ]
        })
      });

      if (!response.ok) throw new Error('Anthropic API error ' + response.status);
      const data = await response.json();
      const content = data.content?.[0]?.text || '[]';
      return JSON.parse(content.replace(/```json|```/g, '').trim());
    } catch (e) {
      return this.localFallback.extractJobRequirements(rawText);
    }
  }

  async generateCoverLetter(job, profile) {
    if (!this.apiKey) return this.localFallback.generateCoverLetter(job, profile);
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-20241022',
          max_tokens: 700,
          messages: [
            { role: 'user', content: `Write a concise executive cover letter (<250 words) for:\nJob: ${JSON.stringify(job)}\nCandidate: ${JSON.stringify(profile)}` }
          ]
        })
      });

      if (!response.ok) throw new Error('Anthropic API error');
      const data = await response.json();
      return data.content?.[0]?.text?.trim() || this.localFallback.generateCoverLetter(job, profile);
    } catch (e) {
      return this.localFallback.generateCoverLetter(job, profile);
    }
  }

  async generateInterviewQuestions(company, role) {
    return this.localFallback.generateInterviewQuestions(company, role);
  }

  async explainDecision(evaluation) {
    return this.localFallback.explainDecision(evaluation);
  }
}

module.exports = { AnthropicAiProvider };
