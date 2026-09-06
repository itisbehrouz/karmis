/**
 * KARMİS V2 Career DNA & Target Career State Engine
 * Structured representation of the candidate's actual career baseline and trajectory.
 */

const { CAREER_LEVELS } = require('./constants');
const { getDb } = require('./db');
const { loadCandidateProfile } = require('./cv-parser');

const DEFAULT_USER_ID = 'usr_default';

function createDefaultCareerDna() {
  return {
    identity: {
      name: 'Professional User',
      title: 'Mid-Level Specialist',
      email: '',
      phone: '',
      location: 'Remote / Hybrid',
      portfolio: '',
      linkedin: '',
      github: ''
    },
    currentRole: 'Mid-Level Specialist',
    currentLevel: 'MID',
    industry: 'General',
    yearsOfExperience: 3,
    education: [],
    experience: [],
    skills: [],
    transferableSkills: [],
    domainExpertise: [],
    leadershipExperience: {
      hasLedTeams: false,
      maxTeamSize: 0,
      years: 0,
      style: 'Collaborative'
    },
    measurableAchievements: [],
    certifications: [],
    projects: [],
    interests: [],
    preferences: {
      preferredWorkType: 'full-time',
      remotePreference: 'hybrid',
      targetGeography: 'Global / Remote',
      travelTolerancePercent: 10,
      timeAvailableForDevelopmentHoursPerWeek: 5
    },
    constraints: {
      minSalary: 0,
      maxCommuteMinutes: 45,
      cannotRelocate: false,
      legalRequirements: []
    },
    financialGoals: {
      currentSalary: 0,
      targetSalary: 0,
      currency: 'EUR'
    },
    careerGoals: [],
    targetCareerState: {
      targetRole: 'Senior Specialist',
      targetLevel: 'SENIOR',
      targetIndustry: 'General',
      targetGeography: 'Global / Remote',
      targetSalary: 0,
      targetWorkingModel: 'hybrid',
      targetTimelineMonths: 18
    }
  };
}

function validateCareerLevel(level) {
  if (!level) return 'MID';
  const normalized = level.toUpperCase().replace(/[\s-]/g, '_');
  return CAREER_LEVELS[normalized] ? normalized : 'MID';
}

function isLateralMove(currentLevel, targetLevel) {
  const current = CAREER_LEVELS[currentLevel] || CAREER_LEVELS.MID;
  const target = CAREER_LEVELS[targetLevel] || CAREER_LEVELS.MID;
  return Math.abs(current.rank - target.rank) <= 1;
}

function getCareerDna(userId = DEFAULT_USER_ID) {
  const db = getDb();
  const userRow = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);

  if (!userRow) {
    // Seed from existing CV parser or defaults
    const legacy = loadCandidateProfile(process.cwd());
    const initialDna = createDefaultCareerDna();

    if (legacy && legacy.name) {
      initialDna.identity.name = legacy.name;
      initialDna.identity.title = legacy.title || initialDna.identity.title;
      initialDna.identity.email = legacy.email || '';
      initialDna.identity.phone = legacy.phone || '';
      initialDna.identity.portfolio = legacy.portfolio || '';
      initialDna.identity.linkedin = legacy.linkedin || '';
      initialDna.currentRole = legacy.title || initialDna.currentRole;
      initialDna.currentLevel = 'LEAD';
      initialDna.yearsOfExperience = 15;
      initialDna.industry = 'Digital Transformation & Technology';
      initialDna.targetCareerState = {
        targetRole: 'Executive Director / VP of Transformation',
        targetLevel: 'DIRECTOR',
        targetIndustry: 'Technology & Enterprise Solutions',
        targetGeography: 'İstanbul / Global Hybrid',
        targetSalary: 250000,
        targetWorkingModel: 'hybrid',
        targetTimelineMonths: 12
      };
      initialDna.financialGoals = {
        currentSalary: 180000,
        targetSalary: 250000,
        currency: 'TRY'
      };
      if (legacy.projects && Array.isArray(legacy.projects)) {
        initialDna.projects = legacy.projects;
      }
      initialDna.skills = [
        { name: 'Digital Transformation', category: 'leadership', level: 5, yearsExperience: 15, confidence: 1.0 },
        { name: 'Power BI', category: 'analytical', level: 5, yearsExperience: 10, confidence: 1.0 },
        { name: 'Leadership', category: 'leadership', level: 5, yearsExperience: 12, confidence: 0.95 },
        { name: 'Data Strategy', category: 'business', level: 5, yearsExperience: 12, confidence: 0.95 },
        { name: 'AI & Automation', category: 'technical', level: 4, yearsExperience: 5, confidence: 0.9 },
        { name: 'Agile & Scrum', category: 'operational', level: 5, yearsExperience: 10, confidence: 0.95 },
        { name: 'SQL & Data Warehousing', category: 'technical', level: 5, yearsExperience: 12, confidence: 0.95 },
        { name: 'Process Architecture (BPMN)', category: 'operational', level: 4, yearsExperience: 8, confidence: 0.9 }
      ];
    }

    saveCareerDna(initialDna, userId);
    return initialDna;
  }

  const profileRow = db.prepare('SELECT * FROM career_profiles WHERE user_id = ?').get(userId);
  const targetRow = db.prepare('SELECT * FROM career_targets WHERE user_id = ?').get(userId);
  let skillRows = db.prepare('SELECT * FROM skills WHERE user_id = ?').all(userId);
  if (skillRows.length === 0) {
    const defaultSkills = [
      { name: 'Digital Transformation', category: 'leadership', level: 5, yearsExperience: 15, confidence: 1.0 },
      { name: 'Power BI', category: 'analytical', level: 5, yearsExperience: 10, confidence: 1.0 },
      { name: 'Leadership', category: 'leadership', level: 5, yearsExperience: 12, confidence: 0.95 },
      { name: 'Data Strategy', category: 'business', level: 5, yearsExperience: 12, confidence: 0.95 },
      { name: 'AI & Automation', category: 'technical', level: 4, yearsExperience: 5, confidence: 0.9 },
      { name: 'Agile & Scrum', category: 'operational', level: 5, yearsExperience: 10, confidence: 0.95 },
      { name: 'SQL & Data Warehousing', category: 'technical', level: 5, yearsExperience: 12, confidence: 0.95 },
      { name: 'Process Architecture (BPMN)', category: 'operational', level: 4, yearsExperience: 8, confidence: 0.9 }
    ];
    const insertSkill = db.prepare(`
      INSERT INTO skills (
        id, user_id, name, category, level, years_experience, confidence, evidence, last_used, transferability, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const now = new Date().toISOString();
    db.transaction(() => {
      for (const s of defaultSkills) {
        insertSkill.run(
          'skl_' + Math.random().toString(36).substring(2, 9),
          userId,
          s.name,
          s.category,
          s.level,
          s.yearsExperience,
          s.confidence,
          '[]',
          String(new Date().getFullYear()),
          'medium',
          now,
          now
        );
      }
    })();
    skillRows = db.prepare('SELECT * FROM skills WHERE user_id = ?').all(userId);
  }

  const dna = {
    identity: {
      name: userRow.name,
      title: profileRow?.current_role || 'Professional',
      email: userRow.email || '',
      phone: userRow.phone || '',
      location: userRow.location || '',
      portfolio: userRow.portfolio || '',
      linkedin: userRow.linkedin || '',
      github: userRow.github || ''
    },
    currentRole: profileRow ? profileRow.current_role : 'Professional',
    currentLevel: profileRow ? profileRow.current_level : 'MID',
    industry: profileRow ? profileRow.industry : 'General',
    yearsOfExperience: profileRow ? profileRow.years_experience : 0,
    education: profileRow ? JSON.parse(profileRow.education || '[]') : [],
    experience: profileRow ? JSON.parse(profileRow.experience || '[]') : [],
    skills: skillRows.map(s => ({
      id: s.id,
      name: s.name,
      category: s.category,
      level: s.level,
      yearsExperience: s.years_experience,
      confidence: s.confidence,
      evidence: JSON.parse(s.evidence || '[]'),
      lastUsed: s.last_used,
      transferability: s.transferability
    })),
    transferableSkills: profileRow ? JSON.parse(profileRow.transferable_skills || '[]') : [],
    domainExpertise: profileRow ? JSON.parse(profileRow.domain_expertise || '[]') : [],
    leadershipExperience: profileRow ? JSON.parse(profileRow.leadership_experience || '{}') : {},
    measurableAchievements: profileRow ? JSON.parse(profileRow.measurable_achievements || '[]') : [],
    certifications: profileRow ? JSON.parse(profileRow.certifications || '[]') : [],
    projects: profileRow ? JSON.parse(profileRow.projects || '[]') : [],
    interests: profileRow ? JSON.parse(profileRow.interests || '[]') : [],
    preferences: profileRow ? JSON.parse(profileRow.preferences || '{}') : {},
    constraints: profileRow ? JSON.parse(profileRow.constraints || '{}') : {},
    financialGoals: profileRow ? JSON.parse(profileRow.financial_goals || '{}') : {},
    targetCareerState: targetRow ? {
      targetRole: targetRow.target_role,
      targetLevel: targetRow.target_level,
      targetIndustry: targetRow.target_industry,
      targetGeography: targetRow.target_geography,
      targetSalary: targetRow.target_salary,
      targetWorkingModel: targetRow.target_working_model,
      targetTimelineMonths: targetRow.target_timeline_months,
      targetSkills: targetRow.target_skills ? JSON.parse(targetRow.target_skills || '[]') : []
    } : {
      targetRole: 'Target Role',
      targetLevel: 'SENIOR',
      targetIndustry: 'General',
      targetGeography: 'Remote',
      targetSalary: 0,
      targetWorkingModel: 'remote',
      targetTimelineMonths: 12,
      targetSkills: []
    }
  };

  return dna;
}

function saveCareerDna(dna, userId = DEFAULT_USER_ID) {
  const db = getDb();
  const now = new Date().toISOString();

  db.transaction(() => {
    // Upsert User
    const existingUser = db.prepare('SELECT id FROM users WHERE id = ?').get(userId);
    if (!existingUser) {
      db.prepare(`
        INSERT INTO users (id, name, email, phone, location, portfolio, linkedin, github, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        userId,
        dna.identity?.name || 'Professional User',
        dna.identity?.email || '',
        dna.identity?.phone || '',
        dna.identity?.location || '',
        dna.identity?.portfolio || '',
        dna.identity?.linkedin || '',
        dna.identity?.github || '',
        now,
        now
      );
    } else {
      db.prepare(`
        UPDATE users SET
          name = ?, email = ?, phone = ?, location = ?, portfolio = ?, linkedin = ?, github = ?, updated_at = ?
        WHERE id = ?
      `).run(
        dna.identity?.name || 'Professional User',
        dna.identity?.email || '',
        dna.identity?.phone || '',
        dna.identity?.location || '',
        dna.identity?.portfolio || '',
        dna.identity?.linkedin || '',
        dna.identity?.github || '',
        now,
        userId
      );
    }

    // Upsert Career Profile
    const profileId = 'prof_' + userId;
    const existingProfile = db.prepare('SELECT id FROM career_profiles WHERE user_id = ?').get(userId);
    const validLevel = validateCareerLevel(dna.currentLevel);

    if (!existingProfile) {
      db.prepare(`
        INSERT INTO career_profiles (
          id, user_id, current_role, current_level, industry, years_experience,
          transferable_skills, domain_expertise, leadership_experience, measurable_achievements,
          education, certifications, projects, interests, preferences, constraints, financial_goals,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        profileId,
        userId,
        dna.currentRole || 'Mid-Level Specialist',
        validLevel,
        dna.industry || 'General',
        dna.yearsOfExperience || 0,
        JSON.stringify(dna.transferableSkills || []),
        JSON.stringify(dna.domainExpertise || []),
        JSON.stringify(dna.leadershipExperience || {}),
        JSON.stringify(dna.measurableAchievements || []),
        JSON.stringify(dna.education || []),
        JSON.stringify(dna.certifications || []),
        JSON.stringify(dna.projects || []),
        JSON.stringify(dna.interests || []),
        JSON.stringify(dna.preferences || {}),
        JSON.stringify(dna.constraints || {}),
        JSON.stringify(dna.financialGoals || {}),
        now,
        now
      );
    } else {
      db.prepare(`
        UPDATE career_profiles SET
          current_role = ?, current_level = ?, industry = ?, years_experience = ?,
          transferable_skills = ?, domain_expertise = ?, leadership_experience = ?,
          measurable_achievements = ?, education = ?, certifications = ?, projects = ?,
          interests = ?, preferences = ?, constraints = ?, financial_goals = ?, updated_at = ?
        WHERE user_id = ?
      `).run(
        dna.currentRole || 'Mid-Level Specialist',
        validLevel,
        dna.industry || 'General',
        dna.yearsOfExperience || 0,
        JSON.stringify(dna.transferableSkills || []),
        JSON.stringify(dna.domainExpertise || []),
        JSON.stringify(dna.leadershipExperience || {}),
        JSON.stringify(dna.measurableAchievements || []),
        JSON.stringify(dna.education || []),
        JSON.stringify(dna.certifications || []),
        JSON.stringify(dna.projects || []),
        JSON.stringify(dna.interests || []),
        JSON.stringify(dna.preferences || {}),
        JSON.stringify(dna.constraints || {}),
        JSON.stringify(dna.financialGoals || {}),
        now,
        userId
      );
    }

    // Upsert Career Target
    const target = dna.targetCareerState || {};
    const targetId = 'tgt_' + userId;
    const existingTarget = db.prepare('SELECT id FROM career_targets WHERE user_id = ?').get(userId);
    const validTargetLevel = validateCareerLevel(target.targetLevel || 'SENIOR');
    const targetCols = db.prepare('PRAGMA table_info(career_targets)').all().map(c => c.name);
    const hasTargetSkills = targetCols.includes('target_skills');
    const targetSkillsJson = JSON.stringify(target.targetSkills || target.requiredSkills || []);

    if (!existingTarget) {
      if (hasTargetSkills) {
        db.prepare(`
          INSERT INTO career_targets (
            id, user_id, target_role, target_level, target_industry, target_geography,
            target_salary, target_working_model, target_timeline_months, target_skills, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          targetId,
          userId,
          target.targetRole || 'Target Role',
          validTargetLevel,
          target.targetIndustry || 'General',
          target.targetGeography || 'Remote',
          target.targetSalary || 0,
          target.targetWorkingModel || 'hybrid',
          target.targetTimelineMonths || 12,
          targetSkillsJson,
          now,
          now
        );
      } else {
        db.prepare(`
          INSERT INTO career_targets (
            id, user_id, target_role, target_level, target_industry, target_geography,
            target_salary, target_working_model, target_timeline_months, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          targetId,
          userId,
          target.targetRole || 'Target Role',
          validTargetLevel,
          target.targetIndustry || 'General',
          target.targetGeography || 'Remote',
          target.targetSalary || 0,
          target.targetWorkingModel || 'hybrid',
          target.targetTimelineMonths || 12,
          now,
          now
        );
      }
    } else {
      if (hasTargetSkills) {
        db.prepare(`
          UPDATE career_targets SET
            target_role = ?, target_level = ?, target_industry = ?, target_geography = ?,
            target_salary = ?, target_working_model = ?, target_timeline_months = ?, target_skills = ?, updated_at = ?
          WHERE user_id = ?
        `).run(
          target.targetRole || 'Target Role',
          validTargetLevel,
          target.targetIndustry || 'General',
          target.targetGeography || 'Remote',
          target.targetSalary || 0,
          target.targetWorkingModel || 'hybrid',
          target.targetTimelineMonths || 12,
          targetSkillsJson,
          now,
          userId
        );
      } else {
        db.prepare(`
          UPDATE career_targets SET
            target_role = ?, target_level = ?, target_industry = ?, target_geography = ?,
            target_salary = ?, target_working_model = ?, target_timeline_months = ?, updated_at = ?
          WHERE user_id = ?
        `).run(
          target.targetRole || 'Target Role',
          validTargetLevel,
          target.targetIndustry || 'General',
          target.targetGeography || 'Remote',
          target.targetSalary || 0,
          target.targetWorkingModel || 'hybrid',
          target.targetTimelineMonths || 12,
          now,
          userId
        );
      }
    }

    // Update Skills if provided
    if (Array.isArray(dna.skills)) {
      db.prepare('DELETE FROM skills WHERE user_id = ?').run(userId);
      const insertSkill = db.prepare(`
        INSERT INTO skills (
          id, user_id, name, category, level, years_experience, confidence, evidence, last_used, transferability, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      for (const s of dna.skills) {
        const sId = s.id || 'skl_' + Math.random().toString(36).substring(2, 9);
        insertSkill.run(
          sId,
          userId,
          s.name,
          s.category || 'technical',
          Math.max(1, Math.min(5, parseInt(s.level, 10) || 1)),
          s.yearsExperience || 0,
          s.confidence !== undefined ? s.confidence : 0.8,
          JSON.stringify(s.evidence || []),
          s.lastUsed || String(new Date().getFullYear()),
          s.transferability || 'medium',
          now,
          now
        );
      }
    }
  })();

  return getCareerDna(userId);
}

module.exports = {
  DEFAULT_USER_ID,
  createDefaultCareerDna,
  validateCareerLevel,
  isLateralMove,
  getCareerDna,
  saveCareerDna
};
