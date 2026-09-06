# KARMİS V2 Domain Model

## 1. Core Purpose

KARMİS is a personal career decision engine.
It models the full trajectory of a professional.
It provides structured career guidance without human bias.

## 2. Core Loop

The career decision cycle follows this sequence:

1. **User Profile**: The user defines their identity, history, and goals.
2. **Career DNA**: The engine stores a structured state of competencies and achievements.
3. **Current State**: The system calculates the current seniority and market position.
4. **Target State**: The user specifies a target role, industry, and compensation.
5. **Gap Analysis**: The engine calculates gaps across critical skills.
6. **Options Evaluation**: The user evaluates jobs or career scenarios.
7. **Decision Engine**: The engine produces `APPLY`, `PASS`, or `MAYBE` decisions.
8. **Next Best Move**: The engine recommends the single highest-value action.
9. **Action Plan**: The engine generates a 30-60-90 day plan.
10. **Evidence Generation**: The user completes milestones and saves evidence.
11. **Outcome Tracking**: The user records application outcomes.
12. **DNA Update**: The loop completes and updates the Career DNA.

## 3. Career Level Model

The engine supports 14 seniority tiers:

- `STUDENT`: Rank 1. Academic focus.
- `INTERN`: Rank 2. Practical training.
- `ENTRY_LEVEL`: Rank 3. First professional employment.
- `JUNIOR`: Rank 4. 1 to 2 years of experience.
- `MID`: Rank 5. 3 to 5 years of independent execution.
- `SENIOR`: Rank 6. 5+ years of autonomous delivery.
- `LEAD`: Rank 7. Technical or functional leadership.
- `MANAGER`: Rank 8. People management and operations.
- `DIRECTOR`: Rank 9. Multi-team strategy and budgets.
- `VP`: Rank 10. Organizational executive oversight.
- `C_LEVEL`: Rank 11. Enterprise governance.
- `FOUNDER`: Rank 9. Enterprise creation.
- `FREELANCER`: Rank 5. Independent contract operations.
- `CAREER_CHANGER`: Rank 4. Cross-industry transition.

The system supports lateral moves.
It evaluates seniority transitions by rank difference.

## 4. Skill Taxonomy

The skill model is domain-neutral.
It classifies competencies into 11 categories:

1. `technical`
2. `domain`
3. `business`
4. `communication`
5. `leadership`
6. `analytical`
7. `operational`
8. `creative`
9. `management`
10. `sales`
11. `interpersonal`

Each skill record contains:
- `name`: Normalized identifier.
- `category`: Classified domain.
- `level`: Discrete score from 1 to 5.
- `yearsExperience`: Verified execution duration.
- `confidence`: Probability estimate from 0.0 to 1.0.
- `evidence`: Array of evidence wallet references.
- `transferability`: Rating of `high`, `medium`, or `low`.

## 5. Evidence Model

An evidence item verifies a stated skill.
It contains:
- `title`: Milestone name.
- `description`: Context of execution.
- `metric`: Measurable business result.
- `date`: Completion period.
- `skills`: Associated competencies.
- `strength`: `STRONG`, `MODERATE`, or `WEAK`.

The engine distinguishes missing skills from missing evidence.
If a user possesses a skill without proof, the engine flags `MISSING EVIDENCE`.
If a user lacks a skill completely, the engine flags `MISSING SKILL`.
