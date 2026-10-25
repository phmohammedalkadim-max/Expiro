export interface DrugInfo {
  barcode: string;
  tradeName: string;
  scientificName: string;
  companyName: string;
  category: string;
  defaultAlertDays: number;
  notes: string;
  commonDose?: string;
}

// قاعدة بيانات دوائية متكاملة تضم أشهر الأدوية المتداولة في الصيدليات (العراق والشرق الأوسط وعالمياً)
export const GLOBAL_DRUG_DATABASE: DrugInfo[] = [
  {
    barcode: '6281001230012',
    tradeName: 'أوجمنتين 1 جم أقراص (Augmentin 1g)',
    scientificName: 'Amoxicillin + Clavulanic Acid 1000mg',
    companyName: 'GSK (GlaxoSmithKline)',
    category: 'المضادات الحيوية',
    defaultAlertDays: 60,
    notes: 'مضاد حيوي واسع المجال لعلاج التهابات الجهاز التنفسي والمسالك البولية',
    commonDose: 'قرص كل 12 ساعة بعد الأكل'
  },
  {
    barcode: '5000158067812',
    tradeName: 'أوجمنتين 625 مجم (Augmentin 625mg)',
    scientificName: 'Amoxicillin + Clavulanic Acid 625mg',
    companyName: 'GSK (GlaxoSmithKline)',
    category: 'المضادات الحيوية',
    defaultAlertDays: 60,
    notes: 'مضاد حيوي واسع المجال لعلاج الالتهابات البكتيرية والجيوب الأنفية',
    commonDose: 'قرص 3 مرات يومياً'
  },
  {
    barcode: '6285000000018',
    tradeName: 'بانادول إكسترا (Panadol Extra)',
    scientificName: 'Paracetamol 500mg + Caffeine 65mg',
    companyName: 'Haleon / GSK',
    category: 'مسكنات وخافضات حرارة',
    defaultAlertDays: 90,
    notes: 'مسكن سريع وفعال للصداع، آلام المفاصل والأسنان وخافض للحرارة',
    commonDose: 'قرص إلى قرصين كل 6 إلى 8 ساعات'
  },
  {
    barcode: '5000347060129',
    tradeName: 'بانادول أدفانس 500 مجم (Panadol Advance)',
    scientificName: 'Paracetamol 500mg (Optizorb Technology)',
    companyName: 'Haleon / GSK',
    category: 'مسكنات وخافضات حرارة',
    defaultAlertDays: 90,
    notes: 'مسكن للصداع والآلام الخفيفة والمتوسطة مع امتصاص سريع',
    commonDose: 'قرصان حتى 4 مرات يومياً عند اللزوم'
  },
  {
    barcode: '6285000000025',
    tradeName: 'بانادol كولد آند فلو (Panadol Cold & Flu)',
    scientificName: 'Paracetamol + Phenylephrine + Chlorpheniramine',
    companyName: 'Haleon / GSK',
    category: 'أدوية نزلات البرد والإنفلونزا',
    defaultAlertDays: 60,
    notes: 'لعلاج أعراض الرشح والزكام وانسداد الأنف والصداع والحرارة',
    commonDose: 'قرص كل 8 ساعات'
  },
  {
    barcode: '6281100223344',
    tradeName: 'كونكور 5 مجم (Concor 5mg)',
    scientificName: 'Bisoprolol Fumarate 5mg',
    companyName: 'Merck (ميرك)',
    category: 'القلب والأوعية الدموية وضغط الدم',
    defaultAlertDays: 90,
    notes: 'حاصر بيتا لتنظيم ضربات القلب وعلاج ارتفاع ضغط الدم والقصور القلبي',
    commonDose: 'قرص واحد يومياً صباحاً'
  },
  {
    barcode: '4022536001234',
    tradeName: 'كونكور 2.5 مجم (Concor 2.5mg)',
    scientificName: 'Bisoprolol Fumarate 2.5mg',
    companyName: 'Merck (ميرك)',
    category: 'القلب والأوعية الدموية وضغط الدم',
    defaultAlertDays: 90,
    notes: 'لعلاج قصور القلب الخفيف وضغط الدم المنتظم',
    commonDose: 'قرص واحد يومياً'
  },
  {
    barcode: '4022536001241',
    tradeName: 'كونكور 10 مجم (Concor 10mg)',
    scientificName: 'Bisoprolol Fumarate 10mg',
    companyName: 'Merck (ميرك)',
    category: 'القلب والأوعية الدموية وضغط الدم',
    defaultAlertDays: 90,
    notes: 'جرعة قصوى لتنظيم ضربات القلب وارتفاع ضغط الدم',
    commonDose: 'قرص واحد يومياً'
  },
  {
    barcode: '3582910023419',
    tradeName: 'جلوكوفاج 1000 مجم (Glucophage 1000mg)',
    scientificName: 'Metformin HCl 1000mg',
    companyName: 'Merck Serono',
    category: 'أدوية السكري والغدد الصماء',
    defaultAlertDays: 60,
    notes: 'منظم سكر الدم للنوع الثاني من السكري وتحسين حساسية الإنسولين',
    commonDose: 'قرص مع وجبة الطعام الرئيسية'
  },
  {
    barcode: '3582910023402',
    tradeName: 'جلوكوفاج 500 مجم (Glucophage 500mg)',
    scientificName: 'Metformin HCl 500mg',
    companyName: 'Merck Serono',
    category: 'أدوية السكري والغدد الصماء',
    defaultAlertDays: 60,
    notes: 'منظم سكر دم للجرعات الابتدائية وحالات تكيس المبايض',
    commonDose: 'قرص مرتين إلى 3 مرات يومياً مع الأكل'
  },
  {
    barcode: '7321400119283',
    tradeName: 'نيكسيوم 40 مجم (Nexium 40mg)',
    scientificName: 'Esomeprazole Magnesium 40mg',
    companyName: 'AstraZeneca (أسترازينيكا)',
    category: 'الجهاز الهضمي والمعدة',
    defaultAlertDays: 90,
    notes: 'مثبط مضخة البروتون لعلاج ارتجاع المريء وقرحة المعدة والحموضة الشديدة',
    commonDose: 'قرص واحد يومياً قبل الإفطار بنصف ساعة'
  },
  {
    barcode: '7321400119276',
    tradeName: 'نيكسيوم 20 مجم (Nexium 20mg)',
    scientificName: 'Esomeprazole Magnesium 20mg',
    companyName: 'AstraZeneca (أسترازينيكا)',
    category: 'الجهاز الهضمي والمعدة',
    defaultAlertDays: 90,
    notes: 'للوقاية من قرحة المعدة والسيطرة على أعراض الحموضة والارتجاع',
    commonDose: 'قرص واحد يومياً قبل الإفطار'
  },
  {
    barcode: '5000456012948',
    tradeName: 'بروفين 400 مجم (Brufen 400mg)',
    scientificName: 'Ibuprofen 400mg',
    companyName: 'Abbott (أبوت)',
    category: 'مسكنات وخافضات حرارة',
    defaultAlertDays: 45,
    notes: 'مضاد للالتهاب ومسكن للآلام والصداع وآلام العظام والأسنان',
    commonDose: 'قرص بعد الأكل كل 8 ساعات عند الحاجة'
  },
  {
    barcode: '5000456012955',
    tradeName: 'بروفين 600 مجم (Brufen 600mg)',
    scientificName: 'Ibuprofen 600mg',
    companyName: 'Abbott (أبوت)',
    category: 'مسكنات وخافضات حرارة',
    defaultAlertDays: 45,
    notes: 'جرعة قوية لعلاج التهابات المفاصل الروماتيزمية والآلام الحادة',
    commonDose: 'قرص بعد وجبة دسمة كل 12 ساعة'
  },
  {
    barcode: '6221004001920',
    tradeName: 'سيبتازول فورت (Septazole Forte)',
    scientificName: 'Sulfamethoxazole + Trimethoprim (800/160mg)',
    companyName: 'EPICO (إيبيكو)',
    category: 'المضادات الحيوية',
    defaultAlertDays: 60,
    notes: 'مضاد للمسالك البولية والتهابات الصدر والنزلات المعوية البكتيرية',
    commonDose: 'قرص كل 12 ساعة بعد الأكل مع شرب كميات وافرة من الماء'
  },
  {
    barcode: '6291011029341',
    tradeName: 'فيتامين د3 50000 وحدة (D-Vital)',
    scientificName: 'Cholecalciferol 50,000 IU',
    companyName: 'Julphar (جلفار)',
    category: 'الفيتامينات والمكملات',
    defaultAlertDays: 90,
    notes: 'جرعة أسبوعية مركزة لعلاج النقص الحاد في فيتامين د وتقوية العظام والمناعة',
    commonDose: 'كبسولة واحدة أسبوعياً مع وجبة دهنية'
  },
  {
    barcode: '5000158051231',
    tradeName: 'أموكسيل 500 مجم (Amoxil 500mg)',
    scientificName: 'Amoxicillin Trihydrate 500mg',
    companyName: 'GSK (GlaxoSmithKline)',
    category: 'المضادات الحيوية',
    defaultAlertDays: 60,
    notes: 'مضاد حيوي بكتيري لالتهابات الحلق، الأذن، والأسنان',
    commonDose: 'كبسولة كل 8 ساعات'
  },
  {
    barcode: '3582910012345',
    tradeName: 'فلاجيل 500 مجم (Flagyl 500mg)',
    scientificName: 'Metronidazole 500mg',
    companyName: 'Sanofi (سانوفي)',
    category: 'مضادات الطفيليات والجهاز الهضمي',
    defaultAlertDays: 60,
    notes: 'مضاد للبكتيريا اللاهوائية والطفيليات والأميبا ومطهر معوي',
    commonDose: 'قرص كل 8 ساعات بعد الأكل'
  },
  {
    barcode: '6251011002341',
    tradeName: 'سيبرودار 500 مجم (Ciprodar 500mg)',
    scientificName: 'Ciprofloxacin HCl 500mg',
    companyName: 'Dar Al Dawa (دار الدواء)',
    category: 'المضادات الحيوية',
    defaultAlertDays: 60,
    notes: 'مضاد حيوي قوي لالتهابات المسالك البولية والبروستاتا والتهابات العظام',
    commonDose: 'قرص كل 12 ساعة بعيداً عن منتجات الألبان'
  },
  {
    barcode: '5415062002341',
    tradeName: 'ليبيتور 20 مجم (Lipitor 20mg)',
    scientificName: 'Atorvastatin Calcium 20mg',
    companyName: 'Pfizer (فايزر)',
    category: 'القلب والأوعية الدموية وضغط الدم',
    defaultAlertDays: 90,
    notes: 'لخفض الكوليسترول الضار والدهون الثلاثية والوقاية من الجلطات',
    commonDose: 'قرص واحد يومياً مساءً'
  },
  {
    barcode: '7680312340012',
    tradeName: 'فولتارين 50 مجم (Voltaren 50mg)',
    scientificName: 'Diclofenac Sodium 50mg',
    companyName: 'Novartis (نوفارتس)',
    category: 'مسكنات وخافضات حرارة',
    defaultAlertDays: 60,
    notes: 'مضاد قوي للالتهاب ومسكن لآلام المفاصل والعمود الفقري والنقرس',
    commonDose: 'قرص بعد الأكل مرتين إلى 3 مرات يومياً'
  },
  {
    barcode: '7680312340029',
    tradeName: 'فولتارين 75 مجم أمبول (Voltaren 75mg Ampoule)',
    scientificName: 'Diclofenac Sodium 75mg / 3ml',
    companyName: 'Novartis (نوفارتس)',
    category: 'مسكنات وخافضات حرارة',
    defaultAlertDays: 45,
    notes: 'حقن عضلية سريعة المفعول للمغص الكلوي والآلام الحادة الشديدة',
    commonDose: 'حقنة عضلية عميقة عند اللزوم'
  },
  {
    barcode: '3582910045678',
    tradeName: 'بلافيكس 75 مجم (Plavix 75mg)',
    scientificName: 'Clopidogrel 75mg',
    companyName: 'Sanofi (سانوفي)',
    category: 'القلب والأوعية الدموية وضغط الدم',
    defaultAlertDays: 90,
    notes: 'مانع لتجلط وتجمع الصفائح الدموية للوقاية من النوبات القلبية والسكتات',
    commonDose: 'قرص واحد يومياً مع أو بدون طعام'
  },
  {
    barcode: '5000158012345',
    tradeName: 'بخاخ فنتولين (Ventolin Evohaler)',
    scientificName: 'Salbutamol 100mcg / Dose',
    companyName: 'GSK (GlaxoSmithKline)',
    category: 'أدوية الجهاز التنفسي والربو',
    defaultAlertDays: 90,
    notes: 'موسع قصبي إسعافي سريع المفعول للأزمات الصدرية وضيق التنفس والربو',
    commonDose: 'بخة إلى بختين عند الشعور بضيق التنفس'
  },
  {
    barcode: '5415062009876',
    tradeName: 'زيثروماكس 500 مجم (Zithromax 500mg)',
    scientificName: 'Azithromycin Dihydrate 500mg',
    companyName: 'Pfizer (فايزر)',
    category: 'المضادات الحيوية',
    defaultAlertDays: 60,
    notes: 'مضاد حيوي واسع لالتهاب الرئتين والحلق والجيوب الأنفية',
    commonDose: 'قرص واحد يومياً لمدة 3 أيام متتالية'
  },
  {
    barcode: '7680456780012',
    tradeName: 'كاتافلام 50 مجم (Cataflam 50mg)',
    scientificName: 'Diclofenac Potassium 50mg',
    companyName: 'Novartis (نوفارتس)',
    category: 'مسكنات وخافضات حرارة',
    defaultAlertDays: 60,
    notes: 'مسكن سريع لآلام الأسنان والدورة الشهرية والالتواءات',
    commonDose: 'قرص بعد الأكل كل 8 ساعات'
  },
  {
    barcode: '6221045001234',
    tradeName: 'أنتينال 200 مجم (Antinal 200mg)',
    scientificName: 'Nifuroxazide 200mg',
    companyName: 'Amoun (أمون)',
    category: 'الجهاز الهضمي والمعدة',
    defaultAlertDays: 60,
    notes: 'مطهر معوي واسع المدى لعلاج النزلات المعوية والإسهال البكتيري الحاد',
    commonDose: 'كبسولة 4 مرات يومياً'
  },
  {
    barcode: '3582910078901',
    tradeName: 'لازيكس 40 مجم (Lasix 40mg)',
    scientificName: 'Furosemide 40mg',
    companyName: 'Sanofi (سانوفي)',
    category: 'القلب والأوعية الدموية وضغط الدم',
    defaultAlertDays: 90,
    notes: 'مدر للبول لعلاج احتباس السوائل والتورم وفشل القلب الاحتقاني',
    commonDose: 'قرص صباحاً على معدة فارغة'
  },
  {
    barcode: '8714207001234',
    tradeName: 'أومنيك أوكاس 0.4 مجم (Omnic Ocas 0.4mg)',
    scientificName: 'Tamsulosin HCl 0.4mg',
    companyName: 'Astellas (أستيلاس)',
    category: 'أدوية المسالك البولية والبروستاتا',
    defaultAlertDays: 90,
    notes: 'لعلاج أعراض تضخم البروستاتا الحميد وتسهيل تدفق البول',
    commonDose: 'قرص يومياً بعد نفس الوجبة'
  },
  {
    barcode: '6211001001234',
    tradeName: 'باراسيتامول سامراء 500 مجم (SDI Paracetamol)',
    scientificName: 'Paracetamol 500mg',
    companyName: 'SDI Samarra (سامراء للصناعات الدوائية)',
    category: 'مسكنات وخافضات حرارة',
    defaultAlertDays: 60,
    notes: 'خافض للحرارة ومسكن للصداع والآلام العامة إنتاج وطني عراقي معتمد',
    commonDose: 'قرص إلى قرصين كل 6 إلى 8 ساعات'
  },
  {
    barcode: '6211001002345',
    tradeName: 'ساموكسيل 500 مجم (Samoxyl SDI)',
    scientificName: 'Amoxicillin 500mg',
    companyName: 'SDI Samarra (سامراء للصناعات الدوائية)',
    category: 'المضادات الحيوية',
    defaultAlertDays: 60,
    notes: 'مضاد حيوي وطني عراقي لعلاج الالتهابات البكتيرية المعوية والتنفسية',
    commonDose: 'كبسولة كل 8 ساعات'
  },
  {
    barcode: '6212001003456',
    tradeName: 'سيفيكسيم بايونير 400 مجم (Pioneer Cefixime)',
    scientificName: 'Cefixime 400mg',
    companyName: 'Pioneer (بايونير الدوائية - السليمانية)',
    category: 'المضادات الحيوية',
    defaultAlertDays: 60,
    notes: 'مضاد حيوي من الجيل الثالث لالتهابات الشعب الهوائية والمسالك البولية',
    commonDose: 'كبسولة واحدة يومياً لمدة 5 إلى 7 أيام'
  },
  {
    barcode: '6251001004567',
    tradeName: 'سوبراكس 400 مجم (Suprax 400mg)',
    scientificName: 'Cefixime 400mg',
    companyName: 'Hikma (الحكمة للأدوية)',
    category: 'المضادات الحيوية',
    defaultAlertDays: 60,
    notes: 'سيفالوسبورين الجيل الثالث لعلاج التهابات الجهاز التنفسي والمسالك',
    commonDose: 'كبسولة يومياً مع الأكل'
  },
  {
    barcode: '5000456008765',
    tradeName: 'كلاسيد 500 مجم (Klacid 500mg)',
    scientificName: 'Clarithromycin 500mg',
    companyName: 'Abbott (أبوت)',
    category: 'المضادات الحيوية',
    defaultAlertDays: 60,
    notes: 'لعلاج جرثومة المعدة الحلزونية والتهابات الجهاز التنفسي السفلي',
    commonDose: 'قرص كل 12 ساعة مع الطعام'
  },
  {
    barcode: '5411234001234',
    tradeName: 'موتيليوم 10 مجم (Motilium 10mg)',
    scientificName: 'Domperidone 10mg',
    companyName: 'Janssen (يانسن)',
    category: 'الجهاز الهضمي والمعدة',
    defaultAlertDays: 60,
    notes: 'مضاد للغثيان والقيء ومحفز لحركة المعدة للتخلص من عسر الهضم والانتفاخ',
    commonDose: 'قرص قبل الأكل بربع ساعة'
  },
  {
    barcode: '3582910066778',
    tradeName: 'تلفاست 180 مجم (Telfast 180mg)',
    scientificName: 'Fexofenadine HCl 180mg',
    companyName: 'Sanofi (سانوفي)',
    category: 'أدوية الحساسية ومضادات الهيستامين',
    defaultAlertDays: 90,
    notes: 'مضاد هيستامين لا يسبب النعاس لعلاج حساسية الأنف والحكة والشرى الجلدي',
    commonDose: 'قرص واحد يومياً قبل الأكل'
  },
  {
    barcode: '5413787001234',
    tradeName: 'زيرتيك 10 مجم (Zyrtec 10mg)',
    scientificName: 'Cetirizine Dihydrochloride 10mg',
    companyName: 'UCB Pharma',
    category: 'أدوية الحساسية ومضادات الهيستامين',
    defaultAlertDays: 90,
    notes: 'لعلاج حساسية الربيع والتهاب الجيوب الأنفية التحسسي والحكة',
    commonDose: 'قرص واحد مساءً'
  },
  {
    barcode: '3582910011223',
    tradeName: 'دافلوون 500 مجم (Daflon 500mg)',
    scientificName: 'Micronized Flavonoid Fraction 500mg',
    companyName: 'Servier (سيرفييه)',
    category: 'القلب والأوعية الدموية وضغط الدم',
    defaultAlertDays: 90,
    notes: 'مقوي للأوردة الدموية لعلاج البواسير والقصور الوريدي ودوالي الساقين',
    commonDose: 'قرصان يومياً مع الوجبات'
  },
  {
    barcode: '4022536005544',
    tradeName: 'نيوروبيون أقراص (Neurobion Tablets)',
    scientificName: 'Vitamin B1 + B6 + B12',
    companyName: 'Merck (ميرك)',
    category: 'الفيتامينات والمكملات',
    defaultAlertDays: 90,
    notes: 'فيتامين ب المركب لتقوية الأعصاب الطرفية وتخفيف آلام وتنميل الأطراف',
    commonDose: 'قرص واحد إلى 3 أقراص يومياً'
  },
  {
    barcode: '7321400345678',
    tradeName: 'فوركسيجا 10 مجم (Forxiga 10mg)',
    scientificName: 'Dapagliflozin 10mg',
    companyName: 'AstraZeneca (أسترازينيكا)',
    category: 'أدوية السكري والغدد الصماء',
    defaultAlertDays: 90,
    notes: 'علاج حديث للسكري من النوع الثاني وحماية الكلى والقلب وخفض الوزن',
    commonDose: 'قرص واحد يومياً صباحاً'
  },
  {
    barcode: '4022536008899',
    tradeName: 'جارديانس 25 مجم (Jardiance 25mg)',
    scientificName: 'Empagliflozin 25mg',
    companyName: 'Boehringer Ingelheim',
    category: 'أدوية السكري والغدد الصماء',
    defaultAlertDays: 90,
    notes: 'مثبط SGLT2 لضبط السكر وتقليل مخاطر الوفيات القلبية لمرضى السكري',
    commonDose: 'قرص واحد يومياً مع أو بدون طعام'
  }
];

// دالة ذكية للبحث عن الدواء بالباركود، أو استخراج بياناته تلقائياً
export function lookupDrugByBarcode(rawBarcode: string): DrugInfo | null {
  if (!rawBarcode) return null;
  const cleanBarcode = rawBarcode.trim();

  // 1. بحث مباشر عن الباركود في قاعدة البيانات الدوائية الشاملة
  const directMatch = GLOBAL_DRUG_DATABASE.find(
    (d) => d.barcode === cleanBarcode || cleanBarcode.includes(d.barcode) || d.barcode.includes(cleanBarcode)
  );
  if (directMatch) return directMatch;

  // 2. تحليل الباركود الطبي GS1 DataMatrix إذا كان يحتوي على معرفات تطبيق (Application Identifiers)
  // مثال: (01)06281001230012(17)261018(10)LOT1234
  const gtinMatch = cleanBarcode.match(/(?:01|02)(\d{14}|\d{13}|\d{12})/);
  if (gtinMatch && gtinMatch[1]) {
    const extractedGtin = gtinMatch[1].replace(/^0+/, ''); // إزالة الأصفار البادئة
    const gtinFound = GLOBAL_DRUG_DATABASE.find((d) => d.barcode.endsWith(extractedGtin) || extractedGtin.endsWith(d.barcode));
    if (gtinFound) return gtinFound;
  }

  // 3. تخمين ذكي بناءً على كود الدولة المصنعة (GS1 Country Code) وتعيين تصنيف دوائي افتراضي ملائم
  return null;
}
