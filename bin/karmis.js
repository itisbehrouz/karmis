#!/usr/bin/env node

/**
 * KARMİS V2 CLI — Personal Career Decision Engine
 * Preserves legacy V1 commands and provides V2 career decision commands.
 */

const fs = require('fs');
const path = require('path');
const { evaluateJobPosting } = require('../lib/evaluator');
const { generateMarkdownReport } = require('../lib/report-generator');
const { generateInterviewPrep, renderInterviewMarkdown } = require('../lib/interview-prep');
const { addApplicationEntry, syncCsvWithDb, parseTrackingCsv } = require('../lib/tracker');
const { startServer, PORT } = require('../lib/server');
const { getCareerDna, saveCareerDna } = require('../lib/dna');
const { analyzeSkillGaps } = require('../lib/skills');
const { getEvidenceWallet, saveEvidenceItem } = require('../lib/evidence');
const { determineNextBestMove, generateActionPlan } = require('../lib/decision');
const { simulateCareerPaths } = require('../lib/simulator');
const { calculateCareerAnalytics } = require('../lib/analytics');
const { initDb } = require('../lib/db');

const args = process.argv.slice(2);
const command = args[0] ? args[0].toLowerCase() : '';
const target = args[1];

function parseJobInput(input, extraArg) {
  let payload = {};
  if (!input) return payload;

  if (fs.existsSync(input)) {
    const raw = fs.readFileSync(input, 'utf8');
    try {
      payload = JSON.parse(raw);
    } catch (e) {
      let comp = '';
      let title = extraArg || path.basename(input, path.extname(input));
      const compMatch = raw.match(/(?:Company|Şirket)\s*:\s*([^\r\n]+)/i);
      if (compMatch) comp = compMatch[1].trim();
      const titleMatch = raw.match(/(?:Role|Title|Pozisyon|İş Tanımı)\s*:\s*([^\r\n]+)/i);
      if (titleMatch) title = titleMatch[1].trim();

      payload = {
        company: comp || undefined,
        title,
        rawDescription: raw
      };
    }
    return payload;
  }

  if (/^https?:\/\//i.test(input)) {
    try {
      const parsedUrl = new URL(input);
      const hostParts = parsedUrl.hostname.replace('www.', '').split('.');
      const domainName = hostParts[0].charAt(0).toUpperCase() + hostParts[0].slice(1);
      payload = {
        company: domainName,
        title: extraArg || 'Target Role',
        link: input,
        sourceUrl: input
      };
    } catch (e) {
      payload = { link: input, sourceUrl: input, title: extraArg || 'Target Role' };
    }
    return payload;
  }

  payload = { company: input, title: extraArg || input };
  return payload;
}

function printHelp() {
  console.log(`
========================================================================
 KARMİS V2 — Personal Career Decision Engine
 Know where you are. Know where you can go. Know what to do next.
========================================================================
Usage:
  karmis <command> [options]

Core Career Commands:
  init                           Initialize local SQLite database & Career DNA
  profile [show|import <file>]   View or import structured Career DNA
  career                         Display current baseline vs target career state
  gap                            Execute skill gap analysis against target role
  evidence [list|add <title>]    Inspect or expand Evidence Wallet
  next                           Determine the single highest-leverage next move
  simulate                       Compare 8 career scenarios (Stay, Pivot, Business)
  analyze <job|company>          Run 11-dimension evaluation (APPLY/PASS/MAYBE)
  job <file.json|file.txt>       Evaluate job file and generate full report
  applications [list|sync]       Manage applications or sync CSV (ABSG)
  analytics                      View pipeline conversion rates & learning loop
  dashboard                      Launch local web dashboard on Port ${PORT}

Legacy Commands (Fully Preserved):
  eval <job-json|url>           Evaluate job posting and output JSON
  report <job-json|url>         Generate comprehensive 8-section Markdown report
  interview <company> [role]     Generate 5-question STAR interview prep matrix
  track <company> <role>         Add entry to application tracking table
  help                           Display this command reference
`);
}

async function run() {
  if (!command || command === 'help' || command === '--help' || command === '-h') {
    printHelp();
    process.exit(0);
  }

  // Ensure DB initialized for all commands
  initDb();

  switch (command) {
    case 'init': {
      const dna = getCareerDna();
      console.log(`\n[KARMİS] Database and Career DNA initialized successfully.`);
      console.log(`Candidate: ${dna.identity.name} (${dna.currentLevel})`);
      console.log(`Target:    ${dna.targetCareerState.targetRole} (${dna.targetCareerState.targetLevel})\n`);
      process.exit(0);
      break;
    }

    case 'profile': {
      const sub = args[1] || 'show';
      if (sub === 'import' && args[2]) {
        const filePath = path.resolve(process.cwd(), args[2]);
        if (!fs.existsSync(filePath)) {
          console.error(`File not found: ${filePath}`);
          process.exit(1);
        }
        const content = fs.readFileSync(filePath, 'utf8');
        let imported = {};
        if (filePath.endsWith('.json')) {
          imported = JSON.parse(content);
        } else {
          imported = { rawContent: content };
        }
        saveCareerDna(imported);
        console.log(`[KARMİS] Profile successfully imported from ${filePath}`);
        process.exit(0);
      }

      const dna = getCareerDna();
      console.log(`
========================================================================
 KARMİS CAREER DNA
========================================================================
Name:             ${dna.identity.name}
Current Role:     ${dna.currentRole} (${dna.currentLevel})
Industry:         ${dna.industry}
Experience:       ${dna.yearsOfExperience} years
Location:         ${dna.identity.location}
Skills Tracked:   ${dna.skills.length} competencies
Target Role:      ${dna.targetCareerState.targetRole} (${dna.targetCareerState.targetLevel})
Target Salary:    ${dna.targetCareerState.targetSalary} ${dna.financialGoals?.currency || 'TRY'}
`);
      process.exit(0);
      break;
    }

    case 'career': {
      const dna = getCareerDna();
      console.log(`
========================================================================
 CAREER BASELINE VS TARGET STATE
========================================================================
CURRENT STATE:
  Role:           ${dna.currentRole}
  Level:          ${dna.currentLevel}
  Experience:     ${dna.yearsOfExperience} years
  Salary:         ${dna.financialGoals?.currentSalary || 'Not set'} ${dna.financialGoals?.currency || ''}

TARGET STATE:
  Role:           ${dna.targetCareerState.targetRole}
  Level:          ${dna.targetCareerState.targetLevel}
  Industry:       ${dna.targetCareerState.targetIndustry}
  Working Model:  ${dna.targetCareerState.targetWorkingModel}
  Target Salary:  ${dna.targetCareerState.targetSalary} ${dna.financialGoals?.currency || ''}
  Timeline:       ${dna.targetCareerState.targetTimelineMonths} months
`);
      process.exit(0);
      break;
    }

    case 'gap': {
      const dna = getCareerDna();
      const targetReqs = (dna.targetCareerState?.targetSkills?.length > 0
        ? dna.targetCareerState.targetSkills
        : (dna.targetCareerState?.requiredSkills?.length > 0
          ? dna.targetCareerState.requiredSkills
          : [
              { name: dna.targetCareerState?.targetRole || 'Target Leadership', targetLevel: 4, importance: 'critical' },
              { name: 'Strategic Leadership & Direction', targetLevel: 4, importance: 'high' },
              { name: 'Stakeholder Communication & Influence', targetLevel: 4, importance: 'high' },
              { name: 'Operational Excellence & Delivery', targetLevel: 4, importance: 'medium' }
            ]
        )
      );
      const gapRes = analyzeSkillGaps(dna.skills, targetReqs);

      console.log(`
========================================================================
 SKILL GAP ANALYSIS: ${dna.targetCareerState?.targetRole}
 Overall Fit Score: ${gapRes.overallSkillScore}%
========================================================================`);
      console.log(`Rating Summary: Strong: ${gapRes.strongCount} | Adequate: ${gapRes.adequateCount} | Developing: ${gapRes.developingCount} | Missing: ${gapRes.missingCount}\n`);

      gapRes.gaps.forEach((g, idx) => {
        console.log(`${idx + 1}. [${g.rating}] ${g.skillName} (Current: ${g.currentLevel}/5 -> Target: ${g.targetLevel}/5)`);
        console.log(`   Action: ${g.recommendedAction}`);
        console.log(`   Effort: ${g.estimatedEffort} | Evidence: ${g.evidenceRequired}\n`);
      });
      process.exit(0);
      break;
    }

    case 'evidence': {
      const sub = args[1] || 'list';
      if (sub === 'add' && args[2]) {
        const title = args[2];
        const metric = args[3] || 'Quantified outcome';
        saveEvidenceItem({ title, metric, strength: 'STRONG' });
        console.log(`[KARMİS] Evidence item added: "${title}" (${metric})`);
        process.exit(0);
      }

      const items = getEvidenceWallet();
      console.log(`
========================================================================
 EVIDENCE WALLET (${items.length} verified items)
========================================================================`);
      if (items.length === 0) {
        console.log('No evidence items found. Add items using: karmis evidence add "<title>" "<metric>"');
      } else {
        items.forEach((item, idx) => {
          console.log(`${idx + 1}. [${item.strength}] ${item.title}`);
          if (item.metric) console.log(`   Metric: ${item.metric}`);
          if (item.description) console.log(`   Detail: ${item.description}`);
          if (item.source) console.log(`   Source: ${item.source}`);
        });
      }
      process.exit(0);
      break;
    }

    case 'next': {
      const dna = getCareerDna();
      const move = determineNextBestMove(dna);
      const plan = generateActionPlan(dna);

      console.log(`
========================================================================
 NEXT BEST MOVE (Single Highest-Leverage Action)
========================================================================
ACTION:          ${move.action}
BOTTLENECK:      ${move.bottleneck}
WHY:             ${move.why}
EXPECTED IMPACT: ${move.expectedImpact}
ESTIMATED TIME:  ${move.estimatedTime}
SUCCESS METRIC:  ${move.successMetric}

------------------------------------------------------------------------
30 / 60 / 90 DAY EXECUTION OUTLINE:
  • 30-Day: ${plan.thirtyDay.objective}
  • 60-Day: ${plan.sixtyDay.objective}
  • 90-Day: ${plan.ninetyDay.objective}
`);
      process.exit(0);
      break;
    }

    case 'simulate': {
      const dna = getCareerDna();
      const sim = simulateCareerPaths(dna);
      console.log(`
========================================================================
 CAREER SCENARIO SIMULATOR (3-Year Horizon)
 Baseline Monthly: ${sim.currentSalaryMonthly.toLocaleString()} ${sim.currency}
========================================================================
Path               3Y Income Range                Risk     Probability  Upside
------------------------------------------------------------------------`);
      sim.scenarios.forEach(s => {
        const range = `${(s.threeYearIncomeMin / 1000).toFixed(0)}K–${(s.threeYearIncomeMax / 1000).toFixed(0)}K ${sim.currency}`;
        console.log(
          `${s.path.padEnd(18)} ${range.padEnd(30)} ${s.risk.padEnd(8)} ${String(s.successProbability + '%').padEnd(12)} ${s.incomeUpside}`
        );
      });
      console.log(`\nNote: Projections represent scenario ranges, not deterministic certainties.\n`);
      process.exit(0);
      break;
    }

    case 'analyze': {
      const payload = parseJobInput(target, args[2]);
      const evalResult = evaluateJobPosting(payload);

      console.log(`
========================================================================
 JOB DECISION ANALYSIS: ${evalResult.company} - ${evalResult.jobTitle}
 DECISION: ${evalResult.decisionCode} (${evalResult.decision}) | Score: ${evalResult.score}%
========================================================================
DIMENSION SCORES (0-100):
  Skill Fit:            ${String(evalResult.dimensions.skillFit).padStart(3)}%
  Experience Fit:       ${String(evalResult.dimensions.experienceFit).padStart(3)}%
  Seniority Fit:        ${String(evalResult.dimensions.seniorityFit).padStart(3)}%
  Salary Fit:           ${String(evalResult.dimensions.salaryFit).padStart(3)}%
  Career Upside:        ${String(evalResult.dimensions.careerUpside).padStart(3)}%
  Location Fit:         ${String(evalResult.dimensions.locationFit).padStart(3)}%
  Work Model Fit:       ${String(evalResult.dimensions.workModelFit).padStart(3)}%
  Industry Fit:         ${String(evalResult.dimensions.industryFit).padStart(3)}%
  Success Probability:  ${String(evalResult.dimensions.successProbability).padStart(3)}%
  Risk Score:           ${String(evalResult.dimensions.risk).padStart(3)}%
  Opportunity Cost:     ${String(evalResult.dimensions.opportunityCost).padStart(3)}%

POSITIVE FACTORS:
${evalResult.reasons.positive.map(p => `  + ${p}`).join('\n') || '  (None noted)'}

RISK FACTORS & OBJECTIONS:
${evalResult.reasons.negative.map(n => `  - ${n}`).join('\n') || '  (None detected)'}
`);
      process.exit(0);
      break;
    }

    case 'job': {
      const payload = parseJobInput(target, args[2]);
      const evalResult = evaluateJobPosting(payload);
      console.log(generateMarkdownReport(evalResult));
      process.exit(0);
      break;
    }

    case 'applications': {
      const sub = args[1] || 'list';
      if (sub === 'sync' || sub === 'absg' || sub === 'abdg') {
        const csvPath = syncCsvWithDb();
        console.log(`[KARMİS] Applications synchronized with CSV: ${csvPath}`);
        process.exit(0);
      }

      const db = initDb();
      const apps = db.prepare('SELECT * FROM applications ORDER BY date DESC LIMIT 15').all();
      console.log(`
========================================================================
 APPLICATION TRACKER (${apps.length} recent applications)
========================================================================`);
      apps.forEach((a, idx) => {
        console.log(`${idx + 1}. [${a.status}] ${a.company} — ${a.position} (%${Math.round(a.score || 0)}) [${a.date}]`);
      });
      process.exit(0);
      break;
    }

    case 'analytics': {
      const stats = calculateCareerAnalytics();
      console.log(`
========================================================================
 CAREER ANALYTICS & LEARNING LOOP
========================================================================
Total Applications:   ${stats.totalApplications}
Active Pipeline:      ${stats.activeCount}
Interview Rate:       ${stats.interviewRate}%
Offer Rate:           ${stats.offerRate}%
Average Fit Score:    ${stats.averageScore}%

LEARNING LOOP INSIGHT:
${stats.learningLoop.calibrationInsight}
`);
      process.exit(0);
      break;
    }

    case 'dashboard': {
      startServer();
      break;
    }

    // Legacy V1 commands
    case 'eval': {
      const payload = parseJobInput(target, args[2]);
      const evalResult = evaluateJobPosting(payload);
      console.log(JSON.stringify(evalResult, null, 2));
      process.exit(0);
      break;
    }

    case 'report': {
      const payload = parseJobInput(target, args[2]);
      const evalResult = evaluateJobPosting(payload);
      console.log(generateMarkdownReport(evalResult));
      process.exit(0);
      break;
    }

    case 'interview': {
      const company = args[1] || 'Roche Türkiye';
      const role = args[2] || 'Business Insights & Analytics Partner';
      const prep = generateInterviewPrep(company, role);
      console.log(renderInterviewMarkdown(prep));
      process.exit(0);
      break;
    }

    case 'track': {
      const company = args[1] || 'Roche Türkiye';
      const role = args[2] || 'Business Insights & Analytics Partner';
      const res = addApplicationEntry({ company, position: role, score: 90, status: 'Applied' });
      console.log(`[KARMİS] Başvuru başarıyla takip tablosuna eklendi: ${res.csvPath}`);
      process.exit(0);
      break;
    }

    default: {
      const evalResult = evaluateJobPosting({ title: command });
      console.log(generateMarkdownReport(evalResult));
      process.exit(0);
    }
  }
}

run().catch(err => {
  console.error('[KARMİS Error]:', err.message);
  process.exit(1);
});
