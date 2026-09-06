/**
 * KARMİS V2 Offline Deterministic AI Provider
 * Fully offline, rule-based text generation, keyword extraction, and explanation generator.
 */

const { generateInterviewPrep } = require('../interview-prep');

class LocalAiProvider {
  constructor() {
    this.name = 'local';
    this.isOffline = true;
  }

  async extractJobRequirements(rawText) {
    if (!rawText || typeof rawText !== 'string') return [];
    
    // Split on newlines, bullet symbols, semicolons, and pipe delimiters
    const rawChunks = rawText
      .replace(/[\r\t]/g, ' ')
      .split(/\n+|[•▪▫–—*]+|;\s+|\s*\|\s*/)
      .map(c => c.trim())
      .filter(Boolean);

    // If single long block remains, split by sentence boundary
    const segments = [];
    for (const chunk of rawChunks) {
      if (chunk.length > 200) {
        const sentences = chunk.split(/(?<=[.!?])\s+/);
        segments.push(...sentences);
      } else {
        segments.push(chunk);
      }
    }

    const requirements = [];
    const seen = new Set();

    const reqPattern = new RegExp(
      'tecrübe|deneyim|bilgi|uzman|yetkin|mezun|lisans|yüksek lisans|şart|beceri|hakimiyet|' +
      'experience|degree|bachelor|master|qualification|skills|proficient|knowledge|' +
      'understanding|ability|requirement|certified|responsible|hands-on|years|track record|expertise|' +
      'management|leadership|communication|analytics|accounting|audit|legal|sales|design|engineering|agile',
      'i'
    );

    for (const seg of segments) {
      const trimmed = seg.trim().replace(/^[-*•]+\s*|^\d+[\.)\]]\s*/, '').trim();
      if (trimmed.endsWith(':') && trimmed.length < 25) continue;
      if (trimmed.length >= 8 && trimmed.length <= 160) {
        if (reqPattern.test(trimmed)) {
          const norm = trimmed.toLowerCase();
          if (!seen.has(norm)) {
            seen.add(norm);
            requirements.push(trimmed);
          }
        }
      }
    }

    // Fallback if no specific keywords matched but non-empty lines exist
    if (requirements.length === 0) {
      for (const seg of segments) {
        const trimmed = seg.trim().replace(/^[-*•]+\s*|^\d+[\.)\]]\s*/, '').trim();
        if (trimmed.length >= 10 && trimmed.length <= 120) {
          requirements.push(trimmed);
          if (requirements.length >= 5) break;
        }
      }
    }

    if (requirements.length === 0) {
      requirements.push('Temel Rol Yetkinlikleri ve İş Disiplini');
    }

    return requirements.slice(0, 10);
  }

  async generateCoverLetter(job, profile) {
    const company = job.company || 'Talent Acquisition Team';
    const role = job.jobTitle || job.title || 'Target Position';
    const name = profile.identity?.name || profile.name || 'Candidate';
    const title = profile.identity?.title || profile.title || 'Professional';
    const portfolio = profile.identity?.portfolio || profile.portfolio || 'https://behruzbagirzade.com/';

    return `Dear ${company} Hiring Team,

I am writing to express my focused interest in the ${role} position at ${company}.

With an established track record in cross-functional execution, measurable KPI delivery, and operational excellence, I align closely with the strategic needs of this role. Throughout my career, I have prioritized evidence-backed results—optimizing process velocity, automating reporting burdens, and leading stakeholder alignment.

You can inspect my verified portfolio case studies and project metrics directly at: ${portfolio}#work

I look forward to discussing how my capabilities can deliver concrete impact for ${company}.

Warm regards,
${name}
${title}
Portfolio: ${portfolio}`;
  }

  async generateInterviewQuestions(company, role) {
    return generateInterviewPrep(company, role);
  }

  async explainDecision(evaluation) {
    const code = evaluation.decisionCode || (evaluation.score >= 80 ? 'APPLY' : 'PASS');
    const score = evaluation.score || 0;
    const reasons = evaluation.reasons || { positive: [], negative: [] };

    let summary = `KARMİS Karar Motoru: ${evaluation.decision || code} (Puan: %${score})\n`;
    if (reasons.positive.length > 0) {
      summary += `\nOlumlu Etkenler:\n` + reasons.positive.map(p => `+ ${p}`).join('\n');
    }
    if (reasons.negative.length > 0) {
      summary += `\nRisk & Çelişki Faktörleri:\n` + reasons.negative.map(n => `- ${n}`).join('\n');
    }
    return summary;
  }
}

module.exports = { LocalAiProvider };
