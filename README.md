# FatefulMoment

FatefulMoment, oyuncuyu tarihî bir kriz anında karar vermeye zorlayan bir
React Native karar simülasyonudur. Oyuncu seçim yapar, kararlarının sonuçlarını video sahneleriyle izler ve sonunda bu seçimlerden
çıkarılan bir **Karar DNA'sı** profili görür.

Uygulama iOS ve Android'de çalışır. Arayüz Türkçe ve İngilizce destekler;
dil, çekmecedeki Ayarlar panelinden anında değiştirilebilir. Backend yoktur:
tüm içerik, skorlar ve oturum bilgisi cihazda tutulur.

## 📱 Teslimat Bağlantıları ve Çıktılar

- **Android Release APK:** [FatefulMoment v1.0.0 APK İndir](https://github.com/YagmurBilgee/FatefulMoment/releases/download/v1.0.0/FatefulMoment-v1.0.0.apk)
- **Ekran Kayıtları (Google Drive):** [iOS & Android Simülasyon Akış Videoları](https://drive.google.com/drive/folders/1I4JmPJ4dxQx1qHEHCWkpuuIVJrQwTrPY?usp=sharing)
- **Kaynak Kod Deposu:** [GitHub - YagmurBilgee/FatefulMoment](https://github.com/YagmurBilgee/FatefulMoment)

---

## Oynanabilir senaryo: Irak Savaşı (2003)

> 2003. Kimyasal silah iddiaları masanızda. Kararınız milyonların kaderini
> belirleyecek.

Oyuncu ABD Başkanı rolündedir. Senaryo tek bir karar düğümü üzerine kurulu,
iki aşamalı bir akıştır. Her iki aşamada yapılan seçim de DNA skoruna
işlenir.

### Akış

| Adım | Ekranda olan | Video |
| --- | --- | --- |
| 1. Brifing | Senaryo kartı: görsel, başlık, açıklama ve **Simülasyonu Başlat** düğmesi | — |
| 2. Giriş sahnesi | Tam ekran video; üstte yalnızca geri düğmesi | `iraq-war` |
| 3. Birinci karar | Videonun son karesi karartılarak arka plan olur. Beş seçenek kartı (2 + 2 + 1 satır) ve 15 saniyelik gerilim sayacı belirir | — |
| 4. Sonuç sahnesi | Seçilen kart parlar, ekran sonuç videosuna geçer | `iraq-war-2` |
| 5. **"Senin Seçimin" incelemesi** | Aynı beş kart aynı yerlerde geri gelir. İlk seçim parlar, kilitlenir ve **Senin Seçimin** rozetini taşır. Diğer dört kart açık kalır, sayaç yeniden başlar | — |
| 6. İkinci sonuç sahnesi | İkinci seçim (ya da süre dolması) inceleme videosunu oynatır | `iraq-war-3` |
| 7. Karar DNA'sı | İki seçimin toplam etkisinden profil hesaplanır. DNA ekranı simülasyonun yerine açılır, bu yüzden Geri tuşu Senaryolar ekranına döner | — |

Birinci kararda süre dolarsa rozet gösterilmez; incelemede tüm kartlar açık
olur.

### Seçenekler ve DNA etkileri

Her seçim, başlangıçta tüm boyutları **50** olan skora aşağıdaki değişiklikleri
uygular. Skorlar 0–100 aralığında sınırlanır.

| Seçenek | Vizyon | Cesaret | Risk | Kontrol | Empati | Etik |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Deniz Karantinası | | +5 | +5 | +10 | | +5 |
| Moskova'dan Sinyal Bekle | | −10 | −5 | | +15 | +5 |
| Zaman Baskısına Uyum (takvimde fırlatma) | +15 | +25 | +15 | | | −10 |
| Sonarla Sinyal Ver (iki ayrı kart) | +15 | +5 | +5 | +10 | | |
| **Süre doldu** | | −10 | | −10 | | |

Süre dolması ayrı bir seçim gibi puanlanır: baskı altında tereddüt etmek
cesareti ve kontrolü düşürür.

### Gerilim sayacı (TensionTimer)

- Her karar için **15 saniye** verilir.
- Çubuk ortasından iki uca doğru aynı anda kısalır.
- Renk sarıdan başlar, yarı sürede turuncuya döner, sürenin son %30'unda
  kırmızıya geçer.
- Süre dolduğunda "Süre doldu" etkisi uygulanır ve karar düğümünün sonuç
  videosu oynar.

---

## Karar DNA'sı: 6 psikolojik boyut

| Boyut | Ölçtüğü şey |
| --- | --- |
| **Vizyon** (Vision) | Büyük resmi ve uzun vadeli etkiyi görme |
| **Cesaret** (Courage) | Baskı altında harekete geçme isteği |
| **Risk** | Belirsizliği üstlenmeye hazır olma |
| **Kontrol** (Control) | Sonucu elde tutma, seçenekleri yönetme |
| **Empati** (Empathy) | Kararın insanlar üzerindeki bedelini gözetme |
| **Etik** (Ethics) | İlkelerden ödün vermeme |

DNA ekranında bu altı boyut bir radar grafiği ve 2×3'lük metrik kartları
(Psikolojik Matris) olarak gösterilir. Ekranda ayrıca üç **Örüntü Tespiti**
kartı ve profilin **Kör Nokta** kartı yer alır.

---

## Karakter arketipleri

### Seçim kuralı

Her arketip bir boyut çiftiyle tanımlanır (`DNA_PROFILE_DIMENSIONS`):

| Arketip | Tanımlayan çift |
| --- | --- |
| Cesur Vizyoner | Vizyon + Cesaret |
| Pragmatik Stratejist | Risk + Kontrol |
| Empatik Lider | Empati + Etik |

Simülasyon bittiğinde iki seçimin etkisi başlangıç skoruna uygulanır.
`selectDnaProfile`, çift toplamı en yüksek olan arketipi seçer. Eşitlikte
listede önce gelen kazanır (sıra: Cesur Vizyoner, Pragmatik Stratejist,
Empatik Lider).

DNA ekranında gösterilen skorlar oyuncunun ham skorları değil, seçilen
arketipin **sabit profil skorlarıdır**.

DNA ekranı çekmeceden, yani simülasyon oynanmadan açılırsa arketip sırayla
döner: her açılışta rastgele bir arketipten başlanır ve her ziyarette
sıradakine geçilir. Böylece aynı profil art arda iki kez gösterilmez.

### Hangi yol hangi arketipe gider

İlk seçim × ikinci seçim (ya da süre dolması), toplam 31 yol:

| Arketip | Yol sayısı | Tipik yollar |
| --- | ---: | --- |
| **Cesur Vizyoner** | 16 | Zaman Baskısına Uyum içeren her yol; iki Sonar kartı birlikte; Sonar + süre dolması |
| **Empatik Lider** | 9 | Moskova'dan Sinyal Bekle ile Karantina, Sonar ya da süre dolması; iki kararda da süre dolması |
| **Pragmatik Stratejist** | 6 | Deniz Karantinası + Sonar (iki sırada da); Karantina + süre dolması |

### 1. CESUR VİZYONER (Brave Visionary)

> Büyük resmi görür ve bedeli ne olursa olsun ona doğru yürürsün.

- **Baskın boyutlar:** Vizyon **88**, Cesaret **82**
- **Kör nokta:** Etik **31**: *"Kazanmak için ne kadar bedel ödeyeceksin?"*
- **Profil skorları:** Vizyon 88 · Cesaret 82 · Risk 79 · Kontrol 55 · Empati 38 · Etik 31
- **Tetikleyen yol:** En güçlü tetikleyici "Zaman Baskısına Uyum" seçeneğidir
  (Vizyon +15, Cesaret +25). Bu seçeneği içeren her yol Cesur Vizyoner'e çıkar.

### 2. EMPATİK LİDER (Empathetic Leader)

> Baskı doruğa çıktığında insanları ve ilkeleri öne koyarsın.

- **Baskın boyutlar:** Empati **86**, Etik **81**
- **Kör nokta:** Cesaret **36**: *"Kimsenin sevmeyeceği kararı verebilir misin?"*
- **Profil skorları:** Vizyon 57 · Cesaret 36 · Risk 41 · Kontrol 52 · Empati 86 · Etik 81
- **Tetikleyen yol:** "Moskova'dan Sinyal Bekle" (Empati +15, Etik +5), fırlatma
  dışındaki bir seçenekle birleştiğinde. İki kararda da süre dolarsa da bu
  profil çıkar: Cesaret ve Kontrol düşer, Empati + Etik çifti öne geçer.

### 3. PRAGMATİK STRATEJİST (Pragmatic Strategist)

> Her riski hesaplar, soğuk bir kararlılıkla hareket edersin.

- **Baskın boyutlar:** Kontrol **86**, Vizyon **65**
- **Kör nokta:** Risk **34**: *"Beklerken neyi kaçıracaksın?"*
- **Profil skorları:** Vizyon 65 · Cesaret 60 · Risk 34 · Kontrol 86 · Empati 42 · Etik 58
- **Tetikleyen yol:** "Deniz Karantinası" (Kontrol +10) ile Sonar ya da süre
  dolması. Risk + Kontrol çifti, diğer iki çiftin önüne geçer.

---

## Teknoloji

| Alan | Kullanılan |
| --- | --- |
| Çatı | React Native 0.87.1, React 19.2.3 |
| Dil | TypeScript 6 |
| Navigasyon | React Navigation 7 (native stack) |
| Video | react-native-video 6 |
| Güvenli alan | react-native-safe-area-context 5 |
| Test | Jest 29, react-test-renderer |
| Kod kalitesi | ESLint (`@react-native/eslint-config`), Prettier |
| Yazı tipi | Inter (paketli); Android'de ek yazı tipi boşluğu kapatılır |

Kimlik doğrulama yereldir (`src/services/mockAuth.ts`). Giriş, sabit bir demo
hesapla yapılır:

- **E-posta:** `test@fatefulmoment.com`
- **Şifre:** `Password123`

### Proje yapısı

```
src/
  components/   Ortak arayüz bileşenleri (DecisionCard, TensionTimer, RadarChart…)
  screens/      Giriş akışı, Senaryolar, Simülasyon, DNA Profili
  data/         Senaryo içeriği ve DNA skor modeli (simulation.ts)
  locales/      Türkçe ve İngilizce metinler
  navigation/   Kök stack ve ekran parametreleri
  context/      Dil bağlamı
  theme/        Renk ve tipografi token'ları
__tests__/      Jest testleri
```

---

## Yerel kurulum

**Gereksinimler:** Node.js ≥ 22.11, Xcode ve CocoaPods (iOS için), Android
Studio ve JDK (Android için).
[React Native ortam kurulumu](https://reactnative.dev/docs/set-up-your-environment)
tamamlanmış olmalıdır.

```sh
# Bağımlılıklar
npm install

# iOS: CocoaPods (ilk kurulumda ve native bağımlılıklar değiştiğinde)
bundle install
cd ios && bundle exec pod install && cd ..

# Metro'yu başlat
npm start

# Ayrı bir terminalde
npm run ios       # iOS Simülatörü
npm run android   # Android emülatörü veya cihaz
```

### Bağımsız Android release APK

Release APK, JavaScript paketini içine gömer ve Metro olmadan çalışır:

```sh
cd android && ./gradlew assembleRelease && cd ..
# Çıktı: android/app/build/outputs/apk/release/app-release.apk
```

---

## Test ve kalite

```sh
npx tsc --noEmit   # tip kontrolü
npx eslint .       # lint
npx jest           # birim ve akış testleri
```

**Durum: 4 test paketinde 48/48 test geçiyor.** Tip kontrolü ve lint temiz.

| Test dosyası | Kapsam |
| --- | --- |
| `App.test.tsx` | Uygulamanın hatasız açılması |
| `SignInScreen.test.tsx` | Giriş formu ve hata mesajları, oturum açma/kapama, Senaryolar ekranı, süre dolması (inceleme dahil), anında dil değişimi |
| `AuthFlow.test.tsx` | Hesap oluşturma ve kural doğrulaması, şifre sıfırlama, e-posta kontrolü akışı |
| `DnaProfile.test.tsx` | Arketip seçim kuralı, radar grafiği geometrisi, DNA ekranı ve çekmece davranışı |

---

## Yapay zekâ destekli geliştirme süreci

Proje, bir yapay zekâ kodlama asistanıyla (Claude Code) geliştirildi. Süreç
geliştirici tarafından yönetildi:

- **Görev tanımı:** Her iş adımı, kabul kriterleri ve kısıtlarıyla birlikte
  geliştirici tarafından tek tek tanımlandı (ör. "Metro kapalıyken test et",
  "commit atmadan önce incelemeye bırak").
- **Doğrulama:** Her değişiklikten sonra `tsc`, `eslint` ve `jest` çalıştırıldı.
  Arayüz değişiklikleri iOS Simülatörü'nde görsel olarak kontrol edildi.
  Release derlemeleri Android emülatöründe Metro olmadan, soğuk başlatmayla
  denendi.
- **İnceleme:** Kod ve metinler commit'ten önce geliştirici tarafından
  gözden geçirildi.
- **Kaynak yönetimi:** Geliştirme makinesinin disk ve ısı sınırları nedeniyle
  görsel kontroller öncelikle iOS Simülatörü'nde yapıldı. Android emülatörü
  yalnızca release doğrulaması için, snapshot kapalı olarak kullanıldı.
- **Kod hijyeni:** Tasarım ölçüm notları ve geçici yorumlar temizlendi.
  Kodda yalnızca alanla ilgili gerekçe yorumları bırakıldı.
