/**
 * KARMİS V2 Skill Taxonomy & Skill Gap Engine
 * Domain-neutral skill evaluation comparing current competencies against target requirements.
 */

const { SKILL_CATEGORIES, SKILL_RATINGS } = require('./constants');

const SYNONYMS = {
  'js': 'javascript',
  'ts': 'typescript',
  'py': 'python',
  'bi': 'business intelligence',
  'powerbi': 'power bi',
  'genai': 'artificial intelligence & llms',
  'ai': 'artificial intelligence & llms',
  'llm': 'artificial intelligence & llms',
  'cx': 'customer experience',
  'pm': 'product management',
  'rpa': 'robotic process automation',
  'kpi': 'kpi architecture & metrics',
  'bddk': 'banking regulations & compliance',
  'tcmb': 'banking regulations & compliance',
  'pci-dss': 'pci dss & information security',
  'iso27001': 'information security governance',
  'scrum': 'agile & scrum leadership',
  'agile': 'agile & scrum leadership',
  'lead': 'leadership & team management',
  'leadership': 'leadership & team management',
  'communication': 'stakeholder & executive communication',
  'presentation': 'stakeholder & executive communication',
  'sales': 'b2b commercial sales',
  'finance': 'financial analysis & budgeting',
  'accounting': 'financial accounting & reporting',
  'operations': 'operational excellence & process optimization'
};

function escapeRegExp(str) {
  if (!str || typeof str !== 'string') return '';
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function normalizeSkillName(name) {
  if (!name || typeof name !== 'string') return '';
  const cleaned = name.trim().toLowerCase().replace(/[-_.]/g, ' ').replace(/\s+/g, ' ');
  return SYNONYMS[cleaned] || cleaned;
}

function skillsMatch(skillA, skillB) {
  const normA = normalizeSkillName(skillA);
  const normB = normalizeSkillName(skillB);
  if (!normA || !normB) return false;
  if (normA === normB) return true;

  // Exact whole word token boundary check
  // Avoid false positives like "Go" matching "Negotiation" or "Category"
  if (normA.length >= 2) {
    const regA = new RegExp(`(?:^|[\\s,;/()])${escapeRegExp(normA)}(?:$|[\\s,;/()])`, 'i');
    if (regA.test(normB)) return true;
  }
  if (normB.length >= 2) {
    const regB = new RegExp(`(?:^|[\\s,;/()])${escapeRegExp(normB)}(?:$|[\\s,;/()])`, 'i');
    if (regB.test(normA)) return true;
  }

  return false;
}

function classifySkillCategory(skillName) {
  const norm = normalizeSkillName(skillName);
  if (/python|javascript|sql|typescript|react|cloud|aws|azure|api|docker|git|java|c\+\+|node|devops|linux|software|engineering/i.test(norm)) {
    return 'technical';
  }
  if (/communication|presentation|stakeholder|writing|storytelling|public speaking/i.test(norm)) {
    return 'communication';
  }
  if (/project management|product management|program management|scrum master|vendor management|resource planning|risk management|portfolio management|time management/i.test(norm)) {
    return 'management';
  }
  if (/lead|directing|executive|mentoring|coaching|vision|culture|hiring|team lead|board/i.test(norm)) {
    return 'leadership';
  }
  if (/process|bpmn|rpa|operations|supply chain|lean|six sigma|logistics|workflow|compliance|governance/i.test(norm)) {
    return 'operational';
  }
  if (/bi|power bi|analytics|tableau|metric|data|kpi|statistics|\bmodel\b|predict|excel|reporting/i.test(norm)) {
    return 'analytical';
  }
  if (/sales|commercial|b2b|negotiation|client|prospecting|quota|business development/i.test(norm)) {
    return 'sales';
  }
  if (/finance|accounting|p&l|budget|audit|banking|tax|revenue|financial/i.test(norm)) {
    return 'business';
  }
  if (/design|ui|ux|branding|creative|art direction|visual|graphic/i.test(norm)) {
    return 'creative';
  }
  if (/hr|recruiting|talent|culture|onboarding|performance management|interpersonal/i.test(norm)) {
    return 'interpersonal';
  }
  if (/manage/i.test(norm)) {
    return 'management';
  }
  return 'domain';
}

function createSkill(opts = {}) {
  const name = opts.name || 'Core Skill';
  const category = opts.category && SKILL_CATEGORIES.includes(opts.category)
    ? opts.category
    : classifySkillCategory(name);

  return {
    id: opts.id || 'skl_' + Math.random().toString(36).substring(2, 9),
    name,
    category,
    level: Math.max(1, Math.min(5, parseInt(opts.level, 10) || 1)),
    yearsExperience: parseFloat(opts.yearsExperience) || 0,
    confidence: opts.confidence !== undefined ? Math.max(0, Math.min(1, parseFloat(opts.confidence))) : 0.8,
    evidence: Array.isArray(opts.evidence) ? opts.evidence : [],
    lastUsed: opts.lastUsed || String(new Date().getFullYear()),
    transferability: ['high', 'medium', 'low'].includes(opts.transferability) ? opts.transferability : 'medium'
  };
}

/**
 * Compare current user skills against target role requirements.
 * Target requirements can be an array of strings or skill requirement objects:
 * [{ name: 'SQL', targetLevel: 4, importance: 'critical' }]
 */
function analyzeSkillGaps(currentSkills = [], targetRequirements = []) {
  const skillMap = new Map();
  for (const s of currentSkills) {
    const norm = normalizeSkillName(s.name);
    skillMap.set(norm, s);
  }

  const normalizedRequirements = targetRequirements.map(req => {
    if (typeof req === 'string') {
      return {
        name: req,
        targetLevel: 3,
        importance: 'high'
      };
    }
    return {
      name: req.name || 'Required Competency',
      targetLevel: Math.max(1, Math.min(5, parseInt(req.targetLevel, 10) || 3)),
      importance: ['critical', 'high', 'medium', 'low'].includes(req.importance) ? req.importance : 'high'
    };
  });

  const gapItems = [];
  let totalScoreWeight = 0;
  let earnedScoreWeight = 0;

  for (const req of normalizedRequirements) {
    const normReq = normalizeSkillName(req.name);
    // Exact or token-based lookup
    let matchedSkill = skillMap.get(normReq);
    if (!matchedSkill) {
      for (const [key, skill] of skillMap.entries()) {
        if (skillsMatch(key, normReq)) {
          matchedSkill = skill;
          break;
        }
      }
    }

    const currentLevel = matchedSkill ? matchedSkill.level : 0;
    const confidence = matchedSkill ? matchedSkill.confidence : 0;
    const evidenceCount = matchedSkill && matchedSkill.evidence ? matchedSkill.evidence.length : 0;
    const gapSize = Math.max(0, req.targetLevel - currentLevel);

    let rating = SKILL_RATINGS.MISSING;
    if (!matchedSkill) {
      rating = SKILL_RATINGS.MISSING;
    } else if (confidence < 0.4) {
      rating = SKILL_RATINGS.UNKNOWN;
    } else if (currentLevel >= req.targetLevel) {
      rating = SKILL_RATINGS.STRONG;
    } else if (currentLevel === req.targetLevel - 1) {
      rating = SKILL_RATINGS.ADEQUATE;
    } else {
      rating = SKILL_RATINGS.DEVELOPING;
    }

    // Weight based on importance
    let weight = 2;
    if (req.importance === 'critical') weight = 4;
    else if (req.importance === 'high') weight = 3;
    else if (req.importance === 'low') weight = 1;

    totalScoreWeight += weight * req.targetLevel;
    earnedScoreWeight += weight * Math.min(currentLevel, req.targetLevel);

    // Formulate practical recommendations
    let recommendedAction = '';
    let estimatedEffort = '';
    let evidenceRequired = '';

    if (gapSize === 0) {
      recommendedAction = `Maintain competency in ${req.name} through current projects.`;
      estimatedEffort = 'Continuous';
      evidenceRequired = 'Deliverable review or ongoing portfolio metrics';
    } else if (gapSize === 1) {
      recommendedAction = `Execute one cross-functional milestone applying advanced ${req.name}.`;
      estimatedEffort = '3-5 weeks';
      evidenceRequired = 'Verified project artifact and stakeholder sign-off';
    } else if (gapSize === 2) {
      recommendedAction = `Lead a structured initiative requiring hands-on mastery of ${req.name}.`;
      estimatedEffort = '6-10 weeks';
      evidenceRequired = 'Measurable outcome (cost reduction, velocity, or revenue metric)';
    } else {
      recommendedAction = `Complete foundational coursework and build an end-to-end practical project in ${req.name}.`;
      estimatedEffort = '10-16 weeks';
      evidenceRequired = 'Comprehensive project case study with documented baseline vs final metrics';
    }

    gapItems.push({
      skillName: req.name,
      category: matchedSkill ? matchedSkill.category : classifySkillCategory(req.name),
      importance: req.importance,
      currentLevel,
      targetLevel: req.targetLevel,
      gapSize,
      rating,
      confidence,
      hasEvidence: evidenceCount > 0,
      recommendedAction,
      estimatedEffort,
      evidenceRequired
    });
  }

  const overallScore = totalScoreWeight > 0
    ? Math.round((earnedScoreWeight / totalScoreWeight) * 100)
    : 100;

  const topGaps = gapItems
    .filter(g => g.gapSize > 0)
    .sort((a, b) => {
      const impWeight = { critical: 4, high: 3, medium: 2, low: 1 };
      const diff = impWeight[b.importance] - impWeight[a.importance];
      if (diff !== 0) return diff;
      return b.gapSize - a.gapSize;
    });

  return {
    overallSkillScore: overallScore,
    totalRequired: normalizedRequirements.length,
    strongCount: gapItems.filter(g => g.rating === SKILL_RATINGS.STRONG).length,
    adequateCount: gapItems.filter(g => g.rating === SKILL_RATINGS.ADEQUATE).length,
    developingCount: gapItems.filter(g => g.rating === SKILL_RATINGS.DEVELOPING).length,
    missingCount: gapItems.filter(g => g.rating === SKILL_RATINGS.MISSING).length,
    unknownCount: gapItems.filter(g => g.rating === SKILL_RATINGS.UNKNOWN).length,
    gaps: gapItems,
    topGaps
  };
}

module.exports = {
  SYNONYMS,
  normalizeSkillName,
  classifySkillCategory,
  createSkill,
  analyzeSkillGaps,
  skillsMatch,
  escapeRegExp
};
