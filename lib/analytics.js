/**
 * KARMİS V2 Career Analytics & Personal Learning Loop
 * Derives empirical funnel metrics and outcome calibration from real application history.
 */

const { getDb } = require('./db');

function calculateCareerAnalytics() {
  const db = getDb();
  let apps = [];
  let evals = [];
  try {
    apps = db.prepare('SELECT * FROM applications').all();
    evals = db.prepare('SELECT * FROM job_evaluations').all();
  } catch (e) {
    apps = [];
    evals = [];
  }

  const total = apps.length;
  if (total === 0) {
    return {
      totalApplications: 0,
      activeCount: 0,
      interviewCount: 0,
      offerCount: 0,
      rejectedCount: 0,
      interviewRate: 0,
      offerRate: 0,
      averageScore: 0,
      averageSalary: 0,
      averageRisk: 0,
      bestPerformingRoleTypes: [],
      bestPerformingIndustries: [],
      bestPerformingSeniority: [],
      statusBreakdown: {},
      channelBreakdown: {},
      roleBreakdown: {},
      learningLoop: {
        analyzedOutcomes: 0,
        averagePredictedProbability: 0,
        actualSuccessRate: 0,
        calibrationDelta: 0,
        calibrationInsight: 'Henüz yeterli başvuru sonucu birikmedi. Gerçek sonuçlar eklendikçe öğrenme döngüsü kalibre edilecektir.'
      }
    };
  }

  const statusBreakdown = {};
  const channelBreakdown = {};
  const roleKeywords = {};
  const industryKeywords = {};
  const seniorityKeywords = {
    'Executive / C-Level': { count: 0, interviews: 0, offers: 0 },
    'Senior / Lead': { count: 0, interviews: 0, offers: 0 },
    'Mid-Level': { count: 0, interviews: 0, offers: 0 },
    'Junior / Entry': { count: 0, interviews: 0, offers: 0 }
  };

  let totalScore = 0;
  let scoreCount = 0;
  let totalSalary = 0;
  let salaryCount = 0;

  let interviewCount = 0;
  let offerCount = 0;
  let rejectedCount = 0;
  let appliedCount = 0;

  for (const a of apps) {
    const status = (a.status || 'SAVED').trim();
    statusBreakdown[status] = (statusBreakdown[status] || 0) + 1;

    const source = (a.source || 'Portal').trim();
    channelBreakdown[source] = (channelBreakdown[source] || 0) + 1;

    if (a.score > 0) {
      totalScore += a.score;
      scoreCount++;
    }

    if (a.salary_offered > 0) {
      totalSalary += a.salary_offered;
      salaryCount++;
    }

    // Status groups
    const sLower = status.toLowerCase();
    const isApplied = sLower.includes('applied') || sLower.includes('interview') || sLower.includes('offer') || sLower.includes('responded') || sLower.includes('rejected');
    const isInterview = sLower.includes('interview') || sLower.includes('mülakat') || sLower.includes('final');
    const isOffer = sLower.includes('offer') || sLower.includes('teklif') || sLower.includes('accepted');
    const isRejected = sLower.includes('reject') || sLower.includes('red') || sLower.includes('iptal');

    if (isApplied) appliedCount++;
    if (isInterview) interviewCount++;
    if (isOffer) offerCount++;
    if (isRejected) rejectedCount++;

    // Domain-neutral Role Type categorization
    const pos = (a.position || '').toLowerCase();
    let roleSegment = 'Genel & Diğer';
    if (/director|head|vp|chief|c_level|president|executive/i.test(pos)) roleSegment = 'Executive & Üst Yönetim';
    else if (/analytics|bi|data|veri|scientist|analyst/i.test(pos)) roleSegment = 'Veri & Analitik';
    else if (/product|ürün/i.test(pos)) roleSegment = 'Ürün Yönetimi';
    else if (/software|developer|yazılım|engineer|frontend|backend|cloud|devops/i.test(pos)) roleSegment = 'Yazılım & Mühendislik';
    else if (/security|güvenlik|cyber|siber/i.test(pos)) roleSegment = 'Bilgi Güvenliği';
    else if (/process|süreç|operations|operasyon|supply|logistics/i.test(pos)) roleSegment = 'Operasyon & Süreç';
    else if (/finance|accounting|muhasebe|finans|audit|tax/i.test(pos)) roleSegment = 'Finans & Muhasebe';
    else if (/sales|satış|commercial|business dev|hesap/i.test(pos)) roleSegment = 'Satış & İş Geliştirme';
    else if (/marketing|pazarlama|growth|brand/i.test(pos)) roleSegment = 'Pazarlama & Büyüme';
    else if (/hr|insan kaynakları|recruiter|talent/i.test(pos)) roleSegment = 'İnsan Kaynakları';
    else if (/legal|hukuk|avukat|compliance/i.test(pos)) roleSegment = 'Hukuk & Mevzuat';
    else if (/transform|dönüşüm/i.test(pos)) roleSegment = 'Dijital Dönüşüm';

    if (!roleKeywords[roleSegment]) {
      roleKeywords[roleSegment] = { count: 0, interviews: 0, offers: 0 };
    }
    roleKeywords[roleSegment].count++;
    if (isInterview) roleKeywords[roleSegment].interviews++;
    if (isOffer) roleKeywords[roleSegment].offers++;

    // Industry / Channel segmentation
    const indSegment = source;
    if (!industryKeywords[indSegment]) {
      industryKeywords[indSegment] = { count: 0, interviews: 0, offers: 0 };
    }
    industryKeywords[indSegment].count++;
    if (isInterview) industryKeywords[indSegment].interviews++;
    if (isOffer) industryKeywords[indSegment].offers++;

    // Seniority segmentation
    let senSegment = 'Mid-Level';
    if (/director|head|vp|c_level|chief|president|executive/i.test(pos)) senSegment = 'Executive / C-Level';
    else if (/senior|lead|principal|architect|kıdemli/i.test(pos)) senSegment = 'Senior / Lead';
    else if (/junior|associate|entry|intern|stajyer/i.test(pos)) senSegment = 'Junior / Entry';

    seniorityKeywords[senSegment].count++;
    if (isInterview) seniorityKeywords[senSegment].interviews++;
    if (isOffer) seniorityKeywords[senSegment].offers++;
  }

  const denominator = appliedCount > 0 ? appliedCount : total;
  const interviewRate = Math.round((interviewCount / denominator) * 100);
  const offerRate = Math.round((offerCount / denominator) * 100);
  const averageScore = scoreCount > 0 ? Math.round(totalScore / scoreCount) : 0;
  const averageSalary = salaryCount > 0 ? Math.round(totalSalary / salaryCount) : 0;

  // Compute average risk score from job evaluations
  let averageRisk = 0;
  if (evals.length > 0) {
    const totalRisk = evals.reduce((acc, ev) => acc + (ev.risk_score || 0), 0);
    averageRisk = Math.round(totalRisk / evals.length);
  } else {
    // Estimate from scores: lower scores generally correlate with risk
    averageRisk = Math.max(10, Math.min(60, 100 - (averageScore || 75)));
  }

  // Format best performing segments
  const bestPerformingRoleTypes = Object.entries(roleKeywords)
    .map(([segment, data]) => ({
      segment,
      count: data.count,
      interviews: data.interviews,
      offers: data.offers,
      interviewRate: data.count > 0 ? Math.round((data.interviews / data.count) * 100) : 0
    }))
    .sort((a, b) => b.interviewRate - a.interviewRate || b.count - a.count);

  const bestPerformingIndustries = Object.entries(industryKeywords)
    .map(([segment, data]) => ({
      segment,
      count: data.count,
      interviews: data.interviews,
      offers: data.offers,
      interviewRate: data.count > 0 ? Math.round((data.interviews / data.count) * 100) : 0
    }))
    .sort((a, b) => b.interviewRate - a.interviewRate || b.count - a.count);

  const bestPerformingSeniority = Object.entries(seniorityKeywords)
    .filter(([_, data]) => data.count > 0)
    .map(([segment, data]) => ({
      segment,
      count: data.count,
      interviews: data.interviews,
      offers: data.offers,
      interviewRate: data.count > 0 ? Math.round((data.interviews / data.count) * 100) : 0
    }))
    .sort((a, b) => b.interviewRate - a.interviewRate || b.count - a.count);

  // Section 20: Personal Learning Loop (Predicted Success Probability vs Actual Outcome)
  const resolvedCount = interviewCount + offerCount + rejectedCount;
  let avgPredictedProb = 0;
  if (evals.length > 0) {
    const totalProb = evals.reduce((acc, ev) => acc + (ev.success_probability || ev.overall_score || 70), 0);
    avgPredictedProb = Math.round(totalProb / evals.length);
  } else {
    avgPredictedProb = averageScore || 75;
  }

  const actualSuccessRate = interviewRate;
  const calibrationDelta = actualSuccessRate - avgPredictedProb;

  let calibrationInsight = '';
  if (resolvedCount >= 3) {
    if (calibrationDelta >= 15) {
      calibrationInsight = `Pozitif Kalibrasyon (+%${calibrationDelta}): Gerçek mülakat oranınız (%${actualSuccessRate}), modelin tahmin ettiği taban olasılığın (%${avgPredictedProb}) belirgin üzerinde. Üst kıdem ve daha yüksek bütçeli rollere genişleyebilirsiniz.`;
    } else if (calibrationDelta <= -15 && appliedCount >= 6) {
      calibrationInsight = `Aşırı İyimserlik Uyarısı (-%${Math.abs(calibrationDelta)}): Model tahmin ortalaması (%${avgPredictedProb}) gerçekleşen mülakat oranının (%${actualSuccessRate}) üzerinde kalıyor. Başvurulan ilanlarda yetkinlik kanıtlarını ve somut metrikleri güçlendirin.`;
    } else if (interviewRate >= 20) {
      calibrationInsight = `Dengeli Model Kalibrasyonu: Gerçek mülakat dönüşümü (%${interviewRate}) ile model tahminleri (%${avgPredictedProb}) yüksek uyum gösteriyor. Yüksek uyum puanlı (%80+) ilanlara odaklanmaya devam edin.`;
    } else {
      calibrationInsight = `Filtre Darboğazı: %${interviewRate} mülakat oranı tespit edildi. Model ve profil konumlandırmasını daraltarak doğrudan karar verici odaklı kanıtlar ekleyin.`;
    }
  } else {
    calibrationInsight = 'Başvuru süreçleriniz geliştikçe tahmin edilen başarı olasılıkları ile gerçekleşen mülakat ve teklif sonuçları burada şeffaf kurallarla kıyaslanacaktır.';
  }

  return {
    totalApplications: total,
    activeCount: total - rejectedCount - offerCount,
    appliedCount,
    interviewCount,
    offerCount,
    rejectedCount,
    interviewRate,
    offerRate,
    averageScore,
    averageSalary,
    averageRisk,
    bestPerformingRoleTypes,
    bestPerformingIndustries,
    bestPerformingSeniority,
    statusBreakdown,
    channelBreakdown,
    roleBreakdown: roleKeywords,
    learningLoop: {
      analyzedOutcomes: resolvedCount,
      averagePredictedProbability: avgPredictedProb,
      actualSuccessRate,
      calibrationDelta,
      calibrationInsight
    }
  };
}

module.exports = {
  calculateCareerAnalytics
};
