import React, { useState, useEffect, useMemo } from 'react';
import { 
  Building2, 
  ShieldCheck, 
  Users, 
  CheckCircle2, 
  AlertCircle, 
  Search, 
  Lock, 
  KeyRound, 
  Power, 
  PowerOff, 
  Eye, 
  X, 
  LogOut, 
  ArrowRight, 
  FileText, 
  RefreshCw, 
  Sparkles,
  Phone,
  Calendar,
  Layers,
  ChevronRight,
  SlidersHorizontal,
  Store,
  Check,
  AlertTriangle,
  ExternalLink
} from 'lucide-react';
import { 
  PharmacistUser, 
  fetchAllPharmacists, 
  togglePharmacistStatus, 
  adminResetPharmacistPassword,
  ADMIN_PHONE
} from '../services/firebase';

interface AdminDashboardProps {
  user: PharmacistUser;
  onLogout: () => void;
  onSwitchToPharmacyView?: () => void;
  isDarkMode: boolean;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  user,
  onLogout,
  onSwitchToPharmacyView,
  isDarkMode,
}) => {
  const [pharmacists, setPharmacists] = useState<PharmacistUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'active' | 'suspended'>('ALL');
  
  // Modals state
  const [selectedLicenseUser, setSelectedLicenseUser] = useState<PharmacistUser | null>(null);
  const [resetPasswordUser, setResetPasswordUser] = useState<PharmacistUser | null>(null);
  const [newManualPassword, setNewManualPassword] = useState('');
  const [resetSuccessNotice, setResetSuccessNotice] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // تحميل قائمة الصيدليات من Firestore
  const loadPharmacists = async () => {
    setIsLoading(true);
    setActionError(null);
    try {
      const list = await fetchAllPharmacists();
      setPharmacists(list);
    } catch (err: any) {
      setActionError('تعذر تحميل الصيدليات من قاعدة البيانات، يرجى المحاولة لاحقاً');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPharmacists();
  }, []);

  // إحصائيات عامة
  const stats = useMemo(() => {
    const total = pharmacists.length;
    const active = pharmacists.filter(p => p.status !== 'suspended' && p.isApproved !== false).length;
    const suspended = total - active;
    const withLicense = pharmacists.filter(p => !!p.licensePhotoBase64).length;
    return { total, active, suspended, withLicense };
  }, [pharmacists]);

  // تصفية الصيدليات
  const filteredPharmacists = useMemo(() => {
    return pharmacists.filter(p => {
      // فلتر الحالة
      if (statusFilter === 'active' && (p.status === 'suspended' || p.isApproved === false)) return false;
      if (statusFilter === 'suspended' && p.status !== 'suspended' && p.isApproved !== false) return false;

      // فلتر البحث
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = (p.fullName || '').toLowerCase().includes(q);
        const matchPharmacy = (p.pharmacyName || '').toLowerCase().includes(q);
        const matchPhone = (p.phone || '').includes(q);
        return matchName || matchPharmacy || matchPhone;
      }

      return true;
    });
  }, [pharmacists, statusFilter, searchQuery]);

  // إيقاف أو تفعيل حساب الصيدلي
  const handleToggleStatus = async (pharmacist: PharmacistUser) => {
    if (pharmacist.role === 'admin' || pharmacist.phone === ADMIN_PHONE) {
      alert('لا يمكن إيقاف حساب مالك النظام الأساسي!');
      return;
    }

    const currentStatus = pharmacist.status || 'active';
    const actionLabel = currentStatus === 'active' ? 'إيقاف' : 'تفعيل';

    if (!confirm(`هل أنت متأكد من ${actionLabel} حساب الصيدلي (${pharmacist.fullName})؟`)) {
      return;
    }

    setIsUpdating(true);
    const result = await togglePharmacistStatus(pharmacist.phone, currentStatus);
    setIsUpdating(false);

    if (result.success) {
      setPharmacists(prev => prev.map(p => {
        if (p.phone === pharmacist.phone) {
          return {
            ...p,
            status: result.newStatus,
            isApproved: result.newStatus === 'active'
          };
        }
        return p;
      }));
    } else {
      alert('حدث خطأ أثناء تعديل حالة الحساب في Firestore');
    }
  };

  // إعادة ضبط كلمة المرور يدوياً للصيدلي
  const handleAdminResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetPasswordUser || !newManualPassword.trim()) return;

    if (newManualPassword.trim().length < 4) {
      alert('كلمة المرور يجب أن تتكون من 4 أحرف أو أرقام على الأقل');
      return;
    }

    setIsUpdating(true);
    const result = await adminResetPharmacistPassword(resetPasswordUser.phone, newManualPassword.trim());
    setIsUpdating(false);

    if (result.success) {
      setResetSuccessNotice(result.message);
      setPharmacists(prev => prev.map(p => {
        if (p.phone === resetPasswordUser.phone) {
          return { ...p, password: newManualPassword.trim() };
        }
        return p;
      }));
      setTimeout(() => {
        setResetPasswordUser(null);
        setNewManualPassword('');
        setResetSuccessNotice(null);
      }, 1600);
    } else {
      alert(result.message);
    }
  };

  return (
    <div className={`min-h-screen flex flex-col font-['Cairo',sans-serif] antialiased ${
      isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-[#F1F5F9] text-[#1E293B]'
    }`} dir="rtl">
      
      {/* 1. Header ترويسة لوحة تحكم المالك */}
      <header className={`border-b transition-colors ${
        isDarkMode 
          ? 'bg-gradient-to-r from-slate-950 via-teal-950 to-slate-900 border-slate-800' 
          : 'bg-gradient-to-r from-[#0F766E] to-[#0D9488] text-white border-teal-800'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-[24%] p-1 bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-lg overflow-hidden">
              <img 
                src="/assets/aistudio/1000003085_8b29976f.png" 
                alt="Expiro Icon" 
                className="w-full h-full object-contain filter drop-shadow-md" 
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-black text-white">لوحة تحكم مالك النظام (Admin)</h1>
                <span className="px-2 py-0.5 rounded-full bg-emerald-400 text-teal-950 font-black text-[10px]">
                  مالك Expiro
                </span>
              </div>
              <p className="text-xs text-teal-100 font-medium">
                إدارة الصيدليات المسجلة، الصلاحيات، ومراقبة التراخيص
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {onSwitchToPharmacyView && (
              <button
                onClick={onSwitchToPharmacyView}
                className="px-3.5 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs backdrop-blur-md border border-white/20 flex items-center gap-1.5 transition-all active:scale-95"
                title="الانتقال إلى واجهة الصيدلية لإدارة الأدوية"
              >
                <Store className="w-4 h-4" />
                <span className="hidden sm:inline">معاينة واجهة الأدوية</span>
              </button>
            )}

            <button
              onClick={loadPharmacists}
              disabled={isLoading}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all active:scale-95"
              title="تحديث البيانات"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>

            <button
              onClick={onLogout}
              className="px-3 py-2 rounded-xl bg-rose-600/90 hover:bg-rose-600 text-white font-bold text-xs flex items-center gap-1.5 transition-all active:scale-95 shadow-md"
            >
              <LogOut className="w-4 h-4" />
              <span>تسجيل الخروج</span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. Main Container */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 space-y-6 flex-1">
        
        {/* معلومات حساب المالك */}
        <div className={`p-4 rounded-2xl border flex flex-wrap items-center justify-between gap-3 shadow-xs ${
          isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-[#E2E8F0]'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/70 text-teal-700 dark:text-teal-400 flex items-center justify-center font-bold">
              👑
            </div>
            <div>
              <p className="font-extrabold text-sm">{user.fullName || 'مالك النظام'}</p>
              <p className="text-xs text-slate-400 font-mono">
                رقم الهاتف المعتمد: {ADMIN_PHONE} | الدور: <span className="text-teal-600 font-bold">role: "admin"</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <Sparkles className="w-4 h-4 text-teal-600" />
            <span>حساب المالك مهيأ مسبقاً في Firestore بصلاحيات تحكم كاملة</span>
          </div>
        </div>

        {/* 3. الإحصائيات العامة (KPI Cards) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          
          <div className={`p-4 rounded-2xl border shadow-xs ${
            isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-[#E2E8F0]'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-400">إجمالي الحسابات المسجلة</span>
              <div className="p-2 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-teal-600 dark:text-teal-400">{stats.total}</p>
            <p className="text-[11px] text-slate-400 mt-1">صيدلية وصيدلي مسجل بقاعدة البيانات</p>
          </div>

          <div className={`p-4 rounded-2xl border shadow-xs ${
            isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-[#E2E8F0]'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-400">الحسابات النشطة والمفعلة</span>
              <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">{stats.active}</p>
            <p className="text-[11px] text-emerald-500 font-medium mt-1">يمكنهم إدارة مخزونهم بنجاح</p>
          </div>

          <div className={`p-4 rounded-2xl border shadow-xs ${
            isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-[#E2E8F0]'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-400">الحسابات الموقوفة</span>
              <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600">
                <PowerOff className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-rose-600 dark:text-rose-400">{stats.suspended}</p>
            <p className="text-[11px] text-rose-500 font-medium mt-1">تم تعطيل دخولهم للصيدلية</p>
          </div>

          <div className={`p-4 rounded-2xl border shadow-xs ${
            isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-[#E2E8F0]'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-400">إجازات ممارسة مرفقة</span>
              <div className="p-2 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600">
                <FileText className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-sky-600 dark:text-sky-400">{stats.withLicense}</p>
            <p className="text-[11px] text-sky-500 font-medium mt-1">وثائق مشفرة ومحفوظة Base64</p>
          </div>

        </div>

        {/* 4. شريط البحث والتصفية */}
        <div className={`p-4 rounded-2xl border shadow-xs space-y-3 ${
          isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-[#E2E8F0]'
        }`}>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            
            {/* حقل البحث */}
            <div className="relative w-full sm:w-80">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="بحث بالاسم، الصيدلية، أو رقم الهاتف..."
                className="w-full pl-3 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-600/30"
              />
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute left-3 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* فلتر الحالة */}
            <div className="flex items-center gap-1.5 w-full sm:w-auto">
              <button
                onClick={() => setStatusFilter('ALL')}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                  statusFilter === 'ALL'
                    ? 'bg-teal-700 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                }`}
              >
                الكل ({pharmacists.length})
              </button>

              <button
                onClick={() => setStatusFilter('active')}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                  statusFilter === 'active'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                }`}
              >
                نشط فقط ({stats.active})
              </button>

              <button
                onClick={() => setStatusFilter('suspended')}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                  statusFilter === 'suspended'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                }`}
              >
                موقوف ({stats.suspended})
              </button>
            </div>

          </div>
        </div>

        {/* 5. جدول وبطاقات الصيدليات المسجلة */}
        <div className={`rounded-2xl border shadow-xs overflow-hidden ${
          isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-[#E2E8F0]'
        }`}>
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">قائمة الصيدليات والصيادلة</h3>
              <p className="text-xs text-slate-400 mt-0.5">يمكنك تفعيل أو إيقاف أي حساب وتعيين كلمة مرور بديلة</p>
            </div>
            <span className="text-xs font-bold text-teal-600 dark:text-teal-400">
              عدد النتائج: {filteredPharmacists.length}
            </span>
          </div>

          {isLoading ? (
            <div className="p-12 text-center">
              <RefreshCw className="w-8 h-8 text-teal-600 animate-spin mx-auto mb-2" />
              <p className="text-xs text-slate-400">جاري تحميل سجلات Firestore...</p>
            </div>
          ) : filteredPharmacists.length === 0 ? (
            <div className="p-12 text-center">
              <Building2 className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">لا توجد صيدليات مطابقة لبحثك</p>
              <p className="text-xs text-slate-400 mt-1">تأكد من كتابة الاسم أو رقم الهاتف بشكل صحيح</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredPharmacists.map((ph) => {
                const isAdmin = ph.role === 'admin' || ph.phone === ADMIN_PHONE;
                const isSuspended = ph.status === 'suspended' || ph.isApproved === false;
                const hasLicense = !!ph.licensePhotoBase64;

                return (
                  <div 
                    key={ph.phone} 
                    className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/50 dark:hover:bg-slate-850/50 transition-colors"
                  >
                    {/* بيانات الصيدلي */}
                    <div className="flex items-start gap-3.5 min-w-0">
                      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 font-bold ${
                        isAdmin 
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300' 
                          : isSuspended
                          ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                          : 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300'
                      }`}>
                        {isAdmin ? '👑' : <Building2 className="w-5 h-5" />}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-extrabold text-sm text-slate-900 dark:text-white truncate">
                            {ph.fullName || 'صيدلي مسجل'}
                          </h4>
                          
                          {isAdmin ? (
                            <span className="px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 font-bold text-[10px] border border-amber-200 dark:border-amber-900">
                              مالك النظام (Admin)
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-md bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 font-bold text-[10px] border border-teal-200 dark:border-teal-900">
                              صيدلي (role: pharmacist)
                            </span>
                          )}

                          {isSuspended ? (
                            <span className="px-2 py-0.5 rounded-md bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 font-bold text-[10px]">
                              موقوف
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold text-[10px]">
                              نشط ومعتمد
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          {ph.pharmacyName || 'صيدلية بدون اسم'}
                        </p>

                        <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1 font-mono">
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3 text-slate-400" />
                            <span dir="ltr">{ph.phone}</span>
                          </span>

                          {ph.createdAt && (
                            <span className="flex items-center gap-1 font-sans">
                              <Calendar className="w-3 h-3 text-slate-400" />
                              <span>{new Date(ph.createdAt).toLocaleDateString('ar-IQ')}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* أزرار الإجراءات الخاصة بالمالك */}
                    <div className="flex items-center gap-2 flex-wrap self-end md:self-center">
                      
                      {/* معاينة الإجازة */}
                      {hasLicense ? (
                        <button
                          onClick={() => setSelectedLicenseUser(ph)}
                          className="px-3 py-1.5 rounded-xl border border-sky-200 dark:border-sky-800 bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 hover:bg-sky-100 text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95"
                          title="عرض صورة إجازة ممارسة المهنة"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>معاينة الإجازة</span>
                        </button>
                      ) : (
                        <span className="px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 text-[11px]">
                          بدون إجازة
                        </span>
                      )}

                      {/* زر إعادة ضبط كلمة المرور يدوياً */}
                      <button
                        onClick={() => {
                          setResetPasswordUser(ph);
                          setNewManualPassword('');
                          setResetSuccessNotice(null);
                        }}
                        className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95"
                        title="إعادة ضبط كلمة المرور يدوياً للصيدلي"
                      >
                        <KeyRound className="w-3.5 h-3.5 text-amber-600" />
                        <span>ضبط كلمة المرور</span>
                      </button>

                      {/* زر إيقاف / تفعيل الحساب */}
                      {!isAdmin && (
                        <button
                          onClick={() => handleToggleStatus(ph)}
                          disabled={isUpdating}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 shadow-xs ${
                            isSuspended
                              ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                              : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 dark:bg-rose-950/60 dark:border-rose-900 dark:text-rose-300'
                          }`}
                        >
                          {isSuspended ? (
                            <>
                              <Power className="w-3.5 h-3.5" />
                              <span>تفعيل الحساب</span>
                            </>
                          ) : (
                            <>
                              <PowerOff className="w-3.5 h-3.5" />
                              <span>إيقاف الحساب</span>
                            </>
                          )}
                        </button>
                      )}

                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </main>

      {/* مودال معاينة صورة الإجازة (Base64) */}
      {selectedLicenseUser && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setSelectedLicenseUser(null)}
        >
          <div 
            className={`w-full max-w-lg rounded-3xl p-5 space-y-4 shadow-2xl border ${
              isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-teal-600" />
                <div>
                  <h4 className="font-extrabold text-sm">إجازة ممارسة مهنة الصيدلة</h4>
                  <p className="text-xs text-slate-400">
                    {selectedLicenseUser.fullName} - {selectedLicenseUser.pharmacyName}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedLicenseUser(null)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-950/20 max-h-[60vh] flex items-center justify-center">
              {selectedLicenseUser.licensePhotoBase64 ? (
                <img 
                  src={selectedLicenseUser.licensePhotoBase64} 
                  alt="License" 
                  className="max-h-[55vh] w-auto object-contain rounded-xl"
                />
              ) : (
                <div className="p-12 text-center text-slate-400">لا توجد صورة متوفرة</div>
              )}
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-slate-400 font-mono">
                المعرف: {selectedLicenseUser.phone}
              </span>
              <button
                onClick={() => setSelectedLicenseUser(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-white rounded-xl font-bold text-xs"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* مودال إعادة ضبط كلمة المرور يدوياً للصيدلي من قبل المالك */}
      {resetPasswordUser && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setResetPasswordUser(null)}
        >
          <div 
            className={`w-full max-w-md rounded-3xl p-5 space-y-4 shadow-2xl border ${
              isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-amber-500" />
                <div>
                  <h4 className="font-extrabold text-sm">إعادة تعيين كلمة المرور للصيدلي</h4>
                  <p className="text-xs text-slate-400 font-mono" dir="ltr">{resetPasswordUser.phone}</p>
                </div>
              </div>
              <button
                onClick={() => setResetPasswordUser(null)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {resetSuccessNotice && (
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-bold">{resetSuccessNotice}</span>
              </div>
            )}

            <form onSubmit={handleAdminResetPassword} className="space-y-3.5 text-xs">
              <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                بصفتك مالك النظام، يمكنك تحديد كلمة مرور جديدة فورية للصيدلي (<strong>{resetPasswordUser.fullName}</strong>) وسيتم تحديثها مباشرة في Firestore.
              </p>

              <div>
                <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">
                  كلمة المرور الجديدة *
                </label>
                <input
                  type="text"
                  value={newManualPassword}
                  onChange={(e) => setNewManualPassword(e.target.value)}
                  placeholder="أدخل كلمة المرور الجديدة (مثال: rx2026)"
                  required
                  dir="ltr"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono text-left focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-xs transition-all active:scale-95 disabled:opacity-60"
                >
                  {isUpdating ? 'جاري الحفظ في Firestore...' : 'تحديث كلمة المرور الآن'}
                </button>
                <button
                  type="button"
                  onClick={() => setResetPasswordUser(null)}
                  className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold rounded-xl hover:bg-slate-200"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
