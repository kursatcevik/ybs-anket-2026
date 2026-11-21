/**
 * Akdeniz Üniversitesi Uygulamalı Bilimler Fakültesi
 * Yönetim Bilişim Sistemleri (YBS) Bölümü
 * Danışma Kurulu ve STAR Akreditasyon Paydaş Anketi — Veri Yapısı
 *
 * Ders listeleri 2025-2026 Bahar ve 2026-2027 Güz fiili ders programlarından
 * birebir doğrulanarak oluşturulmuştur.
 */

const CONFIG = {
  // Google Apps Script Web App URL'si (Aktif Canlı Bağlantı)
  APPS_SCRIPT_URL: "https://script.google.com/macros/s/AKfycbz6h8F6O08vyJF91viVWD2WenSBbbQF7AD2aRyh1m66ZaI0jN2jMTCggdTHDgjCtaK9/exec",
  SURVEY_VERSION: "2026.11-STAR-v3",
  MIN_EXPECTED_SECONDS: 45,
};

const SCALE_NA_VALUE = "Fikrim yok";

const LIKERT_SCALE = [
  { value: "1", short: "1", label: "Kesinlikle Katılmıyorum", isNa: false },
  { value: "2", short: "2", label: "Katılmıyorum", isNa: false },
  { value: "3", short: "3", label: "Kararsızım", isNa: false },
  { value: "4", short: "4", label: "Katılıyorum", isNa: false },
  { value: "5", short: "5", label: "Kesinlikle Katılıyorum", isNa: false },
  { value: SCALE_NA_VALUE, short: "—", label: "Fikrim yok", isNa: true },
];

const IPA_IMPORTANCE_LABELS = {
  1: "Hiç Önemli Değil",
  2: "Az Önemli",
  3: "Orta Düzeyde Önemli",
  4: "Önemli",
  5: "Çok Önemli",
};

const IPA_PERFORMANCE_LABELS = {
  1: "Çok Yetersiz",
  2: "Yetersiz",
  3: "Orta",
  4: "Yeterli",
  5: "Çok Yeterli",
};

/**
 * Katman 2: Ortak Program ve Yetkinlik Ölçeği (4 Boyut x 4 Madde = 16 Madde)
 * EFA/CFA, Cronbach's Alpha ve Sınıflar Arası ANOVA / Kruskal-Wallis için tasarlanmıştır.
 */
const COMMON_SCALE_DIMENSIONS = [
  {
    id: "MG",
    title: "Müfredat Güncelliği ve Teknoloji / Yapay Zekâ Entegrasyonu",
    description: "Öğretim planının güncel bilişim teknolojileri ve YBS disiplin dengesi ile uyumu.",
    items: [
      {
        code: "MG1",
        studentText: "Bölüm öğretim planındaki ders içerikleri güncel bilişim ve yönetim teknolojileriyle uyumludur.",
        alumniText: "Lisans eğitimimde aldığım ders içerikleri güncel bilişim ve yönetim teknolojileriyle uyumluydu.",
      },
      {
        code: "MG2",
        studentText: "Güncel yapay zekâ teknolojileri ders içeriklerine yeterli düzeyde entegre edilmektedir.",
        alumniText: "Güncel yapay zekâ teknolojileri ders içeriklerine yeterli düzeyde entegre edilmişti.",
      },
      {
        code: "MG3",
        studentText: "Seçmeli ders havuzu, güncel sektörel uzmanlaşma alanlarına yönelme olanağı sunmaktadır.",
        alumniText: "Seçmeli ders havuzu, güncel sektörel uzmanlaşma alanlarına yönelme olanağı sunuyordu.",
      },
      {
        code: "MG4",
        studentText: "Müfredattaki işletme/yönetim dersleri ile bilişim/teknoloji dersleri arasında dengeli bir dağılım vardır.",
        alumniText: "Müfredattaki işletme/yönetim dersleri ile bilişim/teknoloji dersleri arasında dengeli bir dağılım vardı.",
      },
    ],
  },
  {
    id: "UO",
    title: "Uygulama, Proje ve Ölçme-Değerlendirme Dengesi",
    description: "Teorik anlatım, laboratuvar imkânları, proje çalışmaları ve sınav yapısının yeterliliği.",
    items: [
      {
        code: "UO1",
        studentText: "Teknik derslerde teorik anlatım ile uygulamalı (kodlama, analiz vb.) çalışma dengesi yeterlidir.",
        alumniText: "Teknik derslerde teorik anlatım ile uygulamalı (kodlama, analiz vb.) çalışma dengesi yeterliydi.",
      },
      {
        code: "UO2",
        studentText: "Derslerdeki mevcut ölçme-değerlendirme yapısı, uygulama ve problem çözme becerilerimi ölçmek için yeterlidir.",
        alumniText: "Derslerdeki ölçme-değerlendirme yapısı, uygulama ve problem çözme becerilerimi ölçmek için yeterliydi.",
      },
      {
        code: "UO3",
        studentText: "Dersler kapsamında gerçek yaşam problemlerine dayalı proje, vaka çalışması ve ödev olanakları yeterlidir.",
        alumniText: "Dersler kapsamında gerçek yaşam problemlerine dayalı proje, vaka çalışması ve ödev olanakları yeterliydi.",
      },
      {
        code: "UO4",
        studentText: "Bilgisayar laboratuvarlarının teknik imkânları ders uygulamalarını gerçekleştirmek için yeterlidir.",
        alumniText: "Bilgisayar laboratuvarlarının teknik imkânları ders uygulamalarını gerçekleştirmek için yeterliydi.",
      },
    ],
  },
  {
    id: "PT",
    title: "Öğretim Planı Tutarlılığı ve Program Çıktıları",
    description: "Derslerin önkoşul zinciri, dönem yükü, müfredat geçişleri ve mesleki yeterlilik algısı.",
    items: [
      {
        code: "PT1",
        studentText: "Alt yarıyıllarda alınan temel dersler, üst yarıyıllardaki ileri düzey dersler için yeterli altyapı oluşturmaktadır.",
        alumniText: "Alt yarıyıllarda alınan temel dersler, üst yarıyıllardaki ileri düzey dersler için yeterli altyapı oluşturmuştu.",
      },
      {
        code: "PT2",
        studentText: "Derslerin yarıyıllara göre iş yükü (AKTS) dağılımı dengelidir.",
        alumniText: "Derslerin yarıyıllara göre iş yükü (AKTS) dağılımı dengeliydi.",
      },
      {
        code: "PT3",
        studentText: "Öğretim planında yapılan yıllık değişiklikler ve geçiş süreçleri eğitim planlamamı olumsuz etkilemeden yürütülmektedir.",
        alumniText: "Öğretim planında yapılan yıllık değişiklikler ve geçiş süreçleri eğitim planlamamı olumsuz etkilemeden yürütülmüştü.",
      },
      {
        code: "PT4",
        studentText: "Programın sunduğu eğitim, YBS alanında mezuniyet sonrası mesleki yetkinlik kazanmam için yeterli bir temel sağlamaktadır.",
        alumniText: "Programın sunduğu eğitim, mezuniyet sonrası iş yaşamında ihtiyaç duyduğum mesleki yetkinlikler için yeterli bir temel sağladı.",
      },
    ],
  },
  {
    id: "AD",
    title: "Akademik Danışmanlık ve Bölüm İletişimi",
    description: "Danışman erişilebilirliği, kariyer yönlendirmesi ve geri bildirim mekanizmaları.",
    items: [
      {
        code: "AD1",
        studentText: "Akademik danışmanımdan akademik süreçlerime ilişkin yeterli rehberlik alabiliyorum.",
        alumniText: "Akademik danışmanımdan akademik süreçlerime ilişkin yeterli rehberlik alabildim.",
      },
      {
        code: "AD2",
        studentText: "Kariyer planlama, staj ve işyerinde eğitim konularında bölümden yeterli yönlendirme sağlanmaktadır.",
        alumniText: "Kariyer planlama, staj ve işyerinde eğitim konularında bölümden yeterli yönlendirme sağlanmıştı.",
      },
      {
        code: "AD3",
        studentText: "Öğrencilerin dersler ve öğretim planı hakkındaki görüş ve önerileri bölüm yönetimi tarafından dikkate alınmaktadır.",
        alumniText: "Öğrencilerin dersler ve öğretim planı hakkındaki görüş ve önerileri bölüm yönetimi tarafından dikkate alınıyordu.",
      },
      {
        code: "AD4",
        studentText: "Bölüm içi duyurular, ders programları ve müfredat değişiklikleri öğrencilere açık ve zamanında iletilmektedir.",
        alumniText: "Bölüm içi duyurular, ders programları ve müfredat değişiklikleri öğrencilere açık ve zamanında iletiliyordu.",
      },
    ],
  },
];

/**
 * Katman 2B: Genel Yetkinlikler (C1–C6) — Ayrı Blok (16 Maddelik Ölçeğin EFA'sına Dahil Edilmez)
 * Öğrenci, Mezun ve İşveren anketlerinde birebir aynı madde metinleriyle üçlü karşılaştırma için kullanılır.
 */
const COMPETENCY_NA_VALUE = SCALE_NA_VALUE;

const COMPETENCY_SCALE = [
  { value: "1", short: "1", label: "Hiç", isNa: false },
  { value: "2", short: "2", label: "Az", isNa: false },
  { value: "3", short: "3", label: "Orta", isNa: false },
  { value: "4", short: "4", label: "İyi", isNa: false },
  { value: "5", short: "5", label: "Çok iyi", isNa: false },
  { value: COMPETENCY_NA_VALUE, short: "—", label: "Fikrim yok", isNa: true },
];

const GENERAL_COMPETENCIES = {
  title: "Genel Yetkinlikler",
  studentStem: "Program şu ana kadar aşağıdaki yetkinlikleri size ne ölçüde kazandırdı?",
  alumniStem: "Program aşağıdaki yetkinlikleri size ne ölçüde kazandırdı?",
  items: [
    { code: "C1", text: "Alanındaki kuramsal ve olgusal bilgiyi kullanma" },
    { code: "C2", text: "Bilgiyi uygulamaya dönüştürme ve problem çözme" },
    { code: "C3", text: "Bağımsız çalışma ve sorumluluk alma" },
    { code: "C4", text: "Yeni bilgi ve teknolojileri kendi kendine öğrenebilme" },
    { code: "C5", text: "Ekip çalışması, iletişim ve sunum" },
    { code: "C6", text: "Mesleğe özgü araç ve yöntemleri kullanma" },
  ],
};

const COURSE_GROUPS = {
  PROG: "Programlama ve Yazılım Geliştirme",
  DATA_AI: "Veri, Yapay Zekâ ve Nicel Yöntemler",
  IS_TECH: "Bilişim Sistemleri ve Kurumsal Teknoloji",
  MGMT: "İşletme, Yönetim ve Girişimcilik",
  LANG_SOC: "Yabancı Dil ve Toplumsal Katkı",
};

/**
 * Katman 3A: Fiili Ders Programları (2025-2026 Bahar ve 2026-2027 Güz)
 * Her sınıfa yalnızca tamamladığı son Bahar yarıyılı ve devam ettiği mevcut Güz yarıyılı açılır.
 * ders_turu: "YBS" (bölüm alan dersi) | "Ortak" (üniversite ortak dersi — yalnızca İngilizce ve TDP 301)
 */
const CURRICULUM_BY_CLASS = {
  "1": [
    {
      semesterId: "YY1",
      semesterTitle: "1. Yarıyıl Dersleri",
      termBadge: "2026–2027 Güz (Devam Eden Dönem)",
      termType: "Devam Eden (2026-27 Güz)",
      courses: [
        { code: "YBS 151", name: "Bilişim Sistemleri ve Teknolojilerine Giriş", category: "YBS", group: COURSE_GROUPS.IS_TECH, mandatory: true },
        { code: "YBS 153", name: "Algoritma ve Programlamaya Giriş", category: "YBS", group: COURSE_GROUPS.PROG, mandatory: true },
        { code: "YBS 155", name: "Matematik", category: "YBS", group: COURSE_GROUPS.DATA_AI, mandatory: true },
        { code: "YBS 157", name: "Pazarlama İlkeleri", category: "YBS", group: COURSE_GROUPS.MGMT, mandatory: true },
        { code: "YBS 159", name: "İktisada Giriş I", category: "YBS", group: COURSE_GROUPS.MGMT, mandatory: true },
        { code: "KPD 101", name: "Kariyer Planlama", category: "YBS", group: COURSE_GROUPS.MGMT, mandatory: true },
        { code: "YBD 101", name: "İngilizce I", category: "Ortak", group: COURSE_GROUPS.LANG_SOC, mandatory: true },
      ],
    },
  ],
  "2": [
    {
      semesterId: "YY2",
      semesterTitle: "2. Yarıyıl Dersleri",
      termBadge: "2025–2026 Bahar (Tamamlanan Dönem)",
      termType: "Tamamlanan (2025-26 Bahar)",
      courses: [
        { code: "YBS 158", name: "Veri Yapıları ve Algoritmalar", category: "YBS", group: COURSE_GROUPS.PROG, mandatory: true },
        { code: "YBS 156", name: "Bilgisayar Donanımı ve İşletim Sistemleri", category: "YBS", group: COURSE_GROUPS.IS_TECH, mandatory: true },
        { code: "YBS 154", name: "İleri Düzey Ofis Uygulamaları", category: "YBS", group: COURSE_GROUPS.IS_TECH, mandatory: true },
        { code: "YBS 152", name: "Yönetim ve Organizasyon", category: "YBS", group: COURSE_GROUPS.MGMT, mandatory: true },
        { code: "YBS 160", name: "İktisada Giriş II", category: "YBS", group: COURSE_GROUPS.MGMT, mandatory: true },
        { code: "YBD 102", name: "İngilizce II", category: "Ortak", group: COURSE_GROUPS.LANG_SOC, mandatory: true },
      ],
    },
    {
      semesterId: "YY3",
      semesterTitle: "3. Yarıyıl Dersleri",
      termBadge: "2026–2027 Güz (Devam Eden Dönem)",
      termType: "Devam Eden (2026-27 Güz)",
      courses: [
        { code: "YBS 251", name: "Nesne Yönelimli Programlama - 1", category: "YBS", group: COURSE_GROUPS.PROG, mandatory: true },
        { code: "YBS 253", name: "Web Tabanlı Programlama - 1", category: "YBS", group: COURSE_GROUPS.PROG, mandatory: true },
        { code: "YBS 255", name: "Veritabanına Giriş", category: "YBS", group: COURSE_GROUPS.DATA_AI, mandatory: true },
        { code: "YBS 257", name: "Proje Yönetimi", category: "YBS", group: COURSE_GROUPS.MGMT, mandatory: true },
        { code: "YBS 259", name: "Örgütsel Davranış", category: "YBS", group: COURSE_GROUPS.MGMT, mandatory: true },
        { code: "YBS 261", name: "İstatistik I", category: "YBS", group: COURSE_GROUPS.DATA_AI, mandatory: true },
        { code: "YBS 265", name: "Genel Muhasebe I", category: "YBS", group: COURSE_GROUPS.MGMT, mandatory: true },
        { code: "YBS 263", name: "Uygulamalı Girişimcilik", category: "YBS", group: COURSE_GROUPS.MGMT, mandatory: false },
      ],
    },
  ],
  "3": [
    {
      semesterId: "YY4",
      semesterTitle: "4. Yarıyıl Dersleri",
      termBadge: "2025–2026 Bahar (Tamamlanan Dönem)",
      termType: "Tamamlanan (2025-26 Bahar)",
      courses: [
        { code: "YBS 252", name: "Nesne Yönelimli Programlama - 2", category: "YBS", group: COURSE_GROUPS.PROG, mandatory: true },
        { code: "YBS 254", name: "Web Tabanlı Programlama - 2", category: "YBS", group: COURSE_GROUPS.PROG, mandatory: true },
        { code: "YBS 256", name: "Veritabanı Yönetim Sistemleri", category: "YBS", group: COURSE_GROUPS.DATA_AI, mandatory: true },
        { code: "YBS 264", name: "Sistem Analizi ve Tasarımı", category: "YBS", group: COURSE_GROUPS.IS_TECH, mandatory: true },
        { code: "YBS 258", name: "Bilimsel Araştırma Yöntemleri", category: "YBS", group: COURSE_GROUPS.DATA_AI, mandatory: true },
        { code: "YBS 262", name: "İstatistik II", category: "YBS", group: COURSE_GROUPS.DATA_AI, mandatory: true },
        { code: "YBS 260", name: "Üretim Yönetimi", category: "YBS", group: COURSE_GROUPS.MGMT, mandatory: true },
        { code: "YBS 266", name: "Genel Muhasebe II", category: "YBS", group: COURSE_GROUPS.MGMT, mandatory: true },
      ],
    },
    {
      semesterId: "YY5",
      semesterTitle: "5. Yarıyıl Dersleri",
      termBadge: "2026–2027 Güz (Devam Eden Dönem)",
      termType: "Devam Eden (2026-27 Güz)",
      courses: [
        { code: "YBS 351", name: "Mobil Uygulama Geliştirme", category: "YBS", group: COURSE_GROUPS.PROG, mandatory: true },
        { code: "YBS 353", name: "Yöneylem Araştırması I", category: "YBS", group: COURSE_GROUPS.DATA_AI, mandatory: true },
        { code: "YBS 355", name: "Karar Verme Teknikleri", category: "YBS", group: COURSE_GROUPS.DATA_AI, mandatory: true },
        { code: "TDP 301", name: "Toplumsal Duyarlılık ve Katkı", category: "Ortak", group: COURSE_GROUPS.LANG_SOC, mandatory: true },
        { code: "YBS 381", name: "Bilgi Sistemleri Entegrasyonu", category: "YBS", group: COURSE_GROUPS.IS_TECH, mandatory: false },
        { code: "YBS 385", name: "Tüketici Davranışları", category: "YBS", group: COURSE_GROUPS.MGMT, mandatory: false },
        { code: "YBS 387", name: "Stratejik Yönetim", category: "YBS", group: COURSE_GROUPS.MGMT, mandatory: false },
        { code: "YBS 391", name: "Bilgisayarla Görme", category: "YBS", group: COURSE_GROUPS.DATA_AI, mandatory: false },
      ],
    },
  ],
  "4": [
    {
      semesterId: "YY6",
      semesterTitle: "6. Yarıyıl Dersleri",
      termBadge: "2025–2026 Bahar (Tamamlanan Dönem)",
      termType: "Tamamlanan (2025-26 Bahar)",
      courses: [
        { code: "YBS 352", name: "Yapay Zekâ ve Makine Öğrenmesi", category: "YBS", group: COURSE_GROUPS.DATA_AI, mandatory: true },
        { code: "YBS 356", name: "Yöneylem Araştırması II", category: "YBS", group: COURSE_GROUPS.DATA_AI, mandatory: true },
        { code: "YBS 354", name: "İnsan Kaynakları Yönetimi", category: "YBS", group: COURSE_GROUPS.MGMT, mandatory: true },
        { code: "YBS 358", name: "Finansal Yönetim", category: "YBS", group: COURSE_GROUPS.MGMT, mandatory: true },
        { code: "YBS 386", name: "Veri İletişimi ve Bilgisayar Ağları", category: "YBS", group: COURSE_GROUPS.IS_TECH, mandatory: false },
        { code: "YBS 384", name: "Bilgisayar Tabanlı Optimizasyon Uygulamaları", category: "YBS", group: COURSE_GROUPS.DATA_AI, mandatory: false },
        { code: "YBS 388", name: "Kalite Yönetim Sistemleri", category: "YBS", group: COURSE_GROUPS.MGMT, mandatory: false },
        {
          code: "YBS 473-B",
          name: "Uygulamalı Veri Madenciliği (2025–26 Bahar)",
          category: "YBS",
          group: COURSE_GROUPS.DATA_AI,
          mandatory: false,
          onlyEvening: true,
        },
      ],
    },
    {
      semesterId: "YY7",
      semesterTitle: "7. Yarıyıl Dersleri",
      termBadge: "2026–2027 Güz (Devam Eden Dönem)",
      termType: "Devam Eden (2026-27 Güz)",
      courses: [
        { code: "YBS 451", name: "Yönetim Bilişim Sistemlerinde Güncel Konular", category: "YBS", group: COURSE_GROUPS.IS_TECH, mandatory: true },
        { code: "YBS 471", name: "Kurumsal Veri Yönetimi", category: "YBS", group: COURSE_GROUPS.DATA_AI, mandatory: false },
        { code: "YBS 473", name: "Uygulamalı Veri Madenciliği", category: "YBS", group: COURSE_GROUPS.DATA_AI, mandatory: false },
        { code: "YBS 475", name: "Derin Öğrenme", category: "YBS", group: COURSE_GROUPS.DATA_AI, mandatory: false },
        { code: "YBS 485", name: "Robotik Uygulamaları", category: "YBS", group: COURSE_GROUPS.IS_TECH, mandatory: false },
        { code: "YBS 489", name: "Kurumsal Kaynak Planlama (ERP)", category: "YBS", group: COURSE_GROUPS.IS_TECH, mandatory: false },
        { code: "YBS 477", name: "Müşteri İlişkileri Yönetimi (CRM)", category: "YBS", group: COURSE_GROUPS.MGMT, mandatory: false },
        { code: "YBS 483", name: "Maliyet Muhasebesi", category: "YBS", group: COURSE_GROUPS.MGMT, mandatory: false },
      ],
    },
  ],
};

/**
 * Katman 3B: Mezunlara Özel YBS 402 İş Yerinde Eğitim (8. Yarıyıl) ve Sektörel Yetkinlik Modülü
 */
const ALUMNI_YBS402_ITEMS = [
  {
    code: "IE1",
    text: "İşyerinde Eğitim (YBS 402) için uygun kurum bulma ve yerleştirme sürecinde bölüm/fakülte desteği yeterliydi.",
  },
  {
    code: "IE2",
    text: "İşyerinde Eğitim süresince çalıştığım kurumda YBS alanıyla doğrudan ilişkili ve nitelikli görevler üstlendim.",
  },
  {
    code: "IE3",
    text: "Süreç boyunca akademik danışman/izleyici öğretim elemanı ile iletişim ve takip mekanizması etkiliydi.",
  },
  {
    code: "IE4",
    text: "İşyerindeki yetkili/mentör desteği, mesleki gelişimime somut katkı sağladı.",
  },
  {
    code: "IE5",
    text: "İlk 7 yarıyılda aldığım dersler, 8. yarıyıldaki İşyerinde Eğitim uygulamasına beni yeterince hazırladı.",
  },
  {
    code: "IE6",
    text: "İşyerinde Eğitim (YBS 402) deneyimi, mezuniyet sonrası istihdam edilmeme ve iş yaşamına uyumuma doğrudan katkı sağladı.",
  },
];

const ALUMNI_SKILL_GAPS = [
  "Üretken Yapay Zekâ ve Büyük Dil Modelleri (LLM / Prompt & Agentic AI)",
  "Bulut Bilişim ve DevOps (AWS, Azure, GCP, Docker, CI/CD)",
  "Veri Mühendisliği ve Büyük Veri (ETL, Spark, Veri Ambarı, Modern SQL)",
  "İş Zekâsı ve Görselleştirme (Power BI, Tableau, İleri Excel/DAX)",
  "Kurumsal Yazılım Mimarisi, API Tasarımı ve Yazılım Test Süreçleri",
  "Kurumsal Kaynak Planlama (SAP / ERP) ve İş Süreçleri Yönetimi (BPM)",
  "Siber Güvenlik, Bilgi Güvenliği Yönetimi ve KVKK/Uyum",
  "Çevik Proje Yönetimi (Agile, Scrum, Jira) ve Ürün Yönetimi",
  "Mesleki İngilizce, Teknik Dokümantasyon ve İş İletişimi",
];

/**
 * Ders kartlarında isteğe bağlı hızlı iyileştirme etiketleri (açık uçlu yerine nicel frekans)
 */
const COURSE_IMPROVEMENT_TAGS = [
  "Uygulama / kodlama artırılsın",
  "İçerik güncellensin",
  "Ders işlenişi daha etkileşimli ve örnekli olsun",
  "Dönem içi proje ve ödev ağırlığı artırılsın",
  "Önkoşul / temel bilgisi eksik kaldı",
  "Ders saati veya lab imkânı yetersiz",
];

/**
 * Mezunlar için YBS 402 İşyerinde Eğitim iyileştirme seçenekleri (en fazla 3 seçim)
 */
const ALUMNI_YBS402_IMPROVEMENTS = [
  "Bölümün anlaşmalı kurum / yerleştirme havuzu oluşturması",
  "İşyerindeki görevlerin YBS alanına uygunluğunun daha sıkı izlenmesi",
  "Akademik izleyici öğretim elemanı ile iletişim/takip sıklığının artırılması",
  "Öncesinde CV, mülakat ve teknik hazırlık desteği verilmesi",
  "Değerlendirme kriterlerinin ve raporlama rubriğinin netleştirilmesi",
  "Mevcut süreç genel olarak yeterliydi",
];

/**
 * Adım 4: Yapılandırılmış (Seçilebilir) Danışma Kurulu Öneri Maddeleri
 */
const STEP4_QUESTIONS = {
  aiTech: {
    maxSelect: 4,
    exclusiveOption: "Mevcut teknoloji kapsamını yeterli buluyorum (ek önerim yok)",
    options: [
      "Üretken Yapay Zekâ, Büyük Dil Modelleri (LLM) ve Yapay Zekâ Ajanları",
      "Uygulamalı Makine Öğrenmesi ve Derin Öğrenme Projeleri",
      "Veri Mühendisliği, Büyük Veri ve Modern SQL / Veri Ambarı",
      "İş Zekâsı ve Veri Görselleştirme (Power BI, Tableau, İleri Excel)",
      "Bulut Bilişim ve DevOps (AWS, Azure, Docker, CI/CD)",
      "Modern Web / Mobil Yazılım Mimarisi ve API Geliştirme",
      "Siber Güvenlik ve Bilgi Güvenliği Yönetimi",
      "Kurumsal Sistemler (SAP / ERP, CRM) ve İş Süreçleri Yönetimi",
      "Çevik Proje Yönetimi (Agile / Scrum) ve Ürün Yönetimi",
      "Mevcut teknoloji kapsamını yeterli buluyorum (ek önerim yok)",
    ],
  },
  curriculum: {
    maxSelect: 3,
    exclusiveOption: "Mevcut öğretim planı ve değerlendirme yapısını genel olarak yeterli buluyorum",
    options: [
      "Dönem içi proje ve ödev ağırlığının artırılması",
      "Teknik derslerde uygulamalı laboratuvar saatinin resmî müfredata eklenmesi",
      "Sektör profesyonelleriyle ortak vaka çalışmaları ve uygulamalı seminerler",
      "Dersler arası içerik tekrarının azaltılıp önkoşul zincirinin düzenlenmesi",
      "Yıllık müfredat değişikliklerinin azaltılarak öğretim planının sabitlenmesi",
      "Seçmeli ders çeşitliliğinin ve güncel uzmanlaşma alanlarının artırılması",
      "Derslerde kullanılan yazılım ve araçların güncel sürümlere taşınması",
      "Mevcut öğretim planı ve değerlendirme yapısını genel olarak yeterli buluyorum",
    ],
  },
  support: {
    maxSelect: 3,
    exclusiveOption: "Mevcut danışmanlık ve bölüm süreçlerini genel olarak yeterli buluyorum",
    options: [
      "Akademik danışmanlarla daha düzenli görüşme ve ders seçimi rehberliği",
      "İşyerinde Eğitim (YBS 402) ve staj için kurum bulma/eşleştirme desteği",
      "Laboratuvar bilgisayar donanımı ve yazılım altyapısının güçlendirilmesi",
      "Müfredat değişiklikleri ve ders programlarının daha erken duyurulması",
      "Kariyer günleri, mezun buluşmaları ve uygulamalı teknik atölyelerin artırılması",
      "Mevcut danışmanlık ve bölüm süreçlerini genel olarak yeterli buluyorum",
    ],
  },
};
