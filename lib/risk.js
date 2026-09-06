/**
 * KARMİS V2 Expanded Risk Engine
 * Detects 17 distinct career and workplace risk indicators.
 * Explicitly penalizes recommendation score and returns clear risk factors.
 */

const { CAREER_LEVELS } = require('./constants');

const RISK_RULES = [
  {
    id: 'downleveling',
    name: 'Kıdem Altı / Downleveling Riski',
    penalty: 25,
    severity: 'high',
    detect: (job, candidate) => {
      if (job.isJuniorDownleveling) return true;
      const candidateRank = CAREER_LEVELS[candidate.currentLevel]?.rank || 5;
      const jobRank = CAREER_LEVELS[job.seniorityLevel]?.rank || (
        /junior|intern|associate|entry/i.test(job.seniority || job.title || '') ? 4 : 5
      );
      return candidateRank >= 6 && jobRank <= 4;
    },
    explain: (job, candidate) =>
      `Pozisyon seviyesi (${job.seniority || 'Junior'}), mevcut kıdeminizin (${candidate.currentLevel}) altında kalmaktadır.`
  },
  {
    id: 'underpayment',
    name: 'Düşük Ücretlendirme / Underpayment Riski',
    penalty: 20,
    severity: 'high',
    detect: (job, candidate) => {
      const minSalary = candidate.constraints?.minSalary || candidate.financialGoals?.currentSalary || 0;
      const offeredSalary = job.salaryOffered || job.salaryMax || 0;
      return minSalary > 0 && offeredSalary > 0 && offeredSalary < minSalary * 0.85;
    },
    explain: (job, candidate) =>
      `Teklif edilen bütçe, hedeflenen taban gelirin %15 veya daha fazla altında kalmaktadır.`
  },
  {
    id: 'unrealistic_requirements',
    name: 'Gerçekçi Olmayan Şartlar / Unrealistic Requirements',
    penalty: 15,
    severity: 'medium',
    detect: (job) => {
      const text = (job.rawDescription || '') + ' ' + (job.requirements?.join(' ') || '');
      const buzzwords = ['unicorn', 'rockstar', 'ninja', 'guru', '10x engineer', 'her işi yapabilen'];
      const count = buzzwords.filter(w => new RegExp(w, 'i').test(text)).length;
      return count >= 2 || (job.requirements && job.requirements.length > 25);
    },
    explain: () =>
      'İlan metninde gerçekçi olmayan beklentiler, aşırı geniş yetkinlik listesi veya tek kişilik ordu arayışı tespit edildi.'
  },
  {
    id: 'excessive_experience',
    name: 'Aşırı Deneyim Talebi / Excessive Experience',
    penalty: 15,
    severity: 'medium',
    detect: (job) => {
      const match = (job.rawDescription || '').match(/(\d+)\s*\+?\s*(?:yıl|year|years)\s*(?:tecrübe|deneyim|experience)/i);
      if (match) {
        const years = parseInt(match[1], 10);
        return years > 12 && /mid|junior|uzman/i.test(job.seniority || job.title || '');
      }
      return false;
    },
    explain: () =>
      'Pozisyon unvanına kıyasla orantısız derecede yüksek yıl tecrübesi şart koşulmaktadır.'
  },
  {
    id: 'excessive_travel',
    name: 'Aşırı Seyahat Yükü / Excessive Travel',
    penalty: 20,
    severity: 'medium',
    detect: (job, candidate) => {
      const maxTolerance = candidate.preferences?.travelTolerancePercent ?? 20;
      const travelMatch = (job.rawDescription || '').match(/(?:%|yüzde)\s*(\d+)\s*seyahat|travel\s*(?:up to)?\s*(\d+)%/i);
      if (travelMatch) {
        const travelPct = parseInt(travelMatch[1] || travelMatch[2], 10);
        return travelPct > maxTolerance;
      }
      return /yoğun seyahat|heavy travel|frequent travel/i.test(job.rawDescription || '') && maxTolerance < 30;
    },
    explain: () =>
      'İlan şartlarında adayın seyahat toleransını aşan yoğun iş gezisi veya saha deplasmanı bulunmaktadır.'
  },
  {
    id: 'cold_call_quotas',
    name: 'Soğuk Satış Kotası / Cold-Call Quotas',
    penalty: 25,
    severity: 'high',
    detect: (job) => {
      if (job.isFieldSalesQuota) return true;
      const text = (job.rawDescription || '') + ' ' + (job.title || '');
      return /cold call|soğuk arama|kapı kapı|saha kotası|hunting quota|telemarketing/i.test(text);
    },
    explain: () =>
      'Rol doğrudan soğuk arama ve agresif outbound satış kotası içermektedir.'
  },
  {
    id: 'commission_only',
    name: 'Prim Odaklı / Komisyon Bazlı Ücret Riski',
    penalty: 30,
    severity: 'fatal',
    detect: (job) => {
      const text = (job.rawDescription || '');
      return /commission only|sadece prim|tamamı prim|komisyon usulü|maaşsız/i.test(text);
    },
    explain: () =>
      'Sabit taban maaş güvencesi bulunmayan prim odaklı gelir modeli tespit edildi.'
  },
  {
    id: 'poor_career_progression',
    name: 'Düşük Kariyer İlerlemesi / Poor Career Progression',
    penalty: 15,
    severity: 'medium',
    detect: (job) => {
      const text = (job.rawDescription || '');
      return /tek kişilik kadro|yatay hiyerarşi bulunmayan|kariyer yolu tanımlanmamış/i.test(text);
    },
    explain: () =>
      'Pozisyonda dikey yükselme veya yapısal kariyer gelişim olanakları belirsizdir.'
  },
  {
    id: 'excessive_bureaucracy',
    name: 'Mevzuat & Ağır Bürokrasi Filtresi',
    penalty: 25,
    severity: 'high',
    detect: (job) => {
      if (job.hasHeavyRegulatory) return true;
      const text = (job.rawDescription || '');
      return /bddk|tcmb|masak|spk mevzuatı|resmi evrak takibi|bürokratik onay/i.test(text);
    },
    explain: () =>
      'İçerikte ağır mevzuat, BDDK/TCMB/SPK denetimi veya resmi yasal evrak yükümlülüğü tespit edildi.'
  },
  {
    id: 'unclear_responsibilities',
    name: 'Belirsiz Görev Tanımı / Unclear Responsibilities',
    penalty: 15,
    severity: 'low',
    detect: (job) => {
      const desc = job.rawDescription || '';
      return desc.length > 50 && desc.length < 250 && (!job.requirements || job.requirements.length === 0);
    },
    explain: () =>
      'İlan metni somut sorumluluklar ve başarı kriterleri tanımlamamaktadır.'
  },
  {
    id: 'role_ambiguity',
    name: 'Rol & Unvan Uyumsuzluğu / Role Ambiguity',
    penalty: 20,
    severity: 'medium',
    detect: (job) => {
      const title = job.title || '';
      const desc = job.rawDescription || '';
      if (/director|lead|architect|manager/i.test(title) && /helpdesk|destek personeli|veri girişi|data entry/i.test(desc)) {
        return true;
      }
      return false;
    },
    explain: () =>
      'İlan unvanı ile açıklamadaki operasyonel iş yükü arasında temel uyumsuzluk bulunmaktadır.'
  },
  {
    id: 'excessive_workload',
    name: 'Aşırı İş Yükü / Excessive Workload',
    penalty: 20,
    severity: 'high',
    detect: (job) => {
      const text = job.rawDescription || '';
      return /24\/7|gece vardiyası|hafta sonu çalışma|yoğun mesai|wear many hats|stress tolerance/i.test(text);
    },
    explain: () =>
      'İlanda aşırı mesai, 7/24 nöbet veya tükenmişlik (burnout) sinyalleri tespit edildi.'
  },
  {
    id: 'contract_risk',
    name: 'Sözleşme & İstihdam Güvencesi Riski',
    penalty: 20,
    severity: 'high',
    detect: (job) => {
      const text = job.rawDescription || '';
      return /ücretsiz staj|unpaid|şahıs şirketi zorunlu|rehin|ağır cezai şart/i.test(text);
    },
    explain: () =>
      'İstihdam koşullarında adil olmayan sözleşme veya hukuki risk unsurları yer almaktadır.'
  },
  {
    id: 'location_mismatch',
    name: 'Lokasyon & Ulaşım Uyumsuzluğu',
    penalty: 25,
    severity: 'high',
    detect: (job, candidate) => {
      if (job.workingModel === 'remote' || /remote|uzaktan/i.test(job.location || '')) return false;
      const candLoc = (candidate.identity?.location || '').toLowerCase();
      const jobLoc = (job.location || '').toLowerCase();
      if (candLoc && jobLoc && !jobLoc.includes('remote') && !jobLoc.includes('hibrit') && !jobLoc.includes('hybrid')) {
        if (candidate.constraints?.cannotRelocate && !jobLoc.includes(candLoc)) {
          return true;
        }
      }
      return false;
    },
    explain: (job) =>
      `Pozisyon lokasyonu (${job.location || 'Ofis'}), adayın çalışma konumu veya taşınma kısıtları ile çelişmektedir.`
  },
  {
    id: 'working_model_mismatch',
    name: 'Çalışma Modeli Uyumsuzluğu / Model Mismatch',
    penalty: 20,
    severity: 'medium',
    detect: (job, candidate) => {
      const candPref = candidate.preferences?.remotePreference || 'hybrid';
      const jobModel = (job.workingModel || job.location || '').toLowerCase();
      if (candPref === 'remote' && (jobModel.includes('on-site') || jobModel.includes('ofisten') || jobModel.includes('5 gün ofis'))) {
        return true;
      }
      return false;
    },
    explain: () =>
      'Aday uzaktan/hibrit çalışma hedeflerken ilan tam zamanlı ofis zorunluluğu istemektedir.'
  },
  {
    id: 'skill_mismatch',
    name: 'Kritik Yetkinlik Eksikliği / Core Skill Mismatch',
    penalty: 25,
    severity: 'high',
    detect: (job) => {
      // Flagged when skill gap engine calculates critical skills missing
      return job.missingCriticalSkillCount >= 3;
    },
    explain: (job) =>
      `Pozisyonun temel gereksinimlerinden ${job.missingCriticalSkillCount} kritik yetkinlik aday profilinde bulunmamaktadır.`
  },
  {
    id: 'management_risk',
    name: 'Yönetim & Şirket İklimi Riski',
    penalty: 15,
    severity: 'low',
    detect: (job) => {
      const text = job.rawDescription || '';
      return /yüksek sirkülasyon|turnover|patron şirketi|aile şirketi kültürü|ani karar alma/i.test(text);
    },
    explain: () =>
      'Şirket yönetim iklimi veya ekip istikrarı hakkında risk göstergeleri mevcuttur.'
  }
];

function evaluateRisks(jobDetails = {}, candidateDna = {}) {
  const detectedRisks = [];
  let totalPenalty = 0;

  for (const rule of RISK_RULES) {
    let matches = false;
    try {
      matches = rule.detect(jobDetails, candidateDna);
    } catch (e) {
      matches = false;
    }

    if (matches) {
      totalPenalty += rule.penalty;
      detectedRisks.push({
        id: rule.id,
        name: rule.name,
        severity: rule.severity,
        penalty: rule.penalty,
        reason: rule.explain(jobDetails, candidateDna)
      });
    }
  }

  // Risk score: 0 (no risk) to 100 (maximum risk)
  const totalRiskScore = Math.min(100, Math.round(totalPenalty));

  return {
    riskScore: totalRiskScore,
    riskCount: detectedRisks.length,
    detectedRisks,
    hasFatalRisk: detectedRisks.some(r => r.severity === 'fatal')
  };
}

module.exports = {
  RISK_RULES,
  evaluateRisks
};
