# KariyerMimari 🎯 (AI Career Operations Engine)

**KariyerMimari**, üst düzey yöneticiler (Director, Head, C-Level) ve kıdemli profesyoneller için geliştirilmiş, yapay zeka destekli açık kaynaklı bir **İlan İnceleme, Analiz ve Kariyer Yönetim Motorudur**.

---

## 🌟 Neden KariyerMimari?

Geleneksel iş arama yöntemleri çöp ilanlar, uyuşmayan kıdem seviyeleri ve belirsiz maaş skalaları ile dolu. **KariyerMimari**, adayların zamanını korumak için tasarlanmıştır:

- 📊 **Sade & Açık Mavi SVG Grafikler:** Şirketlerin Ciro, Bütçe, Çalışan ve Tesis sayılarını temiz beyaz arka planda görselleştirir.
- 🎯 **%80 Eşik Barajı & Otomatik Filtreler:** Mevzuat/BDDK yükü olan, kıdem altı (junior) veya doğrudan kota bazlı saha satışı ilanlarını otomatik eler.
- 💰 **4 Faktörlü Maaş Kesişimi:** Şirket Ölçeği x Sektör x Lokasyon x Seniority kesişimiyle gerçekçi mülakat açılış rakamları üretir.
- 🤝 **LinkedIn Executive Outreach & STAR Mülakat Asistanı:** İlgili İK liderine doğrudan atılacak bağlantı notları ve STAR yöntemiyle mülakat hazırlık soruları üretir.
- 🔒 **%100 Gizlilik:** Adayın kişisel CV'si, telefon numarası ve özel verileri yerel ortamda kalır; GitHub'a asla yüklenmez.

---

## 🛠️ Kurulum ve Kullanım

### 1. Depoyu Klonlayın
```bash
git clone https://github.com/kullanici/KariyerMimari.git
cd KariyerMimari
npm install
```

### 2. Kendi Profilinizi Oluşturun
Proje kök dizinindeki `config.example.json` ve `templates/cv.example.md` dosyalarını kendi bilgilerinize göre kopyalayın:

```bash
cp config.example.json config.json
cp templates/cv.example.md cv.md
```

### 3. İlan Analizini Çalıştırın
```bash
npx kariyer-mimari <ilan-url>
```

---

## 📐 Standart Analiz Çıktı Formatı

Her ilan analiz edildiğinde aşağıdaki 7 standart modül üretilir:

1. **Hızlı Okuma Özet Tablosu** (Maaş açılışı, uyum puanı, karar)
2. **Sade & Açık Mavi Şirket Rakamları Grafiği** (Minimalist SVG)
3. **Aday Uyum Puanı (% ve Detaylar / Risk Matrisi)**
4. **Executive Cover Letter & İK İletişim Metni**
5. **LinkedIn Executive Outreach Metni** (Max 300 karakter)
6. **Mülakat Hazırlık Asistanı (STAR Metodu)** (Top 5 Soru & Cevap)
7. **ATS CV Anahtar Kelime Optimizasyonu** (Top 5 Keywords)

---

## 📄 Lisans

Bu proje **MIT Lisansı** ile lisanslanmıştır. Herkes tarafından özgürce kullanılabilir ve geliştirilebilir.
