/**
 * KARMİS V2 OpenAI Adapter
 * Optional cloud LLM integration. Falls back to LocalAiProvider if offline or unconfigured.
 */

const { LocalAiProvider } = require('./local');

class OpenAiProvider {
  constructor() {
    this.name = 'openai';
    this.apiKey = process.env.OPENAI_API_KEY || null;
    this.localFallback = new LocalAiProvider();
  }

  async extractJobRequirements(rawText) {
    if (!this.apiKey) return this.localFallback.extractJobRequirements(rawText);
    try {
      // In Node.js native fetch (Node 18+)
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
          messages: [
            { role: 'system', content: 'Extract the top 8 required technical and leadership skills as a JSON array of strings.' },
            { role: 'user', content: rawText }
          ],
          temperature: 0.2
        })
      });

      if (!response.ok) throw new Error('OpenAI API error ' + response.status);
      const data = await response.json();
      const content = data.choices[0]?.message?.content || '[]';
      return JSON.parse(content.replace(/```json|```/g, '').trim());
    } catch (e) {
      return this.localFallback.extractJobRequirements(rawText);
    }
  }

  async generateCoverLetter(job, profile) {
    if (!this.apiKey) return this.localFallback.generateCoverLetter(job, profile);
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
          messages: [
            { role: 'system', content: 'You are an executive career advisor. Write a tailored, concise cover letter (under 250 words) focused on evidence and ROI.' },
            { role: 'user', content: `Job: ${JSON.stringify(job)}\nCandidate: ${JSON.stringify(profile)}` }
          ]
        })
      });
      if (!response.ok) throw new Error('OpenAI API error');
      const data = await response.json();
      return data.choices[0]?.message?.content?.trim() || this.localFallback.generateCoverLetter(job, profile);
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

module.exports = { OpenAiProvider };
