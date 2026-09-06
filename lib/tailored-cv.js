/**
 * KARMİS ATS-Tailored CV & Executive Cover Letter Builder v3.0.0
 * Supports Dual-Language (TR & EN) with auto-detection and language toggle.
 * Optimized for A4 PDF printing and clipboard copying.
 */

const { getCompany } = require('./db');
const { loadCandidateProfile } = require('./cv-parser');

function detectLanguage(jobTitle = '', company = '', explicitLang = null) {
  if (explicitLang && (explicitLang === 'en' || explicitLang === 'tr')) {
    return explicitLang;
  }

  const combined = `${jobTitle} ${company}`.toLowerCase();
  
  // Strong Turkish indicators
  const trKeywords = ['müdür', 'yönetici', 'uzman', 'lider', 'danışman', 'başvuru', 'geliştirici', 'mühendis', 'sorumlu', 'direktör', 'şirket', 'holding'];
  const hasTrChars = /[üğşıöçİĞÜŞÖÇ]/.test(combined);

  // English indicators
  const enKeywords = ['manager', 'director', 'lead', 'consultant', 'supervisor', 'architect', 'engineer', 'specialist', 'officer', 'head of'];

  let trScore = hasTrChars ? 2 : 0;
  trKeywords.forEach(k => { if (combined.includes(k)) trScore += 2; });

  let enScore = 0;
  enKeywords.forEach(k => { if (combined.includes(k)) enScore += 2; });

  return trScore > enScore ? 'tr' : 'en';
}

function generateTailoredCv(company = 'Target Company', jobTitle = 'Software Engineer', explicitLang = null) {
  const lang = detectLanguage(jobTitle, company, explicitLang);
  const profile = loadCandidateProfile();
  const compData = (typeof getCompany === 'function' ? getCompany(company) : null) || {};

  const candidateName = profile.name || (lang === 'en' ? 'Candidate Profile' : 'Aday Profili');
  const candidateTitle = profile.title || jobTitle;
  const candidateEmail = profile.email || 'candidate@example.com';
  const candidatePhone = profile.phone || '';
  const candidateLocation = profile.location || (lang === 'en' ? 'Remote / Hybrid' : 'Hibrit / Uzaktan');
  const candidatePortfolio = profile.portfolio || '';
  const candidateLinkedin = profile.linkedin || '';

  const contactStr = [candidateLocation, candidatePhone, candidateEmail].filter(Boolean).join(' · ');

  const defaultSkillsEn = [
    'System Architecture & Microservices',
    'Full-Stack Engineering & API Design',
    'Database Optimization (PostgreSQL / SQLite)',
    'Cloud & Containerization (Docker / Kubernetes)',
    'CI/CD & DevOps Automation',
    'AI & LLM Integration'
  ];
  const defaultSkillsTr = [
    'Sistem Mimarisi & Mikroservisler',
    'Full-Stack Geliştirme & API Tasarımı',
    'Veritabanı Optimizasyonu (PostgreSQL / SQLite)',
    'Bulut & Konteynerleştirme (Docker / K8s)',
    'CI/CD & DevOps Otomasyonu',
    'Yapay Zeka & LLM Entegrasyonu'
  ];

  const candidateSkills = profile.skills && profile.skills.length > 0
    ? profile.skills
    : (lang === 'en' ? defaultSkillsEn : defaultSkillsTr);

  const atsKeywords = compData.atsKeywords || candidateSkills.slice(0, 5);

  if (lang === 'en') {
    const cv = {
      lang: 'en',
      header: {
        name: candidateName,
        title: `${jobTitle} | ${candidateTitle}`,
        contact: contactStr,
        workStatus: 'Full Work Authorization',
        links: {
          portfolio: candidatePortfolio,
          linkedin: candidateLinkedin,
          work: candidatePortfolio
        }
      },
      summary: profile.summary || `Results-driven technology professional with proven engineering and architectural expertise. Skilled in architecting resilient systems, optimizing high-throughput data platforms, and aligning technical execution with strategic organizational outcomes.`,
      atsMatchHighlight: atsKeywords.map(kw => ({
        keyword: kw,
        proof: `Demonstrated direct ownership and implementation with measurable impact.`
      })),
      coreCompetencies: candidateSkills,
      highlightedProjects: profile.projects && profile.projects.length > 0 ? profile.projects : [
        {
          title: 'High-Throughput Analytics Platform',
          category: 'Architecture',
          impact: 'Architected distributed analytics pipeline reducing query latency by 75%.',
          link: candidatePortfolio || '#'
        },
        {
          title: 'Automated Operations & AI Engine',
          category: 'AI & Automation',
          impact: 'Engineered automated workflow system saving hundreds of manual hours monthly.',
          link: candidatePortfolio || '#'
        }
      ],
      experienceSummary: [
        {
          role: candidateTitle,
          company: 'Technology Solutions & Engineering',
          period: '2020 — Present',
          bulletPoints: [
            'Spearheaded enterprise system modernization and architecture initiatives.',
            'Collaborated cross-functionally across engineering, product, and leadership stakeholders.',
            'Implemented automated testing, CI/CD pipelines, and robust database architectures.'
          ]
        }
      ],
      educationAndCertifications: [
        'B.Sc. in Computer Science / Information Systems',
        'Industry Technical Certifications'
      ]
    };

    const coverLetter = {
      lang: 'en',
      subject: `Application for ${jobTitle} — ${company} | ${candidateName}`,
      salutation: `Dear ${company} Hiring Team,`,
      body: `I am writing to express my enthusiasm for the "${jobTitle}" position at ${company}.

With a robust technical background spanning ${candidateSkills.slice(0, 3).join(', ')}, I offer a proven track record of designing scalable solutions and delivering high-value engineering results.

I am eager to contribute to ${company}'s continued growth and look forward to discussing how my experience aligns with your team's objectives.

Sincerely,
${candidateName}
${candidateTitle}
${contactStr}`
    };

    return { lang, cv, coverLetter };
  } else {
    // Turkish
    const cv = {
      lang: 'tr',
      header: {
        name: candidateName,
        title: `${jobTitle} | ${candidateTitle}`,
        contact: contactStr,
        workStatus: 'Tam Çalışma İzni & Yetkinlik',
        links: {
          portfolio: candidatePortfolio,
          linkedin: candidateLinkedin,
          work: candidatePortfolio
        }
      },
      summary: profile.summary || `Sistem mimarisi, teknoloji operasyonları ve mühendislik alanında kanıtlanmış başarı geçmişine sahip sonuç odaklı teknoloji profesyoneli. Yüksek performanslı sistemler tasarlama ve stratejik hedeflerle uyumlu çözümler üretme konusunda yetkin.`,
      atsMatchHighlight: atsKeywords.map(kw => ({
        keyword: kw,
        proof: `Kurumsal ölçekli projelerde uçtan uca uygulanmış ve doğrulanmıştır.`
      })),
      coreCompetencies: candidateSkills,
      highlightedProjects: profile.projects && profile.projects.length > 0 ? profile.projects : [
        {
          title: 'Yüksek Performanslı Veri & Analitik Platformu',
          category: 'Mimari',
          impact: 'Sorgu gecikmelerini %75 azaltan dağıtık veri akış mimarisi kuruldu.',
          link: candidatePortfolio || '#'
        },
        {
          title: 'Otomasyon & Yapay Zeka Entegrasyon Motoru',
          category: 'AI & Otomasyon',
          impact: 'Aylık yüzlerce saatlik manuel operasyonu ortadan kaldıran otomasyon mimarisi geliştirildi.',
          link: candidatePortfolio || '#'
        }
      ],
      experienceSummary: [
        {
          role: candidateTitle,
          company: 'Teknoloji Çözümleri & Mühendislik',
          period: '2020 — Günümüz',
          bulletPoints: [
            'Kurumsal sistem modernizasyonu ve mimari standartlaştırma projelerine liderlik edildi.',
            'Mühendislik, ürün ve yönetici paydaşlarla koordinasyon içinde stratejik çözümler üretildi.',
            'Otomatik test süreçleri, CI/CD hatları ve güvenilir veritabanı altyapıları devreye alındı.'
          ]
        }
      ],
      educationAndCertifications: [
        'Bilgisayar Mühendisliği / Bilişim Sistemleri Lisans',
        'Profesyonel Sektörel Sertifikalar'
      ]
    };

    const coverLetter = {
      lang: 'tr',
      subject: `${company} — ${jobTitle} Başvurusu | ${candidateName}`,
      salutation: `Sayın ${company} Yetenek Yönetimi Ekibi,`,
      body: `${company} bünyesinde açılan "${jobTitle}" pozisyonuna yönelik başvurumu paylaşmaktan memnuniyet duyarım.

${candidateSkills.slice(0, 3).join(', ')} alanlarındaki teknik tecrübem ve sistem mimarisi yetkinliklerimle, ${company}'nin operasyonel ve teknolojik hedeflerine doğrudan katkı sağlamaya hazırım.

Pozisyonun detaylarını ve sağlayabileceğim katma değeri değerlendirmek üzere uygun olacağınız bir zaman diliminde görüşmekten memnuniyet duyarım.

Saygılarımla,
${candidateName}
${candidateTitle}
${contactStr}`
    };

    return { lang, cv, coverLetter };
  }
}

function renderTailoredCvHtml(cv, company, position) {
  const isEn = cv.lang === 'en';
  const headings = {
    summary: isEn ? 'Professional Executive Summary' : 'Yönetici Özeti',
    ats: isEn ? 'ATS Core Competency & Job Alignment' : 'İlana Özel ATS Eşleşme & Yetkinlik Doğrulaması',
    comp: isEn ? 'Core Competencies & Technologies' : 'Temel Uzmanlık Alanları & Teknolojiler',
    cases: isEn ? 'Flagship Enterprise Case Studies' : 'Öne Çıkan Kurumsal Vaka Çalışmaları',
    exp: isEn ? 'Leadership & Professional Experience' : 'Liderlik & İş Deneyimi',
    edu: isEn ? 'Education & Credentials' : 'Eğitim & Sertifikasyonlar',
    portfolio: isEn ? 'Portfolio' : 'Portföy',
    viewCase: isEn ? 'View Case Study →' : 'Vaka Çalışmasını İncele →'
  };

  return `
    <div class="printable-doc" style="background: var(--card); border: 1px solid var(--card-border); border-radius: 12px; padding: 28px; color: var(--text);">
      <!-- Header -->
      <div style="border-bottom: 2px solid var(--accent); padding-bottom: 16px; margin-bottom: 20px;">
        <h2 style="font-size: 22px; font-weight: 700; color: var(--text); margin-bottom: 4px;">${cv.header.name}</h2>
        <div style="font-size: 14px; font-weight: 600; color: var(--accent); margin-bottom: 8px;">${cv.header.title}</div>
        <div style="font-size: 12px; color: var(--text-muted); line-height: 1.6;">
          ${cv.header.contact}<br>
          ${headings.portfolio}: <a href="${cv.header.links.portfolio}" target="_blank" style="color: var(--accent); text-decoration: none; font-weight: 600;">${cv.header.links.portfolio}</a> · 
          LinkedIn: <a href="${cv.header.links.linkedin}" target="_blank" style="color: var(--accent); text-decoration: none; font-weight: 600;">${cv.header.links.linkedin}</a>
          ${cv.header.workStatus ? `<br><span style="font-size: 11px; color: var(--text-muted); font-style: italic;">${cv.header.workStatus}</span>` : ''}
        </div>
      </div>

      <!-- Summary -->
      <div style="margin-bottom: 20px;">
        <h3 style="font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: var(--accent); margin-bottom: 8px;">${headings.summary}</h3>
        <p style="font-size: 13px; line-height: 1.6; color: var(--text);">${cv.summary}</p>
      </div>

      <!-- ATS Key Matches -->
      <div style="margin-bottom: 20px;">
        <h3 style="font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: var(--accent); margin-bottom: 8px;">${headings.ats}</h3>
        <div style="display: flex; flex-direction: column; gap: 6px;">
          ${cv.atsMatchHighlight.map(item => `
            <div style="background: var(--input-bg); border-left: 3px solid var(--accent); padding: 8px 12px; border-radius: 4px; font-size: 12px;">
              <span style="font-weight: 700; color: var(--text);">${item.keyword}:</span> <span style="color: var(--text-muted);">${item.proof}</span>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Core Competencies -->
      <div style="margin-bottom: 20px;">
        <h3 style="font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: var(--accent); margin-bottom: 8px;">${headings.comp}</h3>
        <div style="display: flex; flex-wrap: wrap; gap: 6px;">
          ${cv.coreCompetencies.map(c => `<span style="background: var(--input-bg); border: 1px solid var(--card-border); padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: 500;">${c}</span>`).join('')}
        </div>
      </div>

      <!-- Projects -->
      <div style="margin-bottom: 20px;">
        <h3 style="font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: var(--accent); margin-bottom: 10px;">${headings.cases}</h3>
        <div style="display: flex; flex-direction: column; gap: 10px;">
          ${cv.highlightedProjects.map(p => `
            <div style="background: var(--input-bg); border: 1px solid var(--card-border); border-radius: 8px; padding: 12px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                <span style="font-weight: 700; font-size: 13px; color: var(--text);">${p.title}</span>
                <span style="font-size: 11px; color: var(--accent); font-weight: 600;">${p.category}</span>
              </div>
              <p style="font-size: 12px; color: var(--text-muted); margin-bottom: 6px;">${p.impact}</p>
              <a href="${p.link}" target="_blank" style="font-size: 11px; color: var(--accent); font-weight: 600; text-decoration: none;">${headings.viewCase}</a>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Experience -->
      <div style="margin-bottom: 20px;">
        <h3 style="font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: var(--accent); margin-bottom: 10px;">${headings.exp}</h3>
        <div style="display: flex; flex-direction: column; gap: 12px;">
          ${cv.experienceSummary.map(exp => `
            <div>
              <div style="display: flex; justify-content: space-between; font-size: 13px; font-weight: 700; margin-bottom: 4px;">
                <span>${exp.role} · <span style="color: var(--accent);">${exp.company}</span></span>
                <span style="color: var(--text-muted); font-size: 12px;">${exp.period}</span>
              </div>
              <ul style="margin-left: 18px; font-size: 12px; color: var(--text-muted); display: flex; flex-direction: column; gap: 3px;">
                ${exp.bulletPoints.map(b => `<li>${b}</li>`).join('')}
              </ul>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Education -->
      <div>
        <h3 style="font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: var(--accent); margin-bottom: 6px;">${headings.edu}</h3>
        <ul style="margin-left: 18px; font-size: 12px; color: var(--text-muted); display: flex; flex-direction: column; gap: 2px;">
          ${cv.educationAndCertifications.map(e => `<li>${e}</li>`).join('')}
        </ul>
      </div>
    </div>
  `;
}

function renderTailoredCvPlain(cv, company, position) {
  const isEn = cv.lang === 'en';
  return `${cv.header.name}
${cv.header.title}
${isEn ? 'Target Role' : 'Hedef Pozisyon'}: ${company} — ${position}
${cv.header.contact} | ${isEn ? 'Portfolio' : 'Portföy'}: ${cv.header.links.portfolio} | LinkedIn: ${cv.header.links.linkedin}
${cv.header.workStatus ? cv.header.workStatus + '\n' : ''}
==================================================
${isEn ? 'EXECUTIVE SUMMARY' : 'YÖNETİCİ ÖZETİ'}
==================================================
${cv.summary}

==================================================
${isEn ? 'ATS CORE COMPETENCY & JOB MATCH ALIGNMENT' : 'ATS EŞLEŞME & YETKİNLİK DOĞRULAMASI'}
==================================================
${cv.atsMatchHighlight.map(item => `- ${item.keyword}: ${item.proof}`).join('\n')}

==================================================
${isEn ? 'CORE COMPETENCIES & STRATEGIC DOMAINS' : 'TEMEL YETKİNLİKLER & STRATEJİK ALANLAR'}
==================================================
${cv.coreCompetencies.join(' · ')}

==================================================
${isEn ? 'FLAGSHIP ENTERPRISE CASE STUDIES' : 'ÖNE ÇIKAN KURUMSAL VAKA ÇALIŞMALARI'}
==================================================
${cv.highlightedProjects.map(p => `${p.title} (${p.category})
${p.impact}
Link: ${p.link}
`).join('\n')}

==================================================
${isEn ? 'LEADERSHIP & PROFESSIONAL EXPERIENCE' : 'LİDERLİK & İŞ DENEYİMİ'}
==================================================
${cv.experienceSummary.map(exp => `${exp.role} — ${exp.company} (${exp.period})
${exp.bulletPoints.map(b => `- ${b}`).join('\n')}
`).join('\n')}

==================================================
${isEn ? 'EDUCATION & CERTIFICATIONS' : 'EĞİTİM & SERTİFİKALAR'}
==================================================
${cv.educationAndCertifications.map(e => `- ${e}`).join('\n')}
`;
}

module.exports = { generateTailoredCv, renderTailoredCvHtml, renderTailoredCvPlain, detectLanguage };
