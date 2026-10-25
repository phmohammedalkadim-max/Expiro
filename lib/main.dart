import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:intl/intl.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const ExpiroApp());
}

/// التطبيق الرئيسي - Expiro Flutter App
class ExpiroApp extends StatefulWidget {
  const ExpiroApp({super.key});

  @override
  State<ExpiroApp> createState() => _ExpiroAppState();
}

class _ExpiroAppState extends State<ExpiroApp> {
  bool _isDarkMode = false;

  void toggleTheme() {
    setState(() {
      _isDarkMode = !_isDarkMode;
    });
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Expiro - إدارة تواريخ صلاحية الأدوية',
      debugShowCheckedModeBanner: false,
      locale: const Locale('ar', 'IQ'),
      supportedLocales: const [
        Locale('ar', 'IQ'),
        Locale('en', 'US'),
      ],
      localizationsDelegates: const [
        GlobalMaterialLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
      ],
      themeMode: _isDarkMode ? ThemeMode.dark : ThemeMode.light,
      theme: ThemeData(
        useMaterial3: true,
        brightness: Brightness.light,
        scaffoldBackgroundColor: const Color(0xFFF1F5F9),
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF0D9488),
          primary: const Color(0xFF0F766E),
          secondary: const Color(0xFF0D9488),
          surface: const Color(0xFFFFFFFF),
          brightness: Brightness.light,
        ),
      ),
      darkTheme: ThemeData(
        useMaterial3: true,
        brightness: Brightness.dark,
        scaffoldBackgroundColor: const Color(0xFF0F172A),
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF0D9488),
          primary: const Color(0xFF14B8A6),
          secondary: const Color(0xFF0D9488),
          surface: const Color(0xFF1E293B),
          brightness: Brightness.dark,
        ),
      ),
      home: MainScreen(
        isDarkMode: _isDarkMode,
        onToggleTheme: toggleTheme,
      ),
    );
  }
}

// ==========================================
// 1. نماذج البيانات (Models)
// ==========================================

enum ExpiryStatus { expired, nearExpiry, valid }

class MedicineAnalysis {
  final ExpiryStatus status;
  final int daysRemaining;
  final String badgeText;
  final Color badgeBg;
  final Color badgeTextColor;
  final Color badgeBorderColor;
  final Color accentColor;

  MedicineAnalysis({
    required this.status,
    required this.daysRemaining,
    required this.badgeText,
    required this.badgeBg,
    required this.badgeTextColor,
    required this.badgeBorderColor,
    required this.accentColor,
  });
}

class Medicine {
  final int id;
  String tradeName;
  String scientificName;
  String companyName;
  String category;
  String barcode;
  DateTime expiryDate;
  int alertThresholdDays;
  int quantity;
  String notes;

  Medicine({
    required this.id,
    required this.tradeName,
    required this.scientificName,
    required this.companyName,
    required this.category,
    required this.barcode,
    required this.expiryDate,
    this.alertThresholdDays = 60,
    this.quantity = 1,
    this.notes = '',
  });

  MedicineAnalysis get analysis {
    final now = DateTime.now();
    final today = DateTime(now.year, now.month, now.day);
    final exp = DateTime(expiryDate.year, expiryDate.month, expiryDate.day);
    final days = exp.difference(today).inDays;

    if (days < 0) {
      final absDays = days.abs();
      return MedicineAnalysis(
        status: ExpiryStatus.expired,
        daysRemaining: days,
        badgeText: 'منتهي ($absDays يوم)',
        badgeBg: const Color(0xFFFEF2F2),
        badgeTextColor: const Color(0xFFE53935),
        badgeBorderColor: const Color(0xFFFECACA),
        accentColor: const Color(0xFFE53935),
      );
    } else if (days <= alertThresholdDays) {
      return MedicineAnalysis(
        status: ExpiryStatus.nearExpiry,
        daysRemaining: days,
        badgeText: 'وشيك ($days يوم)',
        badgeBg: const Color(0xFFFFFBEB),
        badgeTextColor: const Color(0xFFFB8C00),
        badgeBorderColor: const Color(0xFFFDE68A),
        accentColor: const Color(0xFFFB8C00),
      );
    } else {
      return MedicineAnalysis(
        status: ExpiryStatus.valid,
        daysRemaining: days,
        badgeText: 'صالح للاستخدام',
        badgeBg: const Color(0xFFF0FDF4),
        badgeTextColor: const Color(0xFF43A047),
        badgeBorderColor: const Color(0xFFBBF7D0),
        accentColor: const Color(0xFF43A047),
      );
    }
  }
}

// ==========================================
// 2. الشاشة الرئيسية مع التصميم المطابق 100%
// ==========================================

class MainScreen extends StatefulWidget {
  final bool isDarkMode;
  final VoidCallback onToggleTheme;

  const MainScreen({
    super.key,
    required this.isDarkMode,
    required this.onToggleTheme,
  });

  @override
  State<MainScreen> createState() => _MainScreenState();
}

class _MainScreenState extends State<MainScreen> {
  // التبويب النشط: 0 = الرئيسية, 1 = الخسائر, 2 = الدعم, 3 = حسابي, 4 = التنبيهات
  int _activeTab = 0;
  String _statusFilter = 'ALL'; // 'ALL', 'EXPIRED', 'NEAR_EXPIRY', 'VALID'
  final TextEditingController _searchController = TextEditingController();
  String _searchQuery = '';
  String _userRole = 'admin'; // 'admin' أو 'staff'
  bool _soundEnabled = true;

  // الأدوية الأولية الثمانية المطابقة للويب شوت تماماً
  late List<Medicine> _medicines;

  @override
  void initState() {
    super.initState();
    final now = DateTime.now();
    _medicines = [
      Medicine(
        id: 1,
        tradeName: 'أوجمنتين 1 جم أقراص (Augmentin 1g)',
        scientificName: 'Amoxicillin + Clavulanic Acid 1000mg',
        companyName: 'GSK (GlaxoSmithKline)',
        category: 'المضادات الحيوية',
        barcode: '6281001230012',
        expiryDate: now.subtract(const Duration(days: 23)),
        alertThresholdDays: 60,
        quantity: 12,
        notes: 'مضاد حيوي واسع المجال - عبوة 14 قرص',
      ),
      Medicine(
        id: 2,
        tradeName: 'بانادول إكسترا (Panadol Extra)',
        scientificName: 'Paracetamol 500mg + Caffeine 65mg',
        companyName: 'Haleon / GSK',
        category: 'مسكنات وخافضات حرارة',
        barcode: '6285000000018',
        expiryDate: now.add(const Duration(days: 11)),
        alertThresholdDays: 30,
        quantity: 45,
        notes: 'مسكن ومخفض للحرارة - أحمر سريع المفعول',
      ),
      Medicine(
        id: 3,
        tradeName: 'كونكور 5 مجم (Concor 5mg)',
        scientificName: 'Bisoprolol Fumarate 5mg',
        companyName: 'Merck (ميرك)',
        category: 'القلب والأوعية الدموية',
        barcode: '6281100223344',
        expiryDate: now.add(const Duration(days: 29)),
        alertThresholdDays: 60,
        quantity: 18,
        notes: 'علاج ارتفاع ضغط الدم والذبحة الصدرية',
      ),
      Medicine(
        id: 4,
        tradeName: 'جلوكوفاج 1000 مجم (Glucophage)',
        scientificName: 'Metformin HCl 1000mg',
        companyName: 'Merck Serono',
        category: 'أدوية السكري والهورمونات',
        barcode: '3582910023419',
        expiryDate: now.subtract(const Duration(days: 5)),
        alertThresholdDays: 45,
        quantity: 24,
        notes: 'تنظيم مستوى السكر في الدم النوع الثاني',
      ),
      Medicine(
        id: 5,
        tradeName: 'نيكسيوم 40 مجم (Nexium 40mg)',
        scientificName: 'Esomeprazole Magnesium 40mg',
        companyName: 'AstraZeneca (أسترازينيكا)',
        category: 'الجهاز الهضمي والمعدة',
        barcode: '7321400119283',
        expiryDate: now.add(const Duration(days: 180)),
        alertThresholdDays: 90,
        quantity: 30,
        notes: 'مثبط مضخة البروتون للحموضة وقرحة المعدة',
      ),
      Medicine(
        id: 6,
        tradeName: 'سيبتازول فورت (Septazole Forte)',
        scientificName: 'Sulfamethoxazole + Trimethoprim',
        companyName: 'EPICO (إيبيكو)',
        category: 'المضادات الحيوية',
        barcode: '6221004001920',
        expiryDate: now.add(const Duration(days: 320)),
        alertThresholdDays: 60,
        quantity: 15,
        notes: 'مضاد للمسالك البولية والتهابات الصدر',
      ),
      Medicine(
        id: 7,
        tradeName: 'بروفين 400 مجم (Brufen 400mg)',
        scientificName: 'Ibuprofen 400mg',
        companyName: 'Abbott (أبوت)',
        category: 'مسكنات وخافضات حرارة',
        barcode: '5000456012948',
        expiryDate: now.add(const Duration(days: 410)),
        alertThresholdDays: 45,
        quantity: 60,
        notes: 'مضاد للالتهاب ومسكن للآلام والصداع',
      ),
      Medicine(
        id: 8,
        tradeName: 'فيتامين د3 50000 وحدة (D-Vital)',
        scientificName: 'Cholecalciferol 50,000 IU',
        companyName: 'Julphar (جلفار)',
        category: 'الفيتامينات والمكملات',
        barcode: '6291011029341',
        expiryDate: now.add(const Duration(days: 580)),
        alertThresholdDays: 90,
        quantity: 50,
        notes: 'جرعة أسبوعية لعلاج نقص فيتامين د',
      ),
    ];
  }

  // الحسابات والإحصائيات
  int get totalCount => _medicines.length;
  int get expiredCount => _medicines.where((m) => m.analysis.status == ExpiryStatus.expired).length;
  int get nearCount => _medicines.where((m) => m.analysis.status == ExpiryStatus.nearExpiry).length;
  int get validCount => _medicines.where((m) => m.analysis.status == ExpiryStatus.valid).length;

  List<Medicine> get filteredMedicines {
    return _medicines.where((med) {
      final a = med.analysis;
      if (_statusFilter == 'EXPIRED' && a.status != ExpiryStatus.expired) return false;
      if (_statusFilter == 'NEAR_EXPIRY' && a.status != ExpiryStatus.nearExpiry) return false;
      if (_statusFilter == 'VALID' && a.status != ExpiryStatus.valid) return false;

      if (_searchQuery.trim().isNotEmpty) {
        final q = _searchQuery.toLowerCase().trim();
        final matchTrade = med.tradeName.toLowerCase().contains(q);
        final matchSci = med.scientificName.toLowerCase().contains(q);
        final matchComp = med.companyName.toLowerCase().contains(q);
        final matchCat = med.category.toLowerCase().contains(q);
        final matchCode = med.barcode.contains(q);
        if (!matchTrade && !matchSci && !matchComp && !matchCat && !matchCode) {
          return false;
        }
      }
      return true;
    }).toList();
  }

  // فتح نافذة الإضافة أو التعديل
  void _openAddEditMedicineModal({Medicine? medicineToEdit, String initialBarcode = ''}) {
    final isEdit = medicineToEdit != null;
    final nameCtrl = TextEditingController(text: isEdit ? medicineToEdit.tradeName : '');
    final sciCtrl = TextEditingController(text: isEdit ? medicineToEdit.scientificName : '');
    final compCtrl = TextEditingController(text: isEdit ? medicineToEdit.companyName : 'صيدلية مسجلة');
    final catCtrl = TextEditingController(text: isEdit ? medicineToEdit.category : 'أدوية عامة');
    final codeCtrl = TextEditingController(text: isEdit ? medicineToEdit.barcode : initialBarcode);
    final qtyCtrl = TextEditingController(text: isEdit ? medicineToEdit.quantity.toString() : '1');
    DateTime selectedDate = isEdit ? medicineToEdit.expiryDate : DateTime.now().add(const Duration(days: 180));

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) {
        return StatefulBuilder(
          builder: (modalCtx, setModalState) {
            final isDark = widget.isDarkMode;
            final sheetBg = isDark ? const Color(0xFF1E293B) : Colors.white;
            final textCol = isDark ? Colors.white : const Color(0xFF1E293B);

            return Container(
              padding: EdgeInsets.only(
                bottom: MediaQuery.of(modalCtx).viewInsets.bottom + 20,
                top: 20,
                left: 20,
                right: 20,
              ),
              decoration: BoxDecoration(
                color: sheetBg,
                borderRadius: const BorderRadius.vertical(top: Radius.circular(28)),
              ),
              child: SingleChildScrollView(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    Center(
                      child: Container(
                        width: 40,
                        height: 4,
                        decoration: BoxDecoration(
                          color: Colors.grey.withOpacity(0.3),
                          borderRadius: BorderRadius.circular(2),
                        ),
                      ),
                    ),
                    const SizedBox(height: 16),
                    Text(
                      isEdit ? 'تعديل بيانات الدواء' : 'إضافة دواء جديد للمخزون',
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        fontSize: 17,
                        fontWeight: FontWeight.bold,
                        color: textCol,
                      ),
                    ),
                    const SizedBox(height: 16),
                    TextField(
                      controller: nameCtrl,
                      decoration: InputDecoration(
                        labelText: 'الاسم التجاري للدواء',
                        labelStyle: TextStyle(color: isDark ? Colors.grey[400] : Colors.grey[700]),
                        prefixIcon: const Icon(Icons.medication, color: Color(0xFF0F766E)),
                        filled: true,
                        fillColor: isDark ? const Color(0xFF0F172A) : const Color(0xFFF8FAFC),
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(16)),
                      ),
                    ),
                    const SizedBox(height: 12),
                    TextField(
                      controller: sciCtrl,
                      decoration: InputDecoration(
                        labelText: 'الاسم العلمي والتركيز',
                        prefixIcon: const Icon(Icons.science, color: Color(0xFF0F766E)),
                        filled: true,
                        fillColor: isDark ? const Color(0xFF0F172A) : const Color(0xFFF8FAFC),
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(16)),
                      ),
                    ),
                    const SizedBox(height: 12),
                    Row(
                      children: [
                        Expanded(
                          child: TextField(
                            controller: compCtrl,
                            decoration: InputDecoration(
                              labelText: 'الشركة المصنعة',
                              filled: true,
                              fillColor: isDark ? const Color(0xFF0F172A) : const Color(0xFFF8FAFC),
                              border: OutlineInputBorder(borderRadius: BorderRadius.circular(16)),
                            ),
                          ),
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: TextField(
                            controller: catCtrl,
                            decoration: InputDecoration(
                              labelText: 'التصنيف الدوائي',
                              filled: true,
                              fillColor: isDark ? const Color(0xFF0F172A) : const Color(0xFFF8FAFC),
                              border: OutlineInputBorder(borderRadius: BorderRadius.circular(16)),
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    Row(
                      children: [
                        Expanded(
                          flex: 2,
                          child: TextField(
                            controller: codeCtrl,
                            decoration: InputDecoration(
                              labelText: 'الباركود',
                              prefixIcon: const Icon(Icons.qr_code, color: Color(0xFF0F766E)),
                              filled: true,
                              fillColor: isDark ? const Color(0xFF0F172A) : const Color(0xFFF8FAFC),
                              border: OutlineInputBorder(borderRadius: BorderRadius.circular(16)),
                            ),
                          ),
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          flex: 1,
                          child: TextField(
                            controller: qtyCtrl,
                            keyboardType: TextInputType.number,
                            decoration: InputDecoration(
                              labelText: 'الكمية',
                              filled: true,
                              fillColor: isDark ? const Color(0xFF0F172A) : const Color(0xFFF8FAFC),
                              border: OutlineInputBorder(borderRadius: BorderRadius.circular(16)),
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    InkWell(
                      onTap: () async {
                        final picked = await showDatePicker(
                          context: context,
                          initialDate: selectedDate,
                          firstDate: DateTime(2020),
                          lastDate: DateTime(2035),
                        );
                        if (picked != null) {
                          setModalState(() {
                            selectedDate = picked;
                          });
                        }
                      },
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                        decoration: BoxDecoration(
                          color: isDark ? const Color(0xFF0F172A) : const Color(0xFFF8FAFC),
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: Colors.grey.withOpacity(0.3)),
                        ),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Row(
                              children: [
                                const Icon(Icons.calendar_today, color: Color(0xFF0F766E), size: 20),
                                const SizedBox(width: 10),
                                Text(
                                  'تاريخ الصلاحية: ${DateFormat('yyyy-MM-dd').format(selectedDate)}',
                                  style: TextStyle(fontWeight: FontWeight.bold, color: textCol),
                                ),
                              ],
                            ),
                            const Icon(Icons.arrow_drop_down, color: Color(0xFF0F766E)),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(height: 20),
                    ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF0F766E),
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                      ),
                      onPressed: () {
                        if (nameCtrl.text.trim().isEmpty) return;
                        setState(() {
                          if (isEdit) {
                            medicineToEdit.tradeName = nameCtrl.text.trim();
                            medicineToEdit.scientificName = sciCtrl.text.trim();
                            medicineToEdit.companyName = compCtrl.text.trim();
                            medicineToEdit.category = catCtrl.text.trim();
                            medicineToEdit.barcode = codeCtrl.text.trim();
                            medicineToEdit.quantity = int.tryParse(qtyCtrl.text.trim()) ?? 1;
                            medicineToEdit.expiryDate = selectedDate;
                          } else {
                            _medicines.insert(
                              0,
                              Medicine(
                                id: DateTime.now().millisecondsSinceEpoch,
                                tradeName: nameCtrl.text.trim(),
                                scientificName: sciCtrl.text.trim(),
                                companyName: compCtrl.text.trim(),
                                category: catCtrl.text.trim(),
                                barcode: codeCtrl.text.trim().isEmpty
                                    ? '${DateTime.now().millisecondsSinceEpoch}'.substring(4)
                                    : codeCtrl.text.trim(),
                                expiryDate: selectedDate,
                                quantity: int.tryParse(qtyCtrl.text.trim()) ?? 1,
                              ),
                            );
                          }
                        });
                        Navigator.pop(ctx);
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(
                            content: Text(isEdit ? 'تم تحديث الدواء بنجاح' : 'تمت إضافة الدواء بنجاح'),
                            backgroundColor: const Color(0xFF0F766E),
                          ),
                        );
                      },
                      child: Text(
                        isEdit ? 'حفظ التعديلات' : 'إضافة للمخزون الصيدلاني',
                        style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
                      ),
                    ),
                  ],
                ),
              ),
            );
          },
        );
      },
    );
  }

  // نافذة ماسح الباركود السريع
  void _openBarcodeScannerModal() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) {
        final isDark = widget.isDarkMode;
        return Container(
          padding: const EdgeInsets.all(24),
          decoration: BoxDecoration(
            color: isDark ? const Color(0xFF1E293B) : Colors.white,
            borderRadius: const BorderRadius.vertical(top: Radius.circular(28)),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Center(
                child: Container(
                  width: 40,
                  height: 4,
                  decoration: BoxDecoration(
                    color: Colors.grey.withOpacity(0.3),
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),
              const SizedBox(height: 16),
              const Text(
                'ماسح باركود الدواء (Expiro AI Scanner)',
                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
              ),
              const SizedBox(height: 6),
              const Text(
                'وجّه الكاميرا نحو باركود عبوة الدواء للتعرف الفوري',
                style: TextStyle(fontSize: 12, color: Colors.grey),
              ),
              const SizedBox(height: 20),
              Container(
                width: double.infinity,
                height: 180,
                decoration: BoxDecoration(
                  color: Colors.black,
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: const Color(0xFF0D9488), width: 2),
                ),
                child: Stack(
                  alignment: Alignment.center,
                  children: [
                    const Icon(Icons.qr_code_scanner, color: Color(0xFF2DD4BF), size: 80),
                    Positioned(
                      bottom: 12,
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                        decoration: BoxDecoration(
                          color: Colors.black54,
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: const Text(
                          'جاري مسح الباركود...',
                          style: TextStyle(color: Colors.white70, fontSize: 11),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 20),
              const Text(
                'أو اختر باركود تجريبي للتعرف السريع:',
                style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 10),
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: [
                  ActionChip(
                    avatar: const Icon(Icons.qr_code, size: 16, color: Color(0xFF0F766E)),
                    label: const Text('أوجمنتين (6281001230012)'),
                    onPressed: () {
                      Navigator.pop(ctx);
                      _openAddEditMedicineModal(initialBarcode: '6281001230012');
                    },
                  ),
                  ActionChip(
                    avatar: const Icon(Icons.qr_code, size: 16, color: Color(0xFF0F766E)),
                    label: const Text('بانادول (6285000000018)'),
                    onPressed: () {
                      Navigator.pop(ctx);
                      _openAddEditMedicineModal(initialBarcode: '6285000000018');
                    },
                  ),
                  ActionChip(
                    avatar: const Icon(Icons.qr_code, size: 16, color: Color(0xFF0F766E)),
                    label: const Text('كونكور (6281100223344)'),
                    onPressed: () {
                      Navigator.pop(ctx);
                      _openAddEditMedicineModal(initialBarcode: '6281100223344');
                    },
                  ),
                ],
              ),
            ],
          ),
        );
      },
    );
  }

  // حذف دواء مع تأكيد
  void _confirmDeleteMedicine(Medicine med) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: const Text('حذف الصنف الدوائي', style: TextStyle(fontWeight: FontWeight.bold)),
        content: Text('هل أنت متأكد من رغبتك بحذف "${med.tradeName}" من سجل الصيدلية؟'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('إلغاء'),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFFE53935), foregroundColor: Colors.white),
            onPressed: () {
              setState(() {
                _medicines.removeWhere((m) => m.id == med.id);
              });
              Navigator.pop(ctx);
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(content: Text('تم حذف: ${med.tradeName}')),
              );
            },
            child: const Text('تأكيد الحذف'),
          ),
        ],
      ),
    );
  }

  // عرض محضر إتلاف رسمي
  void _showDisposalReport() {
    final expired = _medicines.where((m) => m.analysis.status == ExpiryStatus.expired).toList();
    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
        title: const Row(
          children: [
            Icon(Icons.assignment_late, color: Color(0xFFE53935)),
            SizedBox(width: 8),
            Text('محضر إتلاف رسمي فوري', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
          ],
        ),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('صيدلية: صيدلية الشفاء المركزية', style: TextStyle(fontWeight: FontWeight.bold)),
              const Text('المسؤول: د. أحمد الصيدلي'),
              Text('التاريخ: ${DateFormat('yyyy-MM-dd HH:mm').format(DateTime.now())}'),
              const Divider(height: 24),
              Text(
                'عدد الأدوية التالفة المنتهية: ${expired.length} صنف',
                style: const TextStyle(fontWeight: FontWeight.bold, color: Color(0xFFE53935)),
              ),
              const SizedBox(height: 8),
              if (expired.isEmpty)
                const Text('لا توجد أدوية تالفة تستوجب الإتلاف حالياً.')
              else
                ...expired.map((m) => Padding(
                      padding: const EdgeInsets.symmetric(vertical: 2),
                      child: Text('• ${m.tradeName} (${m.quantity} عبوة)'),
                    )),
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('إغلاق'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content: Text('تم توثيق وطباعة محضر الإتلاف الرسمي بنجاح'),
                  backgroundColor: Color(0xFF0F766E),
                ),
              );
            },
            style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF0F766E), foregroundColor: Colors.white),
            child: const Text('طباعة وتأكيد المحضر'),
          ),
        ],
      ),
    );
  }

  // ========================================================
  // الهايدر المطابق 100% للويب شوت (Exact 100px Header)
  // ========================================================
  Widget _buildExactHeader() {
    final isHome = _activeTab == 0;

    return Container(
      width: double.infinity,
      height: 105,
      padding: const EdgeInsets.only(top: 36, bottom: 8, left: 14, right: 14),
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          colors: [Color(0xFF0F766E), Color(0xFF0D9488)],
          begin: Alignment.centerRight,
          end: Alignment.centerLeft,
        ),
        borderRadius: BorderRadius.vertical(bottom: Radius.circular(26)),
      ),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          // الصف العلوي: الأيقونات ثابتة على اليمين واليسار
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              if (isHome) ...[
                // اليمين: أيقونة الصيدلية واسمها
                Row(
                  children: [
                    Container(
                      width: 32,
                      height: 32,
                      decoration: const BoxDecoration(
                        color: Colors.white,
                        shape: BoxShape.circle,
                      ),
                      alignment: Alignment.center,
                      child: const Text(
                        'ص',
                        style: TextStyle(
                          color: Color(0xFF0D9488),
                          fontWeight: FontWeight.w900,
                          fontSize: 14,
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),
                    const Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'مرحبا',
                          style: TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold),
                        ),
                        Text(
                          'صيدلية الشفاء المركزية',
                          style: TextStyle(color: Color(0xFFCCFBF1), fontSize: 10, fontWeight: FontWeight.w500),
                        ),
                      ],
                    ),
                  ],
                ),
                // اليسار: التنبيهات والوضع الليلي
                Row(
                  children: [
                    // زر التنبيهات
                    InkWell(
                      onTap: () {
                        setState(() {
                          _activeTab = 4; // صفحة التنبيهات
                        });
                      },
                      borderRadius: BorderRadius.circular(20),
                      child: Container(
                        width: 30,
                        height: 30,
                        decoration: BoxDecoration(
                          color: Colors.white.withOpacity(0.18),
                          shape: BoxShape.circle,
                          border: Border.all(color: Colors.white.withOpacity(0.25)),
                        ),
                        child: Stack(
                          alignment: Alignment.center,
                          children: [
                            const Icon(Icons.notifications_none, color: Colors.white, size: 17),
                            if (expiredCount + nearCount > 0)
                              Positioned(
                                top: 2,
                                left: 2,
                                child: Container(
                                  padding: const EdgeInsets.all(2),
                                  decoration: const BoxDecoration(
                                    color: Color(0xFFE53935),
                                    shape: BoxShape.circle,
                                  ),
                                  constraints: const BoxConstraints(minWidth: 12, minHeight: 12),
                                  alignment: Alignment.center,
                                  child: Text(
                                    '${expiredCount + nearCount}',
                                    style: const TextStyle(color: Colors.white, fontSize: 8, fontWeight: FontWeight.bold),
                                  ),
                                ),
                              ),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(width: 6),
                    // زر الوضع المظلم
                    InkWell(
                      onTap: widget.onToggleTheme,
                      borderRadius: BorderRadius.circular(20),
                      child: Container(
                        width: 30,
                        height: 30,
                        decoration: BoxDecoration(
                          color: Colors.white.withOpacity(0.18),
                          shape: BoxShape.circle,
                          border: Border.all(color: Colors.white.withOpacity(0.25)),
                        ),
                        child: Icon(
                          widget.isDarkMode ? Icons.wb_sunny_outlined : Icons.dark_mode_outlined,
                          color: Colors.white,
                          size: 16,
                        ),
                      ),
                    ),
                  ],
                ),
              ] else ...[
                // في التبويبات الأخرى: زر الرجوع
                InkWell(
                  onTap: () {
                    setState(() {
                      _activeTab = 0;
                    });
                  },
                  borderRadius: BorderRadius.circular(12),
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: const Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(Icons.arrow_forward_ios, size: 12, color: Color(0xFF0D9488)),
                        SizedBox(width: 4),
                        Text(
                          'رجوع',
                          style: TextStyle(color: Color(0xFF0D9488), fontWeight: FontWeight.bold, fontSize: 11),
                        ),
                      ],
                    ),
                  ),
                ),
                // أيقونة القسم
                Container(
                  width: 30,
                  height: 30,
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.18),
                    shape: BoxShape.circle,
                    border: Border.all(color: Colors.white.withOpacity(0.25)),
                  ),
                  child: Icon(
                    _activeTab == 1
                        ? Icons.trending_down
                        : _activeTab == 2
                            ? Icons.headset_mic
                            : _activeTab == 3
                                ? Icons.person
                                : Icons.notifications_active,
                    color: Colors.white,
                    size: 16,
                  ),
                ),
              ],
            ],
          ),

          // العنوان المنتصف
          Padding(
            padding: const EdgeInsets.only(bottom: 2),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  isHome
                      ? 'Expiro'
                      : _activeTab == 1
                          ? 'الخسائر'
                          : _activeTab == 2
                              ? 'الدعم الفني'
                              : _activeTab == 3
                                  ? 'حسابي'
                                  : 'التنبيهات',
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 16,
                    fontWeight: FontWeight.w900,
                    letterSpacing: 0.5,
                  ),
                ),
                if (isHome)
                  const Text(
                    'إدارة تواريخ صلاحية الأدوية',
                    style: TextStyle(color: Color(0xFFCCFBF1), fontSize: 9.5, fontWeight: FontWeight.w500),
                  ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  // ========================================================
  // بطاقات الإحصائيات الأربعة (KPIs)
  // ========================================================
  Widget _buildKPICards() {
    final isDark = widget.isDarkMode;
    final cardBg = isDark ? const Color(0xFF1E293B) : Colors.white;

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 12),
      child: Row(
        children: [
          // 1. الكل
          Expanded(
            child: _buildSingleKPI(
              title: 'الكل',
              count: totalCount,
              icon: Icons.layers_outlined,
              color: const Color(0xFF0D9488),
              isSelected: _statusFilter == 'ALL',
              onTap: () => setState(() => _statusFilter = 'ALL'),
              cardBg: cardBg,
            ),
          ),
          const SizedBox(width: 8),
          // 2. منتهية
          Expanded(
            child: _buildSingleKPI(
              title: 'منتهية',
              count: expiredCount,
              icon: Icons.cancel_outlined,
              color: const Color(0xFFE53935),
              isSelected: _statusFilter == 'EXPIRED',
              onTap: () => setState(() => _statusFilter = 'EXPIRED'),
              cardBg: cardBg,
            ),
          ),
          const SizedBox(width: 8),
          // 3. وشيكة
          Expanded(
            child: _buildSingleKPI(
              title: 'وشيكة',
              count: nearCount,
              icon: Icons.warning_amber_rounded,
              color: const Color(0xFFFB8C00),
              isSelected: _statusFilter == 'NEAR_EXPIRY',
              onTap: () => setState(() => _statusFilter = 'NEAR_EXPIRY'),
              cardBg: cardBg,
            ),
          ),
          const SizedBox(width: 8),
          // 4. صالحة
          Expanded(
            child: _buildSingleKPI(
              title: 'صالحة',
              count: validCount,
              icon: Icons.check_circle_outline,
              color: const Color(0xFF43A047),
              isSelected: _statusFilter == 'VALID',
              onTap: () => setState(() => _statusFilter = 'VALID'),
              cardBg: cardBg,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSingleKPI({
    required String title,
    required int count,
    required IconData icon,
    required Color color,
    required bool isSelected,
    required VoidCallback onTap,
    required Color cardBg,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(16),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 8),
        decoration: BoxDecoration(
          color: cardBg,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: isSelected ? color : const Color(0xFFE2E8F0),
            width: isSelected ? 2 : 1,
          ),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.02),
              blurRadius: 4,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  title,
                  style: TextStyle(
                    fontSize: 10.5,
                    fontWeight: FontWeight.bold,
                    color: widget.isDarkMode ? Colors.grey[400] : const Color(0xFF64748B),
                  ),
                ),
                Icon(icon, size: 14, color: color),
              ],
            ),
            const SizedBox(height: 4),
            Text(
              '$count',
              style: TextStyle(
                fontSize: 17,
                fontWeight: FontWeight.w900,
                color: color,
              ),
            ),
          ],
        ),
      ),
    );
  }

  // ========================================================
  // شريط البحث المدمج وزر ماسح الباركود
  // ========================================================
  Widget _buildSearchAndScanBar() {
    final isDark = widget.isDarkMode;
    final fillCol = isDark ? const Color(0xFF1E293B) : const Color(0xFFF8FAFC);
    final borderCol = isDark ? const Color(0xFF334155) : const Color(0xFFCBD5E1);

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 12),
      child: Row(
        children: [
          // حقل البحث
          Expanded(
            child: Container(
              height: 44,
              decoration: BoxDecoration(
                color: fillCol,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: borderCol),
              ),
              child: Row(
                children: [
                  const SizedBox(width: 10),
                  const Icon(Icons.search, color: Color(0xFF0D9488), size: 18),
                  const SizedBox(width: 6),
                  Expanded(
                    child: TextField(
                      controller: _searchController,
                      onChanged: (val) => setState(() => _searchQuery = val),
                      style: TextStyle(fontSize: 12, color: isDark ? Colors.white : const Color(0xFF0F172A)),
                      decoration: InputDecoration(
                        isDense: true,
                        hintText: 'ابحث بالاسم، الشركة، الفئة، أو الباركود...',
                        hintStyle: TextStyle(
                          fontSize: 11,
                          color: isDark ? Colors.grey[500] : const Color(0xFF64748B),
                        ),
                        border: InputBorder.none,
                      ),
                    ),
                  ),
                  if (_searchQuery.isNotEmpty)
                    InkWell(
                      onTap: () {
                        _searchController.clear();
                        setState(() => _searchQuery = '');
                      },
                      child: const Padding(
                        padding: EdgeInsets.symmetric(horizontal: 6),
                        child: Icon(Icons.close, size: 16, color: Colors.grey),
                      ),
                    ),
                ],
              ),
            ),
          ),
          const SizedBox(width: 8),
          // زر ماسح باركود
          InkWell(
            onTap: _openBarcodeScannerModal,
            borderRadius: BorderRadius.circular(14),
            child: Container(
              height: 44,
              padding: const EdgeInsets.symmetric(horizontal: 12),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFF0F766E), Color(0xFF0D9488)],
                ),
                borderRadius: BorderRadius.circular(14),
                boxShadow: [
                  BoxShadow(
                    color: const Color(0xFF0F766E).withOpacity(0.3),
                    blurRadius: 4,
                    offset: const Offset(0, 2),
                  ),
                ],
              ),
              child: const Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(Icons.qr_code_scanner, color: Colors.white, size: 16),
                  SizedBox(width: 5),
                  Text(
                    'ماسح باركود',
                    style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 11),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  // ========================================================
  // بطاقة الدواء المدمجة (Compact Medicine Card) المطابقة تماماً
  // ========================================================
  Widget _buildMedicineCard(Medicine med) {
    final a = med.analysis;
    final isDark = widget.isDarkMode;
    final cardBg = isDark ? const Color(0xFF1E293B) : const Color(0xFFFFFFFF);
    final textCol = isDark ? Colors.white : const Color(0xFF1E293B);

    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
      decoration: BoxDecoration(
        color: cardBg,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: const Color(0xFFE2E8F0)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.02),
            blurRadius: 6,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(18),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // الشريط الجانبي الملون على يمين البطاقة
            Container(
              width: 5,
              color: a.accentColor,
            ),
            // المحتوى الداخلي
            Expanded(
              child: Padding(
                padding: const EdgeInsets.all(10),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // الصف 1: الاسم التجاري + شارة الحالة
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Expanded(
                          child: Text(
                            med.tradeName,
                            style: TextStyle(
                              fontSize: 12.5,
                              fontWeight: FontWeight.w900,
                              color: textCol,
                            ),
                          ),
                        ),
                        const SizedBox(width: 6),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2.5),
                          decoration: BoxDecoration(
                            color: a.badgeBg,
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(color: a.badgeBorderColor),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Icon(
                                a.status == ExpiryStatus.expired
                                    ? Icons.cancel
                                    : a.status == ExpiryStatus.nearExpiry
                                        ? Icons.warning_amber_rounded
                                        : Icons.check_circle,
                                size: 11,
                                color: a.badgeTextColor,
                              ),
                              const SizedBox(width: 3),
                              Text(
                                a.badgeText,
                                style: TextStyle(
                                  fontSize: 9.5,
                                  fontWeight: FontWeight.bold,
                                  color: a.badgeTextColor,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 4),

                    // الصف 2: الاسم العلمي + تاريخ الصلاحية
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Expanded(
                          child: Text(
                            med.scientificName.isEmpty ? 'صنف دوائي عام' : med.scientificName,
                            style: TextStyle(
                              fontSize: 10.5,
                              fontWeight: FontWeight.w500,
                              color: isDark ? Colors.grey[400] : const Color(0xFF64748B),
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                        const SizedBox(width: 6),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                          decoration: BoxDecoration(
                            color: isDark ? const Color(0xFF0F172A) : const Color(0xFFF1F5F9),
                            borderRadius: BorderRadius.circular(8),
                            border: Border.all(color: const Color(0xFFE2E8F0)),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              const Icon(Icons.calendar_today, size: 10, color: Color(0xFF64748B)),
                              const SizedBox(width: 4),
                              Text(
                                DateFormat('yyyy-MM-dd').format(med.expiryDate),
                                style: TextStyle(
                                  fontSize: 10,
                                  fontWeight: FontWeight.bold,
                                  fontFamily: 'monospace',
                                  color: a.accentColor,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 6),
                    const Divider(height: 1, color: Color(0xFFF1F5F9)),
                    const SizedBox(height: 6),

                    // الصف 3: الشرائح (الشركة، الفئة، الباركود) + أزرار التعديل والحذف
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Expanded(
                          child: Wrap(
                            spacing: 4,
                            runSpacing: 4,
                            children: [
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 1.5),
                                decoration: BoxDecoration(
                                  color: isDark ? const Color(0xFF0F172A) : const Color(0xFFE2E8F0).withOpacity(0.8),
                                  borderRadius: BorderRadius.circular(6),
                                ),
                                child: Text(
                                  med.companyName,
                                  style: TextStyle(
                                    fontSize: 9,
                                    fontWeight: FontWeight.w500,
                                    color: isDark ? Colors.grey[300] : const Color(0xFF334155),
                                  ),
                                ),
                              ),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 1.5),
                                decoration: BoxDecoration(
                                  color: isDark ? const Color(0xFF042F2E) : const Color(0xFFCCFBF1),
                                  borderRadius: BorderRadius.circular(6),
                                ),
                                child: Text(
                                  med.category,
                                  style: TextStyle(
                                    fontSize: 9,
                                    fontWeight: FontWeight.bold,
                                    color: isDark ? const Color(0xFF5EEAD4) : const Color(0xFF0F766E),
                                  ),
                                ),
                              ),
                              if (med.barcode.isNotEmpty)
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 1.5),
                                  decoration: BoxDecoration(
                                    color: isDark ? const Color(0xFF0F172A) : const Color(0xFFE2E8F0).withOpacity(0.8),
                                    borderRadius: BorderRadius.circular(6),
                                  ),
                                  child: Row(
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      const Icon(Icons.qr_code, size: 9, color: Color(0xFF64748B)),
                                      const SizedBox(width: 2),
                                      Text(
                                        med.barcode,
                                        style: TextStyle(
                                          fontSize: 8.5,
                                          fontFamily: 'monospace',
                                          color: isDark ? Colors.grey[400] : const Color(0xFF475569),
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                            ],
                          ),
                        ),
                        Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            InkWell(
                              onTap: () => _openAddEditMedicineModal(medicineToEdit: med),
                              borderRadius: BorderRadius.circular(8),
                              child: const Padding(
                                padding: EdgeInsets.all(4),
                                child: Icon(Icons.edit_outlined, size: 15, color: Color(0xFF0D9488)),
                              ),
                            ),
                            const SizedBox(width: 2),
                            InkWell(
                              onTap: () => _confirmDeleteMedicine(med),
                              borderRadius: BorderRadius.circular(8),
                              child: const Padding(
                                padding: EdgeInsets.all(4),
                                child: Icon(Icons.delete_outline, size: 15, color: Color(0xFFE53935)),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  // ========================================================
  // محتوى التبويبات الأخرى (الخسائر، الدعم، حسابي، التنبيهات)
  // ========================================================

  Widget _buildLossesView() {
    final expired = _medicines.where((m) => m.analysis.status == ExpiryStatus.expired).toList();
    final near = _medicines.where((m) => m.analysis.status == ExpiryStatus.nearExpiry).toList();

    return Padding(
      padding: const EdgeInsets.all(12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: widget.isDarkMode ? const Color(0xFF1E293B) : Colors.white,
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: const Color(0xFFE2E8F0)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Row(
                  children: [
                    Icon(Icons.trending_down, color: Color(0xFFE53935), size: 20),
                    SizedBox(width: 8),
                    Text('إحصائيات الخسائر والمخاطر', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                  ],
                ),
                const SizedBox(height: 4),
                const Text(
                  'تتبع مفصل للأدوية التالفة والحرجة لتجنب الهدر المالي',
                  style: TextStyle(fontSize: 10.5, color: Colors.grey),
                ),
                const SizedBox(height: 12),
                Row(
                  children: [
                    Expanded(
                      child: Container(
                        padding: const EdgeInsets.all(10),
                        decoration: BoxDecoration(
                          color: const Color(0xFFFEF2F2),
                          borderRadius: BorderRadius.circular(14),
                          border: Border.all(color: const Color(0xFFFECACA)),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text('أدوية تالفة (منتهية)', style: TextStyle(color: Color(0xFFE53935), fontSize: 10, fontWeight: FontWeight.bold)),
                            Text('$expiredCount', style: const TextStyle(color: Color(0xFFE53935), fontSize: 20, fontWeight: FontWeight.w900)),
                            const Text('عبوة ملزمة بالإتلاف', style: TextStyle(color: Color(0xFFE53935), fontSize: 9)),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Container(
                        padding: const EdgeInsets.all(10),
                        decoration: BoxDecoration(
                          color: const Color(0xFFFFFBEB),
                          borderRadius: BorderRadius.circular(14),
                          border: Border.all(color: const Color(0xFFFDE68A)),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text('أدوية وشيكة (حرجة)', style: TextStyle(color: Color(0xFFFB8C00), fontSize: 10, fontWeight: FontWeight.bold)),
                            Text('$nearCount', style: const TextStyle(color: Color(0xFFFB8C00), fontSize: 20, fontWeight: FontWeight.w900)),
                            const Text('تحتاج تصريف سريع', style: TextStyle(color: Color(0xFFFB8C00), fontSize: 9)),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                ElevatedButton.icon(
                  onPressed: _showDisposalReport,
                  icon: const Icon(Icons.assignment, size: 16),
                  label: const Text('إصدار محضر إتلاف رسمي فوري', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF0F766E),
                    foregroundColor: Colors.white,
                    minimumSize: const Size.fromHeight(40),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 12),
          Text(
            'الأدوية المتأثرة بالخسائر (${expired.length + near.length})',
            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12),
          ),
          const SizedBox(height: 8),
          Expanded(
            child: ListView(
              children: [
                ...expired.map(_buildMedicineCard),
                ...near.map(_buildMedicineCard),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSupportView() {
    return Padding(
      padding: const EdgeInsets.all(16),
      child: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: widget.isDarkMode ? const Color(0xFF1E293B) : Colors.white,
              borderRadius: BorderRadius.circular(24),
              border: Border.all(color: const Color(0xFFE2E8F0)),
            ),
            child: Column(
              children: [
                Container(
                  width: 50,
                  height: 50,
                  decoration: const BoxDecoration(
                    color: Color(0xFFCCFBF1),
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(Icons.headset_mic, color: Color(0xFF0F766E), size: 26),
                ),
                const SizedBox(height: 12),
                const Text(
                  'مركز الدعم الفني لصيادلة Expiro',
                  style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                ),
                const SizedBox(height: 4),
                const Text(
                  'فريقنا متواجد 24/7 لخدمتكم ومساعدتكم في تنظيم مستودعات الصيدلية',
                  textAlign: TextAlign.center,
                  style: TextStyle(fontSize: 11, color: Colors.grey),
                ),
                const SizedBox(height: 16),
                ListTile(
                  leading: const Icon(Icons.phone, color: Color(0xFF0F766E)),
                  title: const Text('الخط الساخن المباشر', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                  subtitle: const Text('07701234567', style: TextStyle(fontSize: 11)),
                  trailing: const Icon(Icons.arrow_forward_ios, size: 12),
                  onTap: () {},
                ),
                const Divider(),
                ListTile(
                  leading: const Icon(Icons.chat, color: Color(0xFF0F766E)),
                  title: const Text('محادثة واتساب الفورية', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                  subtitle: const Text('دعم فني سريع', style: TextStyle(fontSize: 11)),
                  trailing: const Icon(Icons.arrow_forward_ios, size: 12),
                  onTap: () {},
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildProfileView() {
    return Padding(
      padding: const EdgeInsets.all(16),
      child: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: widget.isDarkMode ? const Color(0xFF1E293B) : Colors.white,
              borderRadius: BorderRadius.circular(24),
              border: Border.all(color: const Color(0xFFE2E8F0)),
            ),
            child: Column(
              children: [
                Row(
                  children: [
                    Container(
                      width: 50,
                      height: 50,
                      decoration: const BoxDecoration(
                        gradient: LinearGradient(colors: [Color(0xFF0F766E), Color(0xFF0D9488)]),
                        shape: BoxShape.circle,
                      ),
                      alignment: Alignment.center,
                      child: const Text('ص', style: TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold)),
                    ),
                    const SizedBox(width: 12),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('صيدلية الشفاء المركزية', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                        const Text('د. أحمد الصيدلي (مدير الصيدلية)', style: TextStyle(fontSize: 11, color: Colors.grey)),
                        Container(
                          margin: const EdgeInsets.only(top: 4),
                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 1),
                          decoration: BoxDecoration(
                            color: const Color(0xFFCCFBF1),
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: const Text('مرخص رسمياً', style: TextStyle(color: Color(0xFF0F766E), fontSize: 9, fontWeight: FontWeight.bold)),
                        ),
                      ],
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                const Divider(),
                SwitchListTile(
                  title: const Text('الوضع المظلم (Dark Mode)', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                  value: widget.isDarkMode,
                  activeColor: const Color(0xFF0D9488),
                  onChanged: (val) => widget.onToggleTheme(),
                ),
                SwitchListTile(
                  title: const Text('المؤثرات الصوتية', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                  value: _soundEnabled,
                  activeColor: const Color(0xFF0D9488),
                  onChanged: (val) => setState(() => _soundEnabled = val),
                ),
                ListTile(
                  title: const Text('تبديل الصلاحية (تجريبي)', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                  subtitle: Text(_userRole == 'admin' ? 'الصلاحية: مدير الصيدلية' : 'الصلاحية: موظف كادر', style: const TextStyle(fontSize: 10)),
                  trailing: ElevatedButton(
                    onPressed: () {
                      setState(() {
                        _userRole = _userRole == 'admin' ? 'staff' : 'admin';
                      });
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF0D9488),
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    ),
                    child: Text(_userRole == 'admin' ? 'تبديل لموظف' : 'تبديل لمدير', style: const TextStyle(fontSize: 10)),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildNotificationsView() {
    final alertList = _medicines.where((m) => m.analysis.status != ExpiryStatus.valid).toList();

    return Padding(
      padding: const EdgeInsets.all(12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('كافة التنبيهات النشطة (${alertList.length})', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
          const SizedBox(height: 8),
          Expanded(
            child: alertList.isEmpty
                ? const Center(child: Text('لا توجد تنبيهات حالياً.'))
                : ListView(
                    children: alertList.map(_buildMedicineCard).toList(),
                  ),
          ),
        ],
      ),
    );
  }

  // ========================================================
  // شريط التنقل السفلي مع الزر البارز بالمنتصف (+)
  // ========================================================
  Widget _buildBottomNavigationBar() {
    final isDark = widget.isDarkMode;
    final navBg = isDark ? const Color(0xFF0F172A) : const Color(0xFFF1F5F9);

    return Container(
      decoration: BoxDecoration(
        color: navBg,
        border: Border(top: BorderSide(color: navBg)),
      ),
      padding: const EdgeInsets.only(top: 6, bottom: 12, left: 8, right: 8),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceAround,
        children: [
          // 1. الرئيسية
          _buildNavTab(index: 0, label: 'الرئيسية', icon: Icons.home_rounded),

          // 2. الخسائر
          _buildNavTab(index: 1, label: 'الخسائر', icon: Icons.trending_down, badgeCount: expiredCount),

          // 3. زر الإضافة (+) البارز بالمنتصف
          Transform.translate(
            offset: const Offset(0, -10),
            child: InkWell(
              onTap: () => _openAddEditMedicineModal(),
              borderRadius: BorderRadius.circular(30),
              child: Container(
                width: 48,
                height: 48,
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [Color(0xFF0F766E), Color(0xFF0D9488)],
                  ),
                  shape: BoxShape.circle,
                  boxShadow: [
                    BoxShadow(
                      color: const Color(0xFF0F766E).withOpacity(0.4),
                      blurRadius: 8,
                      offset: const Offset(0, 3),
                    ),
                  ],
                ),
                child: const Icon(Icons.add, color: Colors.white, size: 28),
              ),
            ),
          ),

          // 4. الدعم
          _buildNavTab(index: 2, label: 'الدعم', icon: Icons.headset_mic_rounded),

          // 5. حسابي
          _buildNavTab(index: 3, label: 'حسابي', icon: Icons.person_rounded),
        ],
      ),
    );
  }

  Widget _buildNavTab({
    required int index,
    required String label,
    required IconData icon,
    int? badgeCount,
  }) {
    final isSelected = _activeTab == index;
    final activeCol = const Color(0xFF0D9488);
    final inactiveCol = widget.isDarkMode ? Colors.grey[400] : const Color(0xFF1E293B);

    return InkWell(
      onTap: () => setState(() => _activeTab = index),
      borderRadius: BorderRadius.circular(12),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Stack(
              clipBehavior: Clip.none,
              children: [
                Icon(
                  icon,
                  size: 22,
                  color: isSelected ? activeCol : inactiveCol,
                ),
                if (badgeCount != null && badgeCount > 0)
                  Positioned(
                    top: -4,
                    right: -6,
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 1),
                      decoration: BoxDecoration(
                        color: const Color(0xFFE53935),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      constraints: const BoxConstraints(minWidth: 14, minHeight: 14),
                      child: Text(
                        '$badgeCount',
                        textAlign: TextAlign.center,
                        style: const TextStyle(color: Colors.white, fontSize: 8, fontWeight: FontWeight.bold),
                      ),
                    ),
                  ),
              ],
            ),
            const SizedBox(height: 2),
            Text(
              label,
              style: TextStyle(
                fontSize: 10,
                fontWeight: isSelected ? FontWeight.w900 : FontWeight.bold,
                color: isSelected ? activeCol : inactiveCol,
              ),
            ),
            if (isSelected)
              Container(
                margin: const EdgeInsets.only(top: 2),
                width: 4,
                height: 4,
                decoration: BoxDecoration(
                  color: activeCol,
                  shape: BoxShape.circle,
                ),
              ),
          ],
        ),
      ),
    );
  }

  // ========================================================
  // البناء الكلي للواجهة (Build)
  // ========================================================
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        top: false,
        child: Column(
          children: [
            // الهايدر العلوي المتطابق
            _buildExactHeader(),

            // المحتوى بناءً على التبويب النشط
            Expanded(
              child: _activeTab == 0
                  ? RefreshIndicator(
                      color: const Color(0xFF0D9488),
                      onRefresh: () async {
                        await Future.delayed(const Duration(milliseconds: 700));
                        setState(() {});
                      },
                      child: ListView(
                        padding: const EdgeInsets.only(top: 10, bottom: 20),
                        children: [
                          // 1. بطاقات الإحصائيات (KPIs)
                          _buildKPICards(),
                          const SizedBox(height: 10),

                          // 2. شريط البحث المدمج والماسح
                          _buildSearchAndScanBar(),
                          const SizedBox(height: 8),

                          // 3. قائمة الأدوية
                          if (filteredMedicines.isEmpty)
                            Padding(
                              padding: const EdgeInsets.all(32),
                              child: Column(
                                children: [
                                  Icon(Icons.inventory_2_outlined, size: 48, color: Colors.grey[400]),
                                  const SizedBox(height: 8),
                                  const Text(
                                    'لا توجد أدوية مطابقة للبحث أو الفلتر',
                                    style: TextStyle(fontWeight: FontWeight.bold, color: Colors.grey),
                                  ),
                                ],
                              ),
                            )
                          else
                            ...filteredMedicines.map(_buildMedicineCard),
                        ],
                      ),
                    )
                  : _activeTab == 1
                      ? _buildLossesView()
                      : _activeTab == 2
                          ? _buildSupportView()
                          : _activeTab == 3
                              ? _buildProfileView()
                              : _buildNotificationsView(),
            ),

            // شريط التنقل السفلي المطابق
            _buildBottomNavigationBar(),
          ],
        ),
      ),
    );
  }
}
