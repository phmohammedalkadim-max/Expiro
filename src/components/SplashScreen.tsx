import React, { useState, useEffect } from 'react';
import { PharmacistUser } from '../services/firebase';

export type SplashDestination = 
  | 'register'            // أول فتح للتطبيق -> شاشة التسجيل للصيادلة
  | 'admin_dashboard'     // مسجل كـ admin -> لوحة تحكم الأدمن
  | 'pharmacy_inventory'  // مسجل كـ pharmacist -> لوحة إدارة أدوية الصيدلية
  | 'login';              // غير مسجل -> شاشة تسجيل الدخول

interface SplashScreenProps {
  onComplete: (destination: SplashDestination) => void;
  authenticatedUser: PharmacistUser | null;
  isDarkMode?: boolean;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete, authenticatedUser, isDarkMode }) => {
  // فحص الوضع الداكن من الـ prop أو من localStorage
  const darkModeActive = isDarkMode ?? (typeof window !== 'undefined' && localStorage.getItem('expiro_dark_mode') === 'true');

  // المراحل على مدار 3 ثوانٍ بالضبط (3000ms):
  // المرحلة 1: من 0 إلى 0.8 ثانية (ظهور الأيقونة فقط مع تأثير Bounce مرن وبدون أي نصوص)
  // المرحلة 2: بعد 0.8 ثانية (ظهور عبارة "أهلاً بك في Expiro" تدريجياً)
  // المرحلة 3: بعد 1.6 ثانية (ظهور عبارة "جاري تحضير صيدليتك..." والنقاط المتحركة)
  // المرحلة 4: عند 2.65 ثانية (بدء التلاشي السلس ثم الانتقال لواجهة تسجيل أو إنشاء الحساب عند 3.0 ثوانٍ)
  const [stage, setStage] = useState<1 | 2 | 3 | 4>(1);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    // 1. بعد 0.8 ثانية: ظهور عبارة الترحيب بعد استقرار الأيقونة
    const timerStage2 = setTimeout(() => {
      setStage(2);
    }, 800);

    // 2. بعد 1.6 ثانية: ظهور عبارة التحميل والنقاط المتحركة
    const timerStage3 = setTimeout(() => {
      setStage(3);
    }, 1600);

    // 3. عند 2.65 ثانية: بدء تلاشي الشاشة بنعومة
    const timerFadeOut = setTimeout(() => {
      setIsFadingOut(true);
    }, 2650);

    // 4. عند 3.0 ثوانٍ بالضبط (3000ms): الانتقال المباشر لواجهة تسجيل الدخول أو إنشاء الحساب
    const timerComplete = setTimeout(() => {
      onComplete('login');
    }, 3000);

    return () => {
      clearTimeout(timerStage2);
      clearTimeout(timerStage3);
      clearTimeout(timerFadeOut);
      clearTimeout(timerComplete);
    };
  }, [onComplete]);

  return (
    <div 
      className={`fixed inset-0 z-50 flex flex-col items-center justify-between p-6 sm:p-10 select-none overflow-hidden font-['Cairo',sans-serif] transition-opacity duration-350 ${
        isFadingOut ? 'opacity-0' : 'opacity-100'
      } text-white`}
      style={{
        backgroundColor: '#041E23',
        backgroundImage: 'radial-gradient(circle at 50% 36%, #0D4E57 0%, #062B31 45%, #03181C 100%)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
      dir="rtl"
    >
      {/* زر التخطي السريع للدخول الفوري */}
      <div className="w-full flex justify-start z-20">
        <button
          type="button"
          onClick={() => onComplete('login')}
          className="px-3 py-1.5 rounded-full bg-white/15 hover:bg-white/25 active:scale-95 text-teal-100 text-xs font-bold transition-all border border-white/20 backdrop-blur-sm shadow-sm"
        >
          تخطي للدخول مباشرة ←
        </button>
      </div>

      {/* هالة توهج محيطية بلون الـ Teal التركوازي البترولي */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-60"
        style={{
          background: 'radial-gradient(circle at 50% 32%, rgba(20, 184, 166, 0.25) 0%, rgba(13, 148, 136, 0.08) 50%, transparent 80%)'
        }}
      />
      <style>{`
        @keyframes expiroIconBounce {
          0% {
            opacity: 0;
            transform: scale(0.4) translateY(-28px);
          }
          60% {
            opacity: 1;
            transform: scale(1.05) translateY(0);
          }
          80% {
            transform: scale(0.98) translateY(0);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        @keyframes expiroTextFadeUp {
          0% {
            opacity: 0;
            transform: translateY(16px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes expiroDotPulse {
          0%, 100% {
            opacity: 0.25;
            transform: scale(0.8);
          }
          50% {
            opacity: 1;
            transform: scale(1.25);
          }
        }
      `}</style>

      {/* 1. المنطقة العلوية: الشعار المرفوع من المستخدم مع تأثير الحركة الانسيابي */}
      <div className="w-full pt-10 sm:pt-16 flex flex-col items-center justify-center z-10">
        <div 
          className="relative flex flex-col items-center justify-center"
          style={{
            animation: 'expiroIconBounce 0.9s cubic-bezier(0.34, 1.56, 0.64, 1) forwards'
          }}
        >
          {/* هالة توهج تركوازية خلف الشعار */}
          <div className="relative flex items-center justify-center">
            <div className="absolute -inset-8 bg-teal-400/20 rounded-full blur-3xl pointer-events-none" />

            {/* الصورة ثلاثية الأبعاد المرفوعة من المستخدم */}
            <img 
              src="/assets/aistudio/1000003085_8b29976f.png" 
              alt="Expiro Emblem" 
              className="w-48 sm:w-56 md:w-64 max-w-[80vw] h-auto object-contain select-none pointer-events-none filter drop-shadow-[0_16px_32px_rgba(0,0,0,0.55)] drop-shadow-[0_0_45px_rgba(45,212,191,0.25)]"
            />
          </div>

          {/* اسم التطبيق والوصف بتدرج لوني أنيق على الخلفية التركوازية البترولية */}
          <div className="mt-3 text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-teal-200 via-white to-teal-300 drop-shadow-md">
              Expiro
            </h1>
            <p className="text-xs sm:text-sm font-semibold text-teal-200/85 mt-1.5 tracking-wide">
              نظام إدارة صلاحيات الأدوية الصيدلانية
            </p>
          </div>
        </div>
      </div>

      {/* 2. المنطقة الوسطى: عبارة الترحيب "أهلاً بك في Expiro" بستايل زجاجي راقٍ */}
      <div className="flex-1 w-full flex flex-col items-center justify-center text-center px-6 z-10 min-h-[90px]">
        {stage >= 2 && (
          <div 
            style={{
              animation: 'expiroTextFadeUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards'
            }}
            className="flex flex-col items-center justify-center"
          >
            <div className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full bg-white/10 border border-teal-300/25 shadow-xl shadow-teal-950/40 backdrop-blur-md">
              <span className="w-2.5 h-2.5 rounded-full bg-teal-400 shadow-[0_0_10px_#2dd4bf] animate-pulse" />
              <h2 className="text-base sm:text-xl font-bold text-white tracking-normal drop-shadow-sm">
                أهلاً بك في Expiro
              </h2>
            </div>
          </div>
        )}
      </div>

      {/* 3. المنطقة السفلية: عبارة التحميل والنقاط الثلاثة المتحركة بتناسق تام مع الخلفية */}
      <div className="w-full flex flex-col items-center justify-center pb-12 sm:pb-16 min-h-[60px] z-10">
        {stage >= 3 && (
          <div 
            style={{
              animation: 'expiroTextFadeUp 0.6s ease-out forwards'
            }}
            className="flex items-center gap-2.5 text-sm sm:text-base font-semibold text-teal-100/90 tracking-wide drop-shadow-sm"
          >
            <span>جاري تحضير صيدليتك</span>
            
            {/* النقاط الثلاثة المتحركة بالتناوب بلون الـ Teal التركوازي */}
            <div className="flex items-center gap-1.5 font-mono text-base" dir="ltr">
              <span 
                className="inline-block w-2 h-2 rounded-full bg-teal-300 shadow-[0_0_8px_#5eead4]"
                style={{
                  animation: 'expiroDotPulse 1.2s infinite ease-in-out',
                  animationDelay: '0ms'
                }} 
              />
              <span 
                className="inline-block w-2 h-2 rounded-full bg-teal-300 shadow-[0_0_8px_#5eead4]"
                style={{
                  animation: 'expiroDotPulse 1.2s infinite ease-in-out',
                  animationDelay: '200ms'
                }} 
              />
              <span 
                className="inline-block w-2 h-2 rounded-full bg-teal-300 shadow-[0_0_8px_#5eead4]"
                style={{
                  animation: 'expiroDotPulse 1.2s infinite ease-in-out',
                  animationDelay: '400ms'
                }} 
              />
            </div>
          </div>
        )}
      </div>

    </div>
  );
};
