/**
 * KARMİS V2 Evidence Wallet & Evidence Matcher
 * Distinguishes MISSING SKILL from MISSING EVIDENCE.
 * Maps job requirements to verified projects, metrics, and case studies.
 */

const { getDb } = require('./db');
const { normalizeSkillName, skillsMatch, escapeRegExp } = require('./skills');

function createEvidenceItem(opts = {}) {
  return {
    id: opts.id || 'evi_' + Math.random().toString(36).substring(2, 9),
    title: opts.title || 'Career Achievement',
    description: opts.description || '',
    metric: opts.metric || '',
    date: opts.date || String(new Date().getFullYear()),
    skills: Array.isArray(opts.skills) ? opts.skills : [],
    roles: Array.isArray(opts.roles) ? opts.roles : [],
    source: opts.source || '',
    strength: ['STRONG', 'MODERATE', 'WEAK'].includes(opts.strength) ? opts.strength : 'MODERATE'
  };
}

function getEvidenceWallet(userId = 'usr_default') {
  const db = getDb();
  const rows = db.prepare('SELECT * FROM evidence_items WHERE user_id = ? ORDER BY date DESC').all(userId);

  if (rows.length === 0) {
    // Check if projects exist in candidate profile to seed initial evidence
    const profRow = db.prepare('SELECT projects FROM career_profiles WHERE user_id = ?').get(userId);
    if (profRow && profRow.projects) {
      try {
        const projects = JSON.parse(profRow.projects);
        if (Array.isArray(projects) && projects.length > 0) {
          const seeded = projects.map(p => ({
            id: 'evi_proj_' + (p.id || Math.random().toString(36).substring(2, 7)),
            user_id: userId,
            title: p.title || 'Project Case Study',
            description: p.description || '',
            metric: p.metric || (p.description && p.description.match(/%\d+|\d+%/)?.[0]) || 'Operational outcome',
            date: p.organization ? (p.organization.match(/\d{4}/)?.[0] || '2024') : '2024',
            skills: [p.category || 'General'],
            roles: ['Lead'],
            source: p.link || '',
            strength: 'STRONG'
          }));

          const insertStmt = db.prepare(`
            INSERT INTO evidence_items (
              id, user_id, title, description, metric, date, skills, roles, source, strength, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `);

          const now = new Date().toISOString();
          db.transaction(() => {
            for (const item of seeded) {
              insertStmt.run(
                item.id,
                userId,
                item.title,
                item.description,
                item.metric,
                item.date,
                JSON.stringify(item.skills),
                JSON.stringify(item.roles),
                item.source,
                item.strength,
                now,
                now
              );
            }
          })();

          return seeded;
        }
      } catch (e) {
        // Fall back to empty array
      }
    }
    return [];
  }

  return rows.map(r => ({
    id: r.id,
    title: r.title,
    description: r.description,
    metric: r.metric,
    date: r.date,
    skills: JSON.parse(r.skills || '[]'),
    roles: JSON.parse(r.roles || '[]'),
    source: r.source,
    strength: r.strength
  }));
}

function saveEvidenceItem(item, userId = 'usr_default') {
  const db = getDb();
  const now = new Date().toISOString();
  const id = item.id || 'evi_' + Math.random().toString(36).substring(2, 9);

  const existing = db.prepare('SELECT id FROM evidence_items WHERE id = ?').get(id);
  if (existing) {
    db.prepare(`
      UPDATE evidence_items SET
        title = ?, description = ?, metric = ?, date = ?, skills = ?, roles = ?, source = ?, strength = ?, updated_at = ?
      WHERE id = ?
    `).run(
      item.title,
      item.description || '',
      item.metric || '',
      item.date || '',
      JSON.stringify(item.skills || []),
      JSON.stringify(item.roles || []),
      item.source || '',
      item.strength || 'MODERATE',
      now,
      id
    );
  } else {
    db.prepare(`
      INSERT INTO evidence_items (
        id, user_id, title, description, metric, date, skills, roles, source, strength, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      userId,
      item.title,
      item.description || '',
      item.metric || '',
      item.date || '',
      JSON.stringify(item.skills || []),
      JSON.stringify(item.roles || []),
      item.source || '',
      item.strength || 'MODERATE',
      now,
      now
    );
  }

  return getEvidenceWallet(userId);
}

function deleteEvidenceItem(itemId, userId = 'usr_default') {
  const db = getDb();
  db.prepare('DELETE FROM evidence_items WHERE id = ? AND user_id = ?').run(itemId, userId);
  return getEvidenceWallet(userId);
}

/**
 * Match requirements against candidate skills and evidence wallet items.
 * Categorizes each requirement into:
 * - MATCHED (skill exists and evidence exists)
 * - MISSING EVIDENCE (skill exists in profile, but no proof/metric stored)
 * - MISSING SKILL (skill completely absent from profile)
 */
function matchRequirementsToEvidence(requirements = [], candidateSkills = [], evidenceItems = []) {
  const matched = [];
  const missingEvidence = [];
  const missingSkills = [];

  const skillNormMap = new Map();
  for (const s of candidateSkills) {
    skillNormMap.set(normalizeSkillName(s.name), s);
  }

  for (const rawReq of requirements) {
    const reqText = typeof rawReq === 'string' ? rawReq : (rawReq.name || '');
    const normReq = normalizeSkillName(reqText);

    // 1. Check if candidate has skill
    let hasSkill = skillNormMap.has(normReq);
    let matchedSkillObj = skillNormMap.get(normReq);

    if (!hasSkill) {
      for (const [sNorm, sObj] of skillNormMap.entries()) {
        if (skillsMatch(sNorm, normReq)) {
          hasSkill = true;
          matchedSkillObj = sObj;
          break;
        }
      }
    }

    if (!hasSkill) {
      missingSkills.push({
        requirement: reqText,
        reason: 'Aday yetkinlik envanterinde bu beceri tanımlı değil.'
      });
      continue;
    }

    // 2. Check if evidence exists for this skill or requirement
    const matchingEvidence = evidenceItems.filter(item => {
      const titleMatch = skillsMatch(item.title, normReq) || (matchedSkillObj && skillsMatch(item.title, matchedSkillObj.name));
      const descMatch = normReq.length >= 3 && new RegExp(`(?:^|[\\s,;/()])${escapeRegExp(normReq)}(?:$|[\\s,;/()])`, 'i').test(item.description || '');
      const skillTagMatch = (item.skills || []).some(s => skillsMatch(s, normReq) || (matchedSkillObj && skillsMatch(s, matchedSkillObj.name)));
      return titleMatch || descMatch || skillTagMatch;
    });

    if (matchingEvidence.length > 0) {
      matched.push({
        requirement: reqText,
        skill: matchedSkillObj.name,
        skillLevel: matchedSkillObj.level,
        evidenceCount: matchingEvidence.length,
        topEvidence: matchingEvidence[0],
        strength: matchingEvidence[0].strength || 'MODERATE'
      });
    } else {
      missingEvidence.push({
        requirement: reqText,
        skill: matchedSkillObj.name,
        skillLevel: matchedSkillObj.level,
        reason: 'Aday bu beceriye sahip fakat portföyde somut başarı metriği veya vaka kanıtı bulunmuyor.'
      });
    }
  }

  const evidenceCoverageScore = requirements.length > 0
    ? Math.round((matched.length / requirements.length) * 100)
    : 100;

  return {
    coverageScore: evidenceCoverageScore,
    totalRequirements: requirements.length,
    matchedCount: matched.length,
    missingEvidenceCount: missingEvidence.length,
    missingSkillsCount: missingSkills.length,
    matched,
    missingEvidence,
    missingSkills
  };
}

module.exports = {
  createEvidenceItem,
  getEvidenceWallet,
  saveEvidenceItem,
  deleteEvidenceItem,
  matchRequirementsToEvidence
};
