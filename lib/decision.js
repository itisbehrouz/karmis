/**
 * KARMİS V2 Next Best Move Engine & 30/60/90 Day Plan Generator
 * Identifies the single highest-leverage career action based on bottlenecks and evidence.
 */

const { getCareerDna } = require('./dna');
const { analyzeSkillGaps } = require('./skills');
const { getEvidenceWallet } = require('./evidence');
const { getDb } = require('./db');

function determineNextBestMove(candidateDna = null, applications = null) {
  const dna = candidateDna || getCareerDna();
  let appList = applications;
  if (!appList) {
    try {
      const db = getDb();
      appList = db.prepare('SELECT * FROM applications').all();
    } catch (e) {
      appList = [];
    }
  }

  let evidenceList = [];
  if (Array.isArray(candidateDna?.evidenceWallet)) {
    evidenceList = candidateDna.evidenceWallet;
  } else if (Array.isArray(candidateDna?.evidence)) {
    evidenceList = candidateDna.evidence;
  } else {
    try {
      evidenceList = getEvidenceWallet();
    } catch (e) {
      evidenceList = [];
    }
  }

  const targetRole = dna.targetCareerState?.targetRole || 'Target Role';
  const targetLevel = dna.targetCareerState?.targetLevel || 'SENIOR';

  // 1. Skill Gap Analysis (Dynamic & Domain-Neutral)
  const targetRequirements = (dna.targetCareerState?.targetSkills?.length > 0
    ? dna.targetCareerState.targetSkills
    : (dna.targetCareerState?.requiredSkills?.length > 0
      ? dna.targetCareerState.requiredSkills
      : [
          { name: targetRole, targetLevel: 4, importance: 'critical' },
          { name: 'Strategic Leadership & Direction', targetLevel: 4, importance: 'high' },
          { name: 'Stakeholder Communication & Influence', targetLevel: 4, importance: 'high' },
          { name: 'Operational Excellence & Delivery', targetLevel: 4, importance: 'medium' }
        ]
    )
  );
  const gapAnalysis = analyzeSkillGaps(dna.skills || [], targetRequirements);
  const criticalGaps = gapAnalysis.gaps.filter(g => g.importance === 'critical' && g.gapSize > 0);
  const highGaps = gapAnalysis.gaps.filter(g => g.importance === 'high' && g.gapSize > 0);

  // 2. Application Pipeline Analysis
  const totalApps = appList.length;
  const interviewing = appList.filter(a => ['INTERVIEW', 'FINAL', 'Interviewing'].includes(a.status));
  const rejected = appList.filter(a => ['REJECTED', 'Rejected'].includes(a.status));
  const offers = appList.filter(a => ['OFFER', 'ACCEPTED', 'Offer'].includes(a.status));

  // 3. Bottleneck Evaluation Logic

  // Case 1: Active interview in progress -> Focus immediately on interview prep
  if (interviewing.length > 0) {
    const activeApp = interviewing[0];
    return {
      actionType: 'prepare_for_interview',
      action: `Prepare STAR interview simulations for ${activeApp.company || 'your upcoming interview'}.`,
      bottleneck: `Upcoming interview round for ${activeApp.position || targetRole}.`,
      why: `You have active interview pipeline momentum. Converting current conversations into an offer has higher immediate leverage than submitting new applications.`,
      expectedImpact: 'High',
      estimatedTime: '3–7 days',
      successMetric: 'Complete 5 STAR scenario decks and execute one mock interview rehearsal.'
    };
  }

  // Case 2: High application volume but 0 or low interview conversions (< 10%)
  if (totalApps >= 8 && (interviewing.length + offers.length) === 0) {
    return {
      actionType: 'stop_applying',
      action: 'Pause cold applications and reconstruct your CV around verified metrics.',
      bottleneck: `Application conversion bottleneck: ${totalApps} applications submitted with 0 interview conversions.`,
      why: 'Continuing to submit standard applications into ATS systems with current positioning yields diminishing returns. Your profile requires higher evidence density.',
      expectedImpact: 'High',
      estimatedTime: '1–2 weeks',
      successMetric: 'Refactor CV summary and top 3 portfolio case studies with verified percentage impact.'
    };
  }

  // Case 3: Critical skill gaps exist
  if (criticalGaps.length > 0) {
    const topGap = criticalGaps[0];
    return {
      actionType: 'build_project',
      action: topGap.recommendedAction,
      bottleneck: `Insufficient demonstrated competency in ${topGap.skillName} (Current: ${topGap.currentLevel}/5, Required: ${topGap.targetLevel}/5).`,
      why: `Target role (${targetRole}) strictly requires mastery of ${topGap.skillName}. Without proof of execution, applications face high screening drop-off.`,
      expectedImpact: 'Transformative',
      estimatedTime: topGap.estimatedEffort || '6–10 weeks',
      successMetric: topGap.evidenceRequired || 'Deliver one verified project artifact with stakeholder feedback.'
    };
  }

  // Case 4: Skills exist but Evidence Wallet is empty or weak
  if (evidenceList.length < 3) {
    return {
      actionType: 'build_portfolio',
      action: 'Document at least 3 structured case studies with quantified operational metrics in your Evidence Wallet.',
      bottleneck: 'Evidence deficit: Your skills are stated, but not backed by quantified project evidence in your wallet.',
      why: 'Hiring managers at executive and senior tiers prioritize verified business outcomes (revenue impact, efficiency lift, cost savings) over skill lists.',
      expectedImpact: 'High',
      estimatedTime: '2–3 weeks',
      successMetric: 'Store 3 case studies in Evidence Wallet, each containing baseline, action, and verified result.'
    };
  }

  // Case 5: Strong readiness & healthy pipeline -> Active high-fit application execution
  return {
    actionType: 'apply_jobs',
    action: `Target 3 high-alignment opportunities in ${dna.industry || 'your target industry'} matching ${targetRole}.`,
    bottleneck: 'Pipeline velocity: Your Career DNA and Evidence Wallet are primed for senior-level placement.',
    why: 'Your skill match and evidence backing exceed benchmark thresholds. Direct outreach to hiring managers will yield high conversion.',
    expectedImpact: 'High',
    estimatedTime: '1–2 weeks',
    successMetric: 'Submit 3 tailored applications with customized executive cover letters and LinkedIn outreach notes.'
  };
}

function generateActionPlan(candidateDna = null) {
  const dna = candidateDna || getCareerDna();
  const targetRole = dna.targetCareerState?.targetRole || 'Senior Leader';
  const nextMove = determineNextBestMove(dna);

  return {
    targetRole,
    targetLevel: dna.targetCareerState?.targetLevel || 'SENIOR',
    timelineMonths: dna.targetCareerState?.targetTimelineMonths || 12,
    nextBestMove: nextMove,
    thirtyDay: {
      phase: '30-Day Foundation & Evidence',
      objective: 'Eliminate top evidence bottlenecks and validate current market position.',
      actions: [
        'Audit Evidence Wallet to ensure every core skill has at least one quantified case study.',
        'Run KARMİS gap analysis against 3 target job descriptions.',
        'Refine executive pitch and LinkedIn outreach summary.'
      ],
      time: 'Weeks 1–4',
      expectedResult: 'Evidence Wallet populated with 3+ verified case studies; target gap score improved by 15%.',
      evidenceProduced: 'Updated Evidence Wallet entries and verified portfolio metrics.',
      successMetric: '100% of target role critical skills mapped to verified evidence.'
    },
    sixtyDay: {
      phase: '60-Day Competency & Outreach',
      objective: 'Demonstrate advanced competency and activate warm network channels.',
      actions: [
        'Deliver one cross-functional milestone directly demonstrating required target role capabilities.',
        'Initiate 5 targeted executive conversations with hiring managers using custom outreach notes.',
        'Complete STAR interview simulation notes for the 5 most common scenario questions.'
      ],
      time: 'Weeks 5–8',
      expectedResult: 'Initial direct recruiter dialogues and verified project completion artifact.',
      evidenceProduced: 'Project milestone summary sign-off and STAR interview matrix.',
      successMetric: 'At least 2 active recruiter or hiring manager screening conversations.'
    },
    ninetyDay: {
      phase: '90-Day Conversion & Target Attainment',
      objective: 'Convert interviews into qualified offers matching or exceeding target salary.',
      actions: [
        'Participate in final round executive interviews using structured STAR storytelling.',
        'Evaluate offers against KARMİS 11-dimension decision engine to avoid downleveling or underpayment.',
        'Negotiate salary package towards target benchmark.'
      ],
      time: 'Weeks 9–12',
      expectedResult: 'Formal offer secured matching target seniority and financial goals.',
      evidenceProduced: 'Signed offer agreement or strategic promotion memo.',
      successMetric: 'Target role secured at or above target compensation.'
    }
  };
}

module.exports = {
  determineNextBestMove,
  generateActionPlan
};
