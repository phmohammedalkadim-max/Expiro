import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Plus, 
  Search, 
  QrCode, 
  ScanLine, 
  FileText, 
  Trash2, 
  Edit3, 
  Calendar, 
  CheckCircle2, 
  AlertOctagon, 
  AlertTriangle, 
  X, 
  Camera, 
  Printer, 
  Volume2, 
  VolumeX, 
  Smartphone, 
  Monitor, 
  ShieldCheck, 
  ShieldAlert,
  Building2,
  Layers,
  Users,
  Lock,
  Bell,
  RefreshCw,
  Phone,
  ArrowRight,
  UploadCloud,
  FileCheck2,
  Headphones,
  MessageSquare,
  Send,
  Copy,
  Ban,
  UserCheck,
  Download,
  Home,
  TrendingDown,
  User,
  Moon,
  Sun,
  Sparkles,
  LogOut
} from 'lucide-react';
import { RealBarcodeScanner } from './components/RealBarcodeScanner';
import { lookupDrugByBarcode } from './data/drugDatabase';
import { AuthScreen } from './components/AuthScreen';
import { AdminDashboard } from './components/AdminDashboard';
import { SplashScreen, SplashDestination } from './components/SplashScreen';
import { 
  PharmacistUser, 
  syncUserMedicineToFirestore, 
  deleteUserMedicineFromFirestore, 
  subscribeToUserMedicines 
} from './services/firebase';



export interface Medicine {
  id: number;
  tradeName: string;
  scientificName: string;
  companyName: string;
  category: string;
  barcode: string;
  expiryDate: string;
  alertThresholdDays: number;
  notes?: string;
  quantity?: number;
}

export interface Pharmacy {
  id: string;
  name: string;
  adminName: string;
  phone: string;
  licenseImagePath?: string;
  isLicenseVerified: boolean;
}

export interface AppUser {
  id: string;
  name: string;
  phone: string;
  role: 'admin' | 'staff';
  pharmacyId: string;
  joinCode?: string;
  isActive: boolean;
  isBlocked: boolean;
}

export type ExpiryStatus = 'EXPIRED' | 'NEAR_EXPIRY' | 'VALID';

export interface MedicineAnalysis {
  status: ExpiryStatus;
  daysRemaining: number;
  badgeText: string;
  badgeBg: string;
  accentColor: string;
}

const INITIAL_MEDICINES: Medicine[] = [
  {
    id: 1,
    tradeName: 'أوجمنتين 1 جم أقراص (Augmentin 1g)',
    scientificName: 'Amoxicillin + Clavulanic Acid 1000mg',
    companyName: 'GSK (GlaxoSmithKline)',
    category: 'المضادات الحيوية',
    barcode: '6281001230012',
    expiryDate: '2026-10-02',
    alertThresholdDays: 60,
    quantity: 12,
    notes: 'مضاد حيوي واسع المجال - عبوة 14 قرص',
  },
  {
    id: 2,
    tradeName: 'بانادول إكسترا (Panadol Extra)',
    scientificName: 'Paracetamol 500mg + Caffeine 65mg',
    companyName: 'Haleon / GSK',
    category: 'مسكنات وخافضات حرارة',
    barcode: '6285000000018',
    expiryDate: '2026-10-18',
    alertThresholdDays: 30,
    quantity: 45,
    notes: 'مسكن ومخفض للحرارة - أحمر سريع المفعول',
  },
  {
    id: 3,
    tradeName: 'كونكور 5 مجم (Concor 5mg)',
    scientificName: 'Bisoprolol Fumarate 5mg',
    companyName: 'Merck (ميرك)',
    category: 'القلب والأوعية الدموية',
    barcode: '6281100223344',
    expiryDate: '2026-11-05',
    alertThresholdDays: 60,
    quantity: 18,
    notes: 'علاج ارتفاع ضغط الدم والذبحة الصدرية',
  },
  {
    id: 4,
    tradeName: 'جلوكوفاج 1000 مجم (Glucophage)',
    scientificName: 'Metformin HCl 1000mg',
    companyName: 'Merck Serono',
    category: 'أدوية السكري والهورمونات',
    barcode: '3582910023419',
    expiryDate: '2026-11-26',
    alertThresholdDays: 45,
    quantity: 24,
    notes: 'تنظيم مستوى السكر في الدم النوع الثاني',
  },
  {
    id: 5,
    tradeName: 'نيكسيوم 40 مجم (Nexium 40mg)',
    scientificName: 'Esomeprazole Magnesium 40mg',
    companyName: 'AstraZeneca (أسترازينيكا)',
    category: 'الجهاز الهضمي والمعدة',
    barcode: '7321400119283',
    expiryDate: '2027-04-15',
    alertThresholdDays: 90,
    quantity: 30,
    notes: 'مثبط مضخة البروتون للحموضة وقرحة المعدة',
  },
  {
    id: 6,
    tradeName: 'سيبتازول فورت (Septazole Forte)',
    scientificName: 'Sulfamethoxazole + Trimethoprim',
    companyName: 'EPICO (إيبيكو)',
    category: 'المضادات الحيوية',
    barcode: '6221004001920',
    expiryDate: '2027-08-20',
    alertThresholdDays: 60,
    quantity: 15,
    notes: 'مضاد للمسالك البولية والتهابات الصدر',
  },
  {
    id: 7,
    tradeName: 'بروفين 400 مجم (Brufen 400mg)',
    scientificName: 'Ibuprofen 400mg',
    companyName: 'Abbott (أبوت)',
    category: 'مسكنات وخافضات حرارة',
    barcode: '5000456012948',
    expiryDate: '2027-12-10',
    alertThresholdDays: 45,
    quantity: 60,
    notes: 'مضاد للالتهاب ومسكن للآلام والصداع',
  },
  {
    id: 8,
    tradeName: 'فيتامين د3 50000 وحدة (D-Vital)',
    scientificName: 'Cholecalciferol 50,000 IU',
    companyName: 'Julphar (جلفار)',
    category: 'الفيتامينات والمكملات',
    barcode: '6291011029341',
    expiryDate: '2028-02-18',
    alertThresholdDays: 90,
    quantity: 50,
    notes: 'جرعة أسبوعية لعلاج نقص فيتامين د',
  }
];

export function getMedicineAnalysis(med: Medicine): MedicineAnalysis {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const expiry = new Date(med.expiryDate);
  expiry.setHours(0, 0, 0, 0);

  const diffTime = expiry.getTime() - today.getTime();
  const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (daysRemaining < 0) {
    return {
      status: 'EXPIRED',
      daysRemaining,
      badgeText: `منتهي (${Math.abs(daysRemaining)} يوم)`,
      badgeBg: 'bg-red-50 text-[#E53935] border-red-200/80 dark:bg-red-950/50 dark:text-red-300 dark:border-red-900',
      accentColor: '#E53935',
    };
  }

  const threshold = med.alertThresholdDays || 60;
  if (daysRemaining <= threshold) {
    return {
      status: 'NEAR_EXPIRY',
      daysRemaining,
      badgeText: `وشيك (${daysRemaining} يوم)`,
      badgeBg: 'bg-amber-50 text-[#FB8C00] border-amber-200/80 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-900',
      accentColor: '#FB8C00',
    };
  }

  return {
    status: 'VALID',
    daysRemaining,
    badgeText: 'صالح للاستخدام',
    badgeBg: 'bg-emerald-50 text-[#43A047] border-emerald-200/80 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-900',
    accentColor: '#43A047',
  };
}

export default function App() {
  const [medicines, setMedicines] = useState<Medicine[]>(INITIAL_MEDICINES);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'EXPIRED' | 'NEAR_EXPIRY' | 'VALID'>('ALL');
  const [activeTab, setActiveTab] = useState<'home' | 'losses' | 'support' | 'profile' | 'notifications'>('home');
  const [notificationFilter, setNotificationFilter] = useState<'ALL' | 'EXPIRED' | 'NEAR'>('ALL');

  // إدارة حساب الصيدلي المسجل عبر Firebase
  const [authenticatedUser, setAuthenticatedUser] = useState<PharmacistUser | null>(() => {
    const saved = localStorage.getItem('expiro_active_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  const [pharmacy, setPharmacy] = useState<Pharmacy>(() => {
    const saved = localStorage.getItem('expiro_active_user');
    if (saved) {
      try {
        const u = JSON.parse(saved) as PharmacistUser;
        return {
          id: `PH-${u.phone}`,
          name: u.pharmacyName || `صيدلية د. ${u.fullName.split(' ')[0]}`,
          adminName: u.fullName,
          phone: u.phone,
          licenseImagePath: u.licensePhotoBase64 || '',
          isLicenseVerified: !!u.licensePhotoBase64,
        };
      } catch (e) {}
    }
    return {
      id: 'PH-BAGHDAD-884',
      name: 'صيدلية الشفاء المركزية',
      adminName: 'د. أحمد الصيدلي',
      phone: '07701234567',
      licenseImagePath: '',
      isLicenseVerified: false,
    };
  });

  const [currentUser, setCurrentUser] = useState<AppUser>(() => {
    const saved = localStorage.getItem('expiro_active_user');
    if (saved) {
      try {
        const u = JSON.parse(saved) as PharmacistUser;
        return {
          id: `USR-${u.phone}`,
          name: u.fullName,
          phone: u.phone,
          role: 'admin',
          pharmacyId: `PH-${u.phone}`,
          isActive: true,
          isBlocked: false,
        };
      } catch (e) {}
    }
    return {
      id: 'USR-ADMIN-01',
      name: 'أحمد',
      phone: '07701234567',
      role: 'admin',
      pharmacyId: 'PH-BAGHDAD-884',
      isActive: true,
      isBlocked: false,
    };
  });

  // وضع العرض لمالك النظام: إما لوحة تحكم الأدمن أو معاينة مخزون الصيدلية
  const [adminViewMode, setAdminViewMode] = useState<'dashboard' | 'pharmacy'>('dashboard');

  // حالة الشاشة الترحيبية الافتتاحية (Splash Screen) والوضع الأولي للمصادقة
  const [showSplash, setShowSplash] = useState<boolean>(true);
  const [authInitialMode, setAuthInitialMode] = useState<'login' | 'register'>('login');

  const handleSplashComplete = (destination: SplashDestination) => {
    setShowSplash(false);
    if (destination === 'register') {
      setAuthInitialMode('register');
    } else if (destination === 'login') {
      setAuthInitialMode('login');
    } else if (destination === 'admin_dashboard') {
      setAdminViewMode('dashboard');
    } else if (destination === 'pharmacy_inventory') {
      setAdminViewMode('pharmacy');
    }
  };

  const handleLoginSuccess = (user: PharmacistUser) => {
    setAuthenticatedUser(user);
    localStorage.setItem('expiro_active_user', JSON.stringify(user));
    if (user.role === 'admin') {
      setAdminViewMode('dashboard');
    }
    setPharmacy({
      id: `PH-${user.phone}`,
      name: user.pharmacyName || (user.role === 'admin' ? 'إدارة تطبيق Expiro' : `صيدلية د. ${user.fullName.split(' ')[0]}`),
      adminName: user.fullName,
      phone: user.phone,
      licenseImagePath: user.licensePhotoBase64 || '',
      isLicenseVerified: !!user.licensePhotoBase64,
    });
    setCurrentUser({
      id: `USR-${user.phone}`,
      name: user.fullName,
      phone: user.phone,
      role: 'admin',
      pharmacyId: `PH-${user.phone}`,
      isActive: true,
      isBlocked: false,
    });
    playTone('success');
    showToast(user.role === 'admin' ? `مرحباً بك مالك النظام (${user.fullName})` : `مرحباً بك د. ${user.fullName}`);
  };

  const handleLogout = () => {
    if (confirm('هل أنت متأكد من رغبتك في تسجيل الخروج من حساب الصيدلية؟')) {
      localStorage.removeItem('expiro_active_user');
      setAuthenticatedUser(null);
      playTone('beep');
      showToast('تم تسجيل الخروج بنجاح');
    }
  };

  // عزل ومزامنة مخزون الأدوية لكل صيدلي مسجل في Firebase Firestore
  useEffect(() => {
    if (!authenticatedUser) return;
    const userId = authenticatedUser.phone;

    // 1. استرجاع المخزون المحفوظ محلياً لهذا الصيدلي فوراً لسرعة الاستجابة
    const localUserMeds = localStorage.getItem(`expiro_user_medicines_${userId}`);
    if (localUserMeds) {
      try {
        setMedicines(JSON.parse(localUserMeds));
      } catch (e) {}
    } else {
      // صيدلي جديد: تجهيز المخزون الأولي وربطه بحسابه في Firestore
      setMedicines(INITIAL_MEDICINES);
      localStorage.setItem(`expiro_user_medicines_${userId}`, JSON.stringify(INITIAL_MEDICINES));
      INITIAL_MEDICINES.forEach((m) => {
        syncUserMedicineToFirestore(userId, m);
      });
    }

    // 2. اشتراك فوري في Firestore لأدوية هذا الصيدلي فقط
    const unsubscribe = subscribeToUserMedicines(userId, (remoteMeds) => {
      if (remoteMeds && remoteMeds.length > 0) {
        setMedicines(remoteMeds);
        localStorage.setItem(`expiro_user_medicines_${userId}`, JSON.stringify(remoteMeds));
      }
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [authenticatedUser]);


  const [staffList, setStaffList] = useState<AppUser[]>([
    {
      id: 'STF-01',
      name: 'ص. مروة الكادر',
      phone: '07801122334',
      role: 'staff',
      pharmacyId: 'PH-BAGHDAD-884',
      joinCode: 'EXP-841920',
      isActive: true,
      isBlocked: false,
    },
    {
      id: 'STF-02',
      name: 'ص. علي المساعد',
      phone: '07719988776',
      role: 'staff',
      pharmacyId: 'PH-BAGHDAD-884',
      joinCode: 'EXP-519024',
      isActive: true,
      isBlocked: false,
    },
  ]);

  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isAddEditOpen, setIsAddEditOpen] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState<Medicine | null>(null);
  const [initialBarcodeForAdd, setInitialBarcodeForAdd] = useState('');
  const [isAddBottomSheetOpen, setIsAddBottomSheetOpen] = useState(false);
  const [isDisposalOpen, setIsDisposalOpen] = useState(false);
  const [isStaffManagementOpen, setIsStaffManagementOpen] = useState(false);
  const [isLicenseModalOpen, setIsLicenseModalOpen] = useState(false);
  const [permissionAlertMessage, setPermissionAlertMessage] = useState<string | null>(null);

  // Form State for Add / Edit Modal with instant barcode auto-population
  const [formData, setFormData] = useState<Partial<Medicine>>({
    tradeName: '',
    scientificName: '',
    companyName: '',
    category: '',
    barcode: '',
    expiryDate: '',
    alertThresholdDays: 60,
    notes: '',
    quantity: 1,
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [viewMode, setViewMode] = useState<'mobile' | 'wide'>('mobile');

  useEffect(() => {
    if (isAddEditOpen) {
      if (editingMedicine) {
        setFormData({
          tradeName: editingMedicine.tradeName || '',
          scientificName: editingMedicine.scientificName || '',
          companyName: editingMedicine.companyName || '',
          category: editingMedicine.category || '',
          barcode: editingMedicine.barcode || '',
          expiryDate: editingMedicine.expiryDate || new Date().toISOString().split('T')[0],
          alertThresholdDays: editingMedicine.alertThresholdDays || 60,
          notes: editingMedicine.notes || '',
          quantity: editingMedicine.quantity || 1,
        });
      } else {
        const dbMatch = initialBarcodeForAdd ? lookupDrugByBarcode(initialBarcodeForAdd) : null;
        setFormData({
          tradeName: dbMatch?.tradeName || '',
          scientificName: dbMatch?.scientificName || '',
          companyName: dbMatch?.companyName || '',
          category: dbMatch?.category || 'أدوية عامة',
          barcode: initialBarcodeForAdd || '',
          expiryDate: new Date().toISOString().split('T')[0],
          alertThresholdDays: dbMatch?.defaultAlertDays || 60,
          notes: dbMatch?.notes || '',
          quantity: 1,
        });
      }
    }
  }, [isAddEditOpen, editingMedicine, initialBarcodeForAdd]);

  useEffect(() => {
    localStorage.setItem('expiro_dark_mode', String(isDarkMode));
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const playTone = (type: 'beep' | 'success' | 'danger') => {
    if (!soundEnabled) return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'beep') {
        osc.frequency.setValueAtTime(1400, ctx.currentTime);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        osc.start();
        osc.stop(ctx.currentTime + 0.08);
      } else if (type === 'success') {
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        osc.start();
        osc.stop(ctx.currentTime + 0.2);
      } else if (type === 'danger') {
        osc.frequency.setValueAtTime(400, ctx.currentTime);
        osc.frequency.setValueAtTime(300, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        osc.start();
        osc.stop(ctx.currentTime + 0.25);
      }
    } catch (e) {
      // Audio not permitted without interaction
    }
  };

  // ---------------- PULL TO REFRESH (تحديث الصفحة بالسحب مع ثلاث نقاط احترافية) ----------------
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const touchStartY = useRef<number | null>(null);
  const isPullingRef = useRef(false);

  const isScrolledToTop = (target: HTMLElement | null): boolean => {
    let el: HTMLElement | null = target;
    while (el) {
      if (el.scrollTop && el.scrollTop > 5) {
        return false;
      }
      el = el.parentElement;
    }
    return true;
  };

  const handleTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
    if (isRefreshing) return;
    if (!isScrolledToTop(e.target as HTMLElement)) return;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    touchStartY.current = clientY;
    isPullingRef.current = true;
  };

  const handleTouchMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (!isPullingRef.current || touchStartY.current === null || isRefreshing) return;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const diff = clientY - touchStartY.current;

    if (diff > 0) {
      // Damped rubber-band pull
      const damped = Math.min(Math.pow(diff, 0.8) * 1.3, 50);
      setPullDistance(damped);
    } else {
      setPullDistance(0);
    }
  };

  const handleTouchEnd = () => {
    if (!isPullingRef.current) return;
    isPullingRef.current = false;
    touchStartY.current = null;

    if (pullDistance >= 26 && !isRefreshing) {
      setIsRefreshing(true);
      setPullDistance(36); // تثبيت المسافة لظهور النقاط الثلاث أثناء التحديث
      setTimeout(() => {
        playTone('beep');
        setIsRefreshing(false);
        setPullDistance(0);
      }, 1250);
    } else {
      setPullDistance(0);
    }
  };

  const renderPullToRefreshIndicator = () => (
    <div
      className="w-full flex items-center justify-center overflow-hidden transition-all duration-300 pointer-events-none z-30 shrink-0"
      style={{
        height: `${pullDistance}px`,
        opacity: pullDistance > 5 ? Math.min(pullDistance / 24, 1) : 0,
      }}
    >
      <div className="flex items-center justify-center gap-2 py-1">
        <div
          className={`w-2.5 h-2.5 rounded-full transition-all duration-200 ${
            isRefreshing ? 'dot-pulse-1' : 'bg-[#0D9488]'
          }`}
          style={{
            transform: !isRefreshing ? `scale(${Math.min(0.6 + pullDistance / 60, 1)})` : undefined,
          }}
        />
        <div
          className={`w-2.5 h-2.5 rounded-full transition-all duration-200 ${
            isRefreshing ? 'dot-pulse-2' : 'bg-[#06B6D4]'
          }`}
          style={{
            transform: !isRefreshing ? `scale(${Math.min(0.6 + pullDistance / 60, 1)})` : undefined,
          }}
        />
        <div
          className={`w-2.5 h-2.5 rounded-full transition-all duration-200 ${
            isRefreshing ? 'dot-pulse-3' : 'bg-[#10B981]'
          }`}
          style={{
            transform: !isRefreshing ? `scale(${Math.min(0.6 + pullDistance / 60, 1)})` : undefined,
          }}
        />
      </div>
    </div>
  );

  const availableCategories = useMemo(() => {
    const cats = new Set<string>();
    medicines.forEach((m) => {
      if (m.category?.trim()) cats.add(m.category.trim());
    });
    return Array.from(cats);
  }, [medicines]);

  const stats = useMemo(() => {
    let expired = 0;
    let near = 0;
    let valid = 0;

    medicines.forEach((med) => {
      const res = getMedicineAnalysis(med);
      if (res.status === 'EXPIRED') expired++;
      else if (res.status === 'NEAR_EXPIRY') near++;
      else valid++;
    });

    return { total: medicines.length, expired, near, valid };
  }, [medicines]);

  const filteredMedicines = useMemo(() => {
    return medicines
      .filter((med) => {
        const analysis = getMedicineAnalysis(med);
        if (statusFilter !== 'ALL' && analysis.status !== statusFilter) {
          return false;
        }
        if (selectedCategory !== 'ALL' && med.category !== selectedCategory) {
          return false;
        }
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchTrade = med.tradeName.toLowerCase().includes(q);
          const matchScientific = med.scientificName.toLowerCase().includes(q);
          const matchCompany = med.companyName.toLowerCase().includes(q);
          const matchCategory = med.category.toLowerCase().includes(q);
          const matchBarcode = med.barcode.includes(q);
          if (!matchTrade && !matchScientific && !matchCompany && !matchCategory && !matchBarcode) {
            return false;
          }
        }
        return true;
      })
      .sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime());
  }, [medicines, statusFilter, selectedCategory, searchQuery]);

  const expiredMedicines = useMemo(() => {
    return medicines.filter((m) => getMedicineAnalysis(m).status === 'EXPIRED');
  }, [medicines]);

  const nearExpiryMedicines = useMemo(() => {
    return medicines.filter((m) => getMedicineAnalysis(m).status === 'NEAR_EXPIRY');
  }, [medicines]);

  const handleDeleteMedicine = (id: number) => {
    const med = medicines.find((m) => m.id === id);
    if (!med) return;
    if (confirm(`هل أنت متأكد من حذف دواء "${med.tradeName}" من سجل الصلاحيات؟`)) {
      const userId = authenticatedUser?.phone || 'default';
      setMedicines((prev) => {
        const next = prev.filter((m) => m.id !== id);
        localStorage.setItem(`expiro_user_medicines_${userId}`, JSON.stringify(next));
        return next;
      });
      deleteUserMedicineFromFirestore(userId, id);
      playTone('danger');
      showToast(`تم حذف ${med.tradeName} بنجاح`);
    }
  };

  const handleSaveMedicine = (data: Partial<Medicine>) => {
    const userId = authenticatedUser?.phone || 'default';

    if (editingMedicine && editingMedicine.id !== 0) {
      const updatedMed: Medicine = {
        ...editingMedicine,
        ...data,
      } as Medicine;

      setMedicines((prev) => {
        const next = prev.map((m) => (m.id === editingMedicine.id ? updatedMed : m));
        localStorage.setItem(`expiro_user_medicines_${userId}`, JSON.stringify(next));
        return next;
      });

      syncUserMedicineToFirestore(userId, updatedMed);
      playTone('success');
      showToast('تم تحديث بيانات الدواء ومزامنتها في السحابة');
    } else {
      const newMed: Medicine = {
        id: Date.now(),
        tradeName: data.tradeName || 'دواء مسجل جديد',
        scientificName: data.scientificName || '',
        companyName: data.companyName || 'شركة دوائية معتمدة',
        category: data.category || 'أدوية عامة',
        barcode: data.barcode || '',
        expiryDate: data.expiryDate || new Date().toISOString().split('T')[0],
        alertThresholdDays: data.alertThresholdDays || 60,
        notes: data.notes || '',
        quantity: data.quantity || 1,
      };

      setMedicines((prev) => {
        const next = [newMed, ...prev];
        localStorage.setItem(`expiro_user_medicines_${userId}`, JSON.stringify(next));
        return next;
      });

      syncUserMedicineToFirestore(userId, newMed);
      playTone('success');
      showToast(`تم تسجيل ${newMed.tradeName} في سحابة الصيدلية بنجاح`);
    }
    setIsAddEditOpen(false);
    setEditingMedicine(null);
    setInitialBarcodeForAdd('');
  };

  const handleBarcodeManualLookup = (code: string) => {
    const clean = code.trim();
    if (!clean) return;
    const match = lookupDrugByBarcode(clean);
    if (match) {
      setFormData((prev) => ({
        ...prev,
        barcode: clean,
        tradeName: match.tradeName,
        scientificName: match.scientificName,
        companyName: match.companyName,
        category: match.category,
        notes: match.notes,
        alertThresholdDays: match.defaultAlertDays,
      }));
      playTone('beep');
      showToast(`تم التعرف على: ${match.tradeName}`);
    } else {
      showToast('لم يتم العثور على الدواء بالدليل، يمكنك إدخال الاسم يدوياً');
    }
  };

  const handleScanDetected = (barcode: string, drugData?: Partial<Medicine>) => {
    playTone('beep');
    setIsScannerOpen(false);
    
    // 1. هل الدواء موجود مسبقاً في مخزون الصيدلية؟
    const existing = medicines.find((m) => m.barcode === barcode);
    if (existing) {
      setEditingMedicine(existing);
      setInitialBarcodeForAdd('');
      setIsAddEditOpen(true);
      showToast(`تم العثور على: ${existing.tradeName}`);
      return;
    }

    // 2. فحص الدواء في قاعدة البيانات الدوائية الشاملة واسترجاع كافة تفاصيله
    const foundDrug = drugData || lookupDrugByBarcode(barcode);
    if (foundDrug) {
      const defaultAlert = 'defaultAlertDays' in foundDrug ? foundDrug.defaultAlertDays : (foundDrug.alertThresholdDays || 60);
      const notes = foundDrug.notes || '';
      const expDate = ('expiryDate' in foundDrug && foundDrug.expiryDate) ? foundDrug.expiryDate : new Date().toISOString().split('T')[0];
      const qty = ('quantity' in foundDrug && foundDrug.quantity) ? foundDrug.quantity : 1;

      setEditingMedicine({
        id: 0, // معرف مؤقت حتى يحفظه المستخدم كصنف جديد
        tradeName: foundDrug.tradeName || '',
        scientificName: foundDrug.scientificName || '',
        companyName: foundDrug.companyName || '',
        category: foundDrug.category || 'أدوية عامة',
        barcode: barcode,
        expiryDate: expDate,
        alertThresholdDays: defaultAlert,
        notes: notes,
        quantity: qty,
      });
      setInitialBarcodeForAdd(barcode);
      setIsAddEditOpen(true);
      showToast(`تم التعرف تلقائياً على: ${foundDrug.tradeName}`);
    } else {
      setEditingMedicine(null);
      setInitialBarcodeForAdd(barcode);
      setIsAddEditOpen(true);
      showToast(`تم مسح الباركود: ${barcode}`);
    }
  };


  const toggleRoleDemo = () => {
    if (currentUser.role === 'admin') {
      setCurrentUser({
        id: 'STF-01',
        name: 'مروة',
        phone: '07801122334',
        role: 'staff',
        pharmacyId: pharmacy.id,
        joinCode: 'EXP-841920',
        isActive: true,
        isBlocked: false,
      });
      showToast('تم التبديل إلى دور: موظف صيدلية (Staff)');
    } else {
      setCurrentUser({
        id: 'USR-ADMIN-01',
        name: 'أحمد',
        phone: pharmacy.phone,
        role: 'admin',
        pharmacyId: pharmacy.id,
        joinCode: 'EXP-ADMIN',
        isActive: true,
        isBlocked: false,
      });
      showToast('تم التبديل إلى دور: مدير الصيدلية (Admin)');
    }
  };

  // ---------------- 1. DYNAMIC 100px FULL-WIDTH HEADER WITH TOP ICONS & BOTTOM EXPIRO TITLE ----------------
  const renderExactHeader = () => {
    // 1. Home Header (الرئيسية) - عرض كامل يملأ الشاشة بارتفاع 100px
    if (activeTab === 'home') {
      return (
        <header
          className={`w-full h-[100px] min-h-[100px] max-h-[100px] px-3.5 sm:px-5 pt-2.5 pb-2 rounded-b-3xl shadow-none border-b-2 border-[#F1F5F9] dark:border-slate-950 transition-colors shrink-0 z-20 flex flex-col justify-between text-white ${
            isDarkMode
              ? 'bg-gradient-to-r from-slate-950 via-teal-950 to-slate-900'
              : 'bg-gradient-to-r from-[#0F766E] to-[#0D9488]'
          }`}
        >
          {/* الصف العلوي: الأيقونات ثابتة في مكانها بأعلى الهايدر إلى أقصى اليمين وأقصى اليسار */}
          <div className="flex items-center justify-between w-full shrink-0">
            {/* أعلى الجهه اليمنى: أيقونة الصيدلية واسمها */}
            <div className="flex items-center gap-2 text-right min-w-0">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white text-[#0D9488] font-black text-xs flex items-center justify-center shadow-xs shrink-0">
                ص
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-bold text-white leading-tight">
                  مرحبا
                </p>
                <p className="text-[10px] text-teal-100 font-medium truncate max-w-[130px] sm:max-w-[180px]">
                  {pharmacy.name}
                </p>
              </div>
            </div>

            {/* أعلى الجهه اليسرى: أيقونات التنبيهات والوضع المظلم */}
            <div className="flex items-center justify-end gap-1.5 shrink-0">
              <button
                onClick={() => setActiveTab('notifications')}
                className="relative w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/18 hover:bg-white/28 border border-white/25 text-white flex items-center justify-center shadow-xs transition-transform active:scale-95"
                title="صفحة التنبيهات"
              >
                <Bell className="w-3.5 h-3.5" />
                {stats.expired + stats.near > 0 && (
                  <span className="absolute -top-1 -left-1 min-w-[14px] h-[14px] px-0.5 bg-rose-600 text-white font-bold text-[8px] rounded-full flex items-center justify-center border-2 border-[#0D9488] shadow-xs">
                    {stats.expired + stats.near}
                  </span>
                )}
              </button>

              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/18 hover:bg-white/28 border border-white/25 text-white flex items-center justify-center shadow-xs transition-transform active:scale-90"
                title={isDarkMode ? 'الوضع النهاري' : 'الوضع المظلم'}
              >
                {isDarkMode ? (
                  <Sun className="w-3.5 h-3.5 text-amber-300" />
                ) : (
                  <Moon className="w-3.5 h-3.5 text-white" />
                )}
              </button>
            </div>
          </div>

          {/* العناوين مرفوعة للأعلى قليلاً لتكون في موضع مناسب وأنيق */}
          <div className="flex-1 flex flex-col items-center justify-center text-center w-full -translate-y-2 pb-0.5">
            <h1 className="text-base sm:text-lg font-extrabold text-white tracking-wide leading-none drop-shadow-xs">
              Expiro
            </h1>
            <p className="text-[9.5px] sm:text-[10px] text-teal-100/90 font-medium tracking-normal mt-1">
              إدارة تواريخ صلاحية الأدوية
            </p>
          </div>
        </header>
      );
    }

    // 2. Dedicated Section Headers (التنبيهات، الخسائر، الدعم، حسابي) - بارتفاع 100px بتصميم متناسق
    const sectionInfo = {
      notifications: {
        title: 'التنبيهات',
        icon: Bell,
        iconBg: 'bg-rose-500/20 text-rose-200 border-rose-300/30',
      },
      losses: {
        title: 'الخسائر',
        icon: TrendingDown,
        iconBg: 'bg-amber-500/20 text-amber-200 border-amber-300/30',
      },
      support: {
        title: 'الدعم',
        icon: Headphones,
        iconBg: 'bg-teal-400/20 text-teal-100 border-teal-300/30',
      },
      profile: {
        title: 'حسابي',
        icon: User,
        iconBg: 'bg-white/20 text-white border-white/30',
      },
    }[activeTab as 'notifications' | 'losses' | 'support' | 'profile'] || {
      title: 'القسم',
      icon: Layers,
      iconBg: 'bg-white/20 text-white border-white/30',
    };

    const SectionIcon = sectionInfo.icon;

    return (
      <header
        className={`w-full h-[100px] min-h-[100px] max-h-[100px] px-3.5 sm:px-5 pt-2.5 pb-2 rounded-b-3xl shadow-none border-b-2 border-[#F1F5F9] dark:border-slate-950 transition-colors shrink-0 z-20 flex flex-col justify-between text-white ${
          isDarkMode
            ? 'bg-gradient-to-r from-slate-950 via-teal-950 to-slate-900'
            : 'bg-gradient-to-r from-[#0F766E] to-[#0D9488]'
        }`}
      >
        {/* الصف العلوي: زر الرجوع بأعلى اليمين وأيقونة القسم بأعلى اليسار ثابتين في مكانهم */}
        <div className="flex items-center justify-between w-full shrink-0">
          <div className="flex items-center justify-start shrink-0">
            <button
              onClick={() => setActiveTab('home')}
              className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white text-[#0D9488] hover:bg-teal-50 font-bold text-xs shadow-xs transition-transform active:scale-95"
              title="الرجوع إلى الرئيسية"
            >
              <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>رجوع</span>
            </button>
          </div>

          <div className="flex items-center justify-end shrink-0">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/18 border border-white/25 text-white flex items-center justify-center shrink-0 shadow-xs">
              <SectionIcon className="w-3.5 h-3.5 stroke-[2.5]" />
            </div>
          </div>
        </div>

        {/* عنوان القسم مرفوع للأعلى قليلاً ليكون متناسقاً وفي المنتصف تماماً */}
        <div className="flex-1 flex items-center justify-center text-center w-full -translate-y-2 pb-0.5">
          <h2 className="text-sm sm:text-base font-extrabold text-white tracking-wide leading-none drop-shadow-xs">
            {sectionInfo.title}
          </h2>
        </div>
      </header>
    );
  };

  // ---------------- DEDICATED NOTIFICATIONS FULL PAGE COMPONENT ----------------
  const renderNotificationsPage = () => {
    const expiredList = medicines.filter((m) => getMedicineAnalysis(m).status === 'EXPIRED');
    const nearList = medicines.filter((m) => getMedicineAnalysis(m).status === 'NEAR_EXPIRY');

    const displayList =
      notificationFilter === 'ALL'
        ? [...expiredList, ...nearList]
        : notificationFilter === 'EXPIRED'
        ? expiredList
        : nearList;

    return (
      <div className="relative">
        {/* شريط الفئات الثابت بأعلى صفحة التنبيهات بخلفية مطابقة تماماً للون الصفحة الرئيسية (#F1F5F9) */}
        <div className={`sticky top-0 z-20 pt-2 pb-2.5 px-0.5 transition-colors ${
          viewMode === 'wide'
            ? isDarkMode ? 'bg-slate-900' : 'bg-[#F8FAFC]'
            : isDarkMode ? 'bg-slate-950' : 'bg-[#F1F5F9]'
        }`}>
          <div className={`flex gap-1.5 p-1 rounded-2xl border transition-colors ${
            isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-[#F1F5F9] border-[#E2E8F0]'
          }`}>
            <button
              onClick={() => setNotificationFilter('ALL')}
              className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                notificationFilter === 'ALL'
                  ? 'bg-[#0D9488] text-white shadow-xs'
                  : isDarkMode
                  ? 'bg-slate-950 text-slate-300 hover:bg-slate-900'
                  : 'bg-[#F1F5F9] text-slate-700 hover:bg-slate-200/50'
              }`}
            >
              <span>كافة التنبيهات</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                notificationFilter === 'ALL'
                  ? 'bg-white/20 text-white'
                  : 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300'
              }`}>
                {expiredList.length + nearList.length}
              </span>
            </button>
            <button
              onClick={() => setNotificationFilter('EXPIRED')}
              className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                notificationFilter === 'EXPIRED'
                  ? 'bg-[#E53935] text-white shadow-xs'
                  : isDarkMode
                  ? 'bg-slate-950 text-rose-400 hover:bg-slate-900'
                  : 'bg-[#F1F5F9] text-rose-600 hover:bg-rose-50/60'
              }`}
            >
              <AlertOctagon className="w-3.5 h-3.5" />
              <span>منتهية</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                notificationFilter === 'EXPIRED'
                  ? 'bg-white/20 text-white'
                  : 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
              }`}>
                {expiredList.length}
              </span>
            </button>
            <button
              onClick={() => setNotificationFilter('NEAR')}
              className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                notificationFilter === 'NEAR'
                  ? 'bg-[#FB8C00] text-white shadow-xs'
                  : isDarkMode
                  ? 'bg-slate-950 text-amber-400 hover:bg-slate-900'
                  : 'bg-[#F1F5F9] text-amber-600 hover:bg-amber-50/60'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>وشيكة</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                notificationFilter === 'NEAR'
                  ? 'bg-white/20 text-white'
                  : 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
              }`}>
                {nearList.length}
              </span>
            </button>
          </div>
        </div>

        {/* قائمة بطاقات التنبيهات التي تنزلق بنعومة وسلاسة خلف شريط الفئات الثابت */}
        <div className="space-y-2.5 pt-1 pb-4 animate-in fade-in duration-200">
          {displayList.length === 0 ? (
            <div className={`rounded-2xl p-8 text-center border space-y-2 transition-colors ${
              isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-[#F8FAFC] border-[#E2E8F0]'
            }`}>
              <div className="w-12 h-12 bg-teal-50 dark:bg-teal-950/40 text-teal-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="font-extrabold text-slate-800 dark:text-white text-sm">لا توجد أدوية في هذا القسم حالياً</h4>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">مخزون صيدليتكم آمن ومنظم بالكامل ولا يتطلب إجراءات فورية.</p>
            </div>
          ) : (
            displayList.map((med) => renderCompactMedicineCard(med))
          )}
        </div>
      </div>
    );
  };

  // ---------------- 2. DEDICATED LOSSES PAGE (الخسائر) ----------------
  const renderLossesPage = () => {
    return (
      <div className="space-y-3 animate-in fade-in duration-200">
        <div className={`p-4 rounded-2xl border shadow-xs ${
          isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-[#F8FAFC] border-[#E2E8F0]'
        }`}>
          <div className="flex items-center gap-2 mb-3">
            <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950 text-rose-600">
              <TrendingDown className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">إحصائيات الخسائر والمخاطر</h3>
              <p className="text-[11px] text-slate-400">تتبع مفصل للأدوية التالفة والحرجة لتجنب الهدر المالي</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="p-3 rounded-xl bg-red-50/60 dark:bg-rose-950/40 border border-red-200/80 dark:border-rose-900">
              <div className="flex items-center gap-1.5 text-rose-600 font-bold text-xs mb-1">
                <AlertOctagon className="w-4 h-4" />
                <span>أدوية تالفة (منتهية)</span>
              </div>
              <p className="text-2xl font-black text-rose-700 dark:text-rose-400">{stats.expired}</p>
              <p className="text-[10px] text-rose-500 font-medium mt-0.5">عبوة ملزمة بالإتلاف الرسمي</p>
            </div>

            <div className="p-3 rounded-xl bg-amber-50/60 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-900">
              <div className="flex items-center gap-1.5 text-amber-600 font-bold text-xs mb-1">
                <AlertTriangle className="w-4 h-4" />
                <span>أدوية وشيكة (حرجة)</span>
              </div>
              <p className="text-2xl font-black text-amber-700 dark:text-amber-400">{stats.near}</p>
              <p className="text-[10px] text-amber-500 font-medium mt-0.5">تحتاج تصريف أو تدوير سريع</p>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-[#E2E8F0] dark:border-slate-800 flex items-center justify-between">
            <button
              onClick={() => {
                if (currentUser.role === 'admin') {
                  setIsDisposalOpen(true);
                } else {
                  setPermissionAlertMessage('محضر الإتلاف الرسمي متاح لمدير الصيدلية فقط');
                }
              }}
              className="w-full py-2 bg-gradient-to-r from-teal-700 to-teal-800 hover:from-teal-800 hover:to-teal-900 text-white rounded-xl text-xs font-bold shadow-xs flex items-center justify-center gap-1.5 active:scale-98 transition-all"
            >
              <FileText className="w-4 h-4" />
              <span>إصدار محضر إتلاف رسمي فوري</span>
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="font-extrabold text-xs text-slate-600 dark:text-slate-300 px-1">
            الأدوية المتأثرة بالخسائر ({expiredMedicines.length + nearExpiryMedicines.length})
          </h4>
          {expiredMedicines.length + nearExpiryMedicines.length === 0 ? (
            <div className="bg-[#F8FAFC] dark:bg-slate-900 rounded-2xl p-6 text-center border border-[#E2E8F0] dark:border-slate-800 text-xs text-slate-400">
              لا توجد خسائر حالياً! كل الأدوية بحالة ممتازة وصالحة.
            </div>
          ) : (
            <>
              {expiredMedicines.map(renderCompactMedicineCard)}
              {nearExpiryMedicines.map(renderCompactMedicineCard)}
            </>
          )}
        </div>
      </div>
    );
  };

  // ---------------- 3. DEDICATED SUPPORT PAGE (الدعم) ----------------
  const renderSupportPage = () => {
    return (
      <div className="space-y-3 animate-in fade-in duration-200">
        <div className={`p-4 rounded-2xl border shadow-xs ${
          isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-[#F8FAFC] border-[#E2E8F0]'
        }`}>
          <div className="flex items-center gap-2 mb-3">
            <div className="p-2 rounded-xl bg-teal-50 dark:bg-teal-950 text-teal-600">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">مركز الدعم الفني والمساعدة</h3>
              <p className="text-[11px] text-slate-400">فريق خدمة عملاء Expiro متاح لمساعدتكم على مدار الساعة</p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="p-3 rounded-xl bg-[#F1F5F9] dark:bg-slate-800/60 border border-[#E2E8F0] dark:border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">الخط الساخن المباشر</p>
                  <p className="text-[11px] text-slate-500 font-mono">07701234567</p>
                </div>
              </div>
              <button
                onClick={() => {
                  showToast('جاري الاتصال بخدمة العملاء...');
                }}
                className="px-3 py-1 bg-teal-700 hover:bg-teal-800 text-white rounded-lg text-xs font-bold"
              >
                اتصال
              </button>
            </div>

            <div className="p-3 rounded-xl bg-[#F1F5F9] dark:bg-slate-800/60 border border-[#E2E8F0] dark:border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">محادثة واتساب الفورية</p>
                  <p className="text-[11px] text-slate-500">استجابة سريعة خلال دقائق معدودة</p>
                </div>
              </div>
              <button
                onClick={() => {
                  showToast('فتح محادثة واتساب الرسمية...');
                }}
                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold"
              >
                مراسلة
              </button>
            </div>
          </div>
        </div>

        <div className={`p-4 rounded-2xl border shadow-xs space-y-2.5 ${
          isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-[#F8FAFC] border-[#E2E8F0]'
        }`}>
          <h4 className="font-extrabold text-xs text-slate-900 dark:text-white">الأسئلة الشائعة والإرشادات</h4>
          <div className="space-y-2 text-xs">
            <div className="p-2.5 rounded-xl bg-[#F1F5F9] dark:bg-slate-800/40 border border-[#E2E8F0] dark:border-slate-700/60">
              <p className="font-bold text-teal-800 dark:text-teal-300">كيف يتم فحص تواريخ الصلاحية؟</p>
              <p className="text-[11px] text-slate-500 mt-1">يقوم Expiro تلقائياً بحساب الأيام المتبقية وتصنيف الدواء (صالح / وشيك / منتهي) بدقة متناهية.</p>
            </div>
            <div className="p-2.5 rounded-xl bg-[#F1F5F9] dark:bg-slate-800/40 border border-[#E2E8F0] dark:border-slate-700/60">
              <p className="font-bold text-teal-800 dark:text-teal-300">أين أجد كود تسجيل الموظفين؟</p>
              <p className="text-[11px] text-slate-500 mt-1">من تبويب "حسابي"، اضغط على "إدارة حسابات الستاف والموظفين" لمشاركة كود الانضمام المباشر.</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ---------------- 4. DEDICATED PROFILE PAGE (حسابي - يتضمن صلاحيات المدير) ----------------
  const renderProfilePage = () => {
    return (
      <div className="space-y-3 animate-in fade-in duration-200">
        <div className={`p-4 rounded-2xl border shadow-xs space-y-2.5 ${
          isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-[#F8FAFC] border-[#E2E8F0]'
        }`}>
          <div className="flex items-center justify-between">
            <h4 className="font-extrabold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-teal-600" />
              <span>صلاحيات وإدارة المدير</span>
            </h4>
            {currentUser.role !== 'admin' && (
              <span className="text-[10px] text-amber-600 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-md font-bold">
                مقيدة للمدير فقط
              </span>
            )}
          </div>

          <div className="space-y-1.5">
            <button
              onClick={() => {
                if (currentUser.role === 'admin') setIsLicenseModalOpen(true);
                else setPermissionAlertMessage('تعديل إجازة الصيدلية متاح لمدير الصيدلية فقط');
              }}
              className="w-full p-2.5 rounded-xl border border-[#E2E8F0] dark:border-slate-800 hover:bg-[#F1F5F9] dark:hover:bg-slate-800 text-right flex items-center justify-between text-xs transition-colors"
            >
              <div className="flex items-center gap-2">
                <FileCheck2 className="w-4 h-4 text-teal-600" />
                <span className="font-bold text-slate-800 dark:text-slate-200">بيانات الصيدلية وإجازة الممارسة</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 rotate-180" />
            </button>

            <button
              onClick={() => {
                if (currentUser.role === 'admin') setIsStaffManagementOpen(true);
                else setPermissionAlertMessage('إدارة حسابات الستاف متاحة لمدير الصيدلية فقط');
              }}
              className="w-full p-2.5 rounded-xl border border-[#E2E8F0] dark:border-slate-800 hover:bg-[#F1F5F9] dark:hover:bg-slate-800 text-right flex items-center justify-between text-xs transition-colors"
            >
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-teal-600" />
                <span className="font-bold text-slate-800 dark:text-slate-200">إدارة حسابات الستاف والموظفين</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 rotate-180" />
            </button>

            <button
              onClick={() => {
                if (currentUser.role === 'admin') setIsDisposalOpen(true);
                else setPermissionAlertMessage('محضر الإتلاف الرسمي متاح لمدير الصيدلية فقط');
              }}
              className="w-full p-2.5 rounded-xl border border-[#E2E8F0] dark:border-slate-800 hover:bg-[#F1F5F9] dark:hover:bg-slate-800 text-right flex items-center justify-between text-xs transition-colors"
            >
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-rose-600" />
                <span className="font-bold text-slate-800 dark:text-slate-200">محضر الإتلاف الرسمي للأدوية</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 rotate-180" />
            </button>
          </div>
        </div>

        {/* بطاقة إجازة ممارسة المهنة المحفوظة في Firestore (Base64) */}
        {authenticatedUser?.licensePhotoBase64 && (
          <div className={`p-4 rounded-2xl border shadow-xs space-y-2.5 ${
            isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-[#F8FAFC] border-[#E2E8F0]'
          }`}>
            <div className="flex items-center justify-between">
              <h4 className="font-extrabold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                <FileCheck2 className="w-4 h-4 text-teal-600" />
                <span>إجازة ممارسة المهنة الرسمية (Firestore Base64)</span>
              </h4>
              <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>محفوظة بالسحابة</span>
              </span>
            </div>
            <div className="rounded-xl overflow-hidden border border-teal-200 dark:border-teal-900 max-h-56 flex items-center justify-center bg-slate-950/5">
              <img 
                src={authenticatedUser.licensePhotoBase64} 
                alt="Pharmacy Practice License" 
                className="w-full h-auto object-cover max-h-56 rounded-lg"
              />
            </div>
          </div>
        )}

        {/* زر تسجيل الخروج من الحساب */}
        <div className={`p-4 rounded-2xl border shadow-xs ${
          isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-[#F8FAFC] border-[#E2E8F0]'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-extrabold text-xs text-slate-900 dark:text-white">جلسة حساب الصيدلية</h4>
              <p className="text-[11px] text-slate-400">الخروج من الحساب الحالي والتبديل لصيدلية أخرى</p>
            </div>
            <button
              onClick={handleLogout}
              className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs active:scale-95 transition-all"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>تسجيل الخروج</span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ---------------- 5. DOCKED BOTTOM NAVIGATION BAR (نفس لون الواجهة الرئيسية #F1F5F9) ----------------
  const renderBottomNavigationBar = () => {
    return (
      <nav className="absolute bottom-0 inset-x-0 w-full z-30">
        <div className={`w-full border-t shadow-none px-2 sm:px-4 pt-1.5 pb-2.5 sm:pb-3 flex items-center justify-around relative transition-all ${
          isDarkMode
            ? 'bg-slate-950 border-slate-950 text-slate-400'
            : 'bg-[#F1F5F9] border-[#F1F5F9] text-[#1E293B]'
        }`}>
          
          {/* 1. الرئيسية (Home) */}
          <button
            onClick={() => setActiveTab('home')}
            className={`flex-1 flex flex-col items-center justify-center py-1 transition-all group ${
              activeTab === 'home'
                ? 'text-[#0D9488] dark:text-[#14B8A6] font-black'
                : 'text-[#1E293B] hover:text-[#0D9488] dark:text-slate-200 dark:hover:text-white font-bold'
            }`}
          >
            <div className={`p-1 rounded-xl transition-all ${activeTab === 'home' ? 'bg-teal-500/15' : 'group-hover:bg-slate-200/60'}`}>
              <Home className={`w-5 h-5 transition-transform group-active:scale-90 ${activeTab === 'home' ? 'stroke-[2.5]' : 'stroke-[2]'}`} />
            </div>
            <span className="text-[10px] mt-0.5 leading-none">الرئيسية</span>
            {activeTab === 'home' && (
              <span className="w-1.5 h-1.5 rounded-full bg-[#0D9488] dark:bg-[#14B8A6] mt-0.5" />
            )}
          </button>

          {/* 2. الخسائر (Losses) */}
          <button
            onClick={() => setActiveTab('losses')}
            className={`flex-1 flex flex-col items-center justify-center py-1 relative transition-all group ${
              activeTab === 'losses'
                ? 'text-[#0D9488] dark:text-[#14B8A6] font-black'
                : 'text-[#1E293B] hover:text-[#0D9488] dark:text-slate-200 dark:hover:text-white font-bold'
            }`}
          >
            <div className="relative">
              <div className={`p-1 rounded-xl transition-all ${activeTab === 'losses' ? 'bg-teal-500/15' : 'group-hover:bg-slate-200/60'}`}>
                <TrendingDown className={`w-5 h-5 transition-transform group-active:scale-90 ${activeTab === 'losses' ? 'stroke-[2.5]' : 'stroke-[2]'}`} />
              </div>
              {stats.expired > 0 && (
                <span className="absolute -top-1 -right-1 px-1 min-w-[14px] h-[14px] bg-rose-600 text-white font-bold text-[8px] rounded-full flex items-center justify-center shadow-xs">
                  {stats.expired}
                </span>
              )}
            </div>
            <span className="text-[10px] mt-0.5 leading-none">الخسائر</span>
            {activeTab === 'losses' && (
              <span className="w-1.5 h-1.5 rounded-full bg-[#0D9488] dark:bg-[#14B8A6] mt-0.5" />
            )}
          </button>

          {/* 3. زر الإضافة (+) البارز كزر دائري متدرج بالمنتصف */}
          <div className="flex-1 flex flex-col items-center justify-center relative -mt-6">
            <button
              onClick={() => setIsAddBottomSheetOpen(true)}
              className={`w-12 h-12 rounded-full bg-gradient-to-tr from-[#0F766E] to-[#0D9488] hover:from-[#0D9488] hover:to-[#0F766E] text-white flex items-center justify-center shadow-lg shadow-teal-700/35 border-3 active:scale-95 transition-all ${
                isDarkMode ? 'border-slate-950' : 'border-[#F1F5F9]'
              }`}
              title="إضافة علاج أو مسح باركود"
            >
              <Plus className="w-6 h-6 stroke-[3]" />
            </button>
          </div>

          {/* 4. الدعم (Support) */}
          <button
            onClick={() => setActiveTab('support')}
            className={`flex-1 flex flex-col items-center justify-center py-1 transition-all group ${
              activeTab === 'support'
                ? 'text-[#0D9488] dark:text-[#14B8A6] font-black'
                : 'text-[#1E293B] hover:text-[#0D9488] dark:text-slate-200 dark:hover:text-white font-bold'
            }`}
          >
            <div className={`p-1 rounded-xl transition-all ${activeTab === 'support' ? 'bg-teal-500/15' : 'group-hover:bg-slate-200/60'}`}>
              <Headphones className={`w-5 h-5 transition-transform group-active:scale-90 ${activeTab === 'support' ? 'stroke-[2.5]' : 'stroke-[2]'}`} />
            </div>
            <span className="text-[10px] mt-0.5 leading-none">الدعم</span>
            {activeTab === 'support' && (
              <span className="w-1.5 h-1.5 rounded-full bg-[#0D9488] dark:bg-[#14B8A6] mt-0.5" />
            )}
          </button>

          {/* 5. حسابي (Profile) */}
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex-1 flex flex-col items-center justify-center py-1 transition-all group ${
              activeTab === 'profile'
                ? 'text-[#0D9488] dark:text-[#14B8A6] font-black'
                : 'text-[#1E293B] hover:text-[#0D9488] dark:text-slate-200 dark:hover:text-white font-bold'
            }`}
          >
            <div className={`p-1 rounded-xl transition-all ${activeTab === 'profile' ? 'bg-teal-500/10' : 'group-hover:bg-slate-100/50'}`}>
              <User className={`w-5 h-5 transition-transform group-active:scale-90 ${activeTab === 'profile' ? 'stroke-[2.5]' : 'stroke-[2]'}`} />
            </div>
            <span className="text-[10px] mt-0.5 leading-none">حسابي</span>
            {activeTab === 'profile' && (
              <span className="w-1.5 h-1.5 rounded-full bg-[#0D9488] dark:bg-[#14B8A6] mt-0.5" />
            )}
          </button>

        </div>
      </nav>
    );
  };

  // ---------------- DASHBOARD KPI STATS (CLEAN MEDICAL UI WITH GLASSMORPHISM) ----------------
  const renderDashboardKPIs = () => (
    <div className="grid grid-cols-4 gap-2">
      {/* 1. الكل */}
      <button
        onClick={() => setStatusFilter('ALL')}
        className={`p-2 sm:p-2.5 rounded-2xl text-right transition-all flex flex-col justify-between backdrop-blur-md ${
          isDarkMode ? 'bg-slate-900/60 text-white' : 'bg-white/60 text-[#1E293B]'
        } ${
          statusFilter === 'ALL'
            ? 'border-2 border-[#0D9488] shadow-sm ring-2 ring-teal-500/15'
            : isDarkMode
            ? 'border border-slate-800/80 hover:border-teal-400'
            : 'border border-[#E2E8F0]/80 hover:border-teal-300 shadow-[0_2px_6px_rgba(0,0,0,0.02)]'
        }`}
      >
        <div className="flex items-center justify-between w-full mb-1">
          <span className={`text-[10px] sm:text-[11px] font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>الكل</span>
          <Layers className="w-3.5 h-3.5 text-[#0D9488]" />
        </div>
        <span className="text-base sm:text-lg font-black text-[#0D9488]">{stats.total}</span>
      </button>

      {/* 2. منتهية */}
      <button
        onClick={() => setStatusFilter('EXPIRED')}
        className={`p-2 sm:p-2.5 rounded-2xl text-right transition-all flex flex-col justify-between backdrop-blur-md ${
          isDarkMode ? 'bg-slate-900/60 text-white' : 'bg-white/60 text-[#1E293B]'
        } ${
          statusFilter === 'EXPIRED'
            ? 'border-2 border-[#E53935] shadow-sm ring-2 ring-red-500/15'
            : isDarkMode
            ? 'border border-slate-800/80 hover:border-red-400'
            : 'border border-[#E2E8F0]/80 hover:border-red-300 shadow-[0_2px_6px_rgba(0,0,0,0.02)]'
        }`}
      >
        <div className="flex items-center justify-between w-full mb-1">
          <span className={`text-[10px] sm:text-[11px] font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>منتهية</span>
          <AlertOctagon className="w-3.5 h-3.5 text-[#E53935]" />
        </div>
        <span className="text-base sm:text-lg font-black text-[#E53935]">{stats.expired}</span>
      </button>

      {/* 3. وشيكة */}
      <button
        onClick={() => setStatusFilter('NEAR_EXPIRY')}
        className={`p-2 sm:p-2.5 rounded-2xl text-right transition-all flex flex-col justify-between backdrop-blur-md ${
          isDarkMode ? 'bg-slate-900/60 text-white' : 'bg-white/60 text-[#1E293B]'
        } ${
          statusFilter === 'NEAR_EXPIRY'
            ? 'border-2 border-[#FB8C00] shadow-sm ring-2 ring-amber-500/15'
            : isDarkMode
            ? 'border border-slate-800/80 hover:border-amber-400'
            : 'border border-[#E2E8F0]/80 hover:border-amber-300 shadow-[0_2px_6px_rgba(0,0,0,0.02)]'
        }`}
      >
        <div className="flex items-center justify-between w-full mb-1">
          <span className={`text-[10px] sm:text-[11px] font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>وشيكة</span>
          <AlertTriangle className="w-3.5 h-3.5 text-[#FB8C00]" />
        </div>
        <span className="text-base sm:text-lg font-black text-[#FB8C00]">{stats.near}</span>
      </button>

      {/* 4. صالحة */}
      <button
        onClick={() => setStatusFilter('VALID')}
        className={`p-2 sm:p-2.5 rounded-2xl text-right transition-all flex flex-col justify-between backdrop-blur-md ${
          isDarkMode ? 'bg-slate-900/60 text-white' : 'bg-white/60 text-[#1E293B]'
        } ${
          statusFilter === 'VALID'
            ? 'border-2 border-[#43A047] shadow-sm ring-2 ring-emerald-500/15'
            : isDarkMode
            ? 'border border-slate-800/80 hover:border-emerald-400'
            : 'border border-[#E2E8F0]/80 hover:border-emerald-300 shadow-[0_2px_6px_rgba(0,0,0,0.02)]'
        }`}
      >
        <div className="flex items-center justify-between w-full mb-1">
          <span className={`text-[10px] sm:text-[11px] font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>صالحة</span>
          <CheckCircle2 className="w-3.5 h-3.5 text-[#43A047]" />
        </div>
        <span className="text-base sm:text-lg font-black text-[#43A047]">{stats.valid}</span>
      </button>
    </div>
  );

  // ---------------- COMPACT MEDICINE CARD LIST (CLEAN COOL-GRAY MEDICAL CARDS) ----------------
  const renderCompactMedicineCard = (med: Medicine) => {
    const analysis = getMedicineAnalysis(med);
    const isExpired = analysis.status === 'EXPIRED';
    const isNear = analysis.status === 'NEAR_EXPIRY';

    return (
      <article
        key={med.id}
        className={`relative rounded-2xl border shadow-[0_2px_6px_rgba(0,0,0,0.02)] transition-all duration-200 overflow-hidden ${
          isDarkMode
            ? 'bg-slate-900 border-slate-800 text-white'
            : 'bg-[#F8FAFC] border-[#E2E8F0] text-[#1E293B] hover:border-[#CBD5E1]'
        }`}
      >
        <div className="flex items-stretch">
          {/* شريط جانبي ملون ناعم على يمين البطاقة لتمييز حالة الدواء (أحمر للمنتهي، برتقالي للوشيك، أخضر للصالح) */}
          <div
            className={`w-1.5 shrink-0 rounded-r-2xl ${
              isExpired
                ? 'bg-[#E53935]'
                : isNear
                ? 'bg-[#FB8C00]'
                : 'bg-[#43A047]'
            }`}
          />

          <div className="flex-1 p-3 space-y-2">
            {/* Row 1: Trade Name in readable slate navy (#1E293B) + Subtle Status Badge */}
            <div className="flex items-start justify-between gap-2">
              <h3 className={`font-extrabold text-xs sm:text-sm leading-snug truncate ${isDarkMode ? 'text-white' : 'text-[#1E293B]'}`}>
                {med.tradeName}
              </h3>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold shrink-0 border flex items-center gap-1 shadow-2xs ${analysis.badgeBg}`}>
                {isExpired ? (
                  <AlertOctagon className="w-3 h-3 text-[#E53935]" />
                ) : isNear ? (
                  <AlertTriangle className="w-3 h-3 text-[#FB8C00]" />
                ) : (
                  <CheckCircle2 className="w-3 h-3 text-[#43A047]" />
                )}
                <span>{analysis.badgeText}</span>
              </span>
            </div>

            {/* Row 2: Scientific Name in readable dark grey + Expiry Date */}
            <div className="flex items-center justify-between text-[11px] gap-2">
              <p className={`truncate max-w-[200px] sm:max-w-xs font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                {med.scientificName || 'صنف دوائي عام'}
              </p>
              <div
                className={`flex items-center gap-1 font-mono font-bold shrink-0 text-xs px-2 py-0.5 rounded-lg border ${
                  isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-[#F1F5F9] border-[#E2E8F0]'
                }`}
                style={{ color: analysis.accentColor }}
              >
                <Calendar className="w-3 h-3 text-slate-400" />
                <span>{med.expiryDate}</span>
              </div>
            </div>

            {/* Row 3: Tags + Actions */}
            <div className={`flex items-center justify-between pt-1 border-t gap-1 text-[10px] ${
              isDarkMode ? 'border-slate-800' : 'border-[#E2E8F0]/80'
            }`}>
              <div className="flex items-center gap-1.5 flex-wrap min-w-0">
                <span className={`px-1.5 py-0.5 rounded font-medium truncate max-w-[120px] ${
                  isDarkMode ? 'bg-slate-800 text-slate-300' : 'bg-[#E2E8F0]/80 text-slate-700'
                }`}>
                  {med.companyName}
                </span>
                <span className={`px-1.5 py-0.5 rounded font-bold truncate max-w-[110px] ${
                  isDarkMode ? 'bg-teal-950/60 text-teal-300' : 'bg-teal-50 text-teal-800'
                }`}>
                  {med.category}
                </span>
                {med.barcode && (
                  <span className={`px-1.5 py-0.5 rounded font-mono tracking-tight flex items-center gap-0.5 ${
                    isDarkMode ? 'bg-slate-800 text-slate-400' : 'bg-[#E2E8F0]/80 text-slate-600'
                  }`}>
                    <QrCode className="w-2.5 h-2.5 text-slate-400" />
                    <span>{med.barcode}</span>
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => {
                    setEditingMedicine(med);
                    setInitialBarcodeForAdd('');
                    setIsAddEditOpen(true);
                  }}
                  className={`p-1.5 rounded-lg transition-colors ${
                    isDarkMode ? 'text-slate-400 hover:text-teal-400 hover:bg-slate-800' : 'text-slate-400 hover:text-teal-700 hover:bg-teal-50'
                  }`}
                  title="تعديل"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDeleteMedicine(med.id)}
                  className={`p-1.5 rounded-lg transition-colors ${
                    isDarkMode ? 'text-slate-400 hover:text-rose-400 hover:bg-slate-800' : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                  }`}
                  title="حذف"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

          </div>
        </div>
      </article>
    );
  };

  // ---------------- MAIN DASHBOARD CONTENT (خلفية مطابقة تماماً للواجهة الرئيسية #F1F5F9) ----------------
  const renderDashboardContent = () => (
    <div className="h-full overflow-y-auto overscroll-contain no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden pb-32">
      {/* القسم العلوي الثابت بنفس لون خلفية الواجهة الرئيسية تماماً (#F1F5F9) معتم 100% ليحجب المحتوى بانسيابية واختفاء طبيعي */}
      <div className={`sticky top-0 z-20 space-y-2 pb-2.5 pt-2 px-3 -mx-3 transition-colors ${
        viewMode === 'wide'
          ? isDarkMode ? 'bg-slate-900' : 'bg-[#F8FAFC]'
          : isDarkMode ? 'bg-slate-950' : 'bg-[#F1F5F9]'
      }`}>
        {renderDashboardKPIs()}

        {/* شريط البحث المدمج بخلفية ناعمة وإطار أنيق */}
        <div className="relative flex items-center">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث بالاسم، الشركة، الفئة، أو الباركود..."
            className={`w-full pl-32 pr-9 py-2.5 rounded-2xl text-xs font-semibold transition-all shadow-xs focus:outline-none focus:ring-2 focus:ring-teal-600/20 ${
              isDarkMode 
                ? 'bg-slate-900 border border-slate-700 text-white placeholder-slate-400 focus:border-teal-400' 
                : 'bg-[#F8FAFC] border border-[#CBD5E1] text-[#0F172A] placeholder-slate-500 focus:border-[#0D9488]'
            }`}
          />
          <Search className="w-4 h-4 text-[#0D9488] dark:text-teal-400 absolute right-3 top-1/2 -translate-y-1/2 stroke-[2.5]" />
          
          <div className="absolute left-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 p-1 rounded-full transition-colors"
              >
                <X className="w-3.5 h-3.5 stroke-[2.2]" />
              </button>
            )}
            {/* زر ماسح الباركود بتصميم بارز وواضح */}
            <button
              onClick={() => setIsScannerOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-teal-700 to-[#0D9488] hover:from-teal-800 hover:to-teal-700 text-white rounded-xl text-[11px] font-bold shadow-xs active:scale-95 transition-all"
              title="مسح باركود الدواء بالكاميرا"
            >
              <ScanLine className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>ماسح باركود</span>
            </button>
          </div>
        </div>
      </div>

      {/* قائمة بطاقات الأدوية القابلة للتمرير - تنزلق بانسيابية تامة خلف شريط البحث والشريط السفلي */}
      <div className="space-y-2 pt-1 pb-4">
        {filteredMedicines.length === 0 ? (
          <div className={`rounded-2xl p-6 text-center border text-xs backdrop-blur-md ${
            isDarkMode ? 'bg-slate-900/70 border-slate-800 text-slate-400' : 'bg-[#F8FAFC]/80 border-[#E2E8F0] text-slate-500'
          }`}>
            <ShieldAlert className="w-8 h-8 text-teal-600 mx-auto mb-2 opacity-80" />
            <p className={`font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>لا توجد أدوية مطابقة للبحث أو الفلتر</p>
            <p className="text-[11px] mt-1 text-slate-400">اضغط على زر (+) بالأسفل لمسح باركود جديد أو إدخال يدوي</p>
          </div>
        ) : (
          filteredMedicines.map(renderCompactMedicineCard)
        )}
      </div>
    </div>
  );

  // الشاشة الترحيبية الافتتاحية (Splash Screen) لمدة 5 ثوانٍ مع حركة الأيقونة والنصوص
  if (showSplash) {
    return (
      <SplashScreen 
        onComplete={handleSplashComplete} 
        authenticatedUser={authenticatedUser} 
        isDarkMode={isDarkMode}
      />
    );
  }

  // إذا لم يكن الصيدلي قد سجل دخوله، اعرض شاشات الدخول والإنشاء
  if (!authenticatedUser) {
    return (
      <AuthScreen 
        onLoginSuccess={handleLoginSuccess} 
        isDarkMode={isDarkMode}
        initialMode={authInitialMode}
      />
    );
  }

  // التوجيه التلقائي حسب الدور: إذا كان المستخدم مالك النظام (Admin) يوجه فوراً إلى لوحة تحكم الأدمن
  if (authenticatedUser.role === 'admin' && adminViewMode === 'dashboard') {
    return (
      <AdminDashboard 
        user={authenticatedUser} 
        onLogout={handleLogout} 
        onSwitchToPharmacyView={() => setAdminViewMode('pharmacy')} 
        isDarkMode={isDarkMode} 
      />
    );
  }

  return (
    <div className={`min-h-screen flex flex-col font-['Cairo',sans-serif] antialiased selection:bg-teal-600 selection:text-white transition-colors ${
      isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-[#F1F5F9] text-[#1E293B]'
    }`} dir="rtl">
      {/* إذا كان المالك يتصفح واجهة الصيدلية، نعرض شريطاً للعودة للوحة تحكم الأدمن */}
      {authenticatedUser.role === 'admin' && (
        <div className="bg-gradient-to-r from-amber-600 to-amber-700 text-white px-3 sm:px-4 py-2 text-xs font-bold flex items-center justify-between border-b border-amber-800 shadow-sm print:hidden">
          <div className="flex items-center gap-2">
            <span>👑 أنت تتصفح حالياً واجهة إدارة أدوية الصيدلية بصفتك مالك النظام (Admin)</span>
          </div>
          <button
            onClick={() => setAdminViewMode('dashboard')}
            className="px-3 py-1 bg-white text-amber-950 hover:bg-amber-50 rounded-lg font-black text-xs shadow-xs transition-transform active:scale-95 flex items-center gap-1.5"
          >
            <span>العودة للوحة تحكم الأدمن</span>
            <ArrowRight className="w-3.5 h-3.5 rotate-180" />
          </button>
        </div>
      )}

      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 animate-bounce">
          <div className="bg-slate-900 text-white px-4 py-2 rounded-xl shadow-xl flex items-center gap-2 text-xs font-bold border border-slate-700">
            <CheckCircle2 className="w-3.5 h-3.5 text-teal-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Flutter APK Fixed Code Download Banner */}
      <div className="bg-gradient-to-r from-teal-800 to-emerald-700 text-white px-3 py-2 text-xs flex flex-wrap items-center justify-between gap-2 shadow-xs border-b border-teal-900 print:hidden">
        <div className="flex items-center gap-2">
          <Download className="w-4 h-4 text-emerald-300 shrink-0 animate-pulse" />
          <span className="font-bold">كود Flutter مصحح وجاهز لبناء APK في GitHub Actions</span>
        </div>
        <div className="flex items-center gap-2">
          <a
            href="/Expiro_Flutter_Fixed.zip"
            download="Expiro_Flutter_Fixed.zip"
            className="px-3 py-1 bg-white text-teal-900 hover:bg-emerald-50 rounded-lg font-black text-xs shadow-xs transition-transform active:scale-95 flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>تحميل المشروع (ZIP)</span>
          </a>
        </div>
      </div>

      {/* Top Bar for View Toggle / Quick Actions */}
      <div className={`border-b px-3 py-1.5 sm:px-4 sm:py-2 flex items-center justify-between text-xs print:hidden transition-colors ${
        isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-[#F8FAFC] border-[#E2E8F0] text-slate-700'
      }`}>
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping shrink-0" />
          <span className="font-extrabold text-slate-800 dark:text-white shrink-0 text-xs sm:text-sm">Expiro RX</span>
          <span className="hidden sm:inline text-slate-400">|</span>
          <span className="hidden sm:inline text-slate-600 dark:text-slate-300 truncate">{pharmacy.name}</span>
          <span className={`text-[9.5px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded truncate ${
            currentUser.role === 'admin' ? 'bg-teal-50 text-teal-700 border border-teal-200 dark:bg-teal-950 dark:text-teal-300' : 'bg-sky-50 text-sky-700 border border-sky-200'
          }`}>
            <span className="hidden sm:inline">الحساب: </span>
            {currentUser.role === 'admin' ? 'مدير الصيدلية (Admin)' : 'موظف الصيدلية (Staff)'}
          </span>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <button
            onClick={toggleRoleDemo}
            className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold flex items-center gap-1 sm:gap-1.5 shadow-xs transition-all ${
              currentUser.role === 'admin' 
                ? 'bg-teal-700 text-white hover:bg-teal-800' 
                : 'bg-sky-600 text-white hover:bg-sky-700'
            }`}
            title="تبديل الصلاحيات بين المدير والموظف لاختبار القيود"
          >
            <RefreshCw className="w-3 h-3" />
            <span className="hidden sm:inline">تبديل الدور: {currentUser.role === 'admin' ? 'مدير الصيدلية' : 'موظف الصيدلية'}</span>
            <span className="sm:hidden">تبديل الدور</span>
          </button>

          <button
            onClick={() => setViewMode(viewMode === 'mobile' ? 'wide' : 'mobile')}
            className="hidden sm:flex items-center gap-1 px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-lg text-slate-700 dark:text-slate-300 font-bold"
          >
            {viewMode === 'mobile' ? <Monitor className="w-3.5 h-3.5" /> : <Smartphone className="w-3.5 h-3.5" />}
            <span>{viewMode === 'mobile' ? 'عرض واسع' : 'عرض الموبايل'}</span>
          </button>

          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-1 text-slate-500 hover:text-slate-800 rounded"
            title="الصوت"
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-teal-600" /> : <VolumeX className="w-3.5 h-3.5 text-slate-400" />}
          </button>

          <button
            onClick={handleLogout}
            className="flex items-center gap-1 px-2 py-1 rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 font-bold text-xs transition-colors"
            title="تسجيل الخروج من الحساب"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">خروج</span>
          </button>
        </div>
      </div>

      {/* Main Container */}
      <main className="flex-1 p-0 sm:py-4 sm:px-4 flex justify-center pb-6 sm:pb-8">
        <div className={`w-full ${viewMode === 'mobile' ? 'max-w-full sm:max-w-[420px]' : 'max-w-5xl'}`}>
          {viewMode === 'mobile' ? (
            <div className="relative sm:bg-slate-900 sm:rounded-[44px] sm:p-2.5 sm:shadow-2xl sm:border-4 sm:border-slate-800">
              <div className="hidden sm:flex absolute top-4 left-1/2 -translate-x-1/2 w-24 h-4 bg-black rounded-full z-40 items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-slate-900 mr-2 border border-slate-800" />
                <div className="w-1.5 h-1.5 rounded-full bg-teal-900/40" />
              </div>

              {/* Screen Canvas: Full Height with Fixed Header & Fixed Controls on Home */}
              <div className={`h-[calc(100vh-80px)] sm:h-[800px] sm:rounded-[36px] overflow-hidden flex flex-col border-0 sm:border relative transition-colors ${
                isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-[#F1F5F9] border-[#E2E8F0] shadow-sm'
              }`}>
                {/* 1. Header (Fixed at top) */}
                {renderExactHeader()}

                {/* Content Container (For Home: Search stays fixed, list scrolls under bottom bar seamlessly) */}
                <div 
                  className="flex-1 overflow-hidden px-3 pt-0 pb-0 flex flex-col min-h-0 relative select-none"
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                  onMouseDown={handleTouchStart}
                  onMouseMove={handleTouchMove}
                  onMouseUp={handleTouchEnd}
                >
                  {renderPullToRefreshIndicator()}
                  {activeTab === 'home' && renderDashboardContent()}
                  {activeTab === 'losses' && <div className="flex-1 overflow-y-auto pt-1 pb-32 no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">{renderLossesPage()}</div>}
                  {activeTab === 'support' && <div className="flex-1 overflow-y-auto pt-1 pb-32 no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">{renderSupportPage()}</div>}
                  {activeTab === 'profile' && <div className="flex-1 overflow-y-auto pt-1 pb-32 no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">{renderProfilePage()}</div>}
                  {activeTab === 'notifications' && <div className="flex-1 overflow-y-auto pt-0 pb-32 no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">{renderNotificationsPage()}</div>}
                </div>

                {/* Bottom Navigation Bar */}
                {renderBottomNavigationBar()}

                {/* Bottom Sheet for Adding Medicine */}
                {isAddBottomSheetOpen && (
                  <div 
                    className="absolute inset-0 z-40 bg-slate-950/50 backdrop-blur-xs flex flex-col justify-end transition-all"
                    onClick={() => setIsAddBottomSheetOpen(false)}
                  >
                    <div 
                      className={`rounded-t-3xl p-4 shadow-2xl border-t space-y-3 animate-in slide-in-from-bottom duration-200 ${
                        isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-100 text-slate-900'
                      }`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="w-8 h-1 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto" />
                      <div className="text-center">
                        <h4 className="font-extrabold text-sm">إضافة علاج جديد</h4>
                        <p className="text-[11px] text-slate-400">اختر طريقة تسجيل الدواء لمتابعة صلاحيته بدقة</p>
                      </div>

                      <button
                        onClick={() => {
                          setIsAddBottomSheetOpen(false);
                          setIsScannerOpen(true);
                        }}
                        className={`w-full p-3 border rounded-xl flex items-center gap-3 text-right group transition-all ${
                          isDarkMode 
                            ? 'bg-teal-950/60 border-teal-800 hover:bg-teal-900/60' 
                            : 'bg-teal-50 border-teal-200 hover:bg-teal-100/80'
                        }`}
                      >
                        <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-sm">
                          <ScanLine className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <h5 className="font-bold text-xs text-teal-950 dark:text-teal-200">مسح باركود</h5>
                          <p className="text-[11px] text-teal-700/80 dark:text-teal-300">التعرف التلقائي على اسم الشركة والفئة والصنف</p>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-teal-600 rotate-180" />
                      </button>

                      <button
                        onClick={() => {
                          setIsAddBottomSheetOpen(false);
                          setEditingMedicine(null);
                          setInitialBarcodeForAdd('');
                          setIsAddEditOpen(true);
                        }}
                        className={`w-full p-3 border rounded-xl flex items-center gap-3 text-right group transition-all ${
                          isDarkMode 
                            ? 'bg-slate-800 border-slate-700 hover:bg-slate-750' 
                            : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <div className="w-10 h-10 rounded-xl bg-slate-800 dark:bg-slate-700 text-white flex items-center justify-center shadow-sm">
                          <Edit3 className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <h5 className="font-bold text-xs text-slate-900 dark:text-white">إدخال يدوي</h5>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">كتابة اسم العلاج والشركة وتاريخ الانتهاء يدوياً</p>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400 rotate-180" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className={`rounded-3xl border shadow-sm overflow-hidden flex flex-col h-[800px] relative transition-colors ${
              isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-[#F1F5F9] border-[#E2E8F0] text-slate-900'
            }`}>
              {renderExactHeader()}
              <div 
                className="px-4 sm:px-6 pt-0 pb-0 flex-1 flex flex-col min-h-0 overflow-hidden relative select-none"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onMouseDown={handleTouchStart}
                onMouseMove={handleTouchMove}
                onMouseUp={handleTouchEnd}
              >
                {renderPullToRefreshIndicator()}
                {activeTab === 'home' && renderDashboardContent()}
                {activeTab === 'losses' && <div className="flex-1 overflow-y-auto pt-1 pb-32 no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">{renderLossesPage()}</div>}
                {activeTab === 'support' && <div className="flex-1 overflow-y-auto pt-1 pb-32 no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">{renderSupportPage()}</div>}
                {activeTab === 'profile' && <div className="flex-1 overflow-y-auto pt-1 pb-32 no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">{renderProfilePage()}</div>}
                {activeTab === 'notifications' && <div className="flex-1 overflow-y-auto pt-0 pb-32 no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">{renderNotificationsPage()}</div>}
              </div>
              {renderBottomNavigationBar()}
            </div>
          )}
        </div>
      </main>

      {/* Real Live Camera Barcode Scanner & Pharmaceutical Database Integration */}
      <RealBarcodeScanner
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScanComplete={handleScanDetected}
        existingMedicines={medicines}
      />

      {/* Add / Edit Medicine Modal */}
      {isAddEditOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-3 sm:p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-teal-600" />
                <span>{(editingMedicine && editingMedicine.id !== 0) ? 'تعديل بيانات الدواء' : 'تسجيل دواء جديد'}</span>
              </h3>
              <button
                onClick={() => {
                  setIsAddEditOpen(false);
                  setEditingMedicine(null);
                }}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSaveMedicine(formData);
              }}
              className="space-y-3 text-xs"
            >
              {/* حقل الباركود الدولي مع زر الفحص الآلي الذكي */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">الباركود الدولي للمنتج الدوائي</label>
                <div className="flex gap-2">
                  <input
                    name="barcode"
                    value={formData.barcode || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFormData((prev) => ({ ...prev, barcode: val }));
                      if (val.trim().length >= 8) {
                        const match = lookupDrugByBarcode(val.trim());
                        if (match && !formData.tradeName) {
                          setFormData((prev) => ({
                            ...prev,
                            tradeName: match.tradeName,
                            scientificName: match.scientificName,
                            companyName: match.companyName,
                            category: match.category,
                            notes: match.notes,
                            alertThresholdDays: match.defaultAlertDays,
                          }));
                          playTone('beep');
                          showToast(`تم التعرف تلقائياً: ${match.tradeName}`);
                        }
                      }
                    }}
                    placeholder="امسح الباركود أو اكتبه هنا (مثال: 6281001230012)"
                    className="flex-1 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => handleBarcodeManualLookup(formData.barcode || '')}
                    className="px-3 py-2 bg-gradient-to-r from-teal-700 to-teal-600 hover:from-teal-800 hover:to-teal-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0 shadow-xs active:scale-95 transition-all"
                    title="فحص الباركود في الدليل الدوائي المعتمد"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>فحص الباركود</span>
                  </button>
                </div>
                <p className="text-[10px] text-teal-700 dark:text-teal-400 mt-1">
                  💡 عند كتابة أو مسح الباركود، يتم جلب الاسم التجاري، العلمي، والشركة المصنعة تلقائياً.
                </p>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">الاسم التجاري للعلاج *</label>
                <input
                  name="tradeName"
                  value={formData.tradeName || ''}
                  onChange={(e) => setFormData((prev) => ({ ...prev, tradeName: e.target.value }))}
                  required
                  placeholder="مثال: أوجمنتين 1 جم أقراص (Augmentin)"
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">الاسم العلمي (التركيبة الفعالة)</label>
                <input
                  name="scientificName"
                  value={formData.scientificName || ''}
                  onChange={(e) => setFormData((prev) => ({ ...prev, scientificName: e.target.value }))}
                  placeholder="مثال: Amoxicillin + Clavulanic Acid"
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">الشركة المصنعة</label>
                  <input
                    name="companyName"
                    value={formData.companyName || ''}
                    onChange={(e) => setFormData((prev) => ({ ...prev, companyName: e.target.value }))}
                    placeholder="مثال: GSK / سامراء SDI"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">الفئة الطبية</label>
                  <input
                    name="category"
                    value={formData.category || ''}
                    onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
                    placeholder="مثال: المضادات الحيوية"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">تاريخ الانتهاء *</label>
                  <input
                    type="date"
                    name="expiryDate"
                    value={formData.expiryDate || ''}
                    onChange={(e) => setFormData((prev) => ({ ...prev, expiryDate: e.target.value }))}
                    required
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-teal-800 dark:text-teal-300 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">مهلة التنبيه المسبق</label>
                  <select
                    name="alertThresholdDays"
                    value={formData.alertThresholdDays || 60}
                    onChange={(e) => setFormData((prev) => ({ ...prev, alertThresholdDays: Number(e.target.value) }))}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value={15}>قبل 15 يوماً</option>
                    <option value={30}>قبل شهر واحد (30 يوماً)</option>
                    <option value={60}>قبل شهرين (60 يوماً - موصى به)</option>
                    <option value={90}>قبل 3 أشهر (90 يوماً)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">ملاحظات / دواعي الاستعمال / شكل العبوة</label>
                <input
                  name="notes"
                  value={formData.notes || ''}
                  onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                  placeholder="مثال: شراب معلق 100 مل / يحفظ في درجة حرارة أقل من 25 مئوية"
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-teal-700 hover:bg-teal-800 text-white font-bold rounded-xl shadow-xs active:scale-98 transition-all"
                >
                  {(editingMedicine && editingMedicine.id !== 0) ? 'حفظ التعديلات' : 'تسجيل الدواء في الصيدلية'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddEditOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Official Disposal Report Modal */}
      {isDisposalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-3 sm:p-4 backdrop-blur-xs">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl p-5 space-y-4 max-h-[92vh] overflow-y-auto text-slate-900 dark:text-white text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-extrabold text-base flex items-center gap-2">
                <FileText className="w-5 h-5 text-rose-600" />
                <span>محضر إتلاف أدوية رسمي (خاص بالمدير)</span>
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-slate-900 dark:bg-slate-800 text-white font-bold rounded-xl flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>طباعة</span>
                </button>
                <button
                  onClick={() => setIsDisposalOpen(false)}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="text-center py-2 border-b border-slate-100 dark:border-slate-800">
              <h4 className="font-black text-sm text-slate-900 dark:text-white">{pharmacy.name}</h4>
              <p className="text-[11px] text-slate-500">رمز الترخيص: {pharmacy.id} | الصيدلي المسؤول: {pharmacy.adminName}</p>
              <p className="text-[10px] text-slate-400 font-mono mt-0.5">التاريخ: {new Date().toISOString().split('T')[0]}</p>
            </div>

            <div className="space-y-2">
              <h5 className="font-bold text-xs text-rose-600">قائمة الأدوية المعتمدة للإتلاف ({expiredMedicines.length}):</h5>
              {expiredMedicines.length === 0 ? (
                <p className="text-center py-6 text-slate-400">لا توجد أدوية منتهية للإتلاف حالياً.</p>
              ) : (
                <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
                  <table className="w-full text-right text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-800/80 font-bold">
                      <tr>
                        <th className="p-2">الدواء</th>
                        <th className="p-2">الشركة</th>
                        <th className="p-2">تاريخ الانتهاء</th>
                        <th className="p-2">الكمية</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {expiredMedicines.map((m) => (
                        <tr key={m.id}>
                          <td className="p-2 font-bold">{m.tradeName}</td>
                          <td className="p-2 text-slate-500">{m.companyName}</td>
                          <td className="p-2 font-mono text-rose-600 font-bold">{m.expiryDate}</td>
                          <td className="p-2 font-bold">{m.quantity || 1}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="pt-4 grid grid-cols-2 gap-4 text-center text-xs">
              <div className="border border-dashed border-slate-300 dark:border-slate-700 p-3 rounded-xl">
                <p className="font-bold mb-4">توقيع وختم الصيدلي المسؤول</p>
                <div className="border-b border-slate-400 w-28 mx-auto" />
              </div>
              <div className="border border-dashed border-slate-300 dark:border-slate-700 p-3 rounded-xl">
                <p className="font-bold mb-4">اعتماد التفتيش الصيدلي</p>
                <div className="border-b border-slate-400 w-28 mx-auto" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Staff Management Modal */}
      {isStaffManagementOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-3 sm:p-4 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-5 space-y-4 max-h-[90vh] overflow-y-auto text-slate-900 dark:text-white text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-extrabold text-sm flex items-center gap-2">
                <Users className="w-4 h-4 text-teal-600" />
                <span>إدارة حسابات الستاف والموظفين</span>
              </h3>
              <button
                onClick={() => setIsStaffManagementOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 bg-teal-50 dark:bg-teal-950/40 rounded-xl border border-teal-200 dark:border-teal-900">
              <p className="text-[11px] text-teal-800 dark:text-teal-300 font-bold">كود الانضمام السريع لصيدليتك:</p>
              <div className="flex items-center justify-between mt-1">
                <span className="font-mono font-black text-sm text-teal-900 dark:text-teal-200 tracking-wider">
                  {pharmacy.id}
                </span>
                <button
                  onClick={() => {
                    navigator.clipboard?.writeText(pharmacy.id);
                    showToast('تم نسخ كود الانضمام');
                  }}
                  className="px-2.5 py-1 bg-teal-700 text-white rounded-lg text-[10px] font-bold"
                >
                  نسخ الكود
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-bold text-xs text-slate-700 dark:text-slate-300">قائمة الكادر المسجل ({staffList.length}):</h4>
              {staffList.map((stf) => (
                <div
                  key={stf.id}
                  className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between"
                >
                  <div>
                    <p className="font-bold">{stf.name}</p>
                    <p className="text-[10px] text-slate-400 font-mono">{stf.phone}</p>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold text-[10px]">
                    نشط ومعتمد
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* License Edit Modal */}
      {isLicenseModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-3 sm:p-4 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-5 space-y-4 max-h-[90vh] overflow-y-auto text-slate-900 dark:text-white text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-extrabold text-sm flex items-center gap-2">
                <FileCheck2 className="w-4 h-4 text-teal-600" />
                <span>بيانات الصيدلية وإجازة الممارسة</span>
              </h3>
              <button
                onClick={() => setIsLicenseModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">اسم الصيدلية</label>
                <input
                  defaultValue={pharmacy.name}
                  onChange={(e) => setPharmacy((prev) => ({ ...prev, name: e.target.value }))}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">الصيدلي المسؤول</label>
                <input
                  defaultValue={pharmacy.adminName}
                  onChange={(e) => setPharmacy((prev) => ({ ...prev, adminName: e.target.value }))}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">رقم الترخيص / القيد</label>
                <input
                  defaultValue={pharmacy.id}
                  disabled
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 font-mono text-slate-500"
                />
              </div>

              <button
                onClick={() => {
                  setIsLicenseModalOpen(false);
                  showToast('تم حفظ بيانات الصيدلية بنجاح');
                }}
                className="w-full py-2.5 bg-teal-700 hover:bg-teal-800 text-white font-bold rounded-xl shadow-xs"
              >
                تأكيد وحفظ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Permission Denied Alert Modal */}
      {permissionAlertMessage && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-5 text-center space-y-3 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="w-12 h-12 bg-rose-50 dark:bg-rose-950/60 text-rose-600 rounded-full flex items-center justify-center mx-auto">
              <Lock className="w-6 h-6" />
            </div>
            <h4 className="font-black text-sm text-slate-900 dark:text-white">الصلاحية محصورة بالمدير</h4>
            <p className="text-xs text-slate-500">{permissionAlertMessage}</p>
            <button
              onClick={() => setPermissionAlertMessage(null)}
              className="w-full py-2 bg-slate-900 dark:bg-slate-800 text-white font-bold rounded-xl text-xs"
            >
              حسناً، فهمت
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
