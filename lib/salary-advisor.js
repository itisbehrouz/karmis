/**
 * KARMİS Salary Benchmark & Offer Negotiation Advisor v1.0.0
 * Provides detailed compensation breakdown (Net, Gross, Bonus, Perks)
 * and tailored executive counter-offer negotiation scripts.
 */

const { getCompany } = require('./db');

function getSalaryAdvice(company = 'Kurumsal Şirket', jobTitle = 'Teknoloji Yöneticisi') {
  const compData = getCompany(company) || {};
  const benchmark = compData.salaryBenchmark || '160.000 TL - 220.000 TL Net / Ay';
  const opening = compData.salaryOpening || '180.000 TL - 200.000 TL Net / Ay';

  const packageBreakdown = {
    benchmarkMonthlyNet: benchmark,
    recommendedOpeningNet: opening,
    targetAnnualBonus: 'Yıllık 2 — 4 Maaş Performans Primi (%15 - %30 Yıllık Ek Getiri)',
    executivePerks: [
      'Üst Düzey Şirket Aracı (D-Segment / Elektrikli SUV) veya Aylık Araç Ödeneği',
      'Tam Kapsamlı Aile Özel Sağlık Sigortası (Özel & Tamamlayıcı VIP Plan)',
      'Yıllık Teknoloji / Ev Ofis & Sürekli Eğitim / Konferans Bütçesi',
      'Esnek / Hibrit Çalışma Modeli (Haftada 2 gün ofis / 3 gün remote veya tam esnek)',
      'Performansa Bağlı Hisse Opsiyonu (ESOP) veya Uzun Vadeli Teşvik Primi (LTI)'
    ]
  };

  const negotiationStrategies = [
    {
      scenario: '1. İlk Maaş Beklentisi Sorulduğunda (İK / İlk Görüşme)',
      strategy: 'Doğrudan tek bir rakam yerine piyasa aralığını ve rolün sorumluluk kapsamını öne çıkararak geniş bir bant verin.',
      script: `"${company}'deki bu kritik pozisyonun sorumluluk alanı, teknik liderlik boyutu ve tecrübemin getireceği katma değeri göz önünde bulundurarak piyasa beklentim ${opening} bandındadır. Ancak kurumunuzun sunduğu yan haklar ve toplam paketle birlikte esnek ve yapıcı bir değerlendirmeye açığım."`
    },
    {
      scenario: '2. Teklif Beklentinin Altında Geldiğinde (Karşı Teklif / Counter-Offer)',
      strategy: 'Pozisyona olan heyecanı teyit edip, spesifik bir değer teklifiyle rakamı %15-20 yukarı çekin.',
      script: `"Sayın İK Lideri, ${company} ekibine katılma konusundaki heyecanım çok yüksek. Rolün gerektirdiği kurumsal dönüşüm hızı ve ilk 90 günde masaya koyacağım katma değer dikkate alındığında, teklif edilen aylık net rakamın [Mevcut Rakam] yerine [Hedeflenen Rakam] seviyesine revize edilmesi halinde teklifi hemen memnuniyetle imzalamaya hazırım."`
    },
    {
      scenario: '3. Taban Maaş Sabit Kaldığında Yan Hakları / Primi Artırma',
      strategy: 'Taban maaş bütçesi esnek değilse, imza primi (sign-on bonus), yıllık prim katsayısı veya araç bütçesini müzakere edin.',
      script: `"Kurumunuzun taban maaş skalasını anlayışla karşılıyorum. Toplam yıllık kazancı hedeflediğimiz dengeye ulaştırmak adına, 6. ay sonundaki KPI başarı hedeflerine bağlı ek bir performans primi katsayısı veya başlangıç için bir defaya mahsus 'Sign-on Bonus' formülünü değerlendirebilir miyiz?"`
    }
  ];

  return {
    company,
    jobTitle,
    packageBreakdown,
    negotiationStrategies
  };
}

module.exports = { getSalaryAdvice };
