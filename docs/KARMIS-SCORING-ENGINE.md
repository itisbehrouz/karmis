# KARMİS V2 Scoring Engine

## 1. Multi-Dimensional Scoring

The job decision engine evaluates opportunities across 11 discrete dimensions.
It produces separate scores from 0 to 100 before calculating a decision.

### The 11 Dimensions:

1. **Skill Fit (0–100)**:
   Calculated by comparing required competencies against candidate skills.
   It weights critical skills higher than optional skills.

2. **Experience Fit (0–100)**:
   Measures years of experience against requirements.
   It penalizes overqualification when a senior applies for an associate role.

3. **Seniority Fit (0–100)**:
   Evaluates rank difference between current level and job level.
   An equal rank receives 100 points.
   A single step vertical promotion receives 90 points.
   A two-tier leap receives 65 points.
   A two-tier drop receives 40 points.

4. **Salary Fit (0–100)**:
   Compares offered or benchmark compensation against candidate targets.

5. **Career Upside (0–100)**:
   Measures future market equity and career progression potential.

6. **Location Fit (0–100)**:
   Evaluates commute viability and candidate geographical preferences.

7. **Work Model Fit (0–100)**:
   Compares remote, hybrid, or on-site expectations.

8. **Industry Fit (0–100)**:
   Measures domain transferability and sector alignment.

9. **Success Probability (0–100)**:
   Estimates interview and offer conversion likelihood.

10. **Risk Score (0–100)**:
    Evaluates 17 distinct risk indicators.
    High risk directly reduces recommendation scores.

11. **Opportunity Cost (0–100)**:
    Calculates the penalty of accepting a suboptimal position.

## 2. Decision Logic: APPLY, PASS, MAYBE

The engine outputs one of three decision codes:

- `APPLY`:
  The overall score exceeds the threshold (default 80%).
  The risk score remains below 35%.
  The opportunity cost remains below 50%.

- `MAYBE`:
  The overall score is between 68% and 79%.
  The risk score remains below 50%.
  The role represents a viable alternative or negotiation opportunity.

- `PASS`:
  The score falls below 68%, or a fatal risk exists.
  The engine explains explicit objections to the user.

## 3. The 17 Risk Rules

The risk engine detects 17 workplace and career risks:

1. `downleveling`: Senior candidate placed in a junior role.
2. `underpayment`: Salary below target or minimum threshold.
3. `unrealistic_requirements`: Excessive skills across disparate domains.
4. `excessive_experience`: Disproportionate experience conditions for the title.
5. `excessive_travel`: Travel demands beyond candidate tolerance.
6. `cold_call_quotas`: Cold prospecting demands for non-sales roles.
7. `commission_only`: Fatal risk. Lack of base salary security.
8. `poor_career_progression`: Flat structure without promotion ladders.
9. `excessive_bureaucracy`: Multi-tier compliance and government paperwork.
10. `unclear_responsibilities`: Vague description with missing success criteria.
11. `role_ambiguity`: Job title conflicts with described daily tasks.
12. `excessive_workload`: 24/7 on-call or burnout indicators.
13. `contract_risk`: Unpaid probation or severe non-compete clauses.
14. `location_mismatch`: Office location outside candidate commute radius.
15. `working_model_mismatch`: Strict on-site policy when remote is preferred.
16. `skill_mismatch`: Multiple critical core competencies missing.
17. `management_risk`: High turnover indicators and micromanagement signals.
