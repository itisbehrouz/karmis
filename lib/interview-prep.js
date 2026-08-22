/**
 * KARMİS Interview Prep & STAR Simulator
 * Generates structured 5-question STAR method simulation matrix for candidate interview prep.
 */

function generateInterviewPrep(company = 'Roche Türkiye', jobTitle = 'Business Insights & Analytics Partner') {
  return {
    company,
    jobTitle,
    questions: [
      {
        id: 1,
        question: "1. İş birimlerine yapay zekâ ve analitik otomasyon araçlarını (Gemini, Claude, Co-Pilot) nasıl benimsedirsiniz?",
        situation: "Saha ve ticari mükemmellik ekipleri manuel Excel raporlamaları sebebiyle stratejik kararlarda zaman kaybediyordu.",
        action: "Power BI panellerine LLM içgörü motorları entegre ederek otomatik haftalık özet üretimi tasarladım.",
        result: "Raporlama hazırlık süresini %70 kısaltarak saha ve C-Level karar alma süreçlerini hızlandırdık."
      },
      {
        id: 2,
        question: "2. IQVIA, CRM ve pazar payı verilerini stratejik ticari kararlara nasıl dönüştürürsünüz?",
        situation: "Bölgesel hedefleme ve pazar segmentasyon verilerinde farklı kaynaklar arasında kopukluk mevcuttu.",
        action: "IQVIA satış verilerini Veeva/CRM altyapısı ile dinamik segmentasyon dashboard'larına bağladım.",
        result: "Saha satış hedefleme doğruk oranını %35 artırarak ticari verimliliği yükselttik."
      },
      {
        id: 3,
        question: "3. Karmaşık veri mimarisi ve teknik çıktıları teknik olmayan C-Level yöneticilere nasıl sunarsınız?",
        situation: "Üst yönetim karmaşık veri ambarı tabloları yerine hızlı kararlar için sade görsel çıktılara ihtiyaç duyuyordu.",
        action: "Data storytelling prensipleriyle sade ve dinamik KPI dashboard mimarileri oluşturdum.",
        result: "Yönetim kurulu karar alma ve aksiyon belirleme süresini %50 hızlandırdık."
      },
      {
        id: 4,
        question: "4. Veri yönetişimi (Data Governance) ve yasal uyum gereksinimlerini projelerinizde nasıl sağlarsınız?",
        situation: "Hassas müşteri ve ticari verilerin güvenliği ve yasal regülasyon uyumu kritik önem taşıyordu.",
        action: "Rol tabanlı erişim kontrolü (RBAC) ve anonimleştirilmiş veri işleme protokolleri kurdum.",
        result: "Sıfır veri ihlali ile %100 regülasyon uyumu sağladık."
      },
      {
        id: 5,
        question: "5. Bütçe ve kaynak kısıtları altında büyük ölçekli dijital dönüşüm projesini nasıl yönetirsiniz?",
        situation: "Kısıtlı zaman ve bütçe dahilinde kurumsal analitik altyapısının yenilenmesi gerekiyordu.",
        action: "Çevik (Agile) önceliklendirme ile yüksek etkili modülleri ilk fazda canlıya aldım.",
        result: "Projeyi bütçe dahilinde ve zamanında tamamlayarak ilk çeyrekte yatırım getirisini (ROI) kanıtladık."
      }
    ]
  };
}

function renderInterviewMarkdown(prep) {
  return `# KARMİS Mülakat Hazırlık Simülasyonu: ${prep.company} - ${prep.jobTitle}

| Mülakat Sorusu | Durum & Görev (Situation & Task) | Eylem (Action) | Sonuç (Result) |
|---|---|---|---|
${prep.questions.map(q => `| ${q.question} | ${q.situation} | ${q.action} | ${q.result} |`).join('\n')}
`;
}

module.exports = { generateInterviewPrep, renderInterviewMarkdown };
