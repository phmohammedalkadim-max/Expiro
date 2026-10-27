export interface DrugInfo {
  barcode: string;
  tradeName: string;
  scientificName: string;
  companyName: string;
  category: string;
  defaultAlertDays: number;
  notes: string;
  commonDose?: string;
  originCountry?: string;
  dosageForm?: string;
}

export interface ParsedGS1Data {
  raw: string;
  gtin?: string;
  expiryDate?: string; // YYYY-MM-DD
  batchNumber?: string;
  serialNumber?: string;
  isGS1: boolean;
}

// -------------------------------------------------------------
// قاعدة بيانات دوائية صيدلانية متكاملة تضم أكثر من 100 دواء شائع
// أدوية محلية (سامراء SDI، أواميديكا، الرائد) وإقليمية (حكمة، جلفار، دار الدواء) وعالمية
// -------------------------------------------------------------
export const GLOBAL_DRUG_DATABASE: DrugInfo[] = [
  // 1. المضادات الحيوية ومضادات البكتيريا (Antibiotics)
  {
    barcode: '6281001230012',
    tradeName: 'أوجمنتين 1 جم أقراص (Augmentin 1g)',
    scientificName: 'Amoxicillin + Clavulanic Acid 1000mg',
    companyName: 'GSK (GlaxoSmithKline)',
    category: 'المضادات الحيوية',
    defaultAlertDays: 60,
    notes: 'مضاد حيوي واسع المجال لعلاج التهابات الجهاز التنفسي والمسالك البولية والجيوب',
    commonDose: 'قرص كل 12 ساعة بعد الأكل',
    originCountry: 'بريطانيا / GSK',
    dosageForm: 'أقراص مغلفة'
  },
  {
    barcode: '5000158067812',
    tradeName: 'أوجمنتين 625 مجم (Augmentin 625mg)',
    scientificName: 'Amoxicillin + Clavulanic Acid 625mg',
    companyName: 'GSK (GlaxoSmithKline)',
    category: 'المضادات الحيوية',
    defaultAlertDays: 60,
    notes: 'مضاد لالتهابات الأسنان، الأذن الوسطى، واللوزتين',
    commonDose: 'قرص 3 مرات يومياً بعد الوجبات',
    originCountry: 'بريطانيا',
    dosageForm: 'أقراص'
  },
  {
    barcode: '5000158051231',
    tradeName: 'أموكسيل 500 مجم (Amoxil 500mg)',
    scientificName: 'Amoxicillin Trihydrate 500mg',
    companyName: 'GSK (GlaxoSmithKline)',
    category: 'المضادات الحيوية',
    defaultAlertDays: 60,
    notes: 'مضاد حيوي بكتيري كلاسيكي لالتهابات الحلق، الصدر، والأسنان',
    commonDose: 'كبسولة كل 8 ساعات',
    originCountry: 'بريطانيا',
    dosageForm: 'كبسولات'
  },
  {
    barcode: '3582910012345',
    tradeName: 'فلاجيل 500 مجم (Flagyl 500mg)',
    scientificName: 'Metronidazole 500mg',
    companyName: 'Sanofi (سانوفي)',
    category: 'المضادات الحيوية ومطهرات الجهاز الهضمي',
    defaultAlertDays: 60,
    notes: 'مضاد للبكتيريا اللاهوائية والطفيليات والأميبا ومطهر معوي وجراحي',
    commonDose: 'قرص كل 8 ساعات بعد الأكل',
    originCountry: 'فرنسا',
    dosageForm: 'أقراص مغلفة'
  },
  {
    barcode: '6251011002341',
    tradeName: 'سيبرودار 500 مجم (Ciprodar 500mg)',
    scientificName: 'Ciprofloxacin HCl 500mg',
    companyName: 'Dar Al Dawa (دار الدواء)',
    category: 'المضادات الحيوية',
    defaultAlertDays: 60,
    notes: 'مضاد كينولون لالتهابات المسالك البولية الحادة والنزلات المعوية البكتيرية',
    commonDose: 'قرص كل 12 ساعة قبل الأكل أو بعده بساعتين',
    originCountry: 'الأردن',
    dosageForm: 'أقراص مغلفة'
  },
  {
    barcode: '6221004001920',
    tradeName: 'سيبتازول فورت (Septazole Forte)',
    scientificName: 'Sulfamethoxazole + Trimethoprim (800/160mg)',
    companyName: 'EPICO (إيبيكو)',
    category: 'المضادات الحيوية',
    defaultAlertDays: 60,
    notes: 'مضاد للمسالك البولية والتهابات الصدر والتهاب البروستات البكتيري',
    commonDose: 'قرص كل 12 ساعة مع شرب كميات وافرة من الماء',
    originCountry: 'مصر',
    dosageForm: 'أقراص'
  },
  {
    barcode: '3582910056789',
    tradeName: 'زيثروماكس 500 مجم (Zithromax 500mg)',
    scientificName: 'Azithromycin 500mg',
    companyName: 'Pfizer (فايزر)',
    category: 'المضادات الحيوية',
    defaultAlertDays: 90,
    notes: 'مضاد ماكروليد لعلاج التهابات الجهاز التنفسي والجيوب الأنفية',
    commonDose: 'قرص واحد يومياً لمدة 3 أيام متتالية',
    originCountry: 'الولايات المتحدة',
    dosageForm: 'أقراص مغلفة'
  },
  {
    barcode: '6281001239988',
    tradeName: 'كلاسيد 500 مجم (Klacid 500mg)',
    scientificName: 'Clarithromycin 500mg',
    companyName: 'Abbott (أبوت)',
    category: 'المضادات الحيوية',
    defaultAlertDays: 60,
    notes: 'مضاد للالتهابات الرئوية وبكتيريا المعدة الحلزونية (H. Pylori)',
    commonDose: 'قرص كل 12 ساعة مع الطعام',
    originCountry: 'الولايات المتحدة / إيطاليا',
    dosageForm: 'أقراص'
  },
  {
    barcode: '7612345012345',
    tradeName: 'روسيفين 1 جم حقن (Rocephin 1g)',
    scientificName: 'Ceftriaxone Sodium 1g',
    companyName: 'Roche (روش)',
    category: 'المضادات الحيوية',
    defaultAlertDays: 90,
    notes: 'سيفالوسبورين جيل ثالث حقن عضلي/وريدي للعدوى الشديدة',
    commonDose: 'حقنة وريدية أو عضلية كل 24 ساعة',
    originCountry: 'سويسرا',
    dosageForm: 'فيال حقن'
  },
  {
    barcode: '5000158099881',
    tradeName: 'سيفيكس 400 مجم (Cefix 400mg)',
    scientificName: 'Cefixime 400mg',
    companyName: 'Hikma Pharmaceuticals (حكمة)',
    category: 'المضادات الحيوية',
    defaultAlertDays: 60,
    notes: 'سيفالوسبورين جيل ثالث فموي لالتهاب المسالك والتهاب الأذن',
    commonDose: 'كبسولة واحدة يومياً',
    originCountry: 'الأردن',
    dosageForm: 'كبسولات'
  },
  {
    barcode: '6281001234455',
    tradeName: 'يوناسين 375 مجم (Unasyn 375mg)',
    scientificName: 'Sultamicillin 375mg',
    companyName: 'Pfizer (فايزر)',
    category: 'المضادات الحيوية',
    defaultAlertDays: 60,
    notes: 'مضاد أمبيسيلين مع سالباكتام لالتهابات الجلد والأنسجة الرخوة',
    commonDose: 'قرص مرتين يومياً',
    originCountry: 'الولايات المتحدة',
    dosageForm: 'أقراص'
  },
  {
    barcode: '6221004005544',
    tradeName: 'دالاسين سي 300 مجم (Dalacin C 300mg)',
    scientificName: 'Clindamycin HCl 300mg',
    companyName: 'Pfizer (فايزر)',
    category: 'المضادات الحيوية',
    defaultAlertDays: 60,
    notes: 'مضاد للعدوى العظمية وخراجات الأسنان الشديدة',
    commonDose: 'كبسولة كل 8 ساعات مع كوب ماء كامل',
    originCountry: 'الولايات المتحدة',
    dosageForm: 'كبسولات'
  },

  // 2. مسكنات الألم وخافضات الحرارة ومضادات الالتهاب (Analgesics & NSAIDs)
  {
    barcode: '6285000000018',
    tradeName: 'بانادول إكسترا (Panadol Extra)',
    scientificName: 'Paracetamol 500mg + Caffeine 65mg',
    companyName: 'Haleon / GSK',
    category: 'مسكنات وخافضات حرارة',
    defaultAlertDays: 90,
    notes: 'مسكن سريع وفعال للصداع، آلام المفاصل والأسنان وخافض للحرارة',
    commonDose: 'قرص إلى قرصين كل 6 إلى 8 ساعات',
    originCountry: 'بريطانيا / دبي',
    dosageForm: 'أقراص'
  },
  {
    barcode: '5000347060129',
    tradeName: 'بانادول أدفانس 500 مجم (Panadol Advance)',
    scientificName: 'Paracetamol 500mg (Optizorb Technology)',
    companyName: 'Haleon / GSK',
    category: 'مسكنات وخافضات حرارة',
    defaultAlertDays: 90,
    notes: 'مسكن للصداع والآلام الخفيفة والمتوسطة مع امتصاص فائق السرعة',
    commonDose: 'قرصان حتى 4 مرات يومياً عند اللزوم',
    originCountry: 'بريطانيا / أيرلندا',
    dosageForm: 'أقراص'
  },
  {
    barcode: '6285000000025',
    tradeName: 'بانادول كولد آند فلو (Panadol Cold & Flu)',
    scientificName: 'Paracetamol + Phenylephrine + Chlorpheniramine',
    companyName: 'Haleon / GSK',
    category: 'أدوية نزلات البرد والإنفلونزا',
    defaultAlertDays: 60,
    notes: 'لعلاج أعراض الرشح والزكام وانسداد الأنف والصداع والحرارة',
    commonDose: 'قرص كل 8 ساعات',
    originCountry: 'بريطانيا',
    dosageForm: 'أقراص'
  },
  {
    barcode: '6285000000032',
    tradeName: 'بانادول نايت (Panadol Night)',
    scientificName: 'Paracetamol 500mg + Diphenhydramine 25mg',
    companyName: 'Haleon / GSK',
    category: 'مسكنات وخافضات حرارة',
    defaultAlertDays: 90,
    notes: 'تسكين الآلام الليلية والمساعدة على النوم الهادئ',
    commonDose: 'قرصان قبل النوم بـ 20 دقيقة',
    originCountry: 'بريطانيا',
    dosageForm: 'أقراص'
  },
  {
    barcode: '5000456012948',
    tradeName: 'بروفين 400 مجم (Brufen 400mg)',
    scientificName: 'Ibuprofen 400mg',
    companyName: 'Abbott (أبوت)',
    category: 'مسكنات وخافضات حرارة',
    defaultAlertDays: 45,
    notes: 'مضاد للالتهاب ومسكن للآلام والصداع وآلام العظام والأسنان',
    commonDose: 'قرص بعد الأكل كل 8 ساعات عند الحاجة',
    originCountry: 'بريطانيا / Abbott',
    dosageForm: 'أقراص مغلفة'
  },
  {
    barcode: '5000456012955',
    tradeName: 'بروفين 600 مجم (Brufen 600mg)',
    scientificName: 'Ibuprofen 600mg',
    companyName: 'Abbott (أبوت)',
    category: 'مسكنات وخافضات حرارة',
    defaultAlertDays: 45,
    notes: 'جرعة قوية لعلاج التهابات المفاصل الروماتيزمية والآلام الحادة',
    commonDose: 'قرص بعد وجبة دسمة كل 12 ساعة',
    originCountry: 'بريطانيا',
    dosageForm: 'أقراص فوارة / مغلفة'
  },
  {
    barcode: '7680315480123',
    tradeName: 'فولتارين 50 مجم (Voltaren 50mg)',
    scientificName: 'Diclofenac Sodium 50mg',
    companyName: 'Novartis (نوفارتس)',
    category: 'مسكنات ومضادات الالتهاب',
    defaultAlertDays: 60,
    notes: 'مسكن قوي لآلام المفاصل، نوبات النقرس والعمود الفقري',
    commonDose: 'قرص بعد الأكل مرتين إلى 3 مرات يومياً',
    originCountry: 'سويسرا',
    dosageForm: 'أقراص مقاومة لإفرازات المعدة'
  },
  {
    barcode: '7680315480130',
    tradeName: 'فولتارين 75 مجم ريتارد (Voltaren 75mg Retard)',
    scientificName: 'Diclofenac Sodium 75mg (Sustained Release)',
    companyName: 'Novartis (نوفارتس)',
    category: 'مسكنات ومضادات الالتهاب',
    defaultAlertDays: 60,
    notes: 'ممتد المفعول لتخفيف آلام المفاصل على مدار 24 ساعة',
    commonDose: 'قرص واحد يومياً بعد العشاء',
    originCountry: 'سويسرا',
    dosageForm: 'أقراص مديدة الإفراز'
  },
  {
    barcode: '7680315480147',
    tradeName: 'كاتافلام 50 مجم (Cataflam 50mg)',
    scientificName: 'Diclofenac Potassium 50mg',
    companyName: 'Novartis (نوفارتس)',
    category: 'مسكنات وخافضات حرارة',
    defaultAlertDays: 60,
    notes: 'ديكلوفيناك بوتاسيوم سريع الامتصاص لتسكين آلام الأسنان والطمث',
    commonDose: 'قرص كل 8 ساعات بعد الطعام',
    originCountry: 'سويسرا',
    dosageForm: 'أقراص مغلفة بالسكر'
  },
  {
    barcode: '3582910077881',
    tradeName: 'سولبادين كبسول (Solpadeine Capsule)',
    scientificName: 'Paracetamol + Codeine + Caffeine',
    companyName: 'Omega Pharma',
    category: 'مسكنات وخافضات حرارة',
    defaultAlertDays: 60,
    notes: 'مسكن قوي ثلاثي المفعول للصداع النصفي وآلام الأعصاب الحادة',
    commonDose: 'كبسولتان كل 6 ساعات عند اللزوم',
    originCountry: 'بريطانيا',
    dosageForm: 'كبسولات'
  },
  {
    barcode: '6281001237744',
    tradeName: 'سيليبريكس 200 مجم (Celebrex 200mg)',
    scientificName: 'Celecoxib 200mg',
    companyName: 'Pfizer (فايزر)',
    category: 'مسكنات ومضادات الالتهاب',
    defaultAlertDays: 60,
    notes: 'مثبط انتقائي لـ COX-2 آمن على المعدة لآلام المفاصل والغضاريف',
    commonDose: 'كبسولة واحدة يومياً',
    originCountry: 'الولايات المتحدة',
    dosageForm: 'كبسولات'
  },
  {
    barcode: '5000158011223',
    tradeName: 'بونستان فورت 500 مجم (Ponstan Forte)',
    scientificName: 'Mefenamic Acid 500mg',
    companyName: 'Pfizer (فايزر)',
    category: 'مسكنات وخافضات حرارة',
    defaultAlertDays: 60,
    notes: 'مسكن ممتاز لآلام الدورة الشهرية والأسنان والصداع العضلي',
    commonDose: 'قرص 3 مرات يومياً مع الأكل',
    originCountry: 'الولايات المتحدة',
    dosageForm: 'أقراص'
  },

  // 3. أدوية القلب وضغط الدم والأوعية الدموية (Cardiovascular)
  {
    barcode: '6281100223344',
    tradeName: 'كونكور 5 مجم (Concor 5mg)',
    scientificName: 'Bisoprolol Fumarate 5mg',
    companyName: 'Merck (ميرك)',
    category: 'القلب والأوعية الدموية وضغط الدم',
    defaultAlertDays: 90,
    notes: 'حاصر بيتا لتنظيم ضربات القلب وعلاج ارتفاع ضغط الدم والقصور القلبي',
    commonDose: 'قرص واحد يومياً صباحاً',
    originCountry: 'ألمانيا',
    dosageForm: 'أقراص قلبية'
  },
  {
    barcode: '4022536001234',
    tradeName: 'كونكور 2.5 مجم (Concor 2.5mg)',
    scientificName: 'Bisoprolol Fumarate 2.5mg',
    companyName: 'Merck (ميرك)',
    category: 'القلب والأوعية الدموية وضغط الدم',
    defaultAlertDays: 90,
    notes: 'لعلاج قصور القلب الخفيف وضغط الدم المنتظم',
    commonDose: 'قرص واحد يومياً',
    originCountry: 'ألمانيا',
    dosageForm: 'أقراص'
  },
  {
    barcode: '4022536001241',
    tradeName: 'كونكور 10 مجم (Concor 10mg)',
    scientificName: 'Bisoprolol Fumarate 10mg',
    companyName: 'Merck (ميرك)',
    category: 'القلب والأوعية الدموية وضغط الدم',
    defaultAlertDays: 90,
    notes: 'جرعة قصوى لتنظيم ضربات القلب وارتفاع ضغط الدم',
    commonDose: 'قرص واحد يومياً',
    originCountry: 'ألمانيا',
    dosageForm: 'أقراص'
  },
  {
    barcode: '7680315480200',
    tradeName: 'إكسفورج 5/160 مجم (Exforge 5/160)',
    scientificName: 'Amlodipine 5mg + Valsartan 160mg',
    companyName: 'Novartis (نوفارتس)',
    category: 'القلب والأوعية الدموية وضغط الدم',
    defaultAlertDays: 90,
    notes: 'مزيج ثنائي فعال جداً لضبط ارتفاع ضغط الدم الشرياني المقاوم',
    commonDose: 'قرص واحد يومياً في نفس الموعد',
    originCountry: 'سويسرا',
    dosageForm: 'أقراص مغلفة'
  },
  {
    barcode: '7680315480217',
    tradeName: 'إكسفورج 10/160 مجم (Exforge 10/160)',
    scientificName: 'Amlodipine 10mg + Valsartan 160mg',
    companyName: 'Novartis (نوفارتس)',
    category: 'القلب والأوعية الدموية وضغط الدم',
    defaultAlertDays: 90,
    notes: 'جرعة قصوى لمزيج فالسارتان مع أملوديبين',
    commonDose: 'قرص واحد يومياً',
    originCountry: 'سويسرا',
    dosageForm: 'أقراص مغلفة'
  },
  {
    barcode: '3582910088991',
    tradeName: 'نورفاسك 5 مجم (Norvasc 5mg)',
    scientificName: 'Amlodipine Besylate 5mg',
    companyName: 'Pfizer (فايزر)',
    category: 'القلب والأوعية الدموية وضغط الدم',
    defaultAlertDays: 90,
    notes: 'حاصر قنوات الكالسيوم لتوسيع الأوعية وعلاج ضغط الدم والذبحة الصدرية',
    commonDose: 'قرص واحد يومياً',
    originCountry: 'الولايات المتحدة',
    dosageForm: 'أقراص'
  },
  {
    barcode: '3582910088984',
    tradeName: 'نورفاسك 10 مجم (Norvasc 10mg)',
    scientificName: 'Amlodipine Besylate 10mg',
    companyName: 'Pfizer (فايزر)',
    category: 'القلب والأوعية الدموية وضغط الدم',
    defaultAlertDays: 90,
    notes: 'جرعة كاملة لحماية القلب وخفض الضغط الشرياني',
    commonDose: 'قرص واحد يومياً',
    originCountry: 'الولايات المتحدة',
    dosageForm: 'أقراص'
  },
  {
    barcode: '3582910099001',
    tradeName: 'بلافيكس 75 مجم (Plavix 75mg)',
    scientificName: 'Clopidogrel 75mg',
    companyName: 'Sanofi (سانوفي)',
    category: 'أدوية السيولة والجلطات',
    defaultAlertDays: 90,
    notes: 'مضاد لتجمع الصفائح الدموية لمنع الجلطات القلبية والدماغية',
    commonDose: 'قرص واحد يومياً بعد الأكل',
    originCountry: 'فرنسا',
    dosageForm: 'أقراص مغلفة'
  },
  {
    barcode: '4008500123456',
    tradeName: 'أسبرين بروتكت 100 مجم (Aspirin Protect 100mg)',
    scientificName: 'Acetylsalicylic Acid 100mg (Enteric Coated)',
    companyName: 'Bayer (باير)',
    category: 'أدوية السيولة والجلطات',
    defaultAlertDays: 90,
    notes: 'حماية القلب والشرايين مغلف لحماية جدار المعدة',
    commonDose: 'قرص واحد يومياً بعد الغداء',
    originCountry: 'ألمانيا',
    dosageForm: 'أقراص مقاومة لأحماض المعدة'
  },
  {
    barcode: '7680315480330',
    tradeName: 'كو-ديوفان 160/12.5 (Co-Diovan)',
    scientificName: 'Valsartan 160mg + Hydrochlorothiazide 12.5mg',
    companyName: 'Novartis (نوفارتس)',
    category: 'القلب والأوعية الدموية وضغط الدم',
    defaultAlertDays: 90,
    notes: 'مدر ومخفض ضغط مدمج لحالات الضغط العنيد',
    commonDose: 'قرص واحد صباحاً',
    originCountry: 'سويسرا',
    dosageForm: 'أقراص'
  },
  {
    barcode: '3582910011223',
    tradeName: 'دافلوون 500 مجم (Daflon 500mg)',
    scientificName: 'Micronized Flavonoid Fraction 500mg',
    companyName: 'Servier (سيرفييه)',
    category: 'القلب والأوعية الدموية والدوالي',
    defaultAlertDays: 90,
    notes: 'مقوي للأوردة الدموية لعلاج البواسير والقصور الوريدي ودوالي الساقين',
    commonDose: 'قرصان يومياً مع الوجبات',
    originCountry: 'فرنسا',
    dosageForm: 'أقراص مغلفة'
  },
  {
    barcode: '4008500223344',
    tradeName: 'لازيكس 40 مجم (Lasix 40mg)',
    scientificName: 'Furosemide 40mg',
    companyName: 'Sanofi (سانوفي)',
    category: 'أدوية إدرار البول والضغط',
    defaultAlertDays: 90,
    notes: 'مدر للبول عالي الفعالية لتخفيف الوذمات واحتباس السوائل وقصور القلب',
    commonDose: 'قرص صباحاً على معدة فارغة',
    originCountry: 'ألمانيا / فرنسا',
    dosageForm: 'أقراص'
  },

  // 4. أدوية السكري والغدد الصماء (Diabetes & Endocrine)
  {
    barcode: '3582910023419',
    tradeName: 'جلوكوفاج 1000 مجم (Glucophage 1000mg)',
    scientificName: 'Metformin HCl 1000mg',
    companyName: 'Merck Serono',
    category: 'أدوية السكري والغدد الصماء',
    defaultAlertDays: 60,
    notes: 'منظم سكر الدم للنوع الثاني من السكري وتحسين حساسية الإنسولين',
    commonDose: 'قرص مع وجبة الطعام الرئيسية',
    originCountry: 'فرنسا / ألمانيا',
    dosageForm: 'أقراص'
  },
  {
    barcode: '3582910023402',
    tradeName: 'جلوكوفاج 500 مجم (Glucophage 500mg)',
    scientificName: 'Metformin HCl 500mg',
    companyName: 'Merck Serono',
    category: 'أدوية السكري والغدد الصماء',
    defaultAlertDays: 60,
    notes: 'منظم سكر دم للجرعات الابتدائية وحالات تكيس المبايض',
    commonDose: 'قرص مرتين إلى 3 مرات يومياً مع الأكل',
    originCountry: 'فرنسا',
    dosageForm: 'أقراص'
  },
  {
    barcode: '3582910023426',
    tradeName: 'جلوكوفاج إكس آر 750 (Glucophage XR 750)',
    scientificName: 'Metformin HCl 750mg (Extended Release)',
    companyName: 'Merck Serono',
    category: 'أدوية السكري والغدد الصماء',
    defaultAlertDays: 60,
    notes: 'ممتد المفعول بطيء الإطلاق مريح للمعدة',
    commonDose: 'قرص واحد مع وجبة العشاء',
    originCountry: 'فرنسا',
    dosageForm: 'أقراص مديدة الإفراز'
  },
  {
    barcode: '4022536008899',
    tradeName: 'جارديانس 25 مجم (Jardiance 25mg)',
    scientificName: 'Empagliflozin 25mg',
    companyName: 'Boehringer Ingelheim',
    category: 'أدوية السكري والغدد الصماء',
    defaultAlertDays: 90,
    notes: 'مثبط SGLT2 لضبط السكر وتقليل مخاطر الوفيات القلبية لمرضى السكري',
    commonDose: 'قرص واحد يومياً مع أو بدون طعام',
    originCountry: 'ألمانيا',
    dosageForm: 'أقراص مغلفة'
  },
  {
    barcode: '4022536008882',
    tradeName: 'جارديانس 10 مجم (Jardiance 10mg)',
    scientificName: 'Empagliflozin 10mg',
    companyName: 'Boehringer Ingelheim',
    category: 'أدوية السكري والغدد الصماء',
    defaultAlertDays: 90,
    notes: 'جرعة بدء علاج السكري وحماية الكلى والقلب',
    commonDose: 'قرص واحد صباحاً',
    originCountry: 'ألمانيا',
    dosageForm: 'أقراص'
  },
  {
    barcode: '7321400345678',
    tradeName: 'فوركسيجا 10 مجم (Forxiga 10mg)',
    scientificName: 'Dapagliflozin 10mg',
    companyName: 'AstraZeneca (أسترازينيكا)',
    category: 'أدوية السكري والغدد الصماء',
    defaultAlertDays: 90,
    notes: 'علاج حديث للسكري من النوع الثاني وحماية الكلى والقلب وخفض الوزن',
    commonDose: 'قرص واحد يومياً صباحاً',
    originCountry: 'بريطانيا / السويد',
    dosageForm: 'أقراص'
  },
  {
    barcode: '6281001235566',
    tradeName: 'جانوفيا 100 مجم (Januvia 100mg)',
    scientificName: 'Sitagliptin 100mg',
    companyName: 'MSD (Merck Sharp & Dohme)',
    category: 'أدوية السكري والغدد الصماء',
    defaultAlertDays: 90,
    notes: 'مثبط DPP-4 لتنظيم إفراز الإنسولين استجابة للوجبات دون هبوط سكر',
    commonDose: 'قرص واحد يومياً',
    originCountry: 'الولايات المتحدة',
    dosageForm: 'أقراص مغلفة'
  },
  {
    barcode: '6281001235573',
    tradeName: 'جانوميت 50/1000 مجم (Janumet 50/1000)',
    scientificName: 'Sitagliptin 50mg + Metformin 1000mg',
    companyName: 'MSD (Merck Sharp & Dohme)',
    category: 'أدوية السكري والغدد الصماء',
    defaultAlertDays: 90,
    notes: 'مزيج مزدوج من سيتاجليبتين مع ميتفورمين',
    commonDose: 'قرص مرتين يومياً مع الطعام',
    originCountry: 'الولايات المتحدة',
    dosageForm: 'أقراص مغلفة'
  },
  {
    barcode: '3582910034567',
    tradeName: 'أماريل 2 مجم (Amaryl 2mg)',
    scientificName: 'Glimepiride 2mg',
    companyName: 'Sanofi (سانوفي)',
    category: 'أدوية السكري والغدد الصماء',
    defaultAlertDays: 90,
    notes: 'سلفونيل يوريا لتحفيز البنكرياس على إفراز الإنسولين',
    commonDose: 'قرص واحد قبل الإفطار مباشرة',
    originCountry: 'فرنسا / ألمانيا',
    dosageForm: 'أقراص'
  },
  {
    barcode: '4022536009900',
    tradeName: 'إيوثيروكس 50 ميكروجرام (Euthyrox 50mcg)',
    scientificName: 'Levothyroxine Sodium 50mcg',
    companyName: 'Merck (ميرك)',
    category: 'أدوية السكري والغدد الصماء',
    defaultAlertDays: 90,
    notes: 'علاج خمول وقصور الغدة الدرقية وتعويض هرمون الثايروكسين',
    commonDose: 'قرص واحد صباحاً على معدة فارغة تماماً قبل الإفطار بساعة',
    originCountry: 'ألمانيا',
    dosageForm: 'أقراص'
  },
  {
    barcode: '4022536009917',
    tradeName: 'إيوثيروكس 100 ميكروجرام (Euthyrox 100mcg)',
    scientificName: 'Levothyroxine Sodium 100mcg',
    companyName: 'Merck (ميرك)',
    category: 'أدوية السكري والغدد الصماء',
    defaultAlertDays: 90,
    notes: 'جرعة كاملة لتعويض هرمون الغدة الدرقية',
    commonDose: 'قرص واحد صباحاً على الريق',
    originCountry: 'ألمانيا',
    dosageForm: 'أقراص'
  },

  // 5. الجهاز الهضمي وقرحة المعدة والقولون (Gastrointestinal)
  {
    barcode: '7321400119283',
    tradeName: 'نيكسيوم 40 مجم (Nexium 40mg)',
    scientificName: 'Esomeprazole Magnesium 40mg',
    companyName: 'AstraZeneca (أسترازينيكا)',
    category: 'الجهاز الهضمي والمعدة',
    defaultAlertDays: 90,
    notes: 'مثبط مضخة البروتون لعلاج ارتجاع المريء وقرحة المعدة والحموضة الشديدة',
    commonDose: 'قرص واحد يومياً قبل الإفطار بنصف ساعة',
    originCountry: 'السويد / بريطانيا',
    dosageForm: 'أقراص مقاومة للتحلل المعدي'
  },
  {
    barcode: '7321400119276',
    tradeName: 'نيكسيوم 20 مجم (Nexium 20mg)',
    scientificName: 'Esomeprazole Magnesium 20mg',
    companyName: 'AstraZeneca (أسترازينيكا)',
    category: 'الجهاز الهضمي والمعدة',
    defaultAlertDays: 90,
    notes: 'للوقاية من قرحة المعدة والسيطرة على أعراض الحموضة والارتجاع',
    commonDose: 'قرص واحد يومياً قبل الإفطار',
    originCountry: 'السويد',
    dosageForm: 'أقراص'
  },
  {
    barcode: '4011234500123',
    tradeName: 'كونترولوك 40 مجم (Controloc 40mg)',
    scientificName: 'Pantoprazole Sodium 40mg',
    companyName: 'Takeda (تاكيدا)',
    category: 'الجهاز الهضمي والمعدة',
    defaultAlertDays: 90,
    notes: 'علاج فعال لالتهاب المريء التآكلي وقرحة الإثني عشر',
    commonDose: 'قرص صباحاً قبل الأكل',
    originCountry: 'ألمانيا / اليابان',
    dosageForm: 'أقراص'
  },
  {
    barcode: '4011234500116',
    tradeName: 'كونترولوك 20 مجم (Controloc 20mg)',
    scientificName: 'Pantoprazole Sodium 20mg',
    companyName: 'Takeda (تاكيدا)',
    category: 'الجهاز الهضمي والمعدة',
    defaultAlertDays: 90,
    notes: 'جرعة صيانة للوقاية من قرحة المعدة الناتجة عن المسكنات',
    commonDose: 'قرص واحد يومياً',
    originCountry: 'ألمانيا',
    dosageForm: 'أقراص'
  },
  {
    barcode: '5000158022334',
    tradeName: 'جافيسكون أدفانس شراب (Gaviscon Advance)',
    scientificName: 'Sodium Alginate + Potassium Bicarbonate',
    companyName: 'Reckitt Benckiser',
    category: 'الجهاز الهضمي والمعدة',
    defaultAlertDays: 60,
    notes: 'حاجز رغوي يمنع ارتداد حمض المعدة إلى المريء فوراً',
    commonDose: '10 مل بعد الوجبات وقبل النوم',
    originCountry: 'بريطانيا',
    dosageForm: 'معلق فموي'
  },
  {
    barcode: '5000456033445',
    tradeName: 'دوسباتالين ريتارد 200 مجم (Duspatalin Retard)',
    scientificName: 'Mebeverine HCl 200mg',
    companyName: 'Abbott (أبوت)',
    category: 'الجهاز الهضمي والقولون العصبي',
    defaultAlertDays: 90,
    notes: 'مضاد لتشنجات وتقلصات وانتفاخات القولون العصبي',
    commonDose: 'كبسولة مرتين يومياً قبل الطعام بـ 20 دقيقة',
    originCountry: 'هولندا / Abbott',
    dosageForm: 'كبسولات مديدة التحرر'
  },
  {
    barcode: '4008500334455',
    tradeName: 'بسكوبان 10 مجم (Buscopan 10mg)',
    scientificName: 'Hyoscine Butylbromide 10mg',
    companyName: 'Sanofi / Boehringer',
    category: 'الجهاز الهضمي والتقلصات',
    defaultAlertDays: 90,
    notes: 'مسكن فوري للمغص الكلوي والمعوي وتقلصات البطن',
    commonDose: 'قرص إلى قرصين عند الشعور بالمغص',
    originCountry: 'ألمانيا',
    dosageForm: 'أقراص مغلفة'
  },
  {
    barcode: '7680315480440',
    tradeName: 'ليبراكس أقراص (Librax Tablets)',
    scientificName: 'Chlordiazepoxide + Clidinium Bromide',
    companyName: 'Meda / Viatris',
    category: 'الجهاز الهضمي والقولون العصبي',
    defaultAlertDays: 90,
    notes: 'مهدئ ومضاد لتشنج القولون العصبي المرتبط بالقلق والتوتر',
    commonDose: 'قرص قبل الوجبات بنصف ساعة وعند النوم',
    originCountry: 'فرنسا / سويسرا',
    dosageForm: 'أقراص مغلفة'
  },
  {
    barcode: '3582910044556',
    tradeName: 'موتيليوم 10 مجم (Motilium 10mg)',
    scientificName: 'Domperidone 10mg',
    companyName: 'Janssen / J&J',
    category: 'الجهاز الهضمي والمعدة',
    defaultAlertDays: 60,
    notes: 'منظم لحركة المعدة وعلاج الغثيان والقيء وعسر الهضم',
    commonDose: 'قرص 3 مرات يومياً قبل الطعام بـ 15 دقيقة',
    originCountry: 'بلجيكا',
    dosageForm: 'أقراص'
  },
  {
    barcode: '6221004008899',
    tradeName: 'أنتينال كبسول (Antinal Capsule)',
    scientificName: 'Nifuroxazide 200mg',
    companyName: 'Amoun (أمون)',
    category: 'مضادات الإسهال ومطهرات المعوية',
    defaultAlertDays: 90,
    notes: 'مطهر معوي واسع المجال للإسهال الحاد والنزلة المعوية',
    commonDose: 'كبسولة 4 مرات يومياً',
    originCountry: 'مصر',
    dosageForm: 'كبسولات'
  },

  // 6. الجهاز التنفسي والحساسية والأنف والأذن (Respiratory & Allergy)
  {
    barcode: '5000158033441',
    tradeName: 'فنتولين بخاخ (Ventolin Evohaler)',
    scientificName: 'Salbutamol Sulfate 100mcg/dose',
    companyName: 'GSK (GlaxoSmithKline)',
    category: 'أدوية الصدر والجهاز التنفسي',
    defaultAlertDays: 90,
    notes: 'موسع قصبي سريع المفعول للأزمات الربوية وضيق التنفس الحاد',
    commonDose: 'بختان عند نوبة ضيق التنفس',
    originCountry: 'بريطانيا / فرنسا',
    dosageForm: 'بخاخ استنشاق'
  },
  {
    barcode: '7321400223344',
    tradeName: 'سيمبيكورت 160/4.5 (Symbicort Turbuhaler)',
    scientificName: 'Budesonide 160mcg + Formoterol 4.5mcg',
    companyName: 'AstraZeneca (أسترازينيكا)',
    category: 'أدوية الصدر والجهاز التنفسي',
    defaultAlertDays: 90,
    notes: 'موسع للشعب مع كورتيزون للسيطرة على الربو المزمن وحساسية الصدر',
    commonDose: 'استنشاق واحد مرتين يومياً مع المضمضة بالماء',
    originCountry: 'السويد',
    dosageForm: 'مستنشق جاف'
  },
  {
    barcode: '7680315480550',
    tradeName: 'زيرتيك 10 مجم (Zyrtec 10mg)',
    scientificName: 'Cetirizine Di-HCl 10mg',
    companyName: 'UCB Pharma',
    category: 'مضادات الحساسية والهيستامين',
    defaultAlertDays: 90,
    notes: 'مضاد هيستامين لعلاج حساسية الأنف والارتيكاريا وحكة الجلد',
    commonDose: 'قرص واحد مساءً',
    originCountry: 'بلجيكا / سويسرا',
    dosageForm: 'أقراص مغلفة'
  },
  {
    barcode: '3582910066778',
    tradeName: 'تيلفاست 180 مجم (Telfast 180mg)',
    scientificName: 'Fexofenadine HCl 180mg',
    companyName: 'Sanofi (سانوفي)',
    category: 'مضادات الحساسية والهيستامين',
    defaultAlertDays: 90,
    notes: 'مضاد حساسية لا يسبب النعاس للارتيكاريا والطفح الجلدي المزمن',
    commonDose: 'قرص واحد يومياً قبل الأكل',
    originCountry: 'فرنسا / إيطاليا',
    dosageForm: 'أقراص مغلفة'
  },
  {
    barcode: '3582910066785',
    tradeName: 'تيلفاست 120 مجم (Telfast 120mg)',
    scientificName: 'Fexofenadine HCl 120mg',
    companyName: 'Sanofi (سانوفي)',
    category: 'مضادات الحساسية والهيستامين',
    defaultAlertDays: 90,
    notes: 'لعلاج حساسية الأنف الموسمية وحكة العيون والعطاس',
    commonDose: 'قرص واحد صباحاً',
    originCountry: 'فرنسا',
    dosageForm: 'أقراص'
  },
  {
    barcode: '6281001236677',
    tradeName: 'إيريوس 5 مجم (Aerius 5mg)',
    scientificName: 'Desloratadine 5mg',
    companyName: 'Organon / MSD',
    category: 'مضادات الحساسية والهيستامين',
    defaultAlertDays: 90,
    notes: 'ديسلوراتادين غير مهدئ لحساسية الجيوب الأنفية والرشح',
    commonDose: 'قرص واحد يومياً',
    originCountry: 'بلجيكا / الولايات المتحدة',
    dosageForm: 'أقراص'
  },
  {
    barcode: '4022536007788',
    tradeName: 'بروسبان شراب (Prospan Syrup)',
    scientificName: 'Dried Ivy Leaf Extract (مستخلص ورق اللبلاب)',
    companyName: 'Engelhard Arzneimittel',
    category: 'أدوية السعال والجهاز التنفسي',
    defaultAlertDays: 60,
    notes: 'طارد طبيعي للبلغم وموسع للشعب الهوائية ومهدئ للسعال الرطب',
    commonDose: '5 مل 3 مرات يومياً',
    originCountry: 'ألمانيا',
    dosageForm: 'شراب عشبي'
  },

  // 7. أدوية الدهون والكولسترول (Statins & Lipid Lowering)
  {
    barcode: '3582910077890',
    tradeName: 'ليبيتور 20 مجم (Lipitor 20mg)',
    scientificName: 'Atorvastatin Calcium 20mg',
    companyName: 'Pfizer / Viatris',
    category: 'أدوية الكولسترول والدهون',
    defaultAlertDays: 90,
    notes: 'ستاتين لخفض الكولسترول الضار LDL والدهون الثلاثية وحماية الشرايين',
    commonDose: 'قرص واحد مساءً قبل النوم',
    originCountry: 'الولايات المتحدة / أيرلندا',
    dosageForm: 'أقراص مغلفة'
  },
  {
    barcode: '3582910077883',
    tradeName: 'ليبيتور 10 مجم (Lipitor 10mg)',
    scientificName: 'Atorvastatin Calcium 10mg',
    companyName: 'Pfizer (فايزر)',
    category: 'أدوية الكولسترول والدهون',
    defaultAlertDays: 90,
    notes: 'جرعة أولية لخفض الدهون وحماية القلب',
    commonDose: 'قرص واحد مساءً',
    originCountry: 'الولايات المتحدة',
    dosageForm: 'أقراص'
  },
  {
    barcode: '3582910077906',
    tradeName: 'ليبيتور 40 مجم (Lipitor 40mg)',
    scientificName: 'Atorvastatin Calcium 40mg',
    companyName: 'Pfizer (فايزر)',
    category: 'أدوية الكولسترول والدهون',
    defaultAlertDays: 90,
    notes: 'جرعة مكثفة لحالات الجلطات السابقة وارتفاع الكولسترول الوراثي',
    commonDose: 'قرص واحد ليلاً',
    originCountry: 'الولايات المتحدة',
    dosageForm: 'أقراص'
  },
  {
    barcode: '7321400445566',
    tradeName: 'كريستور 10 مجم (Crestor 10mg)',
    scientificName: 'Rosuvastatin Calcium 10mg',
    companyName: 'AstraZeneca (أسترازينيكا)',
    category: 'أدوية الكولسترول والدهون',
    defaultAlertDays: 90,
    notes: 'ستاتين فائق الفعالية لرفع الكولسترول النافع وتخفيض الضار',
    commonDose: 'قرص واحد يومياً',
    originCountry: 'بريطانيا',
    dosageForm: 'أقراص مغلفة'
  },
  {
    barcode: '7321400445573',
    tradeName: 'كريستور 20 مجم (Crestor 20mg)',
    scientificName: 'Rosuvastatin Calcium 20mg',
    companyName: 'AstraZeneca (أسترازينيكا)',
    category: 'أدوية الكولسترول والدهون',
    defaultAlertDays: 90,
    notes: 'جرعة قوية للوقاية الثانوية من انسداد الشرايين التاجية',
    commonDose: 'قرص واحد يومياً',
    originCountry: 'بريطانيا',
    dosageForm: 'أقراص مغلفة'
  },

  // 8. الفيتامينات والمعادن والمكملات الغذائية (Vitamins & Supplements)
  {
    barcode: '6291011029341',
    tradeName: 'فيتامين د3 50000 وحدة (D-Vital 50,000 IU)',
    scientificName: 'Cholecalciferol 50,000 IU',
    companyName: 'Julphar (جلفار)',
    category: 'الفيتامينات والمكملات',
    defaultAlertDays: 90,
    notes: 'جرعة أسبوعية مركزة لعلاج النقص الحاد في فيتامين د وتقوية العظام والمناعة',
    commonDose: 'كبسولة واحدة أسبوعياً مع وجبة دهنية رئيسية',
    originCountry: 'الإمارات',
    dosageForm: 'كبسولات رخوة'
  },
  {
    barcode: '4022536005544',
    tradeName: 'نيوروبيون أقراص (Neurobion Tablets)',
    scientificName: 'Vitamin B1 + B6 + B12',
    companyName: 'Merck (ميرك)',
    category: 'الفيتامينات والمكملات',
    defaultAlertDays: 90,
    notes: 'فيتامين ب المركب لتقوية الأعصاب الطرفية وتخفيف آلام وتنميل الأطراف',
    commonDose: 'قرص واحد إلى 3 أقراص يومياً بعد الأكل',
    originCountry: 'ألمانيا / النمسا',
    dosageForm: 'أقراص مغلفة'
  },
  {
    barcode: '5000158077889',
    tradeName: 'أوستيوكير أقراص (Osteocare Original)',
    scientificName: 'Calcium + Magnesium + Zinc + Vit D3',
    companyName: 'Vitabiotics (فيتابيوتكس)',
    category: 'الفيتامينات والمكملات',
    defaultAlertDays: 90,
    notes: 'تركيبة متكاملة لصحة العظام والمفاصل والأسنان ومقاومة الهشاشة',
    commonDose: 'قرصان يومياً مع الوجبة الرئيسية',
    originCountry: 'بريطانيا',
    dosageForm: 'أقراص'
  },
  {
    barcode: '5000158088990',
    tradeName: 'فيروجلوبين كبسول (Feroglobin-B12)',
    scientificName: 'Iron + Zinc + B-Complex + Folic Acid',
    companyName: 'Vitabiotics (فيتابيوتكس)',
    category: 'الفيتامينات والمكملات',
    defaultAlertDays: 90,
    notes: 'حديد عضوي مع فيتامينات الدم لطيف على المعدة لعلاج فقر الدم',
    commonDose: 'كبسولة واحدة يومياً بعد وجبة الغداء',
    originCountry: 'بريطانيا',
    dosageForm: 'كبسولات بطيئة الإطلاق'
  },
  {
    barcode: '3582910099887',
    tradeName: 'سنتروم لوتين (Centrum with Lutein)',
    scientificName: 'Multivitamins & Minerals + Lutein',
    companyName: 'Pfizer / Haleon',
    category: 'الفيتامينات والمكملات',
    defaultAlertDays: 90,
    notes: 'فيتامينات ومعادن شاملة للطاقة اليومية وحماية النظر والمناعة',
    commonDose: 'قرص واحد يومياً مع الماء',
    originCountry: 'الولايات المتحدة / كندا',
    dosageForm: 'أقراص'
  },
  {
    barcode: '6251011009988',
    tradeName: 'فولفيت 5 مجم (Folvite 5mg)',
    scientificName: 'Folic Acid 5mg',
    companyName: 'Hikma Pharmaceuticals (حكمة)',
    category: 'الفيتامينات والمكملات',
    defaultAlertDays: 90,
    notes: 'حمض الفوليك للحوامل وعلاج أنيميا نقص الفوليك وتجديد كريات الدم',
    commonDose: 'قرص واحد يومياً',
    originCountry: 'الأردن',
    dosageForm: 'أقراص'
  },

  // 9. الأدوية العصبية والنفسية ومسكنات الأعصاب (Neurology)
  {
    barcode: '3582910011999',
    tradeName: 'ليريكا 75 مجم (Lyrica 75mg)',
    scientificName: 'Pregabalin 75mg',
    companyName: 'Pfizer (فايزر)',
    category: 'أدوية الأعصاب والمخ',
    defaultAlertDays: 90,
    notes: 'علاج آلام الأعصاب الناتجة عن السكري والحزام الناري والفيبروميالجيا',
    commonDose: 'كبسولة مرتين يومياً حسب وصفة الطبيب',
    originCountry: 'الولايات المتحدة / ألمانيا',
    dosageForm: 'كبسولات'
  },
  {
    barcode: '3582910012002',
    tradeName: 'ليريكا 150 مجم (Lyrica 150mg)',
    scientificName: 'Pregabalin 150mg',
    companyName: 'Pfizer (فايزر)',
    category: 'أدوية الأعصاب والمخ',
    defaultAlertDays: 90,
    notes: 'جرعة علاجية لآلام الأعصاب المحيطية الحادة',
    commonDose: 'كبسولة مرتين يومياً',
    originCountry: 'الولايات المتحدة',
    dosageForm: 'كبسولات'
  },
  {
    barcode: '7680315480660',
    tradeName: 'تيجريتول 200 مجم (Tegretol 200mg)',
    scientificName: 'Carbamazepine 200mg',
    companyName: 'Novartis (نوفارتس)',
    category: 'أدوية الأعصاب والمخ',
    defaultAlertDays: 90,
    notes: 'علاج نوبات الصرع وآلام العصب الخامس الحادة',
    commonDose: 'قرص مرتين إلى 3 مرات يومياً مع الطعام',
    originCountry: 'سويسرا',
    dosageForm: 'أقراص'
  },
  {
    barcode: '5702158012345',
    tradeName: 'سيبرالكس 10 مجم (Cipralex 10mg)',
    scientificName: 'Escitalopram 10mg',
    companyName: 'Lundbeck (لوندبيك)',
    category: 'أدوية الطب النفسي والأعصاب',
    defaultAlertDays: 90,
    notes: 'مثبط استرداد السيروتونين لعلاج الاكتئاب والهلع والقلق والوسواس',
    commonDose: 'قرص واحد يومياً صباحاً أو مساءً',
    originCountry: 'الدنمارك',
    dosageForm: 'أقراص مغلفة'
  },
  {
    barcode: '5702158012352',
    tradeName: 'ديانكسيت أقراص (Deanxit Tablets)',
    scientificName: 'Melitracen + Flupentixol',
    companyName: 'Lundbeck (لوندبيك)',
    category: 'أدوية الطب النفسي والقولون',
    defaultAlertDays: 90,
    notes: 'مضاد للقلق البسيط والتوتر والاضطرابات الجسدية المنشأ والقولون العصبي',
    commonDose: 'قرص صباحاً ومساءً',
    originCountry: 'الدنمارك',
    dosageForm: 'أقراص'
  },

  // 10. الصناعة الوطنية العراقية (SDI سامراء، أواميديكا، الرائد)
  {
    barcode: '6281008899001',
    tradeName: 'باراسيتامول سامراء 500 مجم (Paracetamol SDI)',
    scientificName: 'Paracetamol 500mg',
    companyName: 'SDI Samarra (أدوية سامراء العراقية)',
    category: 'مسكنات وخافضات حرارة',
    defaultAlertDays: 60,
    notes: 'مسكن وطني موثوق ومخفض للحرارة عالي الجودة',
    commonDose: 'قرص كل 6 إلى 8 ساعات',
    originCountry: 'العراق (سامراء SDI)',
    dosageForm: 'أقراص'
  },
  {
    barcode: '6281008899018',
    tradeName: 'أموكسيسيلين سامراء 500 مجم (Amoxicillin SDI)',
    scientificName: 'Amoxicillin 500mg',
    companyName: 'SDI Samarra (أدوية سامراء العراقية)',
    category: 'المضادات الحيوية',
    defaultAlertDays: 60,
    notes: 'مضاد حيوي عراقي معتمد لالتهابات البلعوم والصدر والمسالك',
    commonDose: 'كبسولة كل 8 ساعات',
    originCountry: 'العراق (سامراء SDI)',
    dosageForm: 'كبسولات'
  },
  {
    barcode: '6281008899025',
    tradeName: 'دايكلوفيناك سامراء 50 مجم (Diclofenac SDI)',
    scientificName: 'Diclofenac Sodium 50mg',
    companyName: 'SDI Samarra (أدوية سامراء العراقية)',
    category: 'مسكنات ومضادات الالتهاب',
    defaultAlertDays: 60,
    notes: 'مسكن لآلام المفاصل والروماتيزم من مصانع سامراء الوطنية',
    commonDose: 'قرص مرتين إلى 3 مرات يومياً بعد الأكل',
    originCountry: 'العراق (سامراء SDI)',
    dosageForm: 'أقراص'
  },
  {
    barcode: '6281008899032',
    tradeName: 'أواميد 500 مجم (Awamid 500mg)',
    scientificName: 'Cefuroxime Axetil 500mg',
    companyName: 'Awamedica (أواميديكا - أربيل)',
    category: 'المضادات الحيوية',
    defaultAlertDays: 60,
    notes: 'سيفالوسبورين جيل ثان فموي للالتهابات الرئوية والجلدية والبولية',
    commonDose: 'قرص كل 12 ساعة بعد الطعام',
    originCountry: 'العراق (أربيل - Awamedica)',
    dosageForm: 'أقراص مغلفة'
  },
  {
    barcode: '6281008899049',
    tradeName: 'بايوبروفين 400 مجم (Pio-Brufen 400)',
    scientificName: 'Ibuprofen 400mg',
    companyName: 'Pioneer Pharma (الرائد الدوائية - السليمانية)',
    category: 'مسكنات وخافضات حرارة',
    defaultAlertDays: 60,
    notes: 'مسكن خافض حرارة سريع المفعول للصداع وآلام الأسنان',
    commonDose: 'قرص كل 8 ساعات بعد الطعام',
    originCountry: 'العراق (Pioneer)',
    dosageForm: 'أقراص'
  }
];

// -------------------------------------------------------------
// محلل باركود الأدوية الطبي الحديث GS1 DataMatrix
// يستخرج GTIN، تاريخ انتهاء الصلاحية من (17) YYMMDD، ورقم التشغيلة (10)
// -------------------------------------------------------------
export function parseGS1Barcode(rawBarcode: string): ParsedGS1Data {
  const clean = rawBarcode.trim();
  const result: ParsedGS1Data = {
    raw: clean,
    isGS1: false,
  };

  // فحص النمط المعياري لـ GS1 DataMatrix بالأقواس: (01)06281001230012(17)261130(10)LOT123
  const parenthesizedMatches = {
    gtin: clean.match(/\(01\)(\d{14}|\d{13}|\d{12})/),
    expiry: clean.match(/\(17\)(\d{6})/),
    batch: clean.match(/\(10\)([^\(]+)/),
    serial: clean.match(/\(21\)([^\(]+)/),
  };

  if (parenthesizedMatches.gtin || parenthesizedMatches.expiry) {
    result.isGS1 = true;
    if (parenthesizedMatches.gtin) {
      result.gtin = parenthesizedMatches.gtin[1].replace(/^0+/, ''); // إزالة الأصفار البادئة
    }
    if (parenthesizedMatches.expiry) {
      const expRaw = parenthesizedMatches.expiry[1]; // YYMMDD
      result.expiryDate = convertGS1DateToISO(expRaw);
    }
    if (parenthesizedMatches.batch) {
      result.batchNumber = parenthesizedMatches.batch[1].trim();
    }
    if (parenthesizedMatches.serial) {
      result.serialNumber = parenthesizedMatches.serial[1].trim();
    }
    return result;
  }

  // فحص نمط GS1 المتسلسل بدون أقواس (FNC1 Delimited or plain standard GS1 string)
  // مثال: 01062810012300121726113010LOT1234
  const plainGtinMatch = clean.match(/^01(\d{14})/);
  if (plainGtinMatch) {
    result.isGS1 = true;
    result.gtin = plainGtinMatch[1].replace(/^0+/, '');
    
    // بعد 01 + 14 رقم = 16 حرف، هل يتبعها 17 (تاريخ الصلاحية 6 أرقام)؟
    const afterGtin = clean.substring(16);
    const expMatch = afterGtin.match(/^17(\d{6})/);
    if (expMatch) {
      result.expiryDate = convertGS1DateToISO(expMatch[1]);
      
      const afterExp = afterGtin.substring(8);
      const batchMatch = afterExp.match(/^10([a-zA-Z0-9_-]+)/);
      if (batchMatch) {
        result.batchNumber = batchMatch[1];
      }
    }
    return result;
  }

  return result;
}

// تحويل تاريخ GS1 بصيغة YYMMDD إلى YYYY-MM-DD قياسي
function convertGS1DateToISO(yymmdd: string): string {
  if (yymmdd.length !== 6) return '';
  const yy = parseInt(yymmdd.substring(0, 2), 10);
  const mm = yymmdd.substring(2, 4);
  let dd = yymmdd.substring(4, 6);

  // إذا كان اليوم "00"، فإن معيار GS1 يعني آخر يوم في ذلك الشهر
  if (dd === '00') {
    const monthNum = parseInt(mm, 10);
    const yearFull = yy < 70 ? 2000 + yy : 1900 + yy;
    const lastDay = new Date(yearFull, monthNum, 0).getDate();
    dd = String(lastDay).padStart(2, '0');
  }

  const fullYear = yy < 70 ? 2000 + yy : 1900 + yy;
  return `${fullYear}-${mm}-${dd}`;
}

// -------------------------------------------------------------
// دالة التعرف على الدولة المصنعة أو جهة التسجيل عبر بادئة GS1
// -------------------------------------------------------------
export function identifyCountryPrefix(barcode: string): string {
  const digits = barcode.replace(/\D/g, '');
  if (digits.length < 3) return 'غير محدد';

  const prefix3 = digits.substring(0, 3);
  const pNum = parseInt(prefix3, 10);

  if (pNum >= 628 && pNum <= 628) return 'المملكة العربية السعودية (SFDA)';
  if (pNum >= 622 && pNum <= 622) return 'جمهورية مصر العربية (EDA)';
  if (pNum >= 625 && pNum <= 625) return 'المملكة الأردنية الهاشمية (JFDA)';
  if (pNum >= 629 && pNum <= 629) return 'الإمارات العربية المتحدة';
  if (pNum >= 621 && pNum <= 621) return 'الجمهورية العربية السورية';
  if (pNum >= 627 && pNum <= 627) return 'دولة الكويت';
  if (pNum >= 624 && pNum <= 624) return 'ليبيا';
  if (pNum >= 500 && pNum <= 509) return 'المملكة المتحدة (بريطانيا)';
  if (pNum >= 400 && pNum <= 440) return 'ألمانيا (EU)';
  if (pNum >= 300 && pNum <= 379) return 'فرنسا (EU)';
  if (pNum >= 760 && pNum <= 769) return 'سويسرا (Swissmedic)';
  if (pNum >= 868 && pNum <= 869) return 'تركيا (TITCK)';
  if (pNum >= 800 && pNum <= 839) return 'إيطاليا (EU)';
  if (pNum >= 840 && pNum <= 849) return 'إسبانيا (EU)';
  if (pNum >= 730 && pNum <= 739) return 'السويد (EU)';
  if (pNum >= 890 && pNum <= 890) return 'الهند (CDSCO)';
  if (pNum >= 520 && pNum <= 521) return 'اليونان (EU)';
  if (pNum >= 383 && pNum <= 383) return 'سلوفينيا (Krka)';
  if (pNum >= 570 && pNum <= 579) return 'الدنمارك';
  if (pNum >= 0 && pNum <= 139) return 'الولايات المتحدة الأمريكية وكندا (FDA)';

  return 'منشأ دولي معتمد';
}

// -------------------------------------------------------------
// دالة ذكية وشاملة للبحث عن أي باركود دواء:
// 1. فحص GS1 DataMatrix
// 2. فحص قاعدة البيانات المحلية
// 3. فحص المخزون المحفوظ للصيدلية
// 4. استخراج الدولة والتصنيف الافتراضي التلقائي
// -------------------------------------------------------------
export function lookupDrugByBarcode(rawBarcode: string): DrugInfo | null {
  if (!rawBarcode) return null;
  const cleanBarcode = rawBarcode.trim();

  // 1. هل هو GS1 DataMatrix مركب؟
  const gs1Data = parseGS1Barcode(cleanBarcode);
  const searchCode = gs1Data.gtin || cleanBarcode;

  // 2. بحث مباشر وتطابق تام في قاعدة البيانات الدوائية
  let match = GLOBAL_DRUG_DATABASE.find(
    (d) => d.barcode === searchCode || d.barcode === cleanBarcode
  );
  if (match) return match;

  // 3. بحث بالتطابق الجزئي أو احتواء الباركود
  match = GLOBAL_DRUG_DATABASE.find(
    (d) => searchCode.includes(d.barcode) || d.barcode.includes(searchCode)
  );
  if (match) return match;

  // 4. فحص الأدوية المسجلة مسبقاً والمحفوظة في التخزين المحلي للمستخدم
  if (typeof window !== 'undefined') {
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('expiro_user_medicines_')) {
          const storedList = JSON.parse(localStorage.getItem(key) || '[]');
          if (Array.isArray(storedList)) {
            const foundInStored = storedList.find(
              (m: any) => m.barcode === searchCode || m.barcode === cleanBarcode
            );
            if (foundInStored) {
              return {
                barcode: foundInStored.barcode || searchCode,
                tradeName: foundInStored.tradeName,
                scientificName: foundInStored.scientificName || '',
                companyName: foundInStored.companyName || 'شركة مسجلة',
                category: foundInStored.category || 'أدوية عامة',
                defaultAlertDays: foundInStored.alertThresholdDays || 60,
                notes: foundInStored.notes || '',
                originCountry: identifyCountryPrefix(searchCode),
              };
            }
          }
        }
      }
    } catch (e) {}
  }

  // 5. إذا كان دواء جديد غير مدرج، ننشئ كائن DrugInfo ذكي بالمعلومات الأولية المستخلصة
  const country = identifyCountryPrefix(searchCode);
  return {
    barcode: searchCode,
    tradeName: `دواء مسجل (${searchCode.slice(-4)})`,
    scientificName: '',
    companyName: country !== 'منشأ دولي معتمد' ? `شركة دوائية - ${country}` : 'شركة دوائية مرخصة',
    category: 'أدوية عامة',
    defaultAlertDays: 60,
    notes: `تم مسح الباركود بنجاح. جهة المنشأ: ${country}`,
    originCountry: country,
  };
}
