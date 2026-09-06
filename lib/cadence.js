/**
 * KARMİS Smart Follow-Up Cadence Engine v1.0.0
 * Calculates days elapsed, flags applications needing follow-up (Day 7, Day 14, Post-Interview),
 * and generates ready-to-send executive outreach emails.
 */

const { getAllApplications } = require('./db');
const { loadCandidateProfile } = require('./cv-parser');

function calculateCadence() {
  const apps = getAllApplications();
  const today = new Date();

  const dueDay7 = [];
  const dueDay14 = [];
  const duePostInterview = [];
  const onTrack = [];

  apps.forEach(app => {
    // Ignore Rejected or Offer stages
    if (app.status === 'Rejected' || app.status === 'Offer') {
      return;
    }

    const lastDateStr = app.lastContactDate || app.date;
    if (!lastDateStr) return;

    const lastDate = new Date(lastDateStr);
    const diffTime = Math.abs(today - lastDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    const item = {
      ...app,
      daysElapsed: diffDays,
      recommendedAction: null,
      emailTemplate: null
    };

    if (app.status === 'Interviewing') {
      if (diffDays >= 1 && diffDays <= 4) {
        item.recommendedAction = 'Mülakat Sonrası Teşekkür & Stratejik Özet Gönder (24-48 Saat)';
        item.urgency = 'high';
        item.templateType = 'post_interview';
        duePostInterview.push(item);
      } else if (diffDays >= 5) {
        item.recommendedAction = 'Mülakat Sonrası Durum Güncellemesi Sor (5+ Gün)';
        item.urgency = 'medium';
        item.templateType = 'interview_followup';
        duePostInterview.push(item);
      }
    } else if (app.status === 'Applied') {
      if (diffDays >= 14) {
        item.recommendedAction = '2. Katma Değer / Portföy Takip Notu İlet (14+ Gün)';
        item.urgency = 'high';
        item.templateType = 'day_14';
        dueDay14.push(item);
      } else if (diffDays >= 7) {
        item.recommendedAction = '1. Nazik Başvuru Takip E-Postası İlet (7-13 Gün)';
        item.urgency = 'medium';
        item.templateType = 'day_7';
        dueDay7.push(item);
      } else {
        item.recommendedAction = `Değerlendirme Sürecinde (${7 - diffDays} gün sonra takip)`;
        item.urgency = 'low';
        onTrack.push(item);
      }
    }
  });

  return {
    summary: {
      totalActive: dueDay7.length + dueDay14.length + duePostInterview.length + onTrack.length,
      needsActionCount: dueDay7.length + dueDay14.length + duePostInterview.length,
      dueDay7Count: dueDay7.length,
      dueDay14Count: dueDay14.length,
      duePostInterviewCount: duePostInterview.length
    },
    dueDay7,
    dueDay14,
    duePostInterview,
    onTrack
  };
}

function generateCadenceEmail(company, position, templateType, contactName = '') {
  const profile = loadCandidateProfile();
  const candidateName = profile.name || '[Aday Adı]';
  const candidateTitle = profile.title || '[Ünvan]';
  const candidateContact = [
    profile.email ? `Email: ${profile.email}` : null,
    profile.phone ? `Tel: ${profile.phone}` : null,
    profile.portfolio ? `Portföy: ${profile.portfolio}` : null,
    profile.linkedin ? `LinkedIn: ${profile.linkedin}` : null
  ].filter(Boolean).join(' | ') || 'Email / LinkedIn';

  const salutation = contactName ? `Sayın ${contactName},` : `Sayın ${company} Yetenek Yönetimi Ekibi,`;

  if (templateType === 'day_7') {
    return {
      subject: `${company} — ${position} Başvurusu Takibi | ${candidateName}`,
      body: `${salutation}

Geçtiğimiz hafta ${company} bünyesindeki "${position}" pozisyonu için gerçekleştirdiğim başvurumu nezaketle hatırlatmak istedim.

Yetkinliklerim ve teknik tecrübemle, ${company}'nin büyüme ve operasyonel hedeflerine somut katkı sağlamaktan memnuniyet duyarım.

Süreçle ilgili güncel bir gelişme olması halinde veya ilave bilgi/doküman gerekirse memnuniyetle paylaşabilirim.

İlginiz ve vaktiniz için teşekkür eder, iyi çalışmalar dilerim.

Saygılarımla,
${candidateName}
${candidateTitle}
${candidateContact}`
    };
  }

  if (templateType === 'day_14') {
    return {
      subject: `${company} — ${position} | Katma Değer & Takip Notu`,
      body: `${salutation}

${company} bünyesindeki "${position}" pozisyonuna yönelik başvurumla ilgili kısa bir ek bilgi ve katma değer notu paylaşmak istedim.

Benzer ölçekteki projelerde edindiğim deneyim ve geliştirdiğim çözümlerle, pozisyonun gerektirdiği hedeflere hızlı adaptasyon sağlayabileceğime inanıyorum.

${company}'nin operasyonel ve teknik hedeflerini değerlendirmek üzere uygun olacağınız bir zaman diliminde 15-20 dakikalık bir görüşme gerçekleştirmeyi çok isterim.

Saygılarımla,
${candidateName}
${candidateTitle}
${candidateContact}`
    };
  }

  // Post Interview Thank You (24-48h)
  return {
    subject: `${company} — ${position} Mülakatı Teşekkür & Stratejik Özet | ${candidateName}`,
    body: `${salutation}

Bugün ${company} bünyesindeki "${position}" rolü üzerine gerçekleştirdiğimiz verimli ve ilham verici mülakat için içtenlikle teşekkür ederim.

Görüşmemiz sırasında bahsettiğiniz kurumsal hedefler ve teknik ihtiyaçlar, bugüne kadar üstlendiğim sorumluluklarla tam bir paralellik göstermektedir. Rolün gerektirdiği çözümleri başarıyla hayata geçirebileceğime inancım tamdır.

Bir sonraki değerlendirme adımlarında görüşmek dileğiyle, sağlıklı ve başarılı çalışmalar dilerim.

Saygılarımla,
${candidateName}
${candidateTitle}
${candidateContact}`
  };
}

module.exports = { calculateCadence, generateCadenceEmail };
