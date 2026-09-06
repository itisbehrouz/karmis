/**
 * KARMİS V2 Constants and Domain Definitions
 * Domain-neutral career levels, skill categories, application statuses, and decisions.
 */

const CAREER_LEVELS = {
  STUDENT: { id: 'STUDENT', rank: 1, label: 'Student', minYears: 0 },
  INTERN: { id: 'INTERN', rank: 2, label: 'Intern', minYears: 0 },
  ENTRY_LEVEL: { id: 'ENTRY_LEVEL', rank: 3, label: 'Entry Level', minYears: 0 },
  JUNIOR: { id: 'JUNIOR', rank: 4, label: 'Junior', minYears: 1 },
  MID: { id: 'MID', rank: 5, label: 'Mid-Level', minYears: 3 },
  SENIOR: { id: 'SENIOR', rank: 6, label: 'Senior', minYears: 5 },
  LEAD: { id: 'LEAD', rank: 7, label: 'Lead / Principal', minYears: 7 },
  MANAGER: { id: 'MANAGER', rank: 8, label: 'Manager', minYears: 6 },
  DIRECTOR: { id: 'DIRECTOR', rank: 9, label: 'Director', minYears: 10 },
  VP: { id: 'VP', rank: 10, label: 'Vice President', minYears: 12 },
  C_LEVEL: { id: 'C_LEVEL', rank: 11, label: 'C-Level Executive', minYears: 14 },
  FOUNDER: { id: 'FOUNDER', rank: 9, label: 'Founder / Entrepreneur', minYears: 3 },
  FREELANCER: { id: 'FREELANCER', rank: 5, label: 'Freelancer / Consultant', minYears: 2 },
  CAREER_CHANGER: { id: 'CAREER_CHANGER', rank: 4, label: 'Career Changer', minYears: 0 }
};

const SKILL_CATEGORIES = [
  'technical',
  'domain',
  'business',
  'communication',
  'leadership',
  'analytical',
  'operational',
  'creative',
  'management',
  'sales',
  'interpersonal'
];

const SKILL_RATINGS = {
  STRONG: 'STRONG',
  ADEQUATE: 'ADEQUATE',
  DEVELOPING: 'DEVELOPING',
  MISSING: 'MISSING',
  UNKNOWN: 'UNKNOWN'
};

const APPLICATION_STATUSES = [
  'SAVED',
  'ANALYZED',
  'MAYBE',
  'APPLIED',
  'SCREENING',
  'INTERVIEW',
  'FINAL',
  'OFFER',
  'ACCEPTED',
  'REJECTED',
  'WITHDRAWN'
];

const DECISIONS = {
  APPLY: 'APPLY',
  PASS: 'PASS',
  MAYBE: 'MAYBE'
};

const SCENARIO_PATHS = [
  'STAY',
  'PROMOTE',
  'CHANGE_COMPANY',
  'CHANGE_INDUSTRY',
  'SPECIALIZE',
  'FREELANCE',
  'CONSULT',
  'START_BUSINESS'
];

const ACTION_TYPES = [
  'apply_jobs',
  'improve_cv',
  'build_project',
  'learn_skill',
  'obtain_certification',
  'network',
  'contact_hiring_manager',
  'ask_for_promotion',
  'request_additional_responsibility',
  'negotiate_salary',
  'change_company',
  'change_industry',
  'build_portfolio',
  'prepare_for_interview',
  'stop_applying',
  'reassess_target'
];

module.exports = {
  CAREER_LEVELS,
  SKILL_CATEGORIES,
  SKILL_RATINGS,
  APPLICATION_STATUSES,
  DECISIONS,
  SCENARIO_PATHS,
  ACTION_TYPES
};
