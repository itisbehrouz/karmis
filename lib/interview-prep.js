/**
 * KARMİS Interview Intelligence & 30-60-90 Day Executive Planner v3.0.0
 * Generates:
 * 1. 5-Question STAR Method behavioral simulation matrix
 * 2. 5 Reverse Strategic Questions for candidate to ask hiring leadership
 * 3. 30-60-90 Day Executive Onboarding & Value-Creation Action Plan
 */

function generateInterviewPrep(company = 'Kurumsal Şirket', jobTitle = 'Teknoloji Yöneticisi') {
  const compLower = (company || '').toLowerCase();
  const titleLower = (jobTitle || '').toLowerCase();

  let questions = [];
  let reverseQuestions = [];
  let plan90Days = {};

  // 1. ERP & Manufacturing / Sanayi & Operasyon (Rönesans, MindDX, vb.)
  if (titleLower.includes('erp') || titleLower.includes('manufacturing') || titleLower.includes('üretim') || compLower.includes('rönesans') || compLower.includes('ronesans') || compLower.includes('minddx')) {
    questions = [
      {
        id: 1,
        question: `1. ${company} bünyesindeki üretim tesisleri ve iş birimlerinde ERP standardizasyonunu sağlarken sahadan gelen direnci nasıl yönetirsiniz?`,
        situation: "Farklı fabrika ve tesislerde yerel alışkanlıklar nedeniyle ERP entegrasyonlarında veri kopukluğu ve süreç uyumsuzluğu yaşanıyordu.",
        action: "Üretim ve operasyon liderlerini kapsayan 'Change Champions' ağı kurdum; ortak veri modelleri ve pratik iş akışları tasarladım.",
        result: "Süreç varyansını minimize ederek tüm üretim ve tedarik veri akışını tek merkezde topladım; proje döngüsünü %67 hızlandırdım."
      },
      {
        id: 2,
        question: "2. Üretim süreçlerinde ERP ve Endüstriyel BT sistemlerinin kesintisiz çalışmasını nasıl garanti edersiniz?",
        situation: "Ağır sanayi ve üretim ortamlarında donanım, ağ veya ERP veri akışındaki kesintiler fabrika üretim hattında doğrudan gecikme riski yaratıyordu.",
        action: "Proaktif izleme mekanizmaları, yedekli altyapı mimarileri ve standart SLA arıza giderme protokolleri uyguladım.",
        result: "Tesis operasyonel sürekliliğini %99,9 seviyesine çıkararak plansız üretim duruşlarını minimuma indirdim."
      },
      {
        id: 3,
        question: "3. ERP sistemlerinden çıkan karmaşık üretim verisini yönetim kurulunun kolay anlayacağı kararlara nasıl dönüştürürsünüz?",
        situation: "ERP modüllerinden üretilen üretim, hurda, stok ve maliyet raporları statikti; karar alıcılar haftalık gecikmeli verilere bakıyordu.",
        action: "ERP veritabanını doğrudan besleyen gerçek zamanlı Power BI üretim ve tedarik zinciri kokpiti modelledim.",
        result: "Raporlama eforunu %80 azalttım; üretim ve finans liderlerinin anlık kararlarla operasyon maliyetlerini düşürmesini sağladım."
      },
      {
        id: 4,
        question: "4. Günlük ERP danışmanlığı, çözüm tasarımı ve test süreçlerinde yapay zekâ (AI) araçlarını nasıl kullanıyorsunuz?",
        situation: "Çözüm tasarım belgeleri, fonksiyonel test senaryoları ve kullanıcı eğitim kılavuzlarının manuel hazırlanması haftalar alıyordu.",
        action: "LLM ve üretken AI asistanlarını süreç çıktılarının otomatik şablonlanması, test senaryosu türetilmesi ve toplantı özetleri için yapılandırdım.",
        result: "Dokümantasyon hazırlık süresini %80 azalttım; ekibin katma değerli analize ve paydaş ilişkilerine odaklanmasını sağladım."
      },
      {
        id: 5,
        question: "5. Bütçe ve zaman kısıtı altında büyük ölçekli çok lokasyonlu ERP geçiş projesini nasıl yönetirsiniz?",
        situation: "Kısıtlı zaman ve bütçe dahilinde çok birimli ERP altyapısının kesintisiz canlıya alınması gerekiyordu.",
        action: "Çevik (Agile) önceliklendirme ile yüksek etkili modülleri ilk fazda canlıya alıp, aşamalı UAT ve go-live metodolojisi uyguladım.",
        result: "Projeyi bütçe dahilinde ve zamanında tamamlayarak ilk çeyrekte yatırım getirisini (ROI) kanıtladık."
      }
    ];

    reverseQuestions = [
      `1. ${company}'nin mevcut ERP ve üretim sistemleri mimarisinde önümüzdeki 12 ayda çözülmesi hedeflenen en kritik darboğaz veya entegrasyon açığı nedir?`,
      "2. Üretim tesislerindeki saha mühendisleri ve fabrika yöneticilerinin merkezi ERP standartlarına adaptasyon düzeyi şu an ne seviyede?",
      "3. Bu pozisyondan ilk 90 günde ve ilk 1 yılda beklenen en somut başarı göstergesi (KPI / OKR) nedir?",
      "4. Yapay zekâ, Power Platform ve kestirimci analitik gibi yenilikçi araçların ERP ekosistemine entegrasyonuna üst yönetimin yaklaşımı ve yatırım vizyonu nasıldır?",
      "5. Ekibin şu anki çevik (Agile/Scrum) çalışma kültürü ve iş birimleri ile sprint hizalanma ritmi nasıl işliyor?"
    ];

    plan90Days = {
      phase1: {
        title: "İlk 30 Gün: Keşif, Tesis Analizi & Paydaş Hizalanması",
        goals: [
          "Fabrika müdürleri, üretim planlama ve finans liderleriyle 1-on-1 keşif toplantıları yaparak ağrı noktalarını (pain points) haritalamak.",
          "Mevcut ERP veri mimarisini, ana veri kalitesini (Master Data / BoM) ve entegrasyon katmanlarını denetlemek.",
          "Kritik operasyonel riskleri ve ilk 60 günde hızla çözülebilecek 'Quick-Win' fırsatlarını raporlamak."
        ]
      },
      phase2: {
        title: "31-60 Gün: Süreç Standardizasyonu & Pilot Dashboardlar",
        goals: [
          "Üretim, hurda ve stok KPI'larını canlı gösteren ilk Power BI Executive Kokpit prototipini yayına almak.",
          "Fabrikalar arası süreç varyansını azaltacak ortak ERP iş akışı standardını belirlemek.",
          "Rutin ERP dokümantasyon ve test süreçlerinde yapay zekâ (LLM) destekli hızlandırma şablonlarını devreye almak."
        ]
      },
      phase3: {
        title: "61-90 Gün: Ölçekleme, Verimlilik & Stratejik Yol Haritası",
        goals: [
          "Manuel raporlama eforunu %50+ azaltan otomatik veri boru hatlarını devreye almak.",
          "Tesis bazlı ERP eğitimlerini ve 'Change Champions' destek ağını aktifleştirmek.",
          "Önümüzdeki 12-24 ayı kapsayan dijital üretim ve ERP modernizasyon stratejik yol haritasını yönetime sunmak."
        ]
      }
    };
  }

  // 2. Vergi Teknolojileri, Danışmanlık & E-Dönüşüm (Sovos vb.)
  else if (titleLower.includes('consulting') || titleLower.includes('supervisor') || compLower.includes('sovos') || titleLower.includes('sap')) {
    questions = [
      {
        id: 1,
        question: `1. ${company} müşterilerinde karmaşık ERP entegrasyonu ve UAT canlıya geçiş krizlerini nasıl yönetirsiniz?`,
        situation: "Müşterinin özel ERP konfigürasyonu ve regülasyon raporlama gereksinimleri nedeniyle go-live takviminde gecikme riski vardı.",
        action: "Çapraz fonksiyonel test matrisleri ve AI destekli senaryo validasyonu kurarak müşteri ekipleriyle günlük hizalanma sağladım.",
        result: "Canlıya geçiş takvimini güvenceye alarak UAT sonrası stabilizasyon süresini %40 kısalttım."
      },
      {
        id: 2,
        question: "2. Danışmanlardan oluşan bir teknik ekibe mentörlük yaparken performans yönetimini nasıl ele alırsınız?",
        situation: "Artan proje yükü sebebiyle danışman ekibinde teslimat varyansları ve önceliklendirme sorunları oluştu.",
        action: "Birebir haftalık mentörlük seansları başlattım; tekrarlayan görevleri yapay zekâ ve Power Platform araçlarıyla otomatikleştirerek ekibin katma değerli analize odaklanmasını sağladım.",
        result: "Ekip içi operasyonel üretkenlik %67 arttı; müşteri memnuniyeti ve zamanında teslimat oranı %95 seviyesine yükseldi."
      },
      {
        id: 3,
        question: "3. Yapay zekâ (AI) araçlarını danışmanlık süreçlerine ve teknik dokümantasyona nasıl entegre ediyorsunuz?",
        situation: "Müşteriye özel ERP konfigürasyonlarının ve fonksiyonel analiz belgelerinin hazırlanması haftalarca manuel iş gücü gerektiriyordu.",
        action: "LLM ve üretken yapay zekâ tabanlı şablonlama sistemleri kurarak, iş kuralları ile teknik spesifikasyonların otomatik özetlenmesini sağladım.",
        result: "Dokümantasyon hazırlık süresini %80 azalttım; hata payını düşürerek müşteri onay süreçlerini hızlandırdım."
      },
      {
        id: 4,
        question: "4. Kurumsal müşterilerin regülasyon uyum (E-Fatura, E-Arşiv, SII vb.) süreçlerinde veri güvenliğini nasıl sağlarsınız?",
        situation: "Milyonlarca finansal ve vergi verisinin üçüncü parti entegrasyon motorlarına aktarımı sırasında yüksek güvenlik gerekiyordu.",
        action: "Siber güvenlik lisans geçmişimle uçtan uca şifreleme, API güvenlik standartları ve rol tabanlı erişim protokolleri kurguladım.",
        result: "Sıfır veri kaybı ile %100 regülasyon ve bilgi güvenliği uyumu sağladık."
      },
      {
        id: 5,
        question: "5. Çoklu müşteri projelerini eşzamanlı yönetirken kapsam genişlemesini (scope creep) nasıl engellersiniz?",
        situation: "Müşteriler canlıya geçiş öncesinde bütçe ve takvim dışı yüzlerce özel talep iletiyordu.",
        action: "Standart-öncelikli (standard-first) analiz prensibiyle ek talepleri fazlara böldüm ve sürüm yükseltme maliyetini şeffafça paylaştım.",
        result: "Proje bütçe aşımını sıfıra indirerek planlanan sürede başarıyla go-live sağladık."
      }
    ];

    reverseQuestions = [
      `1. ${company}'nin EMEA ve Türkiye pazarındaki e-dönüşüm danışmanlık projelerinde bu yıl karşılaştığı en büyük teknik veya operasyonel zorluk nedir?`,
      "2. Danışman ekibinin proje teslim hızını artırmak için şirket içinde yapay zekâ veya otomasyon araçlarının kullanımı ne aşamada?",
      "3. Supervisor rolü olarak ilk 90 günde ekibin verimliliği ve müşteri memnuniyeti tarafında benden beklenen en kritik başarı metriği nedir?",
      "4. Kurumsal müşterilerin regülasyon değişikliklerine hızlı adaptasyonunu sağlamak için ürün ve danışmanlık ekipleri arasındaki geri bildirim döngüsü nasıl işliyor?",
      "5. Ekip üyelerinin sürekli teknik gelişimi ve SAP/Cloud sertifikasyon süreçleri için nasıl bir kurumsal destek mekanizması bulunuyor?"
    ];

    plan90Days = {
      phase1: {
        title: "İlk 30 Gün: Ekip Dinamikleri, Proje Portföyü & Metodoloji Keşfi",
        goals: [
          "Danışman ekibiyle 1-on-1 görüşmeler yaparak güçlü yönleri, yetkinlik matrisini ve iş yükü darboğazlarını belirlemek.",
          "Devam eden aktif müşteri projelerinin UAT, canlıya geçiş takvimlerini ve riskli teslimatları analiz etmek.",
          "Danışmanlık metodolojisi ve dokümantasyon standartlarını inceleyerek hızlı iyileştirme noktalarını çıkarmak."
        ]
      },
      phase2: {
        title: "31-60 Gün: Teslimat Optimizasyonu & AI Destekli Dokümantasyon",
        goals: [
          "Teknik analiz ve test senaryolarını hızlandıran yapay zekâ destekli şablonları ekibe kazandırmak.",
          "Kritik müşteri projelerinde UAT gecikmelerini önleyecek haftalık erken uyarı takip mekanizması kurmak.",
          "Müşteri memnuniyetini ve birinci seviye çözüm hızını %30 artıran danışmanlık rehberini yayımlamak."
        ]
      },
      phase3: {
        title: "61-90 Gün: Sürdürülebilir Liderlik, KPI Takibi & Büyüme",
        goals: [
          "Danışmanlık operasyonlarını gerçek zamanlı takip eden Power BI Yönetici Paneli'ni devreye almak.",
          "Ekip içi mentörlük ve bilgi paylaşımı oturumlarını kurumsallaştırarak tekil bağımlılıkları ortadan kaldırmak.",
          "Gelecek çeyrekler için danışmanlık teslimat kapasitesini %25 artıran ölçeklenebilir operasyon modelini sunmak."
        ]
      }
    };
  }

  // 3. Genel Kurumsal / Teknoloji Liderliği
  else {
    questions = [
      {
        id: 1,
        question: `1. ${company} bünyesinde dijital dönüşüm ve teknoloji projelerini hayata geçirirken paydaş direncini nasıl yönetirsiniz?`,
        situation: "Mevcut manuel süreçlere alışkın iş birimleri yeni dijital sistemlere adaptasyonda direnç gösteriyordu.",
        action: "Kullanıcı dostu eğitimler ve hızlı değer üreten otomasyon prototipleri sunarak erken kazanımlar (quick-wins) sağladım.",
        result: "Sistem benimsenme oranını %95'in üzerine çıkararak operasyonel verimliliği %67 artırdım."
      },
      {
        id: 2,
        question: "2. Çoklu şirket veya departman yapılarında veri mimarisi ve raporlama standardizasyonunu nasıl sağlarsınız?",
        situation: "Farklı birimlerin tutarsız veri tanımları sebebiyle C-Level yönetim konsolide KPI takibi yapamıyordu.",
        action: "Merkezi veri modeli ve Power BI yönetişim çerçevesi kurarak tüm veri akışlarını tek standartta topladım.",
        result: "Manuel raporlama eforunu %80 azaltarak tek ve güvenilir veri kaynağı (single source of truth) oluşturdum."
      },
      {
        id: 3,
        question: "3. Yapay zekâ (AI) ve otomasyon araçlarını iş akışlarına entegre ederken hangi metodolojiyi izlersiniz?",
        situation: "Tekrarlayan operasyonel iş yükleri ekiplerin katma değerli stratejik çalışmalara odaklanmasını engelliyordu.",
        action: "Power Platform ve LLM tabanlı otomasyonlar kurarak rutin süreçlerin otomatik işlenmesini sağladım.",
        result: "Departmanlar arası işlem sürelerini %67 hızlandırdım ve operasyonel maliyetleri düşürdüm."
      },
      {
        id: 4,
        question: "4. Karmaşık teknoloji projelerinde teslimat süresini kısaltmak için hangi çevik yaklaşımları kullanırsınız?",
        situation: "Klasik şelale (waterfall) modellerle yönetilen projeler 18 ayı bulan teslimat süreleriyle iş çevikliğini geciktiriyordu.",
        action: "Çevik sprintler, modüler teslimat ve sürekli geri bildirim döngüleri kurarak teslimat modelini dönüştürdüm.",
        result: "Proje teslim döngülerini 18 aydan 6 aya indirerek time-to-market süresini %67 kısalttım."
      },
      {
        id: 5,
        question: "5. Bilgi güvenliği, KVKK/GDPR ve veri yönetişimi gereksinimlerini projelerinizde nasıl güvenceye alırsınız?",
        situation: "Bulut ve ERP entegrasyonlarında kurumsal veri güvenliği ve regülasyon uyumu en kritik öncelikti.",
        action: "Siber güvenlik lisans altyapımla rol tabanlı yetkilendirme, veri şifreleme ve denetim izleme sistemleri kurguladım.",
        result: "Sıfır güvenlik açığı ve %100 yasal uyum ile projeleri başarıyla tamamladım."
      }
    ];

    reverseQuestions = [
      `1. ${company}'nin dijital dönüşüm ve analitik stratejisinde önümüzdeki 1-2 yıl içindeki en öncelikli 3 hedef nedir?`,
      "2. Mevcut organizasyon yapısında teknoloji ve iş birimleri arasındaki koordinasyon ve proje önceliklendirme süreci nasıl yürütülüyor?",
      "3. Bu rolden ilk 90 günde şirkete kazandırılması beklenen en somut değer ve çıktı nedir?",
      "4. Yapay zekâ (GenAI / LLM) ve iş süreci otomasyonu konularında şirketin mevcut vizyonu ve yatırım iştahı nasıldır?",
      "5. Takımın kurumsal çalışma kültürü, çeviklik düzeyi ve yeni fikirleri hayata geçirme hızı hakkında ne söylersiniz?"
    ];

    plan90Days = {
      phase1: {
        title: "İlk 30 Gün: Dinleme, Tanıma & Mevcut Durum Analizi (Listen & Learn)",
        goals: [
          "Tüm kilit paydaşlarla (C-Level, iş birimleri, BT ekipleri) tanışarak beklentileri ve darboğazları netleştirmek.",
          "Mevcut sistem mimarisini, veri kaynaklarını ve iş süreçlerini uçtan uca denetlemek.",
          "En hızlı değer yaratacak 3 öncelikli 'Quick-Win' fırsatını belirleyip yönetimle mutabık kalmak."
        ]
      },
      phase2: {
        title: "31-60 Gün: Hızlı Kazanımlar, Süreç Tasarımı & İlk Çıktılar (Execute & Deliver)",
        goals: [
          "Belirlenen quick-win otomasyon ve Power BI raporlama prototipini canlıya almak.",
          "Veri yönetişimi ve süreç standartlarını oluşturarak departmanlar arası hizalanmayı sağlamak.",
          "Yapay zekâ ve dijitalleşme araçlarının günlük iş akışlarına entegrasyonu için ilk pilotları başlatmak."
        ]
      },
      phase3: {
        title: "61-90 Gün: Ölçekleme, Kurumsallaşma & Gelecek Vizyonu (Scale & Optimize)",
        goals: [
          "Manuel iş yükünü en az %50 azaltan otomasyon ve analitik çözümleri kurum genelinde yaygınlaştırmak.",
          "Sürekli iyileştirme ve eğitim programlarını devreye alarak kurumsal adaptasyonu %95+ seviyesine çıkarmak.",
          "Gelecek 1-3 yılı kapsayan dijital dönüşüm ve teknoloji mimarisi master planını üst yönetime sunmak."
        ]
      }
    };
  }

  return {
    company,
    jobTitle,
    questions,
    reverseQuestions,
    plan90Days
  };
}

function renderInterviewMarkdown(prep) {
  let md = `# KARMİS Mülakat Zekası & Hazırlık Raporu: ${prep.company} — ${prep.jobTitle}

### 1. STAR Metodu Davranışsal & Teknik Mülakat Soruları
| Mülakat Sorusu | Durum & Görev (Situation & Task) | Eylem (Action) | Sonuç (Result) |
|---|---|---|---|
${prep.questions.map(q => `| ${q.question} | ${q.situation} | ${q.action} | ${q.result} |`).join('\n')}

---

### 2. Şirkete ve İK/Yöneticiye Sorulacak 5 Stratejik Ters Soru ("Reverse Questions")
${prep.reverseQuestions.map(rq => `- **${rq}**`).join('\n')}

---

### 3. İlk 90 Gün Yönetici Eylem Planı (30-60-90 Day Executive Plan)
#### 🟢 ${prep.plan90Days.phase1.title}
${prep.plan90Days.phase1.goals.map(g => `- ${g}`).join('\n')}

#### 🟡 ${prep.plan90Days.phase2.title}
${prep.plan90Days.phase2.goals.map(g => `- ${g}`).join('\n')}

#### 🔵 ${prep.plan90Days.phase3.title}
${prep.plan90Days.phase3.goals.map(g => `- ${g}`).join('\n')}
`;
  return md;
}

module.exports = { generateInterviewPrep, renderInterviewMarkdown };
