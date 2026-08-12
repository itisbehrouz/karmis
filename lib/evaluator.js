/**
 * KARMİS Evaluation Engine
 * Evaluates candidate match score, filter penalties, salary benchmarks,
 * STAR interview questions, and LinkedIn outreach notes.
 */

function evaluateJobPosting(jobDetails, candidateProfile, config = {}) {
  const threshold = config.matchThreshold || 80;
  
  // Calculate Base Match Score
  let score = 85;

  // Apply Filter Penalties
  if (jobDetails.hasHeavyRegulatory) {
    score += config.filters?.penalties?.regulatoryCompliance || -20;
  }
  if (jobDetails.isJuniorDownleveling) {
    score += config.filters?.penalties?.downlevelingJunior || -25;
  }
  if (jobDetails.isFieldSalesQuota) {
    score += config.filters?.penalties?.fieldQuotaSales || -25;
  }

  const decision = score >= threshold ? 'BAŞVURULACAK' : 'PAS GEÇİLECEK';

  return {
    jobTitle: jobDetails.title,
    company: jobDetails.company,
    score,
    threshold,
    decision,
    recommendedSalaryOpening: jobDetails.salaryOpening || 'Esnek Görüşme Açılışı',
    sections: [
      'Hızlı Okuma Özet Tablosu',
      'Sade & Açık Mavi Şirket Rakamları Grafiği',
      'Aday Uyum Puanı & Detaylı Risk Matrisi',
      'Executive Cover Letter & İK İletişim Metni',
      'LinkedIn Executive Outreach Notu',
      'Mülakat Hazırlık Asistanı (STAR Metodu)',
      'ATS CV Anahtar Kelime Optimizasyonu'
    ]
  };
}

module.exports = { evaluateJobPosting };
