import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc,
  query, 
  where, 
  deleteDoc, 
  onSnapshot,
  Unsubscribe 
} from 'firebase/firestore';
import { Medicine } from '../App';

export const firebaseConfig = {
  apiKey: "AIzaSyA7e8x8iTG790o1umWfGQY8pGMwH12pf2Y",
  authDomain: "expiro-app-f9063.firebaseapp.com",
  projectId: "expiro-app-f9063",
  storageBucket: "expiro-app-f9063.firebasestorage.app",
  messagingSenderId: "311495130006",
  appId: "1:311495130006:web:4ldc22b5e707f1fcb13bb7",
  measurementId: "G-RTZFBBCZC0"
};

// تهيئة تطبيق Firebase بشكل آمن ومنع تكرار التهيئة
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app);

// رقم هاتف مالك النظام المعتمد
export const ADMIN_PHONE = '07829692579';

// نموذج بيانات المستخدم / الصيدلي في Firestore
export interface PharmacistUser {
  id: string; // رقم الهاتف أو المعرف الفريد
  fullName: string; // الاسم واللقب
  pharmacyName?: string; // اسم الصيدلية
  phone: string; // رقم الهاتف
  password?: string; // كلمة المرور
  licensePhotoBase64?: string; // صورة إجازة الصيدلية مشفرة Base64
  createdAt: string;
  role: 'admin' | 'pharmacist';
  isApproved: boolean; // معتمد تلقائياً
  status: 'active' | 'suspended'; // نشط أو موقوف
}

/**
 * دالة مساعدة لتوحيد صيغ أرقام الهواتف (مثل تحويل +964 إلى 0)
 */
export function normalizePhone(rawPhone: string): string {
  let cleaned = rawPhone.replace(/[\s\-\+\(\)]/g, '');
  if (cleaned.startsWith('00964')) {
    cleaned = '0' + cleaned.slice(5);
  } else if (cleaned.startsWith('964')) {
    cleaned = '0' + cleaned.slice(3);
  }
  return cleaned;
}

/**
 * التحقق مما إذا كان الرقم هو رقم المالك
 */
export function isOwnerAdminPhone(phone: string): boolean {
  const norm = normalizePhone(phone);
  const adminNorm = normalizePhone(ADMIN_PHONE);
  return norm === adminNorm || phone.includes('7829692579');
}

/**
 * تهيئة حساب المالك تلقائياً في Firestore بصلاحية admin
 */
export async function ensureAdminAccountExists(): Promise<PharmacistUser> {
  const adminDocRef = doc(db, 'users', ADMIN_PHONE);
  const defaultAdmin: PharmacistUser = {
    id: ADMIN_PHONE,
    fullName: 'مالك التطبيق (الإدارة العليا)',
    pharmacyName: 'إدارة نظام Expiro المركزي',
    phone: ADMIN_PHONE,
    role: 'admin',
    isApproved: true,
    status: 'active',
    createdAt: new Date().toISOString()
  };

  try {
    const snap = await getDoc(adminDocRef);
    if (!snap.exists()) {
      await setDoc(adminDocRef, defaultAdmin);
      return defaultAdmin;
    } else {
      const data = snap.data() as PharmacistUser;
      // التأكد من أن الدور لا يزال admin
      if (data.role !== 'admin' || !data.isApproved) {
        await updateDoc(adminDocRef, { role: 'admin', isApproved: true, status: 'active' });
      }
      return { ...data, role: 'admin', isApproved: true };
    }
  } catch (err) {
    console.warn('Admin account initialization notice:', err);
    return defaultAdmin;
  }
}

// دالة تحويل ملف الصورة إلى نص Base64
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
}

// ضغط الصورة قبل تحويلها إلى Base64 لضمان سرعة الحفظ وعدم تجاوز حدود Firestore
export function compressImageToBase64(file: File, maxWidth = 900, maxHeight = 900, quality = 0.75): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(event.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.onerror = (e) => reject(e);
    };
    reader.onerror = (e) => reject(e);
  });
}

/**
 * تسجيل صيدلي جديد في Firestore داخل مجموعة users
 * يتم تعيين role: "pharmacist" و isApproved: true تلقائياً
 */
export async function registerPharmacist(data: {
  fullName: string;
  pharmacyName?: string;
  phone: string;
  password: string;
  licensePhotoBase64?: string;
}): Promise<{ success: boolean; message: string; user?: PharmacistUser }> {
  try {
    const cleanPhone = normalizePhone(data.phone.trim());
    if (!cleanPhone || !data.password.trim() || !data.fullName.trim()) {
      return { success: false, message: 'يرجى ملء جميع الحقول الإلزامية' };
    }

    // التحقق من حساب المالك
    if (isOwnerAdminPhone(cleanPhone)) {
      return { 
        success: false, 
        message: 'هذا الرقم مخصص لمالك النظام (Admin) ومسجل مسبقاً، يمكنك تسجيل الدخول مباشرة أو استعادة كلمة المرور.' 
      };
    }

    const userDocRef = doc(db, 'users', cleanPhone);
    const existingDoc = await getDoc(userDocRef);

    if (existingDoc.exists()) {
      return { success: false, message: 'رقم الهاتف مسجل بالفعل مسبقاً، يرجى الانتقال إلى تسجيل الدخول' };
    }

    const newUser: PharmacistUser = {
      id: cleanPhone,
      fullName: data.fullName.trim(),
      pharmacyName: (data.pharmacyName || 'صيدلية ' + data.fullName.split(' ')[0]).trim(),
      phone: cleanPhone,
      password: data.password.trim(),
      licensePhotoBase64: data.licensePhotoBase64 || '',
      createdAt: new Date().toISOString(),
      role: 'pharmacist', // محدد تلقائياً للصيادلة
      isApproved: true, // معتمد تلقائياً
      status: 'active'
    };

    await setDoc(userDocRef, newUser);

    // حفظ نسخة محلية احتياطية
    try {
      localStorage.setItem(`expiro_backup_user_${cleanPhone}`, JSON.stringify(newUser));
    } catch (e) {
      // ignore
    }

    return { 
      success: true, 
      message: 'تم إنشاء حساب الصيدلية بنجاح وحفظ إجازة الممارسة! جاري تحويلك لشاشة الدخول...', 
      user: newUser 
    };
  } catch (error: any) {
    console.error('Firestore registration error:', error);
    
    // توفير حفظ احتياطي في حال انقطاع الشبكة
    const cleanPhone = normalizePhone(data.phone.trim());
    const fallbackUser: PharmacistUser = {
      id: cleanPhone,
      fullName: data.fullName.trim(),
      pharmacyName: (data.pharmacyName || 'صيدلية ' + data.fullName.split(' ')[0]).trim(),
      phone: cleanPhone,
      password: data.password.trim(),
      licensePhotoBase64: data.licensePhotoBase64 || '',
      createdAt: new Date().toISOString(),
      role: 'pharmacist',
      isApproved: true,
      status: 'active'
    };
    localStorage.setItem(`expiro_local_user_${fallbackUser.phone}`, JSON.stringify(fallbackUser));

    return { 
      success: true, 
      message: 'تم حفظ حساب الصيدلي محلياً وبنجاح! يمكنك الآن تسجيل الدخول', 
      user: fallbackUser 
    };
  }
}

/**
 * تسجيل الدخول بمطابقة رقم الهاتف وكلمة المرور من Firestore
 * والتوجيه حسب الدور (Admin -> لوحة الأدمن، Pharmacist -> لوحة أدوية الصيدلية)
 */
export async function loginPharmacist(
  phone: string, 
  password: string
): Promise<{ success: boolean; message: string; user?: PharmacistUser }> {
  try {
    const cleanPhone = normalizePhone(phone.trim());
    const cleanPass = password.trim();

    if (!cleanPhone || !cleanPass) {
      return { success: false, message: 'يرجى إدخال رقم الهاتف وكلمة المرور' };
    }

    // فحص خاص لمالك النظام Pre-set
    if (isOwnerAdminPhone(cleanPhone)) {
      await ensureAdminAccountExists();
      const adminDoc = await getDoc(doc(db, 'users', ADMIN_PHONE));
      if (adminDoc.exists()) {
        const adminData = adminDoc.data() as PharmacistUser;
        // إذا كان المالك لم يضع كلمة مرور بعد
        if (!adminData.password) {
          return { 
            success: false, 
            message: 'مرحباً بمالك النظام. لم يتم تعيين كلمة مرور بعد، يرجى الضغط على "هل نسيت كلمة المرور؟" لتلقي رمز SMS وتعيين كلمة المرور.' 
          };
        }
        if (adminData.password === cleanPass) {
          return { 
            success: true, 
            message: 'أهلاً بك مالك النظام في لوحة تحكم الإدارة العليا', 
            user: { ...adminData, role: 'admin' } 
          };
        } else {
          return { success: false, message: 'كلمة مرور مالك النظام غير صحيحة' };
        }
      }
    }

    // 1. محاولة استعلام المستند المباشر عبر معرف الهاتف
    const userDocRef = doc(db, 'users', cleanPhone);
    const userSnap = await getDoc(userDocRef);

    if (userSnap.exists()) {
      const userData = userSnap.data() as PharmacistUser;
      
      // التحقق من حالة تفعيل الحساب
      if (userData.status === 'suspended' || userData.isApproved === false) {
        return { 
          success: false, 
          message: 'تم إيقاف هذا الحساب مؤقتاً من قبل إدارة Expiro. يرجى مراجعة مالك النظام.' 
        };
      }

      if (userData.password === cleanPass) {
        return { 
          success: true, 
          message: userData.role === 'admin' 
            ? 'مرحباً بك في لوحة تحكم الأدمن' 
            : `مرحباً بك دكتور ${userData.fullName} في صيدليتك`, 
          user: userData 
        };
      } else {
        return { success: false, message: 'كلمة المرور غير صحيحة، يرجى المحاولة مجدداً' };
      }
    }

    // 2. محاولة البحث في المجموعة بالـ query
    const q = query(collection(db, 'users'), where('phone', '==', cleanPhone));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const firstDoc = querySnapshot.docs[0];
      const userData = firstDoc.data() as PharmacistUser;

      if (userData.status === 'suspended' || userData.isApproved === false) {
        return { 
          success: false, 
          message: 'تم إيقاف هذا الحساب مؤقتاً من قبل إدارة Expiro. يرجى مراجعة مالك النظام.' 
        };
      }

      if (userData.password === cleanPass) {
        return { 
          success: true, 
          message: userData.role === 'admin' 
            ? 'مرحباً بك في لوحة تحكم الأدمن' 
            : `مرحباً بك دكتور ${userData.fullName} في صيدليتك`, 
          user: userData 
        };
      } else {
        return { success: false, message: 'كلمة المرور غير صحيحة، يرجى المحاولة مجدداً' };
      }
    }

    // 3. التحقق من النسخة الاحتياطية
    const localSaved = localStorage.getItem(`expiro_local_user_${cleanPhone}`) || localStorage.getItem(`expiro_backup_user_${cleanPhone}`);
    if (localSaved) {
      const localUser = JSON.parse(localSaved) as PharmacistUser;
      if (localUser.status === 'suspended') {
        return { success: false, message: 'تم إيقاف هذا الحساب مؤقتاً' };
      }
      if (localUser.password === cleanPass) {
        return { 
          success: true, 
          message: `مرحباً بك دكتور ${localUser.fullName}`, 
          user: localUser 
        };
      } else {
        return { success: false, message: 'كلمة المرور غير صحيحة' };
      }
    }

    return { success: false, message: 'رقم الهاتف غير مسجل لدينا، يرجى إنشاء حساب صيدلي جديد' };
  } catch (error: any) {
    console.warn('Firestore login check error:', error);
    const cleanPhone = normalizePhone(phone.trim());
    const localSaved = localStorage.getItem(`expiro_local_user_${cleanPhone}`) || localStorage.getItem(`expiro_backup_user_${cleanPhone}`);
    if (localSaved) {
      const localUser = JSON.parse(localSaved) as PharmacistUser;
      if (localUser.password === password.trim()) {
        return { success: true, message: `مرحباً بك دكتور ${localUser.fullName}`, user: localUser };
      }
    }
    return { success: false, message: 'تعذر التحقق من البيانات، يرجى التحقق من الاتصال بالإنترنت' };
  }
}

/**
 * تحديث كلمة المرور عبر رقم الهاتف (تُستخدم بعد إثبات رمز SMS)
 * تعمل للمالك والصيادلة
 */
export async function resetPasswordWithPhone(
  phone: string, 
  newPassword: string
): Promise<{ success: boolean; message: string }> {
  try {
    const cleanPhone = normalizePhone(phone.trim());
    if (!cleanPhone || !newPassword.trim()) {
      return { success: false, message: 'يرجى إدخال كلمة المرور الجديدة' };
    }

    if (newPassword.trim().length < 4) {
      return { success: false, message: 'كلمة المرور يجب ألا تقل عن 4 خانات' };
    }

    const userDocRef = doc(db, 'users', cleanPhone);
    const snap = await getDoc(userDocRef);

    if (snap.exists()) {
      await updateDoc(userDocRef, {
        password: newPassword.trim(),
        updatedAt: new Date().toISOString()
      });
    } else if (isOwnerAdminPhone(cleanPhone)) {
      // إنشاء حساب الأدمن إذا لم يكن موجوداً بعد
      const adminData: PharmacistUser = {
        id: ADMIN_PHONE,
        fullName: 'مالك التطبيق (Admin)',
        pharmacyName: 'إدارة تطبيق Expiro المركزية',
        phone: ADMIN_PHONE,
        password: newPassword.trim(),
        role: 'admin',
        isApproved: true,
        status: 'active',
        createdAt: new Date().toISOString()
      };
      await setDoc(userDocRef, adminData);
    } else {
      return { success: false, message: 'رقم الهاتف غير مسجل في النظام' };
    }

    // تحديث التخزين المحلي الاحتياطي
    const localKey = `expiro_local_user_${cleanPhone}`;
    const backupKey = `expiro_backup_user_${cleanPhone}`;
    const raw = localStorage.getItem(localKey) || localStorage.getItem(backupKey);
    if (raw) {
      try {
        const u = JSON.parse(raw);
        u.password = newPassword.trim();
        localStorage.setItem(localKey, JSON.stringify(u));
        localStorage.setItem(backupKey, JSON.stringify(u));
      } catch (e) {}
    }

    return { success: true, message: 'تم تحديث كلمة المرور بنجاح في قاعدة البيانات! يمكنك الآن تسجيل الدخول بها.' };
  } catch (error: any) {
    console.error('Password reset error:', error);
    return { success: false, message: 'تعذر تحديث كلمة المرور، يرجى المحاولة مجدداً' };
  }
}

/**
 * ---------------- لوحة تحكم المالك (Admin Dashboard Actions) ----------------
 */

/**
 * جلب جميع الصيدليات والصيادلة المسجلين في Firestore
 */
export async function fetchAllPharmacists(): Promise<PharmacistUser[]> {
  try {
    // التأكد من وجود حساب المالك
    await ensureAdminAccountExists();

    const snap = await getDocs(collection(db, 'users'));
    const list: PharmacistUser[] = [];

    snap.forEach((d) => {
      const data = d.data() as PharmacistUser;
      list.push(data);
    });

    // إضافة أي مستخدمين محليين احتياطيين غير متوفرين بالقائمة
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith('expiro_local_user_') || key.startsWith('expiro_backup_user_'))) {
        try {
          const u = JSON.parse(localStorage.getItem(key)!) as PharmacistUser;
          if (u.phone && !list.find(x => x.phone === u.phone)) {
            list.push(u);
          }
        } catch (e) {}
      }
    }

    // فرز الصيدليات بحيث يظهر الأحدث أولاً
    return list.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
  } catch (err) {
    console.warn('Could not fetch all pharmacists:', err);
    return [];
  }
}

/**
 * إيقاف أو تفعيل حساب صيدلي بواسطة المالك
 */
export async function togglePharmacistStatus(
  phone: string, 
  currentStatus: 'active' | 'suspended'
): Promise<{ success: boolean; newStatus: 'active' | 'suspended' }> {
  const cleanPhone = normalizePhone(phone);
  const newStatus: 'active' | 'suspended' = currentStatus === 'active' ? 'suspended' : 'active';
  const newIsApproved = newStatus === 'active';

  try {
    const userDocRef = doc(db, 'users', cleanPhone);
    await updateDoc(userDocRef, {
      status: newStatus,
      isApproved: newIsApproved,
      statusUpdatedAt: new Date().toISOString()
    });

    // تحديث المحفظة المحلية
    const localKey = `expiro_local_user_${cleanPhone}`;
    const raw = localStorage.getItem(localKey);
    if (raw) {
      try {
        const u = JSON.parse(raw);
        u.status = newStatus;
        u.isApproved = newIsApproved;
        localStorage.setItem(localKey, JSON.stringify(u));
      } catch (e) {}
    }

    return { success: true, newStatus };
  } catch (err) {
    console.error('Error toggling pharmacist status:', err);
    return { success: false, newStatus: currentStatus };
  }
}

/**
 * خيار يدوي لإعادة ضبط كلمة المرور لأي صيدلي من لوحة تحكم المالك
 */
export async function adminResetPharmacistPassword(
  phone: string, 
  newPassword: string
): Promise<{ success: boolean; message: string }> {
  try {
    const cleanPhone = normalizePhone(phone);
    if (!newPassword.trim()) {
      return { success: false, message: 'يرجى إدخال كلمة المرور الجديدة' };
    }

    const userDocRef = doc(db, 'users', cleanPhone);
    await updateDoc(userDocRef, {
      password: newPassword.trim(),
      passwordResetByAdminAt: new Date().toISOString()
    });

    return { success: true, message: `تم تغيير كلمة المرور بنجاح للصيدلي (${cleanPhone})` };
  } catch (err) {
    console.error('Admin password reset error:', err);
    return { success: false, message: 'تعذر تعديل كلمة المرور في قاعدة البيانات' };
  }
}

/**
 * ---------------- إدارة مخزون الأدوية المعزول لكل صيدلي ----------------
 */

// جلب وحفظ الأدوية المعزولة برقم هاتف الصيدلي (userId)
export async function syncUserMedicineToFirestore(userId: string, medicine: Medicine): Promise<void> {
  try {
    const medDocId = `${userId}_${medicine.id}`;
    const medRef = doc(db, 'medicines', medDocId);
    await setDoc(medRef, {
      ...medicine,
      userId: userId,
      updatedAt: new Date().toISOString()
    });
  } catch (err) {
    console.warn('Firestore medicine save notice:', err);
  }
}

// حذف دواء الصيدلي من Firestore
export async function deleteUserMedicineFromFirestore(userId: string, medicineId: number): Promise<void> {
  try {
    const medDocId = `${userId}_${medicineId}`;
    const medRef = doc(db, 'medicines', medDocId);
    await deleteDoc(medRef);
  } catch (err) {
    console.warn('Firestore medicine delete notice:', err);
  }
}

// جلب كافة أدوية الصيدلي الحالي فقط من Firestore
export async function fetchUserMedicines(userId: string): Promise<Medicine[]> {
  try {
    const q = query(collection(db, 'medicines'), where('userId', '==', userId));
    const snap = await getDocs(q);
    const list: Medicine[] = [];
    snap.forEach((docItem) => {
      const data = docItem.data();
      list.push({
        id: data.id,
        tradeName: data.tradeName,
        scientificName: data.scientificName,
        companyName: data.companyName,
        category: data.category,
        barcode: data.barcode,
        expiryDate: data.expiryDate,
        alertThresholdDays: data.alertThresholdDays,
        notes: data.notes || '',
        quantity: data.quantity || 1
      });
    });
    return list;
  } catch (err) {
    console.warn('Could not fetch remote medicines:', err);
    return [];
  }
}

// اشتراك لحظي في أدوية الصيدلي (Real-time listener)
export function subscribeToUserMedicines(userId: string, onUpdate: (medicines: Medicine[]) => void): Unsubscribe {
  const q = query(collection(db, 'medicines'), where('userId', '==', userId));
  return onSnapshot(q, (snapshot) => {
    const list: Medicine[] = [];
    snapshot.forEach((docItem) => {
      const data = docItem.data();
      list.push({
        id: data.id,
        tradeName: data.tradeName,
        scientificName: data.scientificName,
        companyName: data.companyName,
        category: data.category,
        barcode: data.barcode,
        expiryDate: data.expiryDate,
        alertThresholdDays: data.alertThresholdDays,
        notes: data.notes || '',
        quantity: data.quantity || 1
      });
    });
    onUpdate(list);
  }, (err) => {
    console.warn('Snapshot listener error:', err);
  });
}
