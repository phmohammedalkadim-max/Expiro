import React, { useState, useRef } from 'react';
import { 
  Building2, 
  Lock, 
  Phone, 
  User, 
  Eye, 
  EyeOff, 
  FileCheck2, 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  ShieldCheck, 
  X, 
  Sparkles,
  Loader2,
  KeyRound,
  MessageSquare,
  RefreshCw,
  Copy,
  Check
} from 'lucide-react';
import { 
  registerPharmacist, 
  loginPharmacist, 
  resetPasswordWithPhone,
  compressImageToBase64, 
  PharmacistUser,
  ADMIN_PHONE,
  isOwnerAdminPhone,
  normalizePhone
} from '../services/firebase';

interface AuthScreenProps {
  onLoginSuccess: (user: PharmacistUser) => void;
  isDarkMode: boolean;
  initialMode?: 'login' | 'register';
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLoginSuccess, isDarkMode, initialMode = 'login' }) => {
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'forgot'>(initialMode);
  
  // Registration fields
  const [fullName, setFullName] = useState('');
  const [pharmacyName, setPharmacyName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [licenseBase64, setLicenseBase64] = useState<string>('');
  const [licenseFileName, setLicenseFileName] = useState<string>('');

  // Login fields
  const [loginPhone, setLoginPhone] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Forgot Password / SMS Verification fields
  const [forgotPhone, setForgotPhone] = useState('');
  const [forgotStep, setForgotStep] = useState<'phone' | 'verify_sms' | 'new_password'>('phone');
  const [generatedSmsCode, setGeneratedSmsCode] = useState<string>('');
  const [enteredSmsCode, setEnteredSmsCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [smsTimer, setSmsTimer] = useState(60);
  const [isCopiedCode, setIsCopiedCode] = useState(false);

  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // معالجة رفع وتشفير صورة الإجازة
  const handleLicenseUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage('يرجى اختيار ملف صورة صالح (JPG أو PNG)');
      return;
    }

    try {
      setErrorMessage(null);
      setLicenseFileName(file.name);
      // ضغط الصورة وتحويلها إلى Base64
      const base64 = await compressImageToBase64(file);
      setLicenseBase64(base64);
    } catch (err) {
      console.error('Error reading license image:', err);
      setErrorMessage('تعذر قراءة ملف الصورة، يرجى تجربة صورة أخرى');
    }
  };

  const removeLicensePhoto = () => {
    setLicenseBase64('');
    setLicenseFileName('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // 1. معالجة إنشاء حساب جديد للصيادلة
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!fullName.trim() || !regPhone.trim() || !regPassword.trim()) {
      setErrorMessage('يرجى ملء كافة الحقول الإلزامية: الاسم، الهاتف، وكلمة المرور');
      return;
    }

    if (regPassword.length < 4) {
      setErrorMessage('كلمة المرور يجب أن تكون 4 أحرف أو أرقام على الأقل');
      return;
    }

    if (isOwnerAdminPhone(regPhone)) {
      setErrorMessage('هذا الرقم مخصص لحساب المالك (Admin) المسجل مسبقاً، يمكنك تسجيل الدخول مباشرة');
      return;
    }

    setIsLoading(true);
    try {
      const result = await registerPharmacist({
        fullName: fullName.trim(),
        pharmacyName: pharmacyName.trim() || `صيدلية د. ${fullName.split(' ')[0]}`,
        phone: regPhone.trim(),
        password: regPassword.trim(),
        licensePhotoBase64: licenseBase64,
      });

      if (result.success) {
        setSuccessMessage('تم إنشاء الحساب بنجاح في قاعدة البيانات! جاري تحويلك لشاشة تسجيل الدخول...');
        
        // تجهيز بيانات شاشة الدخول المسبقة
        setLoginPhone(regPhone.trim());
        setLoginPassword(regPassword.trim());

        // نقل الصيدلي فوراً إلى شاشة الدخول
        setTimeout(() => {
          setAuthMode('login');
          setSuccessMessage('تم الانتقال لشاشة تسجيل الدخول. يمكنك الآن تسجيل الدخول مباشرة.');
          setIsLoading(false);
        }, 1400);
      } else {
        setErrorMessage(result.message);
        setIsLoading(false);
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'حدث خطأ أثناء إنشاء الحساب، يرجى المحاولة لاحقاً');
      setIsLoading(false);
    }
  };

  // 2. معالجة تسجيل الدخول والتوجيه
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!loginPhone.trim() || !loginPassword.trim()) {
      setErrorMessage('يرجى إدخال رقم الهاتف وكلمة المرور');
      return;
    }

    setIsLoading(true);
    try {
      const result = await loginPharmacist(loginPhone.trim(), loginPassword.trim());

      if (result.success && result.user) {
        setSuccessMessage(result.message);
        setTimeout(() => {
          onLoginSuccess(result.user!);
        }, 600);
      } else {
        setErrorMessage(result.message);
        setIsLoading(false);
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'فشل تسجيل الدخول، يرجى التأكد من البيانات والاتصال');
      setIsLoading(false);
    }
  };

  // 3. إرسال رمز SMS لاستعادة كلمة المرور
  const handleSendSmsCode = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const clean = normalizePhone(forgotPhone.trim());
    if (!clean) {
      setErrorMessage('يرجى إدخال رقم هاتف صالح');
      return;
    }

    setIsLoading(true);

    // توليد رمز تحقق عشوائي من 6 أرقام
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedSmsCode(code);

    setTimeout(() => {
      setIsLoading(false);
      setForgotStep('verify_sms');
      setSmsTimer(60);
      setSuccessMessage(`تم إرسال رمز التحقق عبر SMS إلى (${clean}).`);
    }, 600);
  };

  // التحقق من رمز SMS
  const handleVerifySmsCode = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (enteredSmsCode.trim() !== generatedSmsCode.trim()) {
      setErrorMessage('رمز التحقق غير صحيح، يرجى التأكد من الرمز وإعادة المحاولة');
      return;
    }

    setSuccessMessage('تم تأكيد رمز SMS بنجاح! أدخل كلمة المرور الجديدة الآن');
    setForgotStep('new_password');
  };

  // حفظ كلمة المرور الجديدة في Firestore
  const handleSaveNewPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!newPassword.trim() || newPassword.length < 4) {
      setErrorMessage('كلمة المرور يجب أن لا تقل عن 4 خانات');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setErrorMessage('كلمتا المرور غير متطابقتين');
      return;
    }

    setIsLoading(true);
    try {
      const result = await resetPasswordWithPhone(forgotPhone, newPassword);
      if (result.success) {
        setSuccessMessage(result.message);
        setLoginPhone(forgotPhone.trim());
        setLoginPassword(newPassword.trim());

        setTimeout(() => {
          setAuthMode('login');
          setForgotStep('phone');
          setEnteredSmsCode('');
          setNewPassword('');
          setConfirmNewPassword('');
          setIsLoading(false);
        }, 1500);
      } else {
        setErrorMessage(result.message);
        setIsLoading(false);
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'حدث خطأ أثناء حفظ كلمة المرور');
      setIsLoading(false);
    }
  };

  // نسخ الرمز وتعبئته بنقرة واحدة
  const handleAutoFillCode = () => {
    if (generatedSmsCode) {
      setEnteredSmsCode(generatedSmsCode);
      setIsCopiedCode(true);
      setTimeout(() => setIsCopiedCode(false), 2000);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 sm:p-6 transition-colors font-['Cairo',sans-serif] ${
      isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-[#F1F5F9] text-[#1E293B]'
    }`} dir="rtl">
      
      <div className="w-full max-w-md">
        
        {/* بطاقة المصادقة الرئيسية */}
        <div className={`rounded-3xl border shadow-xl overflow-hidden transition-all duration-300 ${
          isDarkMode 
            ? 'bg-slate-900 border-slate-800' 
            : 'bg-white border-[#E2E8F0]'
        }`}>
          
          {/* Header ترويسة التطبيق */}
          <div className="bg-gradient-to-r from-[#0F766E] to-[#0D9488] p-6 text-white text-center relative">
            <div className="w-16 h-16 rounded-[24%] p-1 bg-white/20 backdrop-blur-md border border-white/30 shadow-xl mx-auto mb-3 overflow-hidden flex items-center justify-center">
              <img 
                src="/assets/aistudio/1000003085_8b29976f.png" 
                alt="Expiro Icon" 
                className="w-full h-full object-contain filter drop-shadow-md"
              />
            </div>
            <h1 className="text-xl font-black tracking-wide">Expiro</h1>
            <p className="text-xs text-teal-100 font-medium mt-1">نظام إدارة صلاحيات الأدوية الصيدلانية</p>
            
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-white/15 text-[10px] font-bold text-teal-50 mt-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>نظام موثق بقاعدة بيانات Firebase</span>
            </div>
          </div>

          <div className="p-6 space-y-4">
            
            {/* أزرار التبويب العلوية الواضحة للتبديل الفوري بين تسجيل الدخول وإنشاء الحساب */}
            <div className="grid grid-cols-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl gap-1">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('login');
                  setErrorMessage(null);
                  setSuccessMessage(null);
                }}
                className={`py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                  authMode === 'login'
                    ? 'bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-400 shadow-sm border border-slate-200 dark:border-slate-700'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Lock className="w-3.5 h-3.5" />
                <span>تسجيل الدخول</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setAuthMode('register');
                  setErrorMessage(null);
                  setSuccessMessage(null);
                }}
                className={`py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                  authMode === 'register'
                    ? 'bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-400 shadow-sm border border-slate-200 dark:border-slate-700'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>إنشاء حساب جديد</span>
              </button>
            </div>

            {/* عنوان النمط الحالي */}
            <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
              <div>
                <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                  {authMode === 'login' && 'تسجيل الدخول'}
                  {authMode === 'register' && 'إنشاء حساب صيدلي جديد'}
                  {authMode === 'forgot' && 'استعادة وتعيين كلمة المرور'}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {authMode === 'login' && 'أدخل رقم الهاتف وكلمة المرور للدخول لحسابك'}
                  {authMode === 'register' && 'سجل بيانات الصيدلي وإجازة الممارسة لحفظها في Firestore'}
                  {authMode === 'forgot' && 'تأكيد رقم الهاتف عبر رمز SMS وتعيين كلمة مرور جديدة'}
                </p>
              </div>
              <div className="w-8 h-8 rounded-full bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-400 flex items-center justify-center">
                {authMode === 'login' && <Lock className="w-4 h-4" />}
                {authMode === 'register' && <Sparkles className="w-4 h-4" />}
                {authMode === 'forgot' && <KeyRound className="w-4 h-4" />}
              </div>
            </div>

            {/* رسائل التنبيه والخطأ */}
            {errorMessage && (
              <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span className="font-semibold">{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span className="font-semibold">{successMessage}</span>
              </div>
            )}

            {/* 1. نموذج تسجيل الدخول */}
            {authMode === 'login' && (
              <form onSubmit={handleLogin} className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    رقم الهاتف *
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type="tel"
                      value={loginPhone}
                      onChange={(e) => setLoginPhone(e.target.value)}
                      placeholder="07XXXXXXXXX"
                      required
                      dir="ltr"
                      className="w-full pl-3 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono text-left focus:outline-none focus:ring-2 focus:ring-teal-600/30"
                    />
                    <Phone className="w-4 h-4 text-slate-400 absolute right-3 pointer-events-none" />
                  </div>
                  {isOwnerAdminPhone(loginPhone) && (
                    <p className="text-[10px] text-amber-600 font-bold mt-1 flex items-center gap-1">
                      <span>👑 حساب مالك النظام (Admin)</span>
                    </p>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300">
                      كلمة المرور *
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('forgot');
                        setForgotPhone(loginPhone || '');
                        setForgotStep('phone');
                        setErrorMessage(null);
                        setSuccessMessage(null);
                      }}
                      className="text-[11px] text-[#0D9488] dark:text-teal-400 hover:underline font-bold"
                    >
                      هل نسيت كلمة المرور؟
                    </button>
                  </div>
                  <div className="relative flex items-center">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      dir="ltr"
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-left focus:outline-none focus:ring-2 focus:ring-teal-600/30"
                    />
                    <Lock className="w-4 h-4 text-slate-400 absolute right-3 pointer-events-none" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute left-3 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-gradient-to-r from-[#0F766E] to-[#0D9488] hover:from-[#0D9488] hover:to-[#0F766E] text-white font-bold rounded-xl shadow-md transition-all active:scale-98 flex items-center justify-center gap-2 mt-2 disabled:opacity-60"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>جاري مطابقة البيانات في Firestore...</span>
                    </>
                  ) : (
                    <>
                      <span>تسجيل الدخول</span>
                      <ArrowRight className="w-4 h-4 rotate-180" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* 2. نموذج إنشاء حساب جديد للصيادلة */}
            {authMode === 'register' && (
              <form onSubmit={handleRegister} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    الاسم واللقب *
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="مثال: د. مصطفى حميد"
                      required
                      className="w-full pl-3 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-600/30"
                    />
                    <User className="w-4 h-4 text-slate-400 absolute right-3 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    اسم الصيدلية
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      value={pharmacyName}
                      onChange={(e) => setPharmacyName(e.target.value)}
                      placeholder="مثال: صيدلية الأمل"
                      className="w-full pl-3 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-600/30"
                    />
                    <Building2 className="w-4 h-4 text-slate-400 absolute right-3 pointer-events-none" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      رقم الهاتف *
                    </label>
                    <div className="relative flex items-center">
                      <input
                        type="tel"
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value)}
                        placeholder="07701234567"
                        required
                        dir="ltr"
                        className="w-full pl-2 pr-8 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono text-left focus:outline-none focus:ring-2 focus:ring-teal-600/30 text-xs"
                      />
                      <Phone className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      كلمة المرور *
                    </label>
                    <div className="relative flex items-center">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        dir="ltr"
                        className="w-full pl-8 pr-8 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-left focus:outline-none focus:ring-2 focus:ring-teal-600/30 text-xs"
                      />
                      <Lock className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 pointer-events-none" />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute left-2.5 text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* خيار إرفاق صورة إجازة الصيدلية وتحويلها لـ Base64 لـ Firestore */}
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    صورة إجازة الصيدلية (تحويل تلقائي Base64) *
                  </label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleLicenseUpload}
                    className="hidden"
                  />

                  {licenseBase64 ? (
                    <div className="p-3 rounded-2xl border border-teal-200 dark:border-teal-800 bg-teal-50/50 dark:bg-teal-950/30 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img 
                          src={licenseBase64} 
                          alt="License preview" 
                          className="w-10 h-10 rounded-lg object-cover border border-teal-300 shrink-0" 
                        />
                        <div className="min-w-0">
                          <p className="font-bold text-teal-900 dark:text-teal-200 truncate text-xs">
                            {licenseFileName || 'صورة الإجازة جاهزة'}
                          </p>
                          <p className="text-[10px] text-teal-700 dark:text-teal-400">
                            تم التحويل والتشفير إلى Base64 بنجاح
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={removeLicensePhoto}
                        className="p-1 rounded-full text-slate-400 hover:text-rose-600 transition-colors"
                        title="إلغاء الصورة"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full p-3 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-teal-500 bg-slate-50/60 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400 flex items-center justify-center gap-2 transition-all group"
                    >
                      <Upload className="w-4 h-4 text-teal-600 group-hover:scale-110 transition-transform" />
                      <span className="font-bold">اضغط لرفع صورة إجازة الصيدلية الرسمية</span>
                    </button>
                  )}
                  <p className="text-[10px] text-slate-400 mt-1">
                    يتم تخزين الإجازة في Firestore تحت users مع صلاحية <span className="font-bold">role: "pharmacist"</span> وتفعيل تلقائي.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-gradient-to-r from-[#0F766E] to-[#0D9488] hover:from-[#0D9488] hover:to-[#0F766E] text-white font-bold rounded-xl shadow-md transition-all active:scale-98 flex items-center justify-center gap-2 mt-3 disabled:opacity-60"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>جاري حفظ الحساب في Firestore...</span>
                    </>
                  ) : (
                    <>
                      <FileCheck2 className="w-4 h-4" />
                      <span>إنشاء حساب</span>
                    </>
                  )}
                </button>
              </form>
            )}

            {/* 3. استعادة كلمة المرور عبر SMS ("هل نسيت كلمة المرور؟") */}
            {authMode === 'forgot' && (
              <div className="space-y-4 text-xs">
                
                {/* خطوة 1: إدخال رقم الهاتف وإرسال SMS */}
                {forgotStep === 'phone' && (
                  <form onSubmit={handleSendSmsCode} className="space-y-3">
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                      أدخل رقم هاتفك المسجل (يطبق على المالك والصيادلة) لتلقي رمز التحقق السريع عبر رسالة نصية SMS.
                    </p>

                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        رقم الهاتف *
                      </label>
                      <div className="relative flex items-center">
                        <input
                          type="tel"
                          value={forgotPhone}
                          onChange={(e) => setForgotPhone(e.target.value)}
                          placeholder="مثال: 07XXXXXXXXX"
                          required
                          dir="ltr"
                          className="w-full pl-3 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono text-left focus:outline-none focus:ring-2 focus:ring-teal-600/30"
                        />
                        <Phone className="w-4 h-4 text-slate-400 absolute right-3 pointer-events-none" />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-3 bg-gradient-to-r from-[#0F766E] to-[#0D9488] text-white font-bold rounded-xl shadow-md transition-all active:scale-98 flex items-center justify-center gap-2 mt-2 disabled:opacity-60"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>جاري إرسال رمز SMS...</span>
                        </>
                      ) : (
                        <>
                          <MessageSquare className="w-4 h-4" />
                          <span>إرسال رمز التحقق عبر SMS</span>
                        </>
                      )}
                    </button>
                  </form>
                )}

                {/* خطوة 2: إدخال رمز SMS الوارد */}
                {forgotStep === 'verify_sms' && (
                  <form onSubmit={handleVerifySmsCode} className="space-y-3.5">
                    
                    {/* شريط محاكاة إشعار رسالة الـ SMS لتجربة فورية ومضمونة */}
                    {generatedSmsCode && (
                      <div className="p-3 rounded-2xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <MessageSquare className="w-4 h-4 text-teal-600" />
                            <span className="font-extrabold text-teal-900 dark:text-teal-200 text-xs">
                              رسالة SMS واردة من Expiro:
                            </span>
                          </div>
                          <span className="text-[10px] text-teal-600 font-mono">الآن</span>
                        </div>
                        <p className="text-[11px] text-teal-800 dark:text-teal-300">
                          رمز التحقق الخاص بك هو: <span className="font-mono font-black text-sm text-teal-950 dark:text-white tracking-widest">{generatedSmsCode}</span>
                        </p>
                        <button
                          type="button"
                          onClick={handleAutoFillCode}
                          className="w-full py-1.5 px-2 bg-teal-700 hover:bg-teal-800 text-white rounded-lg font-bold text-[11px] flex items-center justify-center gap-1.5 transition-all shadow-xs"
                        >
                          {isCopiedCode ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{isCopiedCode ? 'تم النسخ والتعبئة بنجاح' : 'نسخ وتعبئة الرمز تلقائياً'}</span>
                        </button>
                      </div>
                    )}

                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        أدخل رمز التحقق (6 أرقام) *
                      </label>
                      <input
                        type="text"
                        value={enteredSmsCode}
                        onChange={(e) => setEnteredSmsCode(e.target.value.trim())}
                        placeholder="••••••"
                        maxLength={6}
                        required
                        dir="ltr"
                        className="w-full text-center text-lg font-mono font-bold tracking-widest py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-600/30"
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>لم يصلك الرمز؟</span>
                      <button
                        type="button"
                        onClick={handleSendSmsCode}
                        className="text-teal-600 dark:text-teal-400 font-bold hover:underline"
                      >
                        إعادة إرسال الرمز
                      </button>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 bg-gradient-to-r from-[#0F766E] to-[#0D9488] text-white font-bold rounded-xl shadow-md transition-all active:scale-98 flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>تأكيد الرمز والمتابعة</span>
                    </button>
                  </form>
                )}

                {/* خطوة 3: تعيين كلمة المرور الجديدة */}
                {forgotStep === 'new_password' && (
                  <form onSubmit={handleSaveNewPassword} className="space-y-3">
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        كلمة المرور الجديدة *
                      </label>
                      <div className="relative flex items-center">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="••••••••"
                          required
                          dir="ltr"
                          className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-left focus:outline-none focus:ring-2 focus:ring-teal-600/30"
                        />
                        <Lock className="w-4 h-4 text-slate-400 absolute right-3 pointer-events-none" />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute left-3 text-slate-400 hover:text-slate-600"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        تأكيد كلمة المرور الجديدة *
                      </label>
                      <div className="relative flex items-center">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={confirmNewPassword}
                          onChange={(e) => setConfirmNewPassword(e.target.value)}
                          placeholder="••••••••"
                          required
                          dir="ltr"
                          className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-left focus:outline-none focus:ring-2 focus:ring-teal-600/30"
                        />
                        <Lock className="w-4 h-4 text-slate-400 absolute right-3 pointer-events-none" />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-3 bg-gradient-to-r from-[#0F766E] to-[#0D9488] text-white font-bold rounded-xl shadow-md transition-all active:scale-98 flex items-center justify-center gap-2 mt-2 disabled:opacity-60"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>جاري الحفظ في Firestore...</span>
                        </>
                      ) : (
                        <>
                          <KeyRound className="w-4 h-4" />
                          <span>حفظ كلمة المرور والتوجه للدخول</span>
                        </>
                      )}
                    </button>
                  </form>
                )}

                {/* العودة إلى تسجيل الدخول */}
                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('login');
                      setErrorMessage(null);
                      setSuccessMessage(null);
                    }}
                    className="text-xs font-bold text-slate-500 hover:text-teal-600 flex items-center justify-center gap-1 mx-auto"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                    <span>العودة لشاشة تسجيل الدخول</span>
                  </button>
                </div>

              </div>
            )}

            {/* رابط التبديل بين تسجيل الدخول وإنشاء حساب جديد */}
            {authMode !== 'forgot' && (
              <div className="pt-2 text-center border-t border-slate-100 dark:border-slate-800">
                {authMode === 'login' ? (
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    <span>ليس لديك حساب؟ </span>
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('register');
                        setErrorMessage(null);
                        setSuccessMessage(null);
                      }}
                      className="font-black text-[#0D9488] dark:text-teal-400 hover:underline"
                    >
                      إنشاء حساب جديد
                    </button>
                  </p>
                ) : (
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    <span>لديك حساب صيدلي بالفعل؟ </span>
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('login');
                        setErrorMessage(null);
                        setSuccessMessage(null);
                      }}
                      className="font-black text-[#0D9488] dark:text-teal-400 hover:underline"
                    >
                      تسجيل الدخول
                    </button>
                  </p>
                )}
              </div>
            )}

          </div>
        </div>

        {/* تذييل الثقة والخصوصية */}
        <p className="text-[11px] text-center text-slate-400 dark:text-slate-500 mt-4 flex items-center justify-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
          <span>مخزون الأدوية معزول تماماً ومحمي لكل صيدلية على حدة</span>
        </p>

      </div>
    </div>
  );
};
