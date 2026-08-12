# KARMİS (Kariyer Mimarisi ve İlan Süzgeci)

**KARMİS** (**K**ariyer **M**imarisi ve **İ**lan **S**üzgeci), üst düzey yöneticiler (Director, Head, C-Level) ve kıdemli profesyoneller için geliştirilmiş, yapay zeka destekli açık kaynaklı bir **İlan İnceleme, Analiz ve Kariyer Operasyon Motorudur**.

---

## Neden KARMİS?

Geleneksel iş arama yöntemleri çöp ilanlar, uyuşmayan kıdem seviyeleri ve belirsiz maaş skalaları ile dolu. **KARMİS**, adayların zamanını korumak için tasarlanmıştır:

- **Sade & Açık Mavi SVG Grafikler:** Şirketlerin Ciro, Bütçe, Çalışan ve Tesis sayılarını temiz beyaz arka planda görselleştirir.
- **%80 Eşik Barajı & Otomatik Filtreler:** Mevzuat/BDDK yükü olan, kıdem altı (junior) veya doğrudan kota bazlı saha satışı ilanlarını otomatik eler.
- **4 Faktörlü Maaş Kesişimi:** Şirket Ölçeği x Sektör x Lokasyon x Seniority kesişimiyle gerçekçi mülakat açılış rakamları üretir.
- **LinkedIn Executive Outreach & STAR Mülakat Asistanı:** İlgili İK liderine doğrudan atılacak bağlantı notları ve STAR yöntemiyle mülakat hazırlık soruları üretir.
- **%100 Gizlilik:** Adayın kişisel CV'si, telefon numarası ve özel verileri yerel ortamda kalır; GitHub'a asla yüklenmez.

---

## Kurulum ve Kullanım

### 1. Depoyu Klonlayın
```bash
git clone https://github.com/behrouzbagherzadeh/karmis.git
cd karmis
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
npx karmis <ilan-url>
```

---

## Standart Analiz Çıktı Formatı

Her ilan analiz edildiğinde aşağıdaki 7 standart modül üretilir:

1. **Hızlı Okuma Özet Tablosu** (Maaş açılışı, uyum puanı, karar)
2. **Sade & Açık Mavi Şirket Rakamları Grafiği** (Minimalist SVG)
3. **Aday Uyum Puanı (% ve Detaylar / Risk Matrisi)**
4. **Executive Cover Letter & İK İletişim Metni**
5. **LinkedIn Executive Outreach Metni** (Max 300 karakter)
6. **Mülakat Hazırlık Asistanı (STAR Metodu)** (Top 5 Soru & Cevap)
7. **ATS CV Anahtar Kelime Optimizasyonu** (Top 5 Keywords)

---

## Örnek İlan Analiz Raporu (CLI Çıktı Örneği)

Aşağıda `npx karmis <ilan-url>` çalıştırıldığında üretilen jenerik örnek analiz çıktısı verilmiştir:

### 1. Hızlı Okuma Özet Tablosu

| Kriter | Detay ve Analiz |
| :--- | :--- |
| **Şirket & Lokasyon** | **Global Tech Enterprise** \| İstanbul (Hibrit) |
| **Sektör & Yapı** | Kurumsal Yazılım, Büyümekte Olan Teknoloji & Veri Dev |
| **Aday Uyum Puanı** | **%95** (Mükemmel Uyum) |
| **Kıdem Uyum Seviyesi** | **Tam Uyum** (15+ Yıl Liderlik vs. Direktör Şartı) |
| **Maaş Benchmark'ı** | **220.000 TL – 280.000 TL Net / Ay** |
| **Karar & Aksiyon** | **BAŞVURULACAK** (%80+ Eşik Barajı Üzerinde) |

---

### 2. Şirket Finansal & Operasyonel Göstergeleri

| Gösterge Metriği | Rakam / Değer | Kapsam ve Açıklama |
| :--- | :--- | :--- |
| **Global Yıllık Ciro** | **15 Milyar USD** | Küresel Gelir Bütçesi |
| **Global Çalışan Sayısı** | **45.000 Kişi** | 80+ Ülkedeki Global İş Gücü |
| **Yıllık BT/Ar-Ge Bütçesi** | **2 Milyar USD** | Yıllık Dijital İnovasyon Yatırımı |
| **Operasyonel Ülke** | **80+ Ülke** | Küresel Operasyon Hacmi |

*(Sistem otomatik olarak beyaz arka planlı, açık mavi sütunlu SVG grafik üretir)*

---

### 3. LinkedIn Executive Outreach Notu (Örnek)

> "Sayın [İlgili İK Direktörü / Hiring Manager], Global Tech Enterprise'ın dijital dönüşüm vizyonunu yakından takip ediyorum. 15 yılı aşkın iş zekası mimarisi, veri yönetişimi ve üretken AI adaptasyonu tecrübemle açık bulunan Dijital Dönüşüm Direktörü pozisyonu hakkında kısa bir görüşme gerçekleştirmek isterim."

---

### 4. Mülakat Hazırlık Asistanı (STAR Metodu Örneği)

> **Soru:** Şirket genelinde veri analitiği ve AI dönüşümünü nasıl yönettiniz?
> 
> **Yanıt (STAR Metodu):**
> - **Situation (Durum):** 7 farklı uluslararası iş biriminde karar destek süreçleri manuel ve yavaştı.
> - **Task (Görev):** Merkezi veri mimarisi ve üretken AI adaptasyonunu kurarak iş birimlerini hızlandırmak.
> - **Action (Eylem):** Power BI dashboard mimarisini kurup 5 kişilik analitik ekibine liderlik ettim.
> - **Result (Sonuç):** Teslimat sürelerini 18 aydan 6 aya indirdik ve operasyonel hızda %67 artış sağladık.

---

## Geliştirici (Developer)

**Behrouz Bagherzadeh**
- GitHub: [@behrouzbagherzadeh](https://github.com/behrouzbagherzadeh)

---

## Lisans (License)

Bu proje **MIT Lisansı** altında açık kaynak olarak lisanslanmıştır. Detaylı bilgi ve haklar için [LICENSE](file:///Users/behrouzbagherzadeh/Developer/KariyerMimari/LICENSE) dosyasına göz atabilirsiniz.

