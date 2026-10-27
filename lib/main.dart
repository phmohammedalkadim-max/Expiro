import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:intl/intl.dart' show DateFormat;


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
  bool _showSplash = true;
  bool _isAdminDashboard = false;
  bool _isAuthenticated = false;
  Map<String, dynamic>? _currentUser;

  void toggleTheme() {
    setState(() {
      _isDarkMode = !_isDarkMode;
    });
  }

  void toggleView(bool showAdmin) {
    setState(() {
      _isAdminDashboard = showAdmin;
      _showSplash = false;
    });
  }

  void hideSplash() {
    setState(() {
      _showSplash = false;
    });
  }

  void showSplashAgain() {
    setState(() {
      _showSplash = true;
    });
  }

  void handleLogin(Map<String, dynamic> user) {
    setState(() {
      _currentUser = user;
      _isAuthenticated = true;
      _isAdminDashboard = user['role'] == 'admin';
      _showSplash = false;
    });
  }

  void handleLogout() {
    setState(() {
      _isAuthenticated = false;
      _currentUser = null;
      _isAdminDashboard = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Expiro - نظام إدارة صلاحيات الأدوية',
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
        scaffoldBackgroundColor: const Color(0xFFF8FAFC),
        fontFamily: 'Roboto',
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF0F766E),
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
        fontFamily: 'Roboto',
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF0D9488),
          primary: const Color(0xFF14B8A6),
          secondary: const Color(0xFF0D9488),
          surface: const Color(0xFF1E293B),
          brightness: Brightness.dark,
        ),
      ),
      home: _showSplash
          ? SplashScreenWidget(
              onEnter: hideSplash,
              isDarkMode: _isDarkMode,
            )
          : !_isAuthenticated
              ? AuthScreenWidget(
                  isDarkMode: _isDarkMode,
                  onLoginSuccess: handleLogin,
                )
              : _isAdminDashboard
                  ? AdminDashboardWidget(
                      isDarkMode: _isDarkMode,
                      onToggleTheme: toggleTheme,
                      onBackToApp: () => toggleView(false),
                      onLogout: handleLogout,
                    )
                  : MainScreen(
                      isDarkMode: _isDarkMode,
                      onToggleTheme: toggleTheme,
                      onShowAdmin: () => toggleView(true),
                      onShowSplash: showSplashAgain,
                      onLogout: handleLogout,
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
  final String statusText;
  final Color statusColor;
  final Color bgColor;

  const MedicineAnalysis({
    required this.status,
    required this.daysRemaining,
    required this.statusText,
    required this.statusColor,
    required this.bgColor,
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
    required this.alertThresholdDays,
    required this.quantity,
    this.notes = '',
  });

  MedicineAnalysis analyze() {
    final now = DateTime.now();
    final today = DateTime(now.year, now.month, now.day);
    final exp = DateTime(expiryDate.year, expiryDate.month, expiryDate.day);
    final daysRemaining = exp.difference(today).inDays;

    if (daysRemaining <= 0) {
      final daysAgo = daysRemaining.abs();
      return MedicineAnalysis(
        status: ExpiryStatus.expired,
        daysRemaining: daysRemaining,
        statusText: daysAgo == 0 ? 'منتهي اليوم' : 'منتهي ($daysAgo يوم)',
        statusColor: const Color(0xFFE53935),
        bgColor: const Color(0xFFFFEBEE),
      );
    } else if (daysRemaining <= alertThresholdDays) {
      return MedicineAnalysis(
        status: ExpiryStatus.nearExpiry,
        daysRemaining: daysRemaining,
        statusText: 'وشيك ($daysRemaining يوم)',
        statusColor: const Color(0xFFF59E0B),
        bgColor: const Color(0xFFFFFBEB),
      );
    } else {
      return MedicineAnalysis(
        status: ExpiryStatus.valid,
        daysRemaining: daysRemaining,
        statusText: 'صالح للاستخدام',
        statusColor: const Color(0xFF10B981),
        bgColor: const Color(0xFFECFDF5),
      );
    }
  }
}

// ==========================================
// 2. شاشة الترحيب الافتتاحية (Splash Screen)
// ==========================================
class SplashScreenWidget extends StatefulWidget {
  final VoidCallback onEnter;
  final bool isDarkMode;

  const SplashScreenWidget({
    super.key,
    required this.onEnter,
    required this.isDarkMode,
  });

  @override
  State<SplashScreenWidget> createState() => _SplashScreenWidgetState();
}

class _SplashScreenWidgetState extends State<SplashScreenWidget>
    with SingleTickerProviderStateMixin {
  late AnimationController _animCtrl;
  late Animation<double> _scaleAnim;
  late Animation<double> _fadeAnim;

  @override
  void initState() {
    super.initState();
    _animCtrl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1400),
    );
    _scaleAnim = Tween<double>(begin: 0.85, end: 1.0).animate(
      CurvedAnimation(parent: _animCtrl, curve: Curves.easeOutBack),
    );
    _fadeAnim = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(parent: _animCtrl, curve: Curves.easeIn),
    );
    _animCtrl.forward();

    // الانتقال التلقائي لشاشة تسجيل الدخول وإنشاء الحساب بعد 3 ثوانٍ بالضبط
    Future.delayed(const Duration(seconds: 3), () {
      if (mounted) {
        widget.onEnter();
      }
    });
  }

  @override
  void dispose() {
    _animCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        width: double.infinity,
        height: double.infinity,
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [Color(0xFF003833), Color(0xFF012320)],
          ),
        ),
        child: SafeArea(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Spacer(),
              // شعار Expiro ثلاثي الأبعاد
              ScaleTransition(
                scale: _scaleAnim,
                child: FadeTransition(
                  opacity: _fadeAnim,
                  child: Container(
                    width: 170,
                    height: 170,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      boxShadow: [
                        BoxShadow(
                          color: const Color(0xFF0D9488).withOpacity(0.3),
                          blurRadius: 40,
                          spreadRadius: 10,
                        ),
                      ],
                    ),
                    child: Image.asset(
                      'public/assets/expiro_icon.png',
                      errorBuilder: (context, error, stackTrace) =>
                          _buildStylizedHourglass(),
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 28),
              // اسم التطبيق الرسمي
              FadeTransition(
                opacity: _fadeAnim,
                child: Column(
                  children: [
                    const Text(
                      'Expiro',
                      style: TextStyle(
                        fontSize: 36,
                        fontWeight: FontWeight.w900,
                        color: Colors.white,
                        letterSpacing: 1.2,
                      ),
                    ),
                    const SizedBox(height: 6),
                    Text(
                      'نظام إدارة صلاحيات الأدوية الصيدلانية',
                      style: TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                        color: const Color(0xFF5EEAD4).withOpacity(0.9),
                      ),
                    ),
                  ],
                ),
              ),
              const Spacer(),
              // زر الدخول التفاعلي
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 40),
                child: InkWell(
                  onTap: widget.onEnter,
                  borderRadius: BorderRadius.circular(30),
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
                    decoration: BoxDecoration(
                      color: Colors.white.withOpacity(0.12),
                      borderRadius: BorderRadius.circular(30),
                      border: Border.all(color: Colors.white.withOpacity(0.25)),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withOpacity(0.2),
                          blurRadius: 12,
                          offset: const Offset(0, 4),
                        ),
                      ],
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Container(
                          width: 8,
                          height: 8,
                          decoration: const BoxDecoration(
                            color: Color(0xFF14B8A6),
                            shape: BoxShape.circle,
                          ),
                        ),
                        const SizedBox(width: 10),
                        const Text(
                          'أهلاً بك في Expiro',
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 14,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 20),
              // مؤشر تحضير الصيدلية
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Container(
                    width: 6,
                    height: 6,
                    decoration: const BoxDecoration(
                      color: Color(0xFF2DD4BF),
                      shape: BoxShape.circle,
                    ),
                  ),
                  const SizedBox(width: 4),
                  Container(
                    width: 6,
                    height: 6,
                    decoration: BoxDecoration(
                      color: const Color(0xFF2DD4BF).withOpacity(0.6),
                      shape: BoxShape.circle,
                    ),
                  ),
                  const SizedBox(width: 4),
                  Container(
                    width: 6,
                    height: 6,
                    decoration: BoxDecoration(
                      color: const Color(0xFF2DD4BF).withOpacity(0.3),
                      shape: BoxShape.circle,
                    ),
                  ),
                  const SizedBox(width: 8),
                  Text(
                    'جاري تحضير صيدليتك...',
                    style: TextStyle(
                      fontSize: 11,
                      color: Colors.white.withOpacity(0.7),
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 32),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildStylizedHourglass() {
    return Container(
      decoration: BoxDecoration(
        color: const Color(0xFF0F766E),
        shape: BoxShape.circle,
        border: Border.all(color: const Color(0xFF2DD4BF), width: 3),
      ),
      child: const Center(
        child: Icon(Icons.hourglass_top_rounded, size: 70, color: Colors.white),
      ),
    );
  }
}

// ==========================================
// 2.5 شاشة تسجيل الدخول وإنشاء الحساب والمصادقة (AuthScreenWidget)
// ==========================================
class AuthScreenWidget extends StatefulWidget {
  final bool isDarkMode;
  final Function(Map<String, dynamic> user) onLoginSuccess;

  const AuthScreenWidget({
    super.key,
    required this.isDarkMode,
    required this.onLoginSuccess,
  });

  @override
  State<AuthScreenWidget> createState() => _AuthScreenWidgetState();
}

class _AuthScreenWidgetState extends State<AuthScreenWidget> {
  bool _isLoginMode = true; // true = تسجيل الدخول, false = إنشاء حساب جديد
  final _phoneCtrl = TextEditingController();
  final _passwordCtrl = TextEditingController();
  final _nameCtrl = TextEditingController();
  final _pharmacyCtrl = TextEditingController();
  bool _obscurePassword = true;
  bool _isLoading = false;
  String? _errorMessage;
  String? _successMessage;

  @override
  void dispose() {
    _phoneCtrl.dispose();
    _passwordCtrl.dispose();
    _nameCtrl.dispose();
    _pharmacyCtrl.dispose();
    super.dispose();
  }

  bool _isOwnerAdmin(String phone) {
    final clean = phone.replaceAll(RegExp(r'[\s\-\+\(\)]'), '');
    return clean == '07829692579' || clean.contains('7829692579');
  }

  void _showForgotPasswordDialog() {
    final forgotPhoneCtrl = TextEditingController(text: _phoneCtrl.text.trim());
    final newPassCtrl = TextEditingController();
    final codeCtrl = TextEditingController();
    int step = 1; // 1: phone, 2: verify sms, 3: new password
    String generatedCode = '';

    showDialog(
      context: context,
      builder: (dialogCtx) => StatefulBuilder(
        builder: (context, setDialogState) {
          final isDark = widget.isDarkMode;
          return AlertDialog(
            backgroundColor: isDark ? const Color(0xFF1E293B) : Colors.white,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
            title: Row(
              mainAxisAlignment: MainAxisAlignment.end,
              children: [
                Text(
                  'استعادة كلمة المرور',
                  style: TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 14,
                    color: isDark ? Colors.white : const Color(0xFF0F172A),
                  ),
                ),
                const SizedBox(width: 8),
                const Icon(Icons.key_rounded, color: Color(0xFF0D9488), size: 20),
              ],
            ),
            content: SingleChildScrollView(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  if (step == 1) ...[
                    Text(
                      'أدخل رقم هاتفك المسجل لتلقي رمز التحقق السريع عبر رسالة نصية SMS (يعمل للمالك والصيادلة):',
                      textAlign: TextAlign.right,
                      style: TextStyle(
                        fontSize: 11,
                        color: isDark ? Colors.slate[300] : Colors.grey[700],
                      ),
                    ),
                    const SizedBox(height: 12),
                    TextField(
                      controller: forgotPhoneCtrl,
                      keyboardType: TextInputType.phone,
                      textAlign: TextAlign.left,
                      decoration: InputDecoration(
                        labelText: 'رقم الهاتف',
                        hintText: '07829692579',
                        prefixIcon: const Icon(Icons.phone_android_rounded, size: 18),
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                    ),
                  ] else if (step == 2) ...[
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: const Color(0xFF0D9488).withOpacity(0.12),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Column(
                        children: [
                          const Text(
                            'تم إرسال رمز التحقق عبر SMS',
                            style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            generatedCode,
                            style: const TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.w900,
                              letterSpacing: 4,
                              color: Color(0xFF0D9488),
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 12),
                    TextField(
                      controller: codeCtrl,
                      keyboardType: TextInputType.number,
                      textAlign: TextAlign.center,
                      decoration: InputDecoration(
                        labelText: 'أدخل رمز التحقق (6 أرقام)',
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                    ),
                  ] else ...[
                    const Text(
                      'تم تأكيد الرمز بنجاح! أدخل كلمة المرور الجديدة لحسابك:',
                      textAlign: TextAlign.right,
                      style: TextStyle(fontSize: 11, color: Colors.green, fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: 12),
                    TextField(
                      controller: newPassCtrl,
                      obscureText: true,
                      decoration: InputDecoration(
                        labelText: 'كلمة المرور الجديدة',
                        prefixIcon: const Icon(Icons.lock_reset_rounded, size: 18),
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                    ),
                  ],
                ],
              ),
            ),
            actions: [
              TextButton(
                onPressed: () => Navigator.pop(dialogCtx),
                child: const Text('إلغاء'),
              ),
              ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF0F766E),
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
                onPressed: () {
                  if (step == 1) {
                    final p = forgotPhoneCtrl.text.trim();
                    if (p.isEmpty) return;
                    setDialogState(() {
                      generatedCode = (100000 + (DateTime.now().millisecondsSinceEpoch % 900000)).toString();
                      step = 2;
                    });
                  } else if (step == 2) {
                    if (codeCtrl.text.trim() == generatedCode) {
                      setDialogState(() {
                        step = 3;
                      });
                    } else {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('رمز التحقق غير صحيح')),
                      );
                    }
                  } else if (step == 3) {
                    final newPass = newPassCtrl.text.trim();
                    if (newPass.length < 4) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('كلمة المرور يجب أن لا تقل عن 4 أحرف')),
                      );
                      return;
                    }
                    Navigator.pop(dialogCtx);
                    setState(() {
                      _passwordCtrl.text = newPass;
                      _phoneCtrl.text = forgotPhoneCtrl.text.trim();
                      _successMessage = 'تم تعيين كلمة المرور الجديدة بنجاح! يمكنك الآن تسجيل الدخول.';
                    });
                  }
                },
                child: Text(step == 3 ? 'حفظ كلمة المرور' : (step == 2 ? 'تأكيد الرمز' : 'إرسال الرمز SMS')),
              ),
            ],
          );
        },
      ),
    );
  }

  void _handleLogin() {
    final phone = _phoneCtrl.text.trim();
    final pass = _passwordCtrl.text.trim();

    setState(() {
      _errorMessage = null;
      _successMessage = null;
    });

    if (phone.isEmpty || pass.isEmpty) {
      setState(() {
        _errorMessage = 'يرجى إدخال رقم الهاتف وكلمة المرور';
      });
      return;
    }

    setState(() => _isLoading = true);

    Future.delayed(const Duration(milliseconds: 600), () {
      if (!mounted) return;
      setState(() => _isLoading = false);

      final isOwner = _isOwnerAdmin(phone);
      final user = {
        'id': phone,
        'fullName': isOwner ? 'مالك التطبيق (Admin)' : 'د. صيدلي',
        'pharmacyName': isOwner ? 'إدارة نظام Expiro المركزية' : 'صيدلية الأمل',
        'phone': phone,
        'role': isOwner ? 'admin' : 'pharmacist',
      };

      widget.onLoginSuccess(user);
    });
  }

  void _handleRegister() {
    final name = _nameCtrl.text.trim();
    final pharmacy = _pharmacyCtrl.text.trim();
    final phone = _phoneCtrl.text.trim();
    final pass = _passwordCtrl.text.trim();

    setState(() {
      _errorMessage = null;
      _successMessage = null;
    });

    if (name.isEmpty || phone.isEmpty || pass.isEmpty) {
      setState(() {
        _errorMessage = 'يرجى ملء الاسم، رقم الهاتف، وكلمة المرور';
      });
      return;
    }

    if (pass.length < 4) {
      setState(() {
        _errorMessage = 'كلمة المرور يجب أن لا تقل عن 4 خانات';
      });
      return;
    }

    if (_isOwnerAdmin(phone)) {
      setState(() {
        _errorMessage = 'هذا الرقم مخصص لمالك النظام، يرجى الانتقال إلى تسجيل الدخول';
      });
      return;
    }

    setState(() => _isLoading = true);

    Future.delayed(const Duration(milliseconds: 700), () {
      if (!mounted) return;
      setState(() {
        _isLoading = false;
        _successMessage = 'تم إنشاء حساب الصيدلية بنجاح! جاري تحويلك لواجهة الصيدلية...';
      });

      Future.delayed(const Duration(milliseconds: 500), () {
        if (!mounted) return;
        final user = {
          'id': phone,
          'fullName': name,
          'pharmacyName': pharmacy.isNotEmpty ? pharmacy : 'صيدلية $name',
          'phone': phone,
          'role': 'pharmacist',
        };
        widget.onLoginSuccess(user);
      });
    });
  }

  @override
  Widget build(BuildContext context) {
    final isDark = widget.isDarkMode;
    final isOwner = _isOwnerAdmin(_phoneCtrl.text);

    return Scaffold(
      backgroundColor: isDark ? const Color(0xFF0F172A) : const Color(0xFFF1F5F9),
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(20),
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 420),
              child: Container(
                decoration: BoxDecoration(
                  color: isDark ? const Color(0xFF1E293B) : Colors.white,
                  borderRadius: BorderRadius.circular(28),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.08),
                      blurRadius: 20,
                      offset: const Offset(0, 8),
                    ),
                  ],
                ),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    // ترويسة التطبيق الخضراء الزمردية
                    Container(
                      padding: const EdgeInsets.symmetric(vertical: 24, horizontal: 16),
                      decoration: const BoxDecoration(
                        gradient: LinearGradient(
                          colors: [Color(0xFF0F766E), Color(0xFF0D9488)],
                          begin: Alignment.topRight,
                          end: Alignment.bottomLeft,
                        ),
                        borderRadius: BorderRadius.only(
                          topLeft: Radius.circular(28),
                          topRight: Radius.circular(28),
                        ),
                      ),
                      child: Column(
                        children: [
                          Container(
                            width: 60,
                            height: 60,
                            decoration: BoxDecoration(
                              color: Colors.white.withOpacity(0.2),
                              shape: BoxShape.circle,
                              border: Border.all(color: Colors.white.withOpacity(0.3)),
                            ),
                            child: const Center(
                              child: Icon(Icons.medication_rounded, size: 32, color: Colors.white),
                            ),
                          ),
                          const SizedBox(height: 10),
                          const Text(
                            'Expiro',
                            style: TextStyle(
                              color: Colors.white,
                              fontSize: 22,
                              fontWeight: FontWeight.w900,
                              letterSpacing: 1,
                            ),
                          ),
                          const SizedBox(height: 4),
                          const Text(
                            'نظام إدارة صلاحيات وتواريخ الأدوية',
                            style: TextStyle(color: Color(0xFFCCFBF1), fontSize: 11),
                          ),
                        ],
                      ),
                    ),

                    Padding(
                      padding: const EdgeInsets.all(20),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.stretch,
                        children: [
                          // أزرار التبديل العلوية (تسجيل الدخول / إنشاء حساب)
                          Container(
                            padding: const EdgeInsets.all(4),
                            decoration: BoxDecoration(
                              color: isDark ? const Color(0xFF0F172A) : const Color(0xFFF1F5F9),
                              borderRadius: BorderRadius.circular(16),
                            ),
                            child: Row(
                              children: [
                                Expanded(
                                  child: InkWell(
                                    onTap: () {
                                      setState(() {
                                        _isLoginMode = true;
                                        _errorMessage = null;
                                        _successMessage = null;
                                      });
                                    },
                                    borderRadius: BorderRadius.circular(12),
                                    child: Container(
                                      padding: const EdgeInsets.symmetric(vertical: 10),
                                      decoration: BoxDecoration(
                                        color: _isLoginMode
                                            ? (isDark ? const Color(0xFF1E293B) : Colors.white)
                                            : Colors.transparent,
                                        borderRadius: BorderRadius.circular(12),
                                        boxShadow: _isLoginMode
                                            ? [
                                                BoxShadow(
                                                  color: Colors.black.withOpacity(0.05),
                                                  blurRadius: 4,
                                                )
                                              ]
                                            : null,
                                      ),
                                      child: Row(
                                        mainAxisAlignment: MainAxisAlignment.center,
                                        children: [
                                          Icon(
                                            Icons.login_rounded,
                                            size: 15,
                                            color: _isLoginMode ? const Color(0xFF0F766E) : Colors.grey,
                                          ),
                                          const SizedBox(width: 6),
                                          Text(
                                            'تسجيل الدخول',
                                            style: TextStyle(
                                              fontSize: 12,
                                              fontWeight: FontWeight.bold,
                                              color: _isLoginMode
                                                  ? const Color(0xFF0F766E)
                                                  : Colors.grey,
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                  ),
                                ),
                                Expanded(
                                  child: InkWell(
                                    onTap: () {
                                      setState(() {
                                        _isLoginMode = false;
                                        _errorMessage = null;
                                        _successMessage = null;
                                      });
                                    },
                                    borderRadius: BorderRadius.circular(12),
                                    child: Container(
                                      padding: const EdgeInsets.symmetric(vertical: 10),
                                      decoration: BoxDecoration(
                                        color: !_isLoginMode
                                            ? (isDark ? const Color(0xFF1E293B) : Colors.white)
                                            : Colors.transparent,
                                        borderRadius: BorderRadius.circular(12),
                                        boxShadow: !_isLoginMode
                                            ? [
                                                BoxShadow(
                                                  color: Colors.black.withOpacity(0.05),
                                                  blurRadius: 4,
                                                )
                                              ]
                                            : null,
                                      ),
                                      child: Row(
                                        mainAxisAlignment: MainAxisAlignment.center,
                                        children: [
                                          Icon(
                                            Icons.person_add_rounded,
                                            size: 15,
                                            color: !_isLoginMode ? const Color(0xFF0F766E) : Colors.grey,
                                          ),
                                          const SizedBox(width: 6),
                                          Text(
                                            'إنشاء حساب جديد',
                                            style: TextStyle(
                                              fontSize: 12,
                                              fontWeight: FontWeight.bold,
                                              color: !_isLoginMode
                                                  ? const Color(0xFF0F766E)
                                                  : Colors.grey,
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ),

                          const SizedBox(height: 16),

                          // رسائل الخطأ أو النجاح
                          if (_errorMessage != null)
                            Container(
                              margin: const EdgeInsets.only(bottom: 12),
                              padding: const EdgeInsets.all(10),
                              decoration: BoxDecoration(
                                color: Colors.red.withOpacity(0.1),
                                borderRadius: BorderRadius.circular(12),
                                border: Border.all(color: Colors.red.withOpacity(0.3)),
                              ),
                              child: Row(
                                children: [
                                  const Icon(Icons.error_outline, color: Colors.red, size: 16),
                                  const SizedBox(width: 8),
                                  Expanded(
                                    child: Text(
                                      _errorMessage!,
                                      style: const TextStyle(color: Colors.red, fontSize: 11, fontWeight: FontWeight.bold),
                                    ),
                                  ),
                                ],
                              ),
                            ),

                          if (_successMessage != null)
                            Container(
                              margin: const EdgeInsets.only(bottom: 12),
                              padding: const EdgeInsets.all(10),
                              decoration: BoxDecoration(
                                color: Colors.green.withOpacity(0.1),
                                borderRadius: BorderRadius.circular(12),
                                border: Border.all(color: Colors.green.withOpacity(0.3)),
                              ),
                              child: Row(
                                children: [
                                  const Icon(Icons.check_circle_outline, color: Colors.green, size: 16),
                                  const SizedBox(width: 8),
                                  Expanded(
                                    child: Text(
                                      _successMessage!,
                                      style: const TextStyle(color: Colors.green, fontSize: 11, fontWeight: FontWeight.bold),
                                    ),
                                  ),
                                ],
                              ),
                            ),

                          // حقول إنشاء الحساب الإضافية
                          if (!_isLoginMode) ...[
                            TextField(
                              controller: _nameCtrl,
                              textAlign: TextAlign.right,
                              decoration: InputDecoration(
                                labelText: 'الاسم واللقب *',
                                hintText: 'مثال: د. مصطفى حميد',
                                prefixIcon: const Icon(Icons.person_outline, size: 18),
                                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                                isDense: true,
                              ),
                            ),
                            const SizedBox(height: 10),
                            TextField(
                              controller: _pharmacyCtrl,
                              textAlign: TextAlign.right,
                              decoration: InputDecoration(
                                labelText: 'اسم الصيدلية',
                                hintText: 'مثال: صيدلية الشفاء',
                                prefixIcon: const Icon(Icons.local_pharmacy_outlined, size: 18),
                                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                                isDense: true,
                              ),
                            ),
                            const SizedBox(height: 10),
                          ],

                          // حقل رقم الهاتف
                          TextField(
                            controller: _phoneCtrl,
                            keyboardType: TextInputType.phone,
                            textAlign: TextAlign.left,
                            onChanged: (_) => setState(() {}),
                            decoration: InputDecoration(
                              labelText: 'رقم الهاتف *',
                              hintText: '07XXXXXXXXX',
                              prefixIcon: const Icon(Icons.phone_android_rounded, size: 18),
                              border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                              isDense: true,
                            ),
                          ),

                          if (isOwner)
                            Padding(
                              padding: const EdgeInsets.only(top: 4, right: 4),
                              child: Row(
                                mainAxisAlignment: MainAxisAlignment.end,
                                children: const [
                                  Text(
                                    '👑 حساب مالك النظام (Admin)',
                                    style: TextStyle(
                                      color: Color(0xFFD97706),
                                      fontSize: 10,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                ],
                              ),
                            ),

                          const SizedBox(height: 10),

                          // حقل كلمة المرور
                          TextField(
                            controller: _passwordCtrl,
                            obscureText: _obscurePassword,
                            textAlign: TextAlign.left,
                            decoration: InputDecoration(
                              labelText: 'كلمة المرور *',
                              prefixIcon: const Icon(Icons.lock_outline, size: 18),
                              suffixIcon: IconButton(
                                icon: Icon(
                                  _obscurePassword ? Icons.visibility_off : Icons.visibility,
                                  size: 18,
                                ),
                                onPressed: () {
                                  setState(() {
                                    _obscurePassword = !_obscurePassword;
                                  });
                                },
                              ),
                              border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                              isDense: true,
                            ),
                          ),

                          // رابط "هل نسيت كلمة المرور؟"
                          if (_isLoginMode)
                            Align(
                              alignment: Alignment.centerLeft,
                              child: TextButton(
                                onPressed: _showForgotPasswordDialog,
                                style: TextButton.styleFrom(
                                  padding: const EdgeInsets.symmetric(vertical: 4, horizontal: 0),
                                  minimumSize: Size.zero,
                                  tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                                ),
                                child: const Text(
                                  'هل نسيت كلمة المرور؟',
                                  style: TextStyle(
                                    color: Color(0xFF0D9488),
                                    fontSize: 11,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ),
                            ),

                          const SizedBox(height: 14),

                          // زر الإجراء الرئيسي (تسجيل الدخول / إنشاء حساب)
                          ElevatedButton(
                            style: ElevatedButton.styleFrom(
                              backgroundColor: const Color(0xFF0F766E),
                              foregroundColor: Colors.white,
                              padding: const EdgeInsets.symmetric(vertical: 13),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(14),
                              ),
                              elevation: 2,
                            ),
                            onPressed: _isLoading
                                ? null
                                : (_isLoginMode ? _handleLogin : _handleRegister),
                            child: _isLoading
                                ? const SizedBox(
                                    width: 18,
                                    height: 18,
                                    child: CircularProgressIndicator(
                                      strokeWidth: 2,
                                      color: Colors.white,
                                    ),
                                  )
                                : Row(
                                    mainAxisAlignment: MainAxisAlignment.center,
                                    children: [
                                      Icon(
                                        _isLoginMode ? Icons.arrow_back : Icons.check,
                                        size: 16,
                                      ),
                                      const SizedBox(width: 8),
                                      Text(
                                        _isLoginMode ? 'تسجيل الدخول' : 'إنشاء حساب جديد',
                                        style: const TextStyle(
                                          fontWeight: FontWeight.bold,
                                          fontSize: 13,
                                        ),
                                      ),
                                    ],
                                  ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}

// ==========================================
// 3. الشاشة الرئيسية للتطبيق (MainScreen)
// ==========================================
class MainScreen extends StatefulWidget {
  final bool isDarkMode;
  final VoidCallback onToggleTheme;
  final VoidCallback onShowAdmin;
  final VoidCallback onShowSplash;
  final VoidCallback? onLogout;

  const MainScreen({
    super.key,
    required this.isDarkMode,
    required this.onToggleTheme,
    required this.onShowAdmin,
    required this.onShowSplash,
    this.onLogout,
  });

  @override
  State<MainScreen> createState() => _MainScreenState();
}

class _MainScreenState extends State<MainScreen> {
  int _activeTab = 0; // 0: الرئيسية, 1: الخسائر, 2: الدعم, 3: حسابي, 4: التنبيهات
  String _searchQuery = '';
  ExpiryStatus? _filterStatus;
  String _notificationsFilter = 'all'; // all, expired, nearExpiry
  String _userRole = 'admin'; // admin, staff

  final List<Medicine> _medicines = [];

  @override
  void initState() {
    super.initState();
    _initDefaultMedicines();
  }

  void _initDefaultMedicines() {
    final now = DateTime.now();
    _medicines.addAll([
      // 1. أوجمنتين (منتهي 24 يوم)
      Medicine(
        id: 1,
        tradeName: 'أوجمنتين 1 جم أقراص (Augmentin 1g)',
        scientificName: 'Amoxicillin + Clavulanic Acid 1000mg',
        companyName: 'GSK (GlaxoSmithKline)',
        category: 'المضادات الحيوية',
        barcode: '6281001230012',
        expiryDate: now.subtract(const Duration(days: 24)),
        alertThresholdDays: 60,
        quantity: 12,
        notes: 'مضاد حيوي واسع المجال - عبوة 14 قرص',
      ),
      // 2. بانادول إكسترا (منتهي 8 أيام)
      Medicine(
        id: 2,
        tradeName: 'بانادول إكسترا (Panadol Extra)',
        scientificName: 'Paracetamol 500mg + Caffeine 65mg',
        companyName: 'Haleon / GSK',
        category: 'مسكنات وخافضات حرارة',
        barcode: '6285000000018',
        expiryDate: now.subtract(const Duration(days: 8)),
        alertThresholdDays: 45,
        quantity: 25,
        notes: 'مسكن سريع للصداع والآلام',
      ),
      // 3. كونكور 5 مجم (وشيك 10 أيام)
      Medicine(
        id: 3,
        tradeName: 'كونكور 5 مجم (Concor 5mg)',
        scientificName: 'Bisoprolol Fumarate 5mg',
        companyName: 'Merck (ميرك)',
        category: 'القلب والأوعية الدموية',
        barcode: '6281100223344',
        expiryDate: now.add(const Duration(days: 10)),
        alertThresholdDays: 60,
        quantity: 18,
        notes: 'لعلاج ارتفاع ضغط الدم',
      ),
      // 4. جلوكوفاج 1000 مجم (وشيك 31 يوم)
      Medicine(
        id: 4,
        tradeName: 'جلوكوفاج 1000 مجم (Glucophage)',
        scientificName: 'Metformin HCl 1000mg',
        companyName: 'Merck Serono',
        category: 'أدوية السكري والهرمونات',
        barcode: '3582910023419',
        expiryDate: now.add(const Duration(days: 31)),
        alertThresholdDays: 60,
        quantity: 30,
        notes: 'منظم السكر بالدم',
      ),
      // 5. نيكسيوم 40 مجم (صالح)
      Medicine(
        id: 5,
        tradeName: 'نيكسيوم 40 مجم (Nexium 40mg)',
        scientificName: 'Esomeprazole 40mg',
        companyName: 'AstraZeneca',
        category: 'الجهاز الهضمي والمعدة',
        barcode: '7313550001234',
        expiryDate: now.add(const Duration(days: 280)),
        alertThresholdDays: 60,
        quantity: 15,
        notes: 'مثبط مضخة البروتون للحموضة وقرحة المعدة',
      ),
      // 6. سيبتازول فورت (صالح)
      Medicine(
        id: 6,
        tradeName: 'سيبتازول فورت (Septazole Forte)',
        scientificName: 'Trimethoprim + Sulfamethoxazole',
        companyName: 'EIPICO',
        category: 'مضادات ميكروبية',
        barcode: '6221045000998',
        expiryDate: now.add(const Duration(days: 350)),
        alertThresholdDays: 60,
        quantity: 20,
        notes: 'مضاد لالتهابات المسالك البولية والتنفسية',
      ),
      // 7. بروفين 400 مجم (صالح)
      Medicine(
        id: 7,
        tradeName: 'بروفين 400 مجم (Brufen 400mg)',
        scientificName: 'Ibuprofen 400mg',
        companyName: 'Abbott',
        category: 'مسكنات ومضادات التهاب',
        barcode: '5000456012908',
        expiryDate: now.add(const Duration(days: 410)),
        alertThresholdDays: 60,
        quantity: 40,
        notes: 'مسكن للآلام ومضاد للروماتيزم',
      ),
      // 8. فيتامين د3 50000 وحدة (صالح)
      Medicine(
        id: 8,
        tradeName: 'فيتامين د3 50000 وحدة (D-Vital)',
        scientificName: 'Cholecalciferol 50,000 IU',
        companyName: 'Sanofi',
        category: 'الفيتامينات والمكملات',
        barcode: '3582910098765',
        expiryDate: now.add(const Duration(days: 520)),
        alertThresholdDays: 90,
        quantity: 14,
        notes: 'جرعة أسبوعية لتعويض نقص فيتامين د الحاد',
      ),
    ]);
  }

  int get totalCount => _medicines.length;
  int get expiredCount => _medicines.where((m) => m.analyze().status == ExpiryStatus.expired).length;
  int get nearExpiryCount => _medicines.where((m) => m.analyze().status == ExpiryStatus.nearExpiry).length;
  int get validCount => _medicines.where((m) => m.analyze().status == ExpiryStatus.valid).length;

  List<Medicine> get filteredMedicines {
    return _medicines.where((m) {
      if (_filterStatus != null && m.analyze().status != _filterStatus) {
        return false;
      }
      if (_searchQuery.trim().isNotEmpty) {
        final q = _searchQuery.toLowerCase();
        final matchesTrade = m.tradeName.toLowerCase().contains(q);
        final matchesSci = m.scientificName.toLowerCase().contains(q);
        final matchesCompany = m.companyName.toLowerCase().contains(q);
        final matchesCategory = m.category.toLowerCase().contains(q);
        final matchesBarcode = m.barcode.contains(q);
        return matchesTrade || matchesSci || matchesCompany || matchesCategory || matchesBarcode;
      }
      return true;
    }).toList();
  }

  // ========================================================
  // الهايدر العلوي المنحني المتطابق (Curved Teal Header - Height: 100px)
  // مطابق تماماً لتصميم المعاينة (src/App.tsx) بالارتفاع والطبقات
  // ========================================================
  Widget _buildExactHeader() {
    final topPadding = MediaQuery.of(context).padding.top;
    final isDark = widget.isDarkMode;

    return Container(
      height: topPadding + 100,
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.centerRight,
          end: Alignment.centerLeft,
          colors: isDark
              ? const [Color(0xFF020617), Color(0xFF042F2E), Color(0xFF0F172A)]
              : const [Color(0xFF0F766E), Color(0xFF0D9488)],
        ),
        borderRadius: const BorderRadius.only(
          bottomLeft: Radius.circular(26),
          bottomRight: Radius.circular(26),
        ),
        border: Border(
          bottom: BorderSide(
            color: isDark ? const Color(0xFF020617) : const Color(0xFFF1F5F9),
            width: 2,
          ),
        ),
      ),
      padding: EdgeInsets.only(
        top: topPadding > 0 ? topPadding + 6 : 10,
        bottom: 8,
        left: 14,
        right: 14,
      ),
      child: Column(
        children: [
          // 1. الصف العلوي: معلومات الصيدلية في اليمين وأزرار التحكم في اليسار
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              // اليمين: أيقونة "ص" واسم الصيدلية
              Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Container(
                    width: 30,
                    height: 30,
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
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisSize: MainAxisSize.min,
                    children: const [
                      Text(
                        'مرحبا',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 11,
                          fontWeight: FontWeight.bold,
                          height: 1.1,
                        ),
                      ),
                      Text(
                        'إدارة تطبيق Expiro المركزية',
                        style: TextStyle(
                          color: Color(0xFFCCFBF1),
                          fontSize: 10,
                          fontWeight: FontWeight.w500,
                          height: 1.1,
                        ),
                      ),
                    ],
                  ),
                ],
              ),

              // اليسار: زر التنبيهات مع الشارة + زر الوضع الليلي
              Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  // زر التنبيهات
                  Stack(
                    clipBehavior: Clip.none,
                    children: [
                      Container(
                        width: 30,
                        height: 30,
                        decoration: BoxDecoration(
                          color: Colors.white.withOpacity(0.18),
                          shape: BoxShape.circle,
                          border: Border.all(color: Colors.white.withOpacity(0.25)),
                        ),
                        child: IconButton(
                          constraints: const BoxConstraints(),
                          padding: EdgeInsets.zero,
                          onPressed: () => setState(() => _activeTab = 4),
                          icon: const Icon(
                            Icons.notifications_none_rounded,
                            color: Colors.white,
                            size: 16,
                          ),
                          tooltip: 'التنبيهات',
                        ),
                      ),
                      if ((expiredCount + nearExpiryCount) > 0)
                        Positioned(
                          top: -3,
                          left: -3,
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 1),
                            decoration: BoxDecoration(
                              color: const Color(0xFFE11D48),
                              shape: BoxShape.circle,
                              border: Border.all(color: const Color(0xFF0D9488), width: 1.5),
                            ),
                            constraints: const BoxConstraints(minWidth: 15, minHeight: 15),
                            child: Center(
                              child: Text(
                                '${expiredCount + nearExpiryCount}',
                                textAlign: TextAlign.center,
                                style: const TextStyle(
                                  color: Colors.white,
                                  fontSize: 8,
                                  fontWeight: FontWeight.bold,
                                  height: 1,
                                ),
                              ),
                            ),
                          ),
                        ),
                    ],
                  ),
                  const SizedBox(width: 6),
                  // زر الوضع الليلي
                  Container(
                    width: 30,
                    height: 30,
                    decoration: BoxDecoration(
                      color: Colors.white.withOpacity(0.18),
                      shape: BoxShape.circle,
                      border: Border.all(color: Colors.white.withOpacity(0.25)),
                    ),
                    child: IconButton(
                      constraints: const BoxConstraints(),
                      padding: EdgeInsets.zero,
                      onPressed: widget.onToggleTheme,
                      icon: Icon(
                        isDark ? Icons.wb_sunny_rounded : Icons.nightlight_round,
                        color: isDark ? const Color(0xFFFDE047) : Colors.white,
                        size: 15,
                      ),
                      tooltip: isDark ? 'الوضع النهاري' : 'الوضع المظلم',
                    ),
                  ),
                ],
              ),
            ],
          ),

          // 2. الجزء الأوسط/السفلي: اسم التطبيق وشعاره في المنتصف تماماً
          Expanded(
            child: Center(
              child: Transform.translate(
                offset: const Offset(0, -3),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: const [
                    Text(
                      'Expiro',
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 17,
                        fontWeight: FontWeight.w900,
                        letterSpacing: 0.5,
                        height: 1.1,
                      ),
                    ),
                    SizedBox(height: 2),
                    Text(
                      'إدارة تواريخ صلاحية الأدوية',
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        color: Color(0xFFCCFBF1),
                        fontSize: 9.5,
                        fontWeight: FontWeight.w500,
                        height: 1.1,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  // ========================================================
  // الهايدر المخصص للأقسام الفرعية (الخسائر، الدعم، حسابي، التنبيهات)
  // مطابق تماماً للشكل في الصورة رقم 2 وارتفاع 100px
  // ========================================================
  Widget _buildSectionHeader({
    required String title,
    required IconData icon,
  }) {
    final topPadding = MediaQuery.of(context).padding.top;
    final isDark = widget.isDarkMode;

    return Container(
      height: topPadding + 100,
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.centerRight,
          end: Alignment.centerLeft,
          colors: isDark
              ? const [Color(0xFF020617), Color(0xFF042F2E), Color(0xFF0F172A)]
              : const [Color(0xFF0F766E), Color(0xFF0D9488)],
        ),
        borderRadius: const BorderRadius.only(
          bottomLeft: Radius.circular(26),
          bottomRight: Radius.circular(26),
        ),
        border: Border(
          bottom: BorderSide(
            color: isDark ? const Color(0xFF020617) : const Color(0xFFF1F5F9),
            width: 2,
          ),
        ),
      ),
      padding: EdgeInsets.only(
        top: topPadding > 0 ? topPadding + 6 : 10,
        bottom: 8,
        left: 14,
        right: 14,
      ),
      child: Column(
        children: [
          // 1. الصف العلوي: زر رجوع في اليمين وأيقونة القسم في اليسار
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              // اليمين: زر رجوع أبيض مع سهم
              Material(
                color: Colors.white,
                borderRadius: BorderRadius.circular(10),
                elevation: 0,
                child: InkWell(
                  borderRadius: BorderRadius.circular(10),
                  onTap: () => setState(() => _activeTab = 0),
                  child: Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: const [
                        Icon(
                          Icons.arrow_forward_rounded,
                          color: Color(0xFF0D9488),
                          size: 14,
                        ),
                        SizedBox(width: 4),
                        Text(
                          'رجوع',
                          style: TextStyle(
                            color: Color(0xFF0D9488),
                            fontSize: 11,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),

              // اليسار: أيقونة القسم الدائرية
              Container(
                width: 30,
                height: 30,
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.18),
                  shape: BoxShape.circle,
                  border: Border.all(color: Colors.white.withOpacity(0.25)),
                ),
                alignment: Alignment.center,
                child: Icon(icon, color: Colors.white, size: 15),
              ),
            ],
          ),

          // 2. الجزء الأوسط: عنوان القسم بالمنتصف تماماً
          Expanded(
            child: Center(
              child: Transform.translate(
                offset: const Offset(0, -4),
                child: Text(
                  title,
                  textAlign: TextAlign.center,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 16,
                    fontWeight: FontWeight.w900,
                    letterSpacing: 0.3,
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  // ========================================================
  // بطاقات الإحصائيات الأربعة (KPIs Row)
  // ========================================================
  Widget _buildKPICards() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 14),
      child: Row(
        children: [
          // 1. الكل
          Expanded(
            child: _buildSingleKPI(
              title: 'الكل',
              count: totalCount,
              icon: Icons.layers_outlined,
              iconColor: const Color(0xFF0D9488),
              status: null,
            ),
          ),
          const SizedBox(width: 8),
          // 2. منتهية
          Expanded(
            child: _buildSingleKPI(
              title: 'منتهية',
              count: expiredCount,
              icon: Icons.error_outline_rounded,
              iconColor: const Color(0xFFE53935),
              status: ExpiryStatus.expired,
            ),
          ),
          const SizedBox(width: 8),
          // 3. وشيكة
          Expanded(
            child: _buildSingleKPI(
              title: 'وشيكة',
              count: nearExpiryCount,
              icon: Icons.warning_amber_rounded,
              iconColor: const Color(0xFFF59E0B),
              status: ExpiryStatus.nearExpiry,
            ),
          ),
          const SizedBox(width: 8),
          // 4. صالحة
          Expanded(
            child: _buildSingleKPI(
              title: 'صالحة',
              count: validCount,
              icon: Icons.check_circle_outline_rounded,
              iconColor: const Color(0xFF10B981),
              status: ExpiryStatus.valid,
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
    required Color iconColor,
    required ExpiryStatus? status,
  }) {
    final isSelected = _filterStatus == status;
    final cardBg = widget.isDarkMode
        ? (isSelected ? const Color(0xFF1E293B) : const Color(0xFF0F172A))
        : (isSelected ? Colors.teal.shade50 : Colors.white);

    return InkWell(
      onTap: () {
        setState(() {
          _filterStatus = isSelected ? null : status;
        });
      },
      borderRadius: BorderRadius.circular(16),
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 8),
        decoration: BoxDecoration(
          color: cardBg,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: isSelected ? const Color(0xFF0D9488) : const Color(0xFFE2E8F0),
            width: isSelected ? 2 : 1,
          ),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(widget.isDarkMode ? 0.3 : 0.04),
              blurRadius: 6,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Column(
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(icon, color: iconColor, size: 16),
                const SizedBox(width: 4),
                Text(
                  title,
                  style: TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.bold,
                    color: widget.isDarkMode ? Colors.white70 : const Color(0xFF475569),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 6),
            Text(
              '$count',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w900,
                color: isSelected ? const Color(0xFF0D9488) : (widget.isDarkMode ? Colors.white : const Color(0xFF0F172A)),
              ),
            ),
          ],
        ),
      ),
    );
  }

  // ========================================================
  // شريط البحث وماسح الباركود
  // ========================================================
  Widget _buildSearchAndScanBar() {
    final isDark = widget.isDarkMode;
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 14),
      child: Row(
        children: [
          // زر ماسح باركود
          InkWell(
            onTap: _openBarcodeScannerModal,
            borderRadius: BorderRadius.circular(14),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
              decoration: BoxDecoration(
                color: const Color(0xFF0F766E),
                borderRadius: BorderRadius.circular(14),
                boxShadow: [
                  BoxShadow(
                    color: const Color(0xFF0F766E).withOpacity(0.3),
                    blurRadius: 6,
                    offset: const Offset(0, 2),
                  ),
                ],
              ),
              child: Row(
                children: const [
                  Icon(Icons.qr_code_scanner_rounded, color: Colors.white, size: 18),
                  SizedBox(width: 6),
                  Text(
                    'ماسح باركود',
                    style: TextStyle(color: Colors.white, fontSize: 11.5, fontWeight: FontWeight.bold),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(width: 8),

          // حقل البحث
          Expanded(
            child: Container(
              height: 44,
              decoration: BoxDecoration(
                color: isDark ? const Color(0xFF1E293B) : Colors.white,
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: const Color(0xFFE2E8F0)),
              ),
              child: TextField(
                onChanged: (val) => setState(() => _searchQuery = val),
                textAlign: TextAlign.right,
                style: const TextStyle(fontSize: 12),
                decoration: InputDecoration(
                  hintText: 'ابحث بالاسم، الشركة، الفئة، أو الباركود...',
                  hintStyle: TextStyle(
                    fontSize: 11,
                    color: isDark ? Colors.grey[500] : Colors.grey[400],
                  ),
                  prefixIcon: const Icon(Icons.search, size: 19, color: Color(0xFF0D9488)),
                  border: InputBorder.none,
                  contentPadding: const EdgeInsets.symmetric(vertical: 12),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  // ========================================================
  // بطاقة الدواء الواحدة المتطابقة تماماً مع التصميم
  // ========================================================
  Widget _buildMedicineCard(Medicine med) {
    final analysis = med.analyze();
    final isDark = widget.isDarkMode;

    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 14, vertical: 5),
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF1E293B) : Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: isDark ? const Color(0xFF334155) : const Color(0xFFE2E8F0)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(isDark ? 0.25 : 0.03),
            blurRadius: 5,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      clipBehavior: Clip.antiAlias,
      child: IntrinsicHeight(
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // الخط الجانبي الأيمن الملون (أحمر، برتقالي، أخضر)
            Container(
              width: 5,
              color: analysis.statusColor,
            ),

            // محتوى البطاقة الكامل
            Expanded(
              child: Padding(
                padding: const EdgeInsets.all(12),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // الصف العلوي: شارة الحالة + الاسم التجاري
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // شارة الحالة
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                          decoration: BoxDecoration(
                            color: analysis.bgColor,
                            borderRadius: BorderRadius.circular(8),
                            border: Border.all(color: analysis.statusColor.withOpacity(0.3)),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Icon(
                                analysis.status == ExpiryStatus.expired
                                    ? Icons.cancel_outlined
                                    : analysis.status == ExpiryStatus.nearExpiry
                                        ? Icons.warning_amber_rounded
                                        : Icons.check_circle_outline_rounded,
                                size: 12,
                                color: analysis.statusColor,
                              ),
                              const SizedBox(width: 4),
                              Text(
                                analysis.statusText,
                                style: TextStyle(
                                  color: analysis.statusColor,
                                  fontSize: 10,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ],
                          ),
                        ),
                        // اسم الدواء التجاري
                        Expanded(
                          child: Text(
                            med.tradeName,
                            textAlign: TextAlign.right,
                            style: TextStyle(
                              fontSize: 13.5,
                              fontWeight: FontWeight.w800,
                              color: isDark ? Colors.white : const Color(0xFF0F172A),
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 4),

                    // الصف الثاني: تاريخ الانتهاء + الاسم العلمي
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        // صندوق التاريخ
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                          decoration: BoxDecoration(
                            color: isDark ? const Color(0xFF0F172A) : const Color(0xFFF1F5F9),
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: Row(
                            children: [
                              Icon(Icons.calendar_today_outlined, size: 11, color: isDark ? Colors.white60 : Colors.black54),
                              const SizedBox(width: 4),
                              Text(
                                DateFormat('yyyy-MM-dd').format(med.expiryDate),
                                style: TextStyle(
                                  fontSize: 10,
                                  fontWeight: FontWeight.bold,
                                  color: isDark ? Colors.white70 : const Color(0xFF334155),
                                ),
                              ),
                            ],
                          ),
                        ),
                        // الاسم العلمي
                        Expanded(
                          child: Text(
                            med.scientificName,
                            textAlign: TextAlign.right,
                            style: TextStyle(
                              fontSize: 11,
                              color: isDark ? Colors.grey[400] : const Color(0xFF64748B),
                              fontWeight: FontWeight.w500,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),

                    // الصف الثالث: الشركة المصنعة والفئة
                    Row(
                      mainAxisAlignment: MainAxisAlignment.end,
                      children: [
                        if (med.category.isNotEmpty) ...[
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                            decoration: BoxDecoration(
                              color: const Color(0xFF0D9488).withOpacity(0.1),
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: Text(
                              med.category,
                              style: const TextStyle(
                                color: Color(0xFF0F766E),
                                fontSize: 9.5,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                          const SizedBox(width: 6),
                        ],
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                          decoration: BoxDecoration(
                            color: isDark ? const Color(0xFF334155) : const Color(0xFFE2E8F0),
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: Text(
                            med.companyName,
                            style: TextStyle(
                              color: isDark ? Colors.white70 : const Color(0xFF475569),
                              fontSize: 9.5,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 6),

                    // الصف الرابع: الباركود وأزرار التعديل والحذف
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        // أزرار الحذف والتعديل
                        Row(
                          children: [
                            IconButton(
                              onPressed: () => _confirmDeleteMedicine(med),
                              icon: const Icon(Icons.delete_outline, size: 17, color: Colors.grey),
                              visualDensity: VisualDensity.compact,
                              padding: EdgeInsets.zero,
                              constraints: const BoxConstraints(),
                            ),
                            const SizedBox(width: 12),
                            IconButton(
                              onPressed: () => _openAddEditMedicineModal(medicineToEdit: med),
                              icon: const Icon(Icons.edit_outlined, size: 17, color: Colors.grey),
                              visualDensity: VisualDensity.compact,
                              padding: EdgeInsets.zero,
                              constraints: const BoxConstraints(),
                            ),
                          ],
                        ),
                        // شارة الباركود
                        Row(
                          children: [
                            Text(
                              med.barcode,
                              style: TextStyle(
                                fontSize: 10,
                                fontFamily: 'monospace',
                                color: isDark ? Colors.grey[400] : Colors.grey[600],
                              ),
                            ),
                            const SizedBox(width: 4),
                            Icon(Icons.qr_code, size: 13, color: isDark ? Colors.grey[400] : Colors.grey[600]),
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
  // 4. شاشة الخسائر والمخاطر (Losses Screen)
  // ========================================================
  Widget _buildLossesView() {
    final isDark = widget.isDarkMode;
    final affectedMeds = _medicines.where((m) {
      final s = m.analyze().status;
      return s == ExpiryStatus.expired || s == ExpiryStatus.nearExpiry;
    }).toList();

    return SingleChildScrollView(
      padding: const EdgeInsets.only(top: 12, bottom: 20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // بطاقة إحصائيات الخسائر والمخاطر
          Container(
            margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: isDark ? const Color(0xFF1E293B) : Colors.white,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: const Color(0xFFE2E8F0)),
            ),
            child: Column(
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.end,
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: const [
                        Text('إحصائيات الخسائر والمخاطر', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                        Text('تتبع مفصل للأدوية التالفة والحرجة لتجنب الهدر المالي', style: TextStyle(color: Colors.grey, fontSize: 10)),
                      ],
                    ),
                    const SizedBox(width: 8),
                    Container(
                      padding: const EdgeInsets.all(6),
                      decoration: BoxDecoration(
                        color: const Color(0xFFE11D48).withOpacity(0.1),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: const Icon(Icons.trending_down, color: Color(0xFFE11D48), size: 20),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                Row(
                  children: [
                    // أدوية تالفة
                    Expanded(
                      child: Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: const Color(0xFFFFEBEE),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: const Color(0xFFFFCDD2)),
                        ),
                        child: Column(
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: const [
                                Icon(Icons.error_outline, color: Color(0xFFE53935), size: 14),
                                SizedBox(width: 4),
                                Text('أدوية تالفة (منتهية)', style: TextStyle(color: Color(0xFFB71C1C), fontSize: 10, fontWeight: FontWeight.bold)),
                              ],
                            ),
                            const SizedBox(height: 4),
                            Text('$expiredCount', style: const TextStyle(color: Color(0xFFB71C1C), fontSize: 20, fontWeight: FontWeight.bold)),
                            const Text('عبوة ملزمة بالإتلاف الرسمي', style: TextStyle(color: Colors.grey, fontSize: 8.5)),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(width: 10),
                    // أدوية وشيكة
                    Expanded(
                      child: Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: const Color(0xFFFFFBEB),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: const Color(0xFFFDE68A)),
                        ),
                        child: Column(
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: const [
                                Icon(Icons.warning_amber_rounded, color: Color(0xFFF59E0B), size: 14),
                                SizedBox(width: 4),
                                Text('أدوية وشيكة (حرجة)', style: TextStyle(color: Color(0xFFB45309), fontSize: 10, fontWeight: FontWeight.bold)),
                              ],
                            ),
                            const SizedBox(height: 4),
                            Text('$nearExpiryCount', style: const TextStyle(color: Color(0xFFB45309), fontSize: 20, fontWeight: FontWeight.bold)),
                            const Text('تحتاج تصريف أو تدوير سريع', style: TextStyle(color: Colors.grey, fontSize: 8.5)),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 14),
                // زر إصدار محضر إتلاف رسمي فوري
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton.icon(
                    onPressed: _openOfficialDisposalReportModal,
                    icon: const Icon(Icons.assignment_outlined, size: 18),
                    label: const Text('إصدار محضر إتلاف رسمي فوري', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF0F766E),
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                  ),
                ),
              ],
            ),
          ),

          // قائمة الأدوية المتأثرة بالخسائر
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 10),
            child: Text(
              'الأدوية المتأثرة بالخسائر (${affectedMeds.length})',
              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
              textAlign: TextAlign.right,
            ),
          ),
          ...affectedMeds.map(_buildMedicineCard),
        ],
      ),
    );
  }

  // ========================================================
  // 5. شاشة التنبيهات (Notifications Screen)
  // ========================================================
  Widget _buildNotificationsView() {
    final allAlerts = _medicines.where((m) {
      final s = m.analyze().status;
      return s == ExpiryStatus.expired || s == ExpiryStatus.nearExpiry;
    }).toList();

    List<Medicine> displayAlerts = allAlerts;
    if (_notificationsFilter == 'expired') {
      displayAlerts = _medicines.where((m) => m.analyze().status == ExpiryStatus.expired).toList();
    } else if (_notificationsFilter == 'nearExpiry') {
      displayAlerts = _medicines.where((m) => m.analyze().status == ExpiryStatus.nearExpiry).toList();
    }

    return SingleChildScrollView(
      padding: const EdgeInsets.only(top: 12, bottom: 20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [

          // فلاتر التنبيهات الثلاثية (كافة التنبيهات 4, منتهية 2, وشيكة 2)
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                _buildFilterPill('كافة التنبيهات ${allAlerts.length}', 'all', const Color(0xFF0F766E)),
                const SizedBox(width: 8),
                _buildFilterPill('منتهية $expiredCount', 'expired', const Color(0xFFE53935)),
                const SizedBox(width: 8),
                _buildFilterPill('وشيكة $nearExpiryCount', 'nearExpiry', const Color(0xFFF59E0B)),
              ],
            ),
          ),

          // قائمة التنبيهات
          ...displayAlerts.map(_buildMedicineCard),
        ],
      ),
    );
  }

  Widget _buildFilterPill(String label, String filterKey, Color activeColor) {
    final isSelected = _notificationsFilter == filterKey;
    return InkWell(
      onTap: () => setState(() => _notificationsFilter = filterKey),
      borderRadius: BorderRadius.circular(20),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
        decoration: BoxDecoration(
          color: isSelected ? activeColor : (widget.isDarkMode ? const Color(0xFF1E293B) : Colors.white),
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: isSelected ? activeColor : const Color(0xFFE2E8F0)),
        ),
        child: Text(
          label,
          style: TextStyle(
            color: isSelected ? Colors.white : (widget.isDarkMode ? Colors.white70 : const Color(0xFF334155)),
            fontSize: 11,
            fontWeight: FontWeight.bold,
          ),
        ),
      ),
    );
  }

  // ========================================================
  // 6. شاشة الدعم والمساعدة (Support Screen)
  // ========================================================
  Widget _buildSupportView() {
    final isDark = widget.isDarkMode;

    return SingleChildScrollView(
      padding: const EdgeInsets.only(top: 12, bottom: 20),
      child: Column(
        children: [
          // بطاقة مركز الدعم
          Container(
            margin: const EdgeInsets.all(16),
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: isDark ? const Color(0xFF1E293B) : Colors.white,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: const Color(0xFFE2E8F0)),
            ),
            child: Column(
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.end,
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: const [
                        Text('مركز الدعم الفني والمساعدة', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                        Text('فريق خدمة عملاء Expiro متاح لمساعدتكم على مدار الساعة', style: TextStyle(color: Colors.grey, fontSize: 10)),
                      ],
                    ),
                    const SizedBox(width: 8),
                    Container(
                      padding: const EdgeInsets.all(6),
                      decoration: BoxDecoration(
                        color: const Color(0xFF0D9488).withOpacity(0.1),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: const Icon(Icons.headset_mic_rounded, color: Color(0xFF0F766E), size: 20),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                // الخط الساخن
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: isDark ? const Color(0xFF0F172A) : const Color(0xFFF8FAFC),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: const Color(0xFFE2E8F0)),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      ElevatedButton(
                        onPressed: () {
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(content: Text('الاتصال بالرقم: 07701234567')),
                          );
                        },
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFF0F766E),
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                        ),
                        child: const Text('اتصال', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                      ),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.end,
                        children: const [
                          Text('الخط الساخن المباشر', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 11)),
                          Text('07701234567', style: TextStyle(color: Colors.grey, fontSize: 10, fontFamily: 'monospace')),
                        ],
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 10),
                // محادثة واتساب
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: isDark ? const Color(0xFF0F172A) : const Color(0xFFF8FAFC),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: const Color(0xFFE2E8F0)),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      ElevatedButton(
                        onPressed: () {
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(content: Text('فتح محادثة واتساب الفورية...')),
                          );
                        },
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFF10B981),
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                        ),
                        child: const Text('مراسلة', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                      ),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.end,
                        children: const [
                          Text('محادثة واتساب الفورية', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 11)),
                          Text('استجابة سريعة خلال دقائق معدودة', style: TextStyle(color: Colors.grey, fontSize: 10)),
                        ],
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),

          // الأسئلة الشائعة
          Container(
            margin: const EdgeInsets.symmetric(horizontal: 16),
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: isDark ? const Color(0xFF1E293B) : Colors.white,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: const Color(0xFFE2E8F0)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: const [
                Text('الأسئلة الشائعة والإرشادات', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
                SizedBox(height: 10),
                Text('كيف يتم فحص تواريخ الصلاحية؟', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 11, color: Color(0xFF0F766E))),
                Text('يقوم Expiro تلقائياً بحساب الأيام المتبقية وتصنيف الدواء (صالح / وشيك / منتهي) بدقة متناهية.', style: TextStyle(fontSize: 10, color: Colors.grey)),
                Divider(height: 16),
                Text('أين أجد كود تسجيل الموظفين؟', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 11, color: Color(0xFF0F766E))),
                Text('من تبويب "حسابي"، اضغط على "إدارة حسابات الستاف والموظفين" لمشاركة كود الانضمام المباشر.', style: TextStyle(fontSize: 10, color: Colors.grey)),
              ],
            ),
          ),
        ],
      ),
    );
  }

  // ========================================================
  // 7. شاشة حسابي والإعدادات (Profile Screen)
  // ========================================================
  Widget _buildProfileView() {
    final isDark = widget.isDarkMode;

    return SingleChildScrollView(
      padding: const EdgeInsets.only(top: 12, bottom: 20),
      child: Column(
        children: [
          // صلاحيات وإدارة المدير
          Container(
            margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: isDark ? const Color(0xFF1E293B) : Colors.white,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: const Color(0xFFE2E8F0)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.end,
                  children: const [
                    Text('صلاحيات وإدارة المدير', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
                    SizedBox(width: 6),
                    Icon(Icons.shield_outlined, size: 16, color: Color(0xFF0F766E)),
                  ],
                ),
                const SizedBox(height: 12),
                _buildActionTile(
                  icon: Icons.badge_outlined,
                  title: 'بيانات الصيدلية وإجازة الممارسة',
                  color: const Color(0xFF0F766E),
                  onTap: _openPharmacyLicenseModal,
                ),
                _buildActionTile(
                  icon: Icons.people_outline_rounded,
                  title: 'إدارة حسابات الستاف والموظفين',
                  color: const Color(0xFF0F766E),
                  onTap: _openStaffManagementModal,
                ),
                _buildActionTile(
                  icon: Icons.description_outlined,
                  title: 'محضر الإتلاف الرسمي للأدوية',
                  color: const Color(0xFF0F766E),
                  onTap: _openOfficialDisposalReportModal,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildActionTile({
    required IconData icon,
    required String title,
    String? subtitle,
    required Color color,
    required VoidCallback onTap,
  }) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      decoration: BoxDecoration(
        color: widget.isDarkMode ? const Color(0xFF0F172A) : const Color(0xFFF8FAFC),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFFE2E8F0)),
      ),
      child: ListTile(
        dense: true,
        leading: const Icon(Icons.arrow_back_ios_new, size: 12, color: Colors.grey),
        trailing: Icon(icon, color: color, size: 20),
        title: Text(title, textAlign: TextAlign.right, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
        subtitle: subtitle != null ? Text(subtitle, textAlign: TextAlign.right, style: TextStyle(fontSize: 9.5, color: color, fontWeight: FontWeight.bold)) : null,
        onTap: onTap,
      ),
    );
  }

  // ========================================================
  // 8. شريط التنقل السفلي مع الزر البارز بالمنتصف (+)
  // ========================================================
  Widget _buildBottomNavigationBar() {
    final isDark = widget.isDarkMode;
    final navBg = isDark ? const Color(0xFF0F172A) : const Color(0xFFF1F5F9);

    return Container(
      decoration: BoxDecoration(
        color: navBg,
        border: Border(top: BorderSide(color: isDark ? const Color(0xFF1E293B) : const Color(0xFFE2E8F0))),
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
              onTap: _openAddBottomSheet,
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
  // 9. نافذة إضافة علاج جديد BottomSheet (المطابقة للقطة 1)
  // ========================================================
  void _openAddBottomSheet() {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      isScrollControlled: true,
      builder: (context) {
        final isDark = widget.isDarkMode;
        return Container(
          decoration: BoxDecoration(
            color: isDark ? const Color(0xFF1E293B) : Colors.white,
            borderRadius: const BorderRadius.only(
              topLeft: Radius.circular(24),
              topRight: Radius.circular(24),
            ),
          ),
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              // مقبض السحب
              Container(
                width: 40,
                height: 4,
                decoration: BoxDecoration(
                  color: Colors.grey[300],
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
              const SizedBox(height: 16),
              const Text(
                'إضافة علاج جديد',
                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
              ),
              const SizedBox(height: 4),
              Text(
                'اختر طريقة تسجيل الدواء لمتابعة صلاحيته بدقة',
                style: TextStyle(fontSize: 10.5, color: isDark ? Colors.white60 : Colors.grey[600]),
              ),
              const SizedBox(height: 18),

              // خيار 1: مسح باركود
              InkWell(
                onTap: () {
                  Navigator.pop(context);
                  _openBarcodeScannerModal();
                },
                borderRadius: BorderRadius.circular(14),
                child: Container(
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: const Color(0xFF0F766E).withOpacity(0.08),
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(color: const Color(0xFF0F766E).withOpacity(0.3)),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.arrow_back, size: 16, color: Color(0xFF0F766E)),
                      const Spacer(),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.end,
                        children: const [
                          Text('مسح باركود', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12, color: Color(0xFF0F766E))),
                          Text('التعرف التلقائي على اسم الشركة والفئة والصنف', style: TextStyle(fontSize: 10, color: Colors.grey)),
                        ],
                      ),
                      const SizedBox(width: 12),
                      Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          color: const Color(0xFF0F766E),
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: const Icon(Icons.qr_code_scanner, color: Colors.white, size: 20),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 10),

              // خيار 2: إدخال يدوي
              InkWell(
                onTap: () {
                  Navigator.pop(context);
                  _openAddEditMedicineModal();
                },
                borderRadius: BorderRadius.circular(14),
                child: Container(
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: isDark ? const Color(0xFF0F172A) : const Color(0xFFF8FAFC),
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(color: const Color(0xFFE2E8F0)),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.arrow_back, size: 16, color: Colors.grey),
                      const Spacer(),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.end,
                        children: const [
                          Text('إدخال يدوي', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
                          Text('كتابة اسم العلاج والشركة وتاريخ الانتهاء يدوياً', style: TextStyle(fontSize: 10, color: Colors.grey)),
                        ],
                      ),
                      const SizedBox(width: 12),
                      Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          color: Colors.grey[800],
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: const Icon(Icons.edit, color: Colors.white, size: 20),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 20),
            ],
          ),
        );
      },
    );
  }

  // ========================================================
  // 10. نوافذ الحوار (Modals)
  // ========================================================
  void _openBarcodeScannerModal() {
    showDialog(
      context: context,
      builder: (context) {
        String testCode = '6281001230012';
        return AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
          title: const Text('ماسح الباركود الصيدلاني', textAlign: TextAlign.right, style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                height: 140,
                width: double.infinity,
                decoration: BoxDecoration(
                  color: Colors.black,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Stack(
                  alignment: Alignment.center,
                  children: const [
                    Icon(Icons.camera_alt, color: Colors.white30, size: 48),
                    Icon(Icons.qr_code_scanner, color: Color(0xFF2DD4BF), size: 90),
                  ],
                ),
              ),
              const SizedBox(height: 12),
              const Text('قم بتوجيه الكاميرا نحو باركود عبوة الدواء للتعرف عليه فوراً', textAlign: TextAlign.center, style: TextStyle(fontSize: 11, color: Colors.grey)),
              const SizedBox(height: 10),
              TextField(
                decoration: const InputDecoration(
                  labelText: 'أو أدخل رقم الباركود يدوياً',
                  border: OutlineInputBorder(),
                  contentPadding: EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                ),
                onChanged: (val) => testCode = val,
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('إلغاء'),
            ),
            ElevatedButton(
              onPressed: () {
                Navigator.pop(context);
                _openAddEditMedicineModal(initialBarcode: testCode);
              },
              style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF0F766E), foregroundColor: Colors.white),
              child: const Text('تأكيد المسح'),
            ),
          ],
        );
      },
    );
  }

  // دليل الأدوية السريع للتعرف التلقائي على الباركود في Flutter
  Map<String, String>? _lookupDrugInfo(String barcode) {
    final clean = barcode.trim();
    final db = <String, Map<String, String>>{
      '6281001230012': {
        'tradeName': 'أوجمنتين 1 جم أقراص (Augmentin 1g)',
        'scientificName': 'Amoxicillin + Clavulanic Acid 1000mg',
        'companyName': 'GSK (GlaxoSmithKline)',
        'category': 'المضادات الحيوية',
      },
      '6285000000018': {
        'tradeName': 'بانادول إكسترا (Panadol Extra)',
        'scientificName': 'Paracetamol 500mg + Caffeine 65mg',
        'companyName': 'Haleon / GSK',
        'category': 'مسكنات وخافضات حرارة',
      },
      '6281100223344': {
        'tradeName': 'كونكور 5 مجم (Concor 5mg)',
        'scientificName': 'Bisoprolol Fumarate 5mg',
        'companyName': 'Merck (ميرك)',
        'category': 'القلب والأوعية الدموية وضغط الدم',
      },
      '3582910023419': {
        'tradeName': 'جلوكوفاج 1000 مجم (Glucophage 1000mg)',
        'scientificName': 'Metformin HCl 1000mg',
        'companyName': 'Merck Serono',
        'category': 'أدوية السكري والغدد الصماء',
      },
      '7321400119283': {
        'tradeName': 'نيكسيوم 40 مجم (Nexium 40mg)',
        'scientificName': 'Esomeprazole Magnesium 40mg',
        'companyName': 'AstraZeneca (أسترازينيكا)',
        'category': 'الجهاز الهضمي والمعدة',
      },
      '5000456012948': {
        'tradeName': 'بروفين 400 مجم (Brufen 400mg)',
        'scientificName': 'Ibuprofen 400mg',
        'companyName': 'Abbott (أبوت)',
        'category': 'مسكنات وخافضات حرارة',
      },
      '6291011029341': {
        'tradeName': 'فيتامين د3 50000 وحدة (D-Vital)',
        'scientificName': 'Cholecalciferol 50,000 IU',
        'companyName': 'Julphar (جلفار)',
        'category': 'الفيتامينات والمكملات',
      },
      '6281008899001': {
        'tradeName': 'باراسيتامول سامراء 500 مجم (Paracetamol SDI)',
        'scientificName': 'Paracetamol 500mg',
        'companyName': 'SDI Samarra (أدوية سامراء العراقية)',
        'category': 'مسكنات وخافضات حرارة',
      },
    };
    return db[clean];
  }

  void _openAddEditMedicineModal({Medicine? medicineToEdit, String? initialBarcode}) {
    String autoTrade = medicineToEdit?.tradeName ?? '';
    String autoSci = medicineToEdit?.scientificName ?? '';
    String autoComp = medicineToEdit?.companyName ?? '';
    String autoCat = medicineToEdit?.category ?? '';

    if (medicineToEdit == null && initialBarcode != null && initialBarcode.isNotEmpty) {
      final match = _lookupDrugInfo(initialBarcode);
      if (match != null) {
        autoTrade = match['tradeName'] ?? '';
        autoSci = match['scientificName'] ?? '';
        autoComp = match['companyName'] ?? '';
        autoCat = match['category'] ?? '';
      }
    }

    final tradeCtrl = TextEditingController(text: autoTrade);
    final sciCtrl = TextEditingController(text: autoSci);
    final compCtrl = TextEditingController(text: autoComp);
    final catCtrl = TextEditingController(text: autoCat);
    final barCtrl = TextEditingController(text: medicineToEdit?.barcode ?? initialBarcode ?? '');
    final qtyCtrl = TextEditingController(text: '${medicineToEdit?.quantity ?? 1}');
    DateTime expDate = medicineToEdit?.expiryDate ?? DateTime.now().add(const Duration(days: 180));

    showDialog(
      context: context,
      builder: (ctx) {
        return StatefulBuilder(
          builder: (context, setDlgState) {
            return AlertDialog(
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
              title: Text(
                medicineToEdit != null ? 'تعديل بيانات الدواء' : 'إضافة دواء جديد للصيدلية',
                textAlign: TextAlign.right,
                style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
              ),
              content: SingleChildScrollView(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    TextField(controller: tradeCtrl, textAlign: TextAlign.right, decoration: const InputDecoration(labelText: 'الاسم التجاري')),
                    TextField(controller: sciCtrl, textAlign: TextAlign.right, decoration: const InputDecoration(labelText: 'الاسم العلمي')),
                    TextField(controller: compCtrl, textAlign: TextAlign.right, decoration: const InputDecoration(labelText: 'الشركة المصنعة')),
                    TextField(controller: catCtrl, textAlign: TextAlign.right, decoration: const InputDecoration(labelText: 'التصنيف / الفئة')),
                    TextField(controller: barCtrl, textAlign: TextAlign.right, decoration: const InputDecoration(labelText: 'رقم الباركود')),
                    TextField(controller: qtyCtrl, keyboardType: TextInputType.number, textAlign: TextAlign.right, decoration: const InputDecoration(labelText: 'الكمية')),
                    const SizedBox(height: 12),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        ElevatedButton(
                          onPressed: () async {
                            final picked = await showDatePicker(
                              context: context,
                              initialDate: expDate,
                              firstDate: DateTime(2020),
                              lastDate: DateTime(2035),
                            );
                            if (picked != null) {
                              setDlgState(() => expDate = picked);
                            }
                          },
                          child: const Text('تغيير التاريخ'),
                        ),
                        Text('تاريخ الانتهاء: ${DateFormat('yyyy-MM-dd').format(expDate)}', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 11)),
                      ],
                    ),
                  ],
                ),
              ),
              actions: [
                TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('إلغاء')),
                ElevatedButton(
                  onPressed: () {
                    if (tradeCtrl.text.trim().isEmpty) return;
                    setState(() {
                      if (medicineToEdit != null) {
                        medicineToEdit.tradeName = tradeCtrl.text;
                        medicineToEdit.scientificName = sciCtrl.text;
                        medicineToEdit.companyName = compCtrl.text;
                        medicineToEdit.category = catCtrl.text;
                        medicineToEdit.barcode = barCtrl.text;
                        medicineToEdit.quantity = int.tryParse(qtyCtrl.text) ?? 1;
                        medicineToEdit.expiryDate = expDate;
                      } else {
                        _medicines.add(Medicine(
                          id: DateTime.now().millisecondsSinceEpoch,
                          tradeName: tradeCtrl.text,
                          scientificName: sciCtrl.text,
                          companyName: compCtrl.text,
                          category: catCtrl.text,
                          barcode: barCtrl.text,
                          quantity: int.tryParse(qtyCtrl.text) ?? 1,
                          expiryDate: expDate,
                          alertThresholdDays: 60,
                        ));
                      }
                    });
                    Navigator.pop(ctx);
                  },
                  style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF0F766E), foregroundColor: Colors.white),
                  child: const Text('حفظ الدواء'),
                ),
              ],
            );
          },
        );
      },
    );
  }

  void _confirmDeleteMedicine(Medicine med) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Text('تأكيد الحذف', textAlign: TextAlign.right, style: TextStyle(fontWeight: FontWeight.bold)),
        content: Text('هل أنت متأكد من حذف الدواء: ${med.tradeName}؟', textAlign: TextAlign.right),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('إلغاء')),
          ElevatedButton(
            onPressed: () {
              setState(() => _medicines.remove(med));
              Navigator.pop(ctx);
            },
            style: ElevatedButton.styleFrom(backgroundColor: Colors.red, foregroundColor: Colors.white),
            child: const Text('حذف'),
          ),
        ],
      ),
    );
  }

  void _openOfficialDisposalReportModal() {
    final expiredList = _medicines.where((m) => m.analyze().status == ExpiryStatus.expired).toList();
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: const [
            Icon(Icons.print, color: Color(0xFF0F766E)),
            Text('محضر إتلاف أدوية رسمي', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
          ],
        ),
        content: SizedBox(
          width: double.maxFinite,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              const Text('جمهورية العراق - وزارة الصحة / نقابة الصيادلة', style: TextStyle(fontSize: 10, color: Colors.grey)),
              const Text('صيدلية الشفاء المركزية - محضر إتلاف منتهي الصلاحية', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
              const Divider(),
              if (expiredList.isEmpty)
                const Text('لا توجد أدوية منتهية للإتلاف حالياً.')
              else
                ...expiredList.map((m) => Text('• ${m.tradeName} (الكمية: ${m.quantity})', style: const TextStyle(fontSize: 11))),
              const SizedBox(height: 12),
              const Text('توقيع الصيدلي المسؤول: د. أحمد الصيدلي ____________', style: TextStyle(fontSize: 10)),
            ],
          ),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('إغلاق')),
          ElevatedButton.icon(
            onPressed: () {
              Navigator.pop(ctx);
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('تم إرسال محضر الإتلاف للطابعة بنجاح 🖨️')),
              );
            },
            icon: const Icon(Icons.print, size: 16),
            label: const Text('طباعة المحضر'),
            style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF0F766E), foregroundColor: Colors.white),
          ),
        ],
      ),
    );
  }

  void _openStaffManagementModal() {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: const Text('إدارة حسابات الستاف والموظفين', textAlign: TextAlign.right, style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.end,
          children: const [
            Text('كود انضمام كادر الصيدلية:', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
            SizedBox(height: 4),
            Text('EXPIRO-STAFF-9941', style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Color(0xFF0F766E), fontFamily: 'monospace')),
            Divider(height: 20),
            Text('1. ص. علي كريم (موظف كادر - نشط)', style: TextStyle(fontSize: 11)),
            Text('2. ص. سارة محمد (موظف كادر - نشط)', style: TextStyle(fontSize: 11)),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('إغلاق')),
        ],
      ),
    );
  }

  void _openPharmacyLicenseModal() {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: const Text('بيانات الصيدلية وإجازة الممارسة', textAlign: TextAlign.right, style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.end,
          children: const [
            Text('اسم الصيدلية: صيدلية الشفاء المركزية', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 11)),
            Text('رقم الإجازة الرسمية: 88492/بغداد', style: TextStyle(fontSize: 10, color: Colors.grey)),
            SizedBox(height: 8),
            Text('وثيقة الترخيص وممارسة المهنة محفوظة وموثقة في قاعدة البيانات السحابية.', style: TextStyle(fontSize: 10)),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('إغلاق')),
        ],
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
            // الهايدر العلوي المنحني الديناميكي (مطابق 100% للصورة رقم 2)
            if (_activeTab == 0)
              _buildExactHeader()
            else if (_activeTab == 1)
              _buildSectionHeader(title: 'الخسائر', icon: Icons.trending_down)
            else if (_activeTab == 2)
              _buildSectionHeader(title: 'الدعم', icon: Icons.headphones_rounded)
            else if (_activeTab == 3)
              _buildSectionHeader(title: 'حسابي', icon: Icons.person_rounded)
            else
              _buildSectionHeader(title: 'التنبيهات', icon: Icons.notifications_none_rounded),

            // المحتوى بناءً على التبويب النشط
            Expanded(
              child: _activeTab == 0
                  ? RefreshIndicator(
                      color: const Color(0xFF0D9488),
                      onRefresh: () async {
                        await Future.delayed(const Duration(milliseconds: 600));
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
                                children: const [
                                  Icon(Icons.inventory_2_outlined, size: 48, color: Colors.grey),
                                  SizedBox(height: 8),
                                  Text(
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

// ==========================================
// 11. لوحة تحكم مالك النظام (Admin Dashboard Widget)
// ==========================================
class AdminDashboardWidget extends StatefulWidget {
  final bool isDarkMode;
  final VoidCallback onToggleTheme;
  final VoidCallback onBackToApp;
  final VoidCallback? onLogout;

  const AdminDashboardWidget({
    super.key,
    required this.isDarkMode,
    required this.onToggleTheme,
    required this.onBackToApp,
    this.onLogout,
  });

  @override
  State<AdminDashboardWidget> createState() => _AdminDashboardWidgetState();
}

class _AdminDashboardWidgetState extends State<AdminDashboardWidget> {
  String _adminFilter = 'all'; // all, active, suspended
  String _search = '';

  @override
  Widget build(BuildContext context) {
    final isDark = widget.isDarkMode;

    return Scaffold(
      body: SafeArea(
        top: false,
        child: Column(
          children: [
            // ترويسة مالك النظام الخضراء الزمردية (مطابقة لقطة الشاشة)
            Container(
              decoration: const BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topRight,
                  end: Alignment.bottomLeft,
                  colors: [Color(0xFF0F766E), Color(0xFF047857)],
                ),
              ),
              padding: const EdgeInsets.only(top: 40, bottom: 14, left: 14, right: 14),
              child: Column(
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      // زر معاينة واجهة الأدوية وزر تسجيل الخروج
                      Row(
                        children: [
                          ElevatedButton.icon(
                            onPressed: widget.onBackToApp,
                            icon: const Icon(Icons.storefront_outlined, size: 14),
                            label: const Text('معاينة واجهة الأدوية', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold)),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: Colors.white.withOpacity(0.2),
                              foregroundColor: Colors.white,
                              elevation: 0,
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                            ),
                          ),
                          const SizedBox(width: 6),
                          IconButton(
                            onPressed: widget.onLogout ?? widget.onBackToApp,
                            icon: const Icon(Icons.logout, size: 18, color: Colors.white70),
                            tooltip: 'تسجيل الخروج',
                          ),
                        ],
                      ),

                      // العنوان والشارة
                      Row(
                        children: [
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.end,
                            children: const [
                              Text(
                                'لوحة تحكم مالك النظام (Admin)',
                                style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12),
                              ),
                              Text(
                                'إدارة الصيدليات المسجلة، الصلاحيات، ومراقبة التراخيص',
                                style: TextStyle(color: Color(0xFFA7F3D0), fontSize: 9),
                              ),
                            ],
                          ),
                          const SizedBox(width: 8),
                          Container(
                            padding: const EdgeInsets.all(6),
                            decoration: BoxDecoration(
                              color: Colors.white.withOpacity(0.15),
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: const Icon(Icons.shield, color: Colors.white, size: 18),
                          ),
                        ],
                      ),
                    ],
                  ),
                ],
              ),
            ),

            // المحتوى الرئيسي للوحة التحكم
            Expanded(
              child: ListView(
                padding: const EdgeInsets.all(14),
                children: [
                  // بطاقة المالك مع التاج الذهبي
                  Container(
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      color: isDark ? const Color(0xFF1E293B) : Colors.white,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: const Color(0xFFE2E8F0)),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Icon(Icons.star, color: Color(0xFFF59E0B), size: 28),
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.end,
                          children: const [
                            Text('مالك التطبيق (Admin)', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                            Text('رقم الهاتف المعتمد: 07829692579 | الدور: role: admin', style: TextStyle(fontSize: 10, color: Colors.grey)),
                            Text('حساب المالك مهيأ مسبقاً في Firestore بصلاحيات تحكم كاملة', style: TextStyle(fontSize: 9.5, color: Color(0xFF0F766E))),
                          ],
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 12),

                  // بطاقات الإحصائيات الـ 4
                  Row(
                    children: [
                      Expanded(
                        child: _buildAdminKpiCard(title: 'إجمالي الحسابات المسجلة', count: 1, subtitle: 'صيدلية وصيدلي مسجل بقاعدة البيانات', color: const Color(0xFF0F766E)),
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: _buildAdminKpiCard(title: 'الحسابات النشطة والمفعلة', count: 1, subtitle: 'يمكنهم إدارة مخزونهم بنجاح', color: const Color(0xFF10B981)),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      Expanded(
                        child: _buildAdminKpiCard(title: 'إجازات ممارسة مرفقة', count: 0, subtitle: 'وثائق مشفرة ومحفوظة Base64', color: const Color(0xFF3B82F6)),
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: _buildAdminKpiCard(title: 'الحسابات الموقوفة', count: 0, subtitle: 'تم تعطيل دخولهم للصيدلية', color: const Color(0xFFEF4444)),
                      ),
                    ],
                  ),
                  const SizedBox(height: 14),

                  // فلاتر التبويب: الكل (1), نشط فقط (1), موقوف (0)
                  Row(
                    children: [
                      _buildAdminFilterTab('الكل (1)', 'all'),
                      const SizedBox(width: 6),
                      _buildAdminFilterTab('نشط فقط (1)', 'active'),
                      const SizedBox(width: 6),
                      _buildAdminFilterTab('موقوف (0)', 'suspended'),
                    ],
                  ),
                  const SizedBox(height: 10),

                  // حقل البحث
                  Container(
                    height: 42,
                    decoration: BoxDecoration(
                      color: isDark ? const Color(0xFF1E293B) : Colors.white,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: const Color(0xFFE2E8F0)),
                    ),
                    child: TextField(
                      onChanged: (val) => setState(() => _search = val),
                      textAlign: TextAlign.right,
                      style: const TextStyle(fontSize: 11.5),
                      decoration: const InputDecoration(
                        hintText: 'بحث بالاسم، الصيدلية، أو رقم الهاتف...',
                        prefixIcon: Icon(Icons.search, size: 18, color: Colors.grey),
                        border: InputBorder.none,
                        contentPadding: EdgeInsets.symmetric(vertical: 12),
                      ),
                    ),
                  ),
                  const SizedBox(height: 14),

                  // قائمة الصيدليات والصيادلة
                  Container(
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      color: isDark ? const Color(0xFF1E293B) : Colors.white,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: const Color(0xFFE2E8F0)),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        const Text('قائمة الصيدليات والصيادلة', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12.5)),
                        const Text('يمكنك تفعيل أو إيقاف أي حساب وتعيين كلمة مرور بديلة', style: TextStyle(color: Colors.grey, fontSize: 10)),
                        const SizedBox(height: 12),
                        Container(
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: isDark ? const Color(0xFF0F172A) : const Color(0xFFF8FAFC),
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(color: const Color(0xFFE2E8F0)),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.end,
                            children: [
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Row(
                                    children: [
                                      Container(
                                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                        decoration: BoxDecoration(color: const Color(0xFFCCFBF1), borderRadius: BorderRadius.circular(6)),
                                        child: const Text('نشط ومعتمد', style: TextStyle(color: Color(0xFF0F766E), fontSize: 9, fontWeight: FontWeight.bold)),
                                      ),
                                      const SizedBox(width: 4),
                                      Container(
                                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                        decoration: BoxDecoration(color: const Color(0xFFFEF3C7), borderRadius: BorderRadius.circular(6)),
                                        child: const Text('مالك النظام (Admin)', style: TextStyle(color: Color(0xFFB45309), fontSize: 9, fontWeight: FontWeight.bold)),
                                      ),
                                    ],
                                  ),
                                  const Text('مالك التطبيق (Admin)', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
                                ],
                              ),
                              const SizedBox(height: 4),
                              const Text('إدارة تطبيق Expiro المركزية', style: TextStyle(fontSize: 10, color: Colors.grey)),
                              const Text('07829692579  •  2026/10/25', style: TextStyle(fontSize: 9.5, color: Colors.grey, fontFamily: 'monospace')),
                              const SizedBox(height: 8),
                              Row(
                                mainAxisAlignment: MainAxisAlignment.end,
                                children: [
                                  ElevatedButton.icon(
                                    onPressed: () {
                                      ScaffoldMessenger.of(context).showSnackBar(
                                        const SnackBar(content: Text('تم إرسال رابط ضبط كلمة المرور إلى 07829692579')),
                                      );
                                    },
                                    icon: const Icon(Icons.key, size: 12),
                                    label: const Text('ضبط كلمة المرور', style: TextStyle(fontSize: 10)),
                                    style: ElevatedButton.styleFrom(
                                      backgroundColor: const Color(0xFF0F766E),
                                      foregroundColor: Colors.white,
                                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                    ),
                                  ),
                                  const SizedBox(width: 6),
                                  OutlinedButton(
                                    onPressed: () {},
                                    style: OutlinedButton.styleFrom(padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4)),
                                    child: const Text('بدون إجازة', style: TextStyle(fontSize: 10, color: Colors.grey)),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildAdminKpiCard({required String title, required int count, required String subtitle, required Color color}) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: widget.isDarkMode ? const Color(0xFF1E293B) : Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: const Color(0xFFE2E8F0)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.end,
        children: [
          Text(title, textAlign: TextAlign.right, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 10)),
          const SizedBox(height: 4),
          Text('$count', style: TextStyle(fontWeight: FontWeight.w900, fontSize: 18, color: color)),
          const SizedBox(height: 2),
          Text(subtitle, textAlign: TextAlign.right, style: const TextStyle(fontSize: 8.5, color: Colors.grey)),
        ],
      ),
    );
  }

  Widget _buildAdminFilterTab(String label, String key) {
    final isSelected = _adminFilter == key;
    return InkWell(
      onTap: () => setState(() => _adminFilter = key),
      borderRadius: BorderRadius.circular(8),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
        decoration: BoxDecoration(
          color: isSelected ? const Color(0xFF0F766E) : (widget.isDarkMode ? const Color(0xFF1E293B) : Colors.white),
          borderRadius: BorderRadius.circular(8),
          border: Border.all(color: isSelected ? const Color(0xFF0F766E) : const Color(0xFFE2E8F0)),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 10,
            fontWeight: FontWeight.bold,
            color: isSelected ? Colors.white : (widget.isDarkMode ? Colors.white70 : Colors.black87),
          ),
        ),
      ),
    );
  }
}
