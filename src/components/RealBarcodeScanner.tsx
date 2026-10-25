import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { Camera, X, Flashlight, RefreshCw, Upload, CheckCircle2, PackageCheck, AlertCircle, Sparkles, Search } from 'lucide-react';
import { lookupDrugByBarcode, GLOBAL_DRUG_DATABASE, DrugInfo } from '../data/drugDatabase';
import { Medicine } from '../App';

interface RealBarcodeScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onScanComplete: (barcode: string, drugData?: Partial<Medicine>) => void;
  existingMedicines: Medicine[];
}

export const RealBarcodeScanner: React.FC<RealBarcodeScannerProps> = ({
  isOpen,
  onClose,
  onScanComplete,
  existingMedicines,
}) => {
  const [scannerError, setScannerError] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [torchOn, setTorchOn] = useState(false);
  const [scannedDrug, setScannedDrug] = useState<{
    barcode: string;
    existing?: Medicine;
    globalMatch?: DrugInfo;
  } | null>(null);
  const [isManualInput, setIsManualInput] = useState(false);
  const [manualBarcode, setManualBarcode] = useState('');

  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const scannerContainerId = 'real-camera-barcode-reader';
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // تشغيل نغمة بيب الصيدلية عند القراءة الناجحة
  const playScannerBeep = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1800, audioCtx.currentTime); // تردد بيب أجهزة الباركود الصيدلانية
      gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.1);

      // اهتزاز خفيف للموبايل (Haptic Feedback)
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(60);
      }
    } catch (e) {
      // AudioContext may be restricted without user gesture
    }
  };

  const processBarcode = (decodedBarcode: string) => {
    const cleanBarcode = decodedBarcode.trim();
    if (!cleanBarcode) return;

    playScannerBeep();

    // 1. البحث أولاً في قائمة الأدوية المسجلة حالياً بالصيدلية
    const existing = existingMedicines.find((m) => m.barcode === cleanBarcode);

    // 2. البحث في قاعدة البيانات الدوائية الوطنية والعالمية المعتمدة
    const globalMatch = lookupDrugByBarcode(cleanBarcode) || undefined;

    setScannedDrug({
      barcode: cleanBarcode,
      existing,
      globalMatch,
    });
  };

  const startCamera = async () => {
    setScannerError(null);
    try {
      const formatsToSupport = [
        Html5QrcodeSupportedFormats.EAN_13,
        Html5QrcodeSupportedFormats.EAN_8,
        Html5QrcodeSupportedFormats.CODE_128,
        Html5QrcodeSupportedFormats.CODE_39,
        Html5QrcodeSupportedFormats.UPC_A,
        Html5QrcodeSupportedFormats.UPC_E,
        Html5QrcodeSupportedFormats.DATA_MATRIX,
        Html5QrcodeSupportedFormats.QR_CODE,
      ];

      if (!html5QrCodeRef.current) {
        html5QrCodeRef.current = new Html5Qrcode(scannerContainerId, {
          formatsToSupport,
          verbose: false,
        });
      }

      const qrCode = html5QrCodeRef.current;

      await qrCode.start(
        { facingMode: 'environment' },
        {
          fps: 15,
          qrbox: { width: 260, height: 180 },
          aspectRatio: 1.0,
        },
        (decodedText) => {
          // تم اكتشاف الباركود بنجاح
          processBarcode(decodedText);
          stopCamera();
        },
        () => {
          // Frame decode failure (normal while aligning)
        }
      );

      setIsCameraActive(true);
    } catch (err: unknown) {
      console.warn('Camera initiation failed:', err);
      const errMsg = err instanceof Error ? err.message : String(err);
      if (errMsg.includes('NotAllowedError') || errMsg.includes('Permission')) {
        setScannerError('يرجى منح إذن الوصول إلى الكاميرا في المتصفح لمسح باركود الدواء.');
      } else {
        setScannerError('تعذر فتح الكاميرا مباشرة (قد تكون مستخدمة أو البيئة مقيدة). يمكنك اختيار صورة أو تجربة الباركودات السريعة أدناه.');
      }
      setIsCameraActive(false);
    }
  };

  const stopCamera = async () => {
    try {
      if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
        await html5QrCodeRef.current.stop();
        html5QrCodeRef.current.clear();
      }
    } catch (err) {
      console.error('Error stopping camera:', err);
    } finally {
      setIsCameraActive(false);
      setTorchOn(false);
    }
  };

  const toggleTorch = async () => {
    try {
      if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
        const nextTorch = !torchOn;
        await html5QrCodeRef.current.applyVideoConstraints({
          advanced: [{ torch: nextTorch } as MediaTrackConstraintSet],
        });
        setTorchOn(nextTorch);
      }
    } catch (e) {
      console.warn('Torch not supported on this camera:', e);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      if (!html5QrCodeRef.current) {
        html5QrCodeRef.current = new Html5Qrcode(scannerContainerId);
      }
      const qrCode = html5QrCodeRef.current;
      const result = await qrCode.scanFile(file, true);
      processBarcode(result);
    } catch (err) {
      setScannerError('لم يتم العثور على باركود واضح في الصورة المختارة. يرجى التأكد من وضوح خطوط الباركود.');
    } finally {
      if (e.target) e.target.value = '';
    }
  };

  useEffect(() => {
    if (isOpen) {
      setScannedDrug(null);
      setScannerError(null);
      setIsManualInput(false);
      // محاولة تشغيل الكاميرا تلقائياً بعد رندر الـ DOM
      const timer = setTimeout(() => {
        startCamera();
      }, 300);
      return () => clearTimeout(timer);
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleConfirmDrug = () => {
    if (!scannedDrug) return;

    if (scannedDrug.existing) {
      // دواء موجود بالفعل في الصيدلية
      onScanComplete(scannedDrug.barcode, scannedDrug.existing);
    } else if (scannedDrug.globalMatch) {
      // دواء تم التعرف عليه من قاعدة البيانات الدوائية العامة
      const gm = scannedDrug.globalMatch;
      onScanComplete(scannedDrug.barcode, {
        tradeName: gm.tradeName,
        scientificName: gm.scientificName,
        companyName: gm.companyName,
        category: gm.category,
        alertThresholdDays: gm.defaultAlertDays,
        notes: gm.notes,
        barcode: gm.barcode,
      });
    } else {
      // باركود غير مدرج بقاعدة البيانات
      onScanComplete(scannedDrug.barcode, {
        barcode: scannedDrug.barcode,
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-slate-900 rounded-3xl overflow-hidden border border-slate-800 text-white shadow-2xl flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between shrink-0 bg-slate-950/60">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-teal-500/20 text-teal-400 border border-teal-500/30 flex items-center justify-center">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-white">قارئ الباركود الصيدلاني الذكي</h3>
              <p className="text-[10px] text-teal-400 font-medium">التعرف الفوري على بيانات الدواء من العلبة</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors active:scale-90"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 overflow-y-auto space-y-4 no-scrollbar">

          {/* حالة: تم التعرف على الدواء بنجاح */}
          {scannedDrug ? (
            <div className="space-y-4 animate-in zoom-in-95 duration-200">
              <div className="p-4 rounded-2xl bg-teal-950/50 border-2 border-teal-500/60 text-right space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full bg-teal-500 text-white font-bold text-[10px] flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    <span>تم التعرف على الدواء بنجاح</span>
                  </span>
                  <span className="font-mono text-xs text-teal-300 font-bold tracking-wider">
                    {scannedDrug.barcode}
                  </span>
                </div>

                {scannedDrug.existing ? (
                  // الدواء موجود سابقاً في الصيدلية
                  <div className="space-y-2 pt-1 border-t border-teal-800/40">
                    <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>الدواء مسجل بالفعل في صيدليتك:</span>
                    </div>
                    <h4 className="font-black text-base text-white">{scannedDrug.existing.tradeName}</h4>
                    <p className="text-xs text-slate-300 font-medium">{scannedDrug.existing.scientificName}</p>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400">
                      <span className="bg-slate-800 px-2 py-0.5 rounded text-teal-300">{scannedDrug.existing.companyName}</span>
                      <span className="bg-slate-800 px-2 py-0.5 rounded text-slate-300">{scannedDrug.existing.category}</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-900/80 border border-teal-900 text-[11px] text-teal-200 flex justify-between">
                      <span>تاريخ الانتهاء المسجل:</span>
                      <span className="font-mono font-bold text-white">{scannedDrug.existing.expiryDate}</span>
                    </div>
                  </div>
                ) : scannedDrug.globalMatch ? (
                  // تم جلبه من قاعدة البيانات العامة للباركود
                  <div className="space-y-2 pt-1 border-t border-teal-800/40">
                    <div className="flex items-center gap-1.5 text-teal-400 text-xs font-bold">
                      <PackageCheck className="w-4 h-4" />
                      <span>تم سحب كافة معلومات العلاج تلقائياً:</span>
                    </div>
                    <h4 className="font-black text-base text-white">{scannedDrug.globalMatch.tradeName}</h4>
                    <p className="text-xs text-teal-100 font-medium">{scannedDrug.globalMatch.scientificName}</p>
                    
                    <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                      <div className="p-2 rounded-xl bg-slate-900/90 border border-slate-800 text-right">
                        <span className="text-slate-400 block text-[9.5px]">الشركة المصنعة</span>
                        <span className="font-bold text-teal-300">{scannedDrug.globalMatch.companyName}</span>
                      </div>
                      <div className="p-2 rounded-xl bg-slate-900/90 border border-slate-800 text-right">
                        <span className="text-slate-400 block text-[9.5px]">الفئة الدوائية</span>
                        <span className="font-bold text-teal-300">{scannedDrug.globalMatch.category}</span>
                      </div>
                    </div>

                    {scannedDrug.globalMatch.notes && (
                      <p className="text-[11px] text-slate-300 bg-slate-900/60 p-2 rounded-xl border border-slate-800/80">
                        {scannedDrug.globalMatch.notes}
                      </p>
                    )}
                  </div>
                ) : (
                  // باركود غير مدرج بقاعدة البيانات
                  <div className="space-y-2 pt-1 border-t border-teal-800/40 text-center">
                    <p className="text-xs font-bold text-amber-300">باركود جديد تم مسحه:</p>
                    <p className="font-mono text-sm font-black text-white bg-slate-900/80 py-1 rounded-xl">{scannedDrug.barcode}</p>
                    <p className="text-[11px] text-slate-300">سيتم فتح نموذج التسجيل لتعبئة الصنف أو اختياره بنقرة واحدة</p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={handleConfirmDrug}
                  className="flex-1 py-3 bg-gradient-to-r from-teal-600 to-[#0D9488] hover:from-teal-700 hover:to-teal-600 text-white rounded-2xl font-black text-xs shadow-lg shadow-teal-900/40 active:scale-95 transition-all flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{scannedDrug.existing ? 'تعديل أو تحديث الصلاحية' : 'إدراج العلاج بالمعلومات الكاملة'}</span>
                </button>
                <button
                  onClick={() => {
                    setScannedDrug(null);
                    startCamera();
                  }}
                  className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-2xl font-bold text-xs active:scale-95 transition-all"
                  title="مسح دواء آخر"
                >
                  مسح دواء آخر
                </button>
              </div>
            </div>
          ) : (
            // شاشة الكاميرا والمسح المباشر
            <div className="space-y-3">
              {/* Camera Video Viewport */}
              <div className="relative aspect-[4/3] max-h-64 mx-auto rounded-2xl bg-black border-2 border-teal-500/40 overflow-hidden flex flex-col items-center justify-center">
                <div id={scannerContainerId} className="w-full h-full [&_video]:object-cover" />
                
                {/* Visual Target Overlay */}
                <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center p-6">
                  <div className="w-56 h-36 border-2 border-dashed border-teal-400 rounded-2xl relative flex items-center justify-center shadow-[0_0_20px_rgba(20,184,166,0.3)]">
                    <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-teal-400 to-transparent absolute top-1/2 -translate-y-1/2 shadow-lg shadow-teal-400 animate-pulse" />
                    <span className="absolute bottom-2 text-[10px] text-teal-200 bg-slate-950/80 px-2 py-0.5 rounded-full font-medium">
                      ضع باركود العلبة داخل الإطار
                    </span>
                  </div>
                </div>

                {/* Torch / Restart Controls */}
                <div className="absolute top-2 right-2 flex gap-1.5">
                  <button
                    onClick={toggleTorch}
                    className={`p-2 rounded-xl backdrop-blur-md transition-all ${
                      torchOn ? 'bg-amber-400 text-slate-950' : 'bg-slate-900/80 text-white hover:bg-slate-800'
                    }`}
                    title="فلاش الكاميرا"
                  >
                    <Flashlight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={startCamera}
                    className="p-2 rounded-xl bg-slate-900/80 text-white hover:bg-slate-800 backdrop-blur-md transition-all"
                    title="إعادة تشغيل الكاميرا"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Status / Error Message */}
              {scannerError && (
                <div className="p-3 rounded-2xl bg-amber-950/40 border border-amber-800/60 text-amber-200 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <p className="leading-snug">{scannerError}</p>
                </div>
              )}

              {/* Action Buttons: Upload Image or Manual Barcode Entry */}
              <div className="flex gap-2 pt-1">
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95"
                >
                  <Upload className="w-3.5 h-3.5 text-teal-400" />
                  <span>مسح من صورة العلبة</span>
                </button>

                <button
                  onClick={() => setIsManualInput(!isManualInput)}
                  className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95"
                >
                  <Search className="w-3.5 h-3.5 text-teal-400" />
                  <span>إدخال رقمي</span>
                </button>
              </div>

              {/* Manual Barcode Input Form */}
              {isManualInput && (
                <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-2 animate-in slide-in-from-top-2 duration-150">
                  <p className="text-[11px] text-slate-400 text-right">أدخل رقم باركود الدواء للبحث المباشر:</p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={manualBarcode}
                      onChange={(e) => setManualBarcode(e.target.value)}
                      placeholder="مثال: 6281001230012"
                      className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-teal-400"
                    />
                    <button
                      onClick={() => {
                        if (manualBarcode.trim()) {
                          processBarcode(manualBarcode.trim());
                        }
                      }}
                      className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-bold"
                    >
                      فحص
                    </button>
                  </div>
                </div>
              )}

              {/* أدوية تجريبية حقيقية جاهزة للفحص السريع */}
              <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
                <p className="text-[11px] text-slate-400 font-bold text-center">أو اضغط على أحد باركودات الأدوية الحقيقية للتجربة الفورية:</p>
                <div className="flex flex-wrap gap-1.5 justify-center max-h-24 overflow-y-auto no-scrollbar">
                  {GLOBAL_DRUG_DATABASE.slice(0, 8).map((d) => (
                    <button
                      key={d.barcode}
                      onClick={() => processBarcode(d.barcode)}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-teal-900/50 border border-slate-700 hover:border-teal-500/50 text-[10px] text-teal-300 font-medium transition-all active:scale-95 flex items-center gap-1"
                    >
                      <span className="font-mono">{d.barcode}</span>
                      <span className="text-slate-400">({d.tradeName.split(' ')[0]})</span>
                    </button>
                  ))}
                </div>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
