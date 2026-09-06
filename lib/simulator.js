/**
 * KARMİS V2 Career Simulator & Salary Trajectory Engine
 * Models 8 distinct career paths with ranges, confidence intervals, and risk comparisons.
 */

const { SCENARIO_PATHS, CAREER_LEVELS } = require('./constants');
const { getCareerDna } = require('./dna');
const { getDb } = require('./db');

function simulateCareerPaths(candidateDna = null) {
  const dna = candidateDna || getCareerDna();
  const currentSalary = dna.financialGoals?.currentSalary || 180000;
  const targetSalary = dna.financialGoals?.targetSalary || (currentSalary * 1.4);
  const currency = dna.financialGoals?.currency || 'TRY';
  const candRank = CAREER_LEVELS[dna.currentLevel]?.rank || 7;

  // Annual baseline
  const currentAnnual = currentSalary * 12;

  const scenarios = [
    {
      path: 'STAY',
      label: 'Mevcut Şirkette Kalma (Stay)',
      threeYearIncomeMin: Math.round(currentAnnual * 3 * 1.05),
      threeYearIncomeMax: Math.round(currentAnnual * 3 * 1.18),
      incomeUpside: 'Low',
      risk: 'Low',
      riskScore: 15,
      skillGrowth: 'Low to Medium',
      networkGrowth: 'Low',
      successProbability: 90,
      timeToMilestoneMonths: 12,
      capitalRequired: 0,
      careerOptionality: 'Moderate',
      confidenceLevel: 'High (85%)',
      summary: 'Stabilite ve düşük belirsizlik sunar. Ancak enflasyon karşısında reel gelir erozyonu ve yetkinlik ataleti riski taşır.'
    },
    {
      path: 'PROMOTE',
      label: 'İç Terfi & Dikey Yükselme (Promote)',
      threeYearIncomeMin: Math.round(currentAnnual * 3 * 1.20),
      threeYearIncomeMax: Math.round(currentAnnual * 3 * 1.45),
      incomeUpside: 'Medium',
      risk: 'Low to Medium',
      riskScore: 30,
      skillGrowth: 'Medium',
      networkGrowth: 'Medium',
      successProbability: 70,
      timeToMilestoneMonths: 9,
      capitalRequired: 0,
      careerOptionality: 'High',
      confidenceLevel: 'High (80%)',
      summary: 'Mevcut kurum içi sermaye korunur. Şirket içi politika ve sınırlı bütçe artışı tavan oluşturabilir.'
    },
    {
      path: 'CHANGE_COMPANY',
      label: 'Şirket Değişimi & Piyasa Geçişi (Change Company)',
      threeYearIncomeMin: Math.round(currentAnnual * 3 * 1.35),
      threeYearIncomeMax: Math.round(currentAnnual * 3 * 1.75),
      incomeUpside: 'High',
      risk: 'Medium',
      riskScore: 40,
      skillGrowth: 'High',
      networkGrowth: 'High',
      successProbability: 65,
      timeToMilestoneMonths: 6,
      capitalRequired: 0,
      careerOptionality: 'High',
      confidenceLevel: 'High (75%)',
      summary: 'Piyasa benchmarkına en hızlı sıçrama yoludur. Yeni şirket kültürü ve deneme süresi adaptasyonu gerektirir.'
    },
    {
      path: 'CHANGE_INDUSTRY',
      label: 'Sektör Değişimi & Yatay Pivot (Change Industry)',
      threeYearIncomeMin: Math.round(currentAnnual * 3 * 1.15),
      threeYearIncomeMax: Math.round(currentAnnual * 3 * 1.80),
      incomeUpside: 'High',
      risk: 'High',
      riskScore: 60,
      skillGrowth: 'Transformative',
      networkGrowth: 'High',
      successProbability: 50,
      timeToMilestoneMonths: 12,
      capitalRequired: 0,
      careerOptionality: 'Very High',
      confidenceLevel: 'Medium (60%)',
      summary: 'Dönüştürülebilir becerileri yeni pazara taşır. Başlangıçta kıdem ve ücret tavizi riski bulunabilir.'
    },
    {
      path: 'SPECIALIZE',
      label: 'Derin Uzmanlaşma (Specialize / Niche)',
      threeYearIncomeMin: Math.round(currentAnnual * 3 * 1.30),
      threeYearIncomeMax: Math.round(currentAnnual * 3 * 1.70),
      incomeUpside: 'High',
      risk: 'Low to Medium',
      riskScore: 25,
      skillGrowth: 'High',
      networkGrowth: 'Medium',
      successProbability: 75,
      timeToMilestoneMonths: 8,
      capitalRequired: 0,
      careerOptionality: 'Moderate',
      confidenceLevel: 'High (80%)',
      summary: 'Niş alanlarda (örn. Yapay Zekâ Güvenliği, RegTech) tekel pozisyonu sağlar. Dar pazar hacmine bağımlıdır.'
    },
    {
      path: 'FREELANCE',
      label: 'Serbest Çalışma & Kontrat (Freelance)',
      threeYearIncomeMin: Math.round(currentAnnual * 3 * 0.80),
      threeYearIncomeMax: Math.round(currentAnnual * 3 * 2.20),
      incomeUpside: 'Very High',
      risk: 'High',
      riskScore: 65,
      skillGrowth: 'High',
      networkGrowth: 'High',
      successProbability: 45,
      timeToMilestoneMonths: 6,
      capitalRequired: Math.round(currentSalary * 2),
      careerOptionality: 'High',
      confidenceLevel: 'Medium (55%)',
      summary: 'Yüksek saatlik gelir ve esneklik potansiyeli. Düzensiz nakit akışı ve sürekli müşteri bulma zorunluluğu vardır.'
    },
    {
      path: 'CONSULT',
      label: 'Stratejik Yönetim Danışmanlığı (Consulting)',
      threeYearIncomeMin: Math.round(currentAnnual * 3 * 1.10),
      threeYearIncomeMax: Math.round(currentAnnual * 3 * 2.50),
      incomeUpside: 'Very High',
      risk: 'Medium to High',
      riskScore: 50,
      skillGrowth: 'High',
      networkGrowth: 'Transformative',
      successProbability: 55,
      timeToMilestoneMonths: 9,
      capitalRequired: Math.round(currentSalary * 3),
      careerOptionality: 'Very High',
      confidenceLevel: 'Medium (60%)',
      summary: 'C-Level ve kurumsal müşterilere yüksek katma değerli danışmanlık. Güçlü portföy ve itibar sermayesi şarttır.'
    },
    {
      path: 'START_BUSINESS',
      label: 'Girişimcilik & Kendi İşini Kurma (Start Business)',
      threeYearIncomeMin: 0,
      threeYearIncomeMax: Math.round(currentAnnual * 3 * 4.0),
      incomeUpside: 'Unlimited',
      risk: 'Extreme',
      riskScore: 85,
      skillGrowth: 'Transformative',
      networkGrowth: 'Transformative',
      successProbability: 25,
      timeToMilestoneMonths: 18,
      capitalRequired: Math.round(currentSalary * 6),
      careerOptionality: 'Maximum',
      confidenceLevel: 'Low (30%)',
      summary: 'Ölçeklenebilir mülkiyet ve sınırsız getiri. İlk 1-2 yılda sıfır veya negatif nakit akışı ve yüksek batma riski barındırır.'
    }
  ];

  return {
    currency,
    currentSalaryMonthly: currentSalary,
    targetSalaryMonthly: targetSalary,
    scenarios
  };
}

function calculateSalaryTrajectory(currentMonthly, targetMonthly, timelineMonths = 24, currency = 'TRY') {
  const c = Math.max(1000, currentMonthly || 10000);
  const t = Math.max(c, targetMonthly || c * 1.4);
  const totalMonths = Math.max(6, Math.min(60, timelineMonths || 24));
  const stepCount = Math.floor(totalMonths / 6);

  // 6 Domain-neutral paths specified in Section 17
  const paths = [
    {
      id: 'promotion',
      name: 'İç Terfi Yolu (Promotion)',
      points: []
    },
    {
      id: 'job_change',
      name: 'Stratejik Şirket Değişimi (Job Change)',
      points: []
    },
    {
      id: 'specialization',
      name: 'Derin Uzmanlaşma (Specialization)',
      points: []
    },
    {
      id: 'management',
      name: 'Yönetsel Liderlik Yolu (Management)',
      points: []
    },
    {
      id: 'freelance',
      name: 'Serbest Çalışma / Bağımsız Danışmanlık (Freelance)',
      points: []
    },
    {
      id: 'business',
      name: 'Girişimcilik & Kendi İşini Kurma (Business)',
      points: []
    }
  ];

  for (let i = 0; i <= stepCount; i++) {
    const month = i * 6;
    const progressRatio = month / totalMonths;

    // 1. Promotion: Steady internal progression
    const promoMin = Math.round(c + (t * 0.85 - c) * progressRatio);
    const promoMax = Math.round(c + (t * 1.05 - c) * progressRatio);
    const promoExp = Math.round(c + (t * 0.95 - c) * progressRatio);
    paths[0].points.push({
      month,
      min: promoMin,
      max: promoMax,
      expected: promoExp,
      amount: promoExp,
      range: `${promoMin.toLocaleString()} - ${promoMax.toLocaleString()} ${currency}`
    });

    // 2. Job Change: External leaps across tiers
    let jcMin = c;
    let jcMax = c;
    let jcExp = c;
    if (i > 0) {
      if (progressRatio < 0.5) {
        jcMin = Math.round(c * 1.08);
        jcMax = Math.round(c * 1.25);
        jcExp = Math.round(c * 1.15);
      } else {
        jcMin = Math.round(t * (0.90 + 0.08 * progressRatio));
        jcMax = Math.round(t * (1.10 + 0.18 * progressRatio));
        jcExp = Math.round(t * (1.00 + 0.12 * progressRatio));
      }
    }
    paths[1].points.push({
      month,
      min: jcMin,
      max: jcMax,
      expected: jcExp,
      amount: jcExp,
      range: `${jcMin.toLocaleString()} - ${jcMax.toLocaleString()} ${currency}`
    });

    // 3. Specialization: Initial ramp then premium domain pricing
    const specMin = i === 0 ? c : Math.round(c + (t * 0.95 - c) * Math.pow(progressRatio, 1.3));
    const specMax = i === 0 ? c : Math.round(c + (t * 1.30 - c) * Math.pow(progressRatio, 1.1));
    const specExp = i === 0 ? c : Math.round(c + (t * 1.15 - c) * Math.pow(progressRatio, 1.2));
    paths[2].points.push({
      month,
      min: specMin,
      max: specMax,
      expected: specExp,
      amount: specExp,
      range: `${specMin.toLocaleString()} - ${specMax.toLocaleString()} ${currency}`
    });

    // 4. Management: Executive / People track
    const mgmtMin = Math.round(c + (t * 0.90 - c) * progressRatio);
    const mgmtMax = Math.round(c + (t * 1.25 - c) * Math.pow(progressRatio, 0.9));
    const mgmtExp = Math.round(c + (t * 1.10 - c) * progressRatio);
    paths[3].points.push({
      month,
      min: mgmtMin,
      max: mgmtMax,
      expected: mgmtExp,
      amount: mgmtExp,
      range: `${mgmtMin.toLocaleString()} - ${mgmtMax.toLocaleString()} ${currency}`
    });

    // 5. Freelance: Flexible contract pricing with broader variance
    const freeMin = i === 0 ? c : Math.round(c * (0.75 + 0.25 * progressRatio));
    const freeMax = i === 0 ? c : Math.round(c * 0.80 + (t * 1.60 - c * 0.80) * progressRatio);
    const freeExp = i === 0 ? c : Math.round(c + (t * 1.20 - c) * progressRatio);
    paths[4].points.push({
      month,
      min: freeMin,
      max: freeMax,
      expected: freeExp,
      amount: freeExp,
      range: `${freeMin.toLocaleString()} - ${freeMax.toLocaleString()} ${currency}`
    });

    // 6. Business: Venture / Equity upside with high initial uncertainty
    const bizMin = i === 0 ? c : (progressRatio < 0.5 ? Math.round(c * 0.40) : Math.round(c * 0.80));
    const bizMax = i === 0 ? c : Math.round(c * 0.50 + (t * 2.50 - c * 0.50) * Math.pow(progressRatio, 1.5));
    const bizExp = i === 0 ? c : (progressRatio < 0.5 ? Math.round(c * 0.70) : Math.round(t * 1.40));
    paths[5].points.push({
      month,
      min: bizMin,
      max: bizMax,
      expected: bizExp,
      amount: bizExp,
      range: `${bizMin.toLocaleString()} - ${bizMax.toLocaleString()} ${currency}`
    });
  }

  return {
    currency,
    timelineMonths: totalMonths,
    baselineMonthly: c,
    targetMonthly: t,
    paths
  };
}

module.exports = {
  simulateCareerPaths,
  calculateSalaryTrajectory
};
