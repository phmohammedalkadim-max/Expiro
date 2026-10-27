import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats, CameraDevice } from 'html5-qrcode';
import { 
  Camera, 
  X, 
  Flashlight, 
  RefreshCw, 
  Upload, 
  CheckCircle2, 
  PackageCheck, 
  AlertCircle, 
  Sparkles, 
  Search, 
  Calendar,
  Layers,
  Check,
  SwitchCamera,
  QrCode
} from 'lucide-react';
import { 
  lookupDrugByBarcode, 
  GLOBAL_DRUG_DATABASE, 
  DrugInfo, 
  parseGS1Barcode, 
  ParsedGS1Data, 
  identifyCountryPrefix 
} from '../data/drugDatabase';
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
  const [availableCameras, setAvailableCameras] = useState<CameraDevice[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string | null>(null);

  // حالة التعرف على الدواء
  const [scannedResult, setScannedResult] = useState<{
    barcode: string;
    parsedGS1: ParsedGS1Data;
    countryOrigin: string;
    existing?: Medicine;
    globalMatch?: DrugInfo;
  } | null>(null);

  const [isManualInput, setIsManualInput] = useState(false);
  const [manualBarcode, setManualBarcode] = useState('');
  const [testCategoryFilter, setTestCategoryFilter] = useState<string>('ALL');

  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const scannerContainerId = 'real-camera-barcode-reader';
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // تشغيل نغمة بيب أجهزة الباركود الصيدلانية + اهتزاز الموبايل
  const playScannerBeep = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(2200, audioCtx.currentTime); // تردد بيب ليزر الباركود
      gain.gain.setValueAtTime(0.25, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.08);

      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([60, 40, 60]);
      }
    } catch (e) {
      // Ignore if autoplay restricted
    }
  };

  // معالجة وتحليل الباركود المقروء (عادي أو GS1 DataMatrix طبي)
  const processBarcode = (decodedBarcode: string) => {
    const cleanBarcode = decodedBarcode.trim();
    if (!cleanBarcode) return;

    playScannerBeep();

    // 1. تحليل GS1 DataMatrix لمعرفة ما إذا كان يحتوي على تاريخ الصلاحية ورقم التشغيلة
    const parsedGS1 = parseGS1Barcode(cleanBarcode);
    const searchCode = parsedGS1.gtin || cleanBarcode;

    // 2. فحص مخزون الصيدلية الحالي
    const existing = existingMedicines.find(
      (m) => m.barcode === searchCode || m.barcode === cleanBarcode
    );

    // 3. فحص قاعدة البيانات الدوائية الشاملة
    const globalMatch = lookupDrugByBarcode(cleanBarcode) || undefined;
    const countryOrigin = identifyCountryPrefix(searchCode);

    setScannedResult({
      barcode: searchCode,
      parsedGS1,
      countryOrigin,
      existing,
      globalMatch,
    });
  };

  // تشغيل الكاميرا ومسح الباركود
  const startCamera = async (cameraIdToUse?: string) => {
    setScannerError(null);
    try {
      // 1. الحصول على قائمة الكاميرات المتاحة
      let cameras = availableCameras;
      if (cameras.length === 0) {
        try {
          cameras = await Html5Qrcode.getCameras();
          setAvailableCameras(cameras);
        } catch (e) {
          // Camera listing might fail if permissions not granted yet
        }
      }

      const formatsToSupport = [
        Html5QrcodeSupportedFormats.EAN_13,
        Html5QrcodeSupportedFormats.EAN_8,
        Html5QrcodeSupportedFormats.CODE_128,
        Html5QrcodeSupportedFormats.CODE_39,
        Html5QrcodeSupportedFormats.UPC_A,
        Html5QrcodeSupportedFormats.UPC_E,
        Html5QrcodeSupportedFormats.DATA_MATRIX, // الأهم للأدوية الحديثة GS1
        Html5QrcodeSupportedFormats.QR_CODE,
        Html5QrcodeSupportedFormats.ITF,
        Html5QrcodeSupportedFormats.CODABAR,
      ];

      if (!html5QrCodeRef.current) {
        html5QrCodeRef.current = new Html5Qrcode(scannerContainerId, {
          formatsToSupport,
          verbose: false,
          experimentalFeatures: {
            useBarCodeDetectorIfSupported: true, // تسريع فوري عبر معالج الهواتف
          },
        });
      }

      const qrCode = html5QrCodeRef.current;
      if (qrCode.isScanning) {
        await qrCode.stop();
      }

      // تحديد الكاميرا: استخدام الكاميرا الخلفية دائماً
      const cameraConfig = cameraIdToUse 
        ? { deviceId: { exact: cameraIdToUse } }
        : { facingMode: { ideal: 'environment' } };

      await qrCode.start(
        cameraConfig,
        {
          fps: 20, // سرعة مسح عالية
          qrbox: (viewfinderWidth: number, viewfinderHeight: number) => {
            return {
              width: Math.floor(Math.min(viewfinderWidth * 0.88, 320)),
              height: Math.floor(Math.min(viewfinderHeight * 0.65, 200)),
            };
          },
          aspectRatio: 1.333333,
        },
        (decodedText) => {
          processBarcode(decodedText);
          stopCamera();
        },
        () => {
          // جاري المسح المستمر للإطارات
        }
      );

      setIsCameraActive(true);
      if (cameraIdToUse) {
        setSelectedCameraId(cameraIdToUse);
      }
    } catch (err: unknown) {
      console.warn('Camera start error:', err);
      const errMsg = err instanceof Error ? err.message : String(err);
      if (errMsg.includes('NotAllowedError') || errMsg.includes('Permission')) {
        setScannerError('يرجى منح إذن الوصول إلى الكاميرا من إعدادات المتصفح لمسح علبة الدواء.');
      } else {
        setScannerError('تعذر فتح الكاميرا المباشرة في هذه البيئة. يمكنك اختيار صورة العلبة أو إدخال الباركود يدوياً.');
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

  const switchCamera = async () => {
    if (availableCameras.length < 2) return;
    const currentIndex = availableCameras.findIndex((c) => c.id === selectedCameraId);
    const nextIndex = (currentIndex + 1) % availableCameras.length;
    const nextCamera = availableCameras[nextIndex];
    setSelectedCameraId(nextCamera.id);
    await stopCamera();
    startCamera(nextCamera.id);
  };

  // مسح باركود من صورة ملتقطة لعلبة الدواء
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      if (!html5QrCodeRef.current) {
        html5QrCodeRef.current = new Html5Qrcode(scannerContainerId, {
          formatsToSupport: [
            Html5QrcodeSupportedFormats.EAN_13,
            Html5QrcodeSupportedFormats.EAN_8,
            Html5QrcodeSupportedFormats.CODE_128,
            Html5QrcodeSupportedFormats.UPC_A,
            Html5QrcodeSupportedFormats.DATA_MATRIX,
            Html5QrcodeSupportedFormats.QR_CODE,
          ],
          verbose: false,
        });
      }
      const qrCode = html5QrCodeRef.current;
      const result = await qrCode.scanFile(file, true);
      processBarcode(result);
    } catch (err) {
      setScannerError('لم يتم العثور على باركود واضح في الصورة. يرجى التأكد من وضوح خطوط الباركود والإضاءة الجيدة.');
    } finally {
      if (e.target) e.target.value = '';
    }
  };

  useEffect(() => {
    if (isOpen) {
      setScannedResult(null);
      setScannerError(null);
      setIsManualInput(false);
      const timer = setTimeout(() => {
        startCamera();
      }, 250);
      return () => clearTimeout(timer);
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // تأكيد إدراج الدواء ونقله لشاشة التعديل أو الحفظ
  const handleConfirmDrug = () => {
    if (!scannedResult) return;

    const { barcode, parsedGS1, globalMatch, existing } = scannedResult;

    if (existing) {
      // دواء مسجل سابقاً في الصيدلية
      onScanComplete(barcode, {
        ...existing,
        expiryDate: parsedGS1.expiryDate || existing.expiryDate,
        notes: parsedGS1.batchNumber 
          ? `تشغيلة / Batch: ${parsedGS1.batchNumber}. ${existing.notes || ''}` 
          : existing.notes,
      });
    } else if (globalMatch) {
      // دواء من قاعدة البيانات الشاملة
      const expiry = parsedGS1.expiryDate || new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const batchNote = parsedGS1.batchNumber ? `تشغيلة / Batch: ${parsedGS1.batchNumber}. ` : '';

      onScanComplete(barcode, {
        tradeName: globalMatch.tradeName,
        scientificName: globalMatch.scientificName,
        companyName: globalMatch.companyName,
        category: globalMatch.category,
        alertThresholdDays: globalMatch.defaultAlertDays,
        notes: `${batchNote}${globalMatch.notes || ''}`.trim(),
        barcode: barcode,
        expiryDate: expiry,
      });
    } else {
      // دواء جديد غير مدرج
      const expiry = parsedGS1.expiryDate || new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      onScanComplete(barcode, {
        barcode: barcode,
        tradeName: `دواء مسجل (${barcode.slice(-4)})`,
        expiryDate: expiry,
        notes: parsedGS1.batchNumber ? `تشغيلة: ${parsedGS1.batchNumber}` : '',
      });
    }

    onClose();
  };

  // فلترة قائمة الأدوية التجريبية
  const sampleDrugs = GLOBAL_DRUG_DATABASE.filter((d) => {
    if (testCategoryFilter === 'ALL') return true;
    if (testCategoryFilter === 'IRAQ') return d.companyName.includes('العراق') || d.companyName.includes('سامراء') || d.companyName.includes('أواميديكا') || d.companyName.includes('الرائد');
    if (testCategoryFilter === 'ANTIBIOTIC') return d.category.includes('المضادات');
    if (testCategoryFilter === 'PAIN') return d.category.includes('مسكنات');
    if (testCategoryFilter === 'CHRONIC') return d.category.includes('القلب') || d.category.includes('السكري');
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200 font-['Cairo',sans-serif]" dir="rtl">
      <div className="w-full max-w-lg bg-slate-900 rounded-3xl overflow-hidden border border-slate-800 text-white shadow-2xl flex flex-col max-h-[94vh]">
        
        {/* ترويسة الماسح الضوئي */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between shrink-0 bg-slate-950/70">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-teal-500/20 text-teal-400 border border-teal-500/30 flex items-center justify-center shadow-xs">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-black text-sm text-white">ماسح الباركود الصيدلاني الشامل</h3>
                <span className="px-2 py-0.2 bg-teal-500/20 text-teal-300 text-[9px] font-bold rounded-full border border-teal-500/30">
                  GS1 + 1D/2D
                </span>
              </div>
              <p className="text-[10px] text-teal-200/80 font-medium">قراءة علب الأدوية، الرموز الشريطية، و DataMatrix</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors active:scale-90"
            title="إغلاق"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* محتوى الماسح */}
        <div className="p-4 overflow-y-auto space-y-4 no-scrollbar">

          {/* 1. حالة: تم التعرف على الدواء بنجاح */}
          {scannedResult ? (
            <div className="space-y-4 animate-in zoom-in-95 duration-200">
              <div className="p-4 rounded-2xl bg-teal-950/60 border-2 border-teal-500/70 text-right space-y-3.5 shadow-xl shadow-teal-950/40">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="px-2.5 py-1 rounded-full bg-teal-600 text-white font-extrabold text-[11px] flex items-center gap-1.5 shadow-sm">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>تم التعرف على الدواء</span>
                  </span>
                  <div className="flex items-center gap-2">
                    {scannedResult.parsedGS1.isGS1 && (
                      <span className="px-2 py-0.5 rounded-md bg-amber-400 text-slate-950 font-black text-[9.5px]">
                        GS1 DataMatrix طبي
                      </span>
                    )}
                    <span className="font-mono text-xs text-teal-300 font-bold tracking-wider bg-slate-900/90 px-2.5 py-1 rounded-lg border border-teal-800">
                      {scannedResult.barcode}
                    </span>
                  </div>
                </div>

                {/* إذا استخرج الماسح تاريخ الصلاحية من باركود GS1 DataMatrix مباشرة */}
                {scannedResult.parsedGS1.expiryDate && (
                  <div className="p-2.5 rounded-xl bg-emerald-950/80 border border-emerald-500/50 flex items-center justify-between text-xs text-emerald-200">
                    <div className="flex items-center gap-1.5 font-bold">
                      <Calendar className="w-4 h-4 text-emerald-400" />
                      <span>تاريخ الصلاحية المقروء من الباركود مباشرة:</span>
                    </div>
                    <span className="font-mono font-black text-white text-sm bg-emerald-900/80 px-2 py-0.5 rounded">
                      {scannedResult.parsedGS1.expiryDate}
                    </span>
                  </div>
                )}

                {/* تفاصيل الدواء المكتشف */}
                {scannedResult.existing ? (
                  // الدواء مسجل مسبقاً في مخزون الصيدلية
                  <div className="space-y-2 pt-1 border-t border-teal-800/50">
                    <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>الدواء مسجل بالفعل في صيدليتك:</span>
                    </div>
                    <h4 className="font-black text-base text-white">{scannedResult.existing.tradeName}</h4>
                    <p className="text-xs text-slate-300 font-medium">{scannedResult.existing.scientificName}</p>
                    <div className="flex flex-wrap gap-2 text-[11px] text-slate-400">
                      <span className="bg-slate-900 px-2.5 py-1 rounded-lg text-teal-300 border border-slate-800">{scannedResult.existing.companyName}</span>
                      <span className="bg-slate-900 px-2.5 py-1 rounded-lg text-slate-300 border border-slate-800">{scannedResult.existing.category}</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-900/90 border border-teal-900 text-xs text-teal-200 flex justify-between">
                      <span>تاريخ الانتهاء الحالي:</span>
                      <span className="font-mono font-bold text-white">{scannedResult.existing.expiryDate}</span>
                    </div>
                  </div>
                ) : scannedResult.globalMatch ? (
                  // الدواء من قاعدة البيانات الدوائية الشاملة
                  <div className="space-y-2.5 pt-1 border-t border-teal-800/50">
                    <div className="flex items-center gap-1.5 text-teal-300 text-xs font-bold">
                      <PackageCheck className="w-4 h-4" />
                      <span>تم استدعاء بيانات الدواء بالكامل من الدليل الطبي:</span>
                    </div>
                    <h4 className="font-black text-base text-white">{scannedResult.globalMatch.tradeName}</h4>
                    <p className="text-xs text-teal-100 font-medium">{scannedResult.globalMatch.scientificName}</p>
                    
                    <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                      <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-right">
                        <span className="text-slate-400 block text-[10px]">الشركة المصنعة</span>
                        <span className="font-bold text-teal-300">{scannedResult.globalMatch.companyName}</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-right">
                        <span className="text-slate-400 block text-[10px]">الفئة الدوائية</span>
                        <span className="font-bold text-teal-300">{scannedResult.globalMatch.category}</span>
                      </div>
                    </div>

                    {scannedResult.globalMatch.notes && (
                      <p className="text-[11px] text-slate-300 bg-slate-900/70 p-2.5 rounded-xl border border-slate-800">
                        {scannedResult.globalMatch.notes}
                      </p>
                    )}

                    <div className="flex items-center justify-between text-[11px] text-teal-300/80 px-1">
                      <span>جهة التسجيل / المنشأ:</span>
                      <span className="font-bold text-teal-200">{scannedResult.countryOrigin}</span>
                    </div>
                  </div>
                ) : (
                  // باركود جديد تماماً
                  <div className="space-y-2 pt-1 border-t border-teal-800/50 text-center">
                    <p className="text-xs font-bold text-amber-300">باركود علاج جديد:</p>
                    <p className="font-mono text-base font-black text-white bg-slate-900/90 py-1.5 rounded-xl">{scannedResult.barcode}</p>
                    <p className="text-xs text-slate-300">المنشأ المحتمل: <span className="font-bold text-teal-300">{scannedResult.countryOrigin}</span></p>
                    <p className="text-[11px] text-slate-400">سيتم فتح نموذج الإضافة لحفظ هذا الدواء وسيتذكره النظام تلقائياً لكافة عمليات المسح القادمة!</p>
                  </div>
                )}
              </div>

              {/* أزرار الإجراء */}
              <div className="flex gap-2">
                <button
                  onClick={handleConfirmDrug}
                  className="flex-1 py-3 bg-gradient-to-r from-teal-600 to-[#0D9488] hover:from-teal-700 hover:to-teal-600 text-white rounded-2xl font-black text-xs shadow-lg shadow-teal-900/40 active:scale-95 transition-all flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{scannedResult.existing ? 'تحديث ومتابعة الصلاحية' : 'إدراج العلاج بكامل المعلومات'}</span>
                </button>
                <button
                  onClick={() => {
                    setScannedResult(null);
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
            // 2. شاشة الكاميرا والمسح المباشر
            <div className="space-y-3.5">
              
              {/* إطار الكاميرا التفاعلي مع ليزر المسح */}
              <div className="relative aspect-[4/3] max-h-72 mx-auto rounded-3xl bg-black border-2 border-teal-500/50 overflow-hidden flex flex-col items-center justify-center shadow-2xl">
                <div id={scannerContainerId} className="w-full h-full [&_video]:object-cover" />
                
                {/* علامة الهدف البصري والليزر الأحمر/الأخضر */}
                <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center p-4">
                  <div className="w-[82%] h-[68%] border-2 border-dashed border-teal-400/90 rounded-2xl relative flex items-center justify-center shadow-[0_0_25px_rgba(20,184,166,0.35)]">
                    
                    {/* زوايا استهداف محددة مثل كاميرات المستشفيات */}
                    <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-teal-300 rounded-tl-lg" />
                    <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-teal-300 rounded-tr-lg" />
                    <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-teal-300 rounded-bl-lg" />
                    <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-teal-300 rounded-br-lg" />

                    {/* خط الليزر المتحرك */}
                    <div 
                      className="w-full h-0.5 bg-gradient-to-r from-transparent via-teal-300 to-transparent absolute shadow-[0_0_12px_#2dd4bf]"
                      style={{
                        animation: 'laserScan 2.2s ease-in-out infinite alternate',
                      }}
                    />
                    
                    <span className="absolute bottom-2 text-[10px] text-teal-100 bg-slate-950/85 px-3 py-0.5 rounded-full font-bold border border-teal-500/30">
                      وجه الكاميرا نحو باركود علبة الدواء
                    </span>
                  </div>
                </div>

                <style>{`
                  @keyframes laserScan {
                    0% { top: 15%; opacity: 0.8; }
                    50% { opacity: 1; }
                    100% { top: 85%; opacity: 0.8; }
                  }
                `}</style>

                {/* أزرار التحكم: فلاش الكاميرا + تبديل الكاميرات + إعادة التشغيل */}
                <div className="absolute top-3 right-3 flex gap-2">
                  <button
                    type="button"
                    onClick={toggleTorch}
                    className={`p-2 rounded-xl backdrop-blur-md transition-all ${
                      torchOn ? 'bg-amber-400 text-slate-950' : 'bg-slate-900/80 text-white hover:bg-slate-800'
                    }`}
                    title="فلاش الكاميرا"
                  >
                    <Flashlight className="w-4 h-4" />
                  </button>

                  {availableCameras.length > 1 && (
                    <button
                      type="button"
                      onClick={switchCamera}
                      className="p-2 rounded-xl bg-slate-900/80 text-white hover:bg-slate-800 backdrop-blur-md transition-all"
                      title="تبديل الكاميرا الخلفية / الواسعة"
                    >
                      <SwitchCamera className="w-4 h-4" />
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => startCamera(selectedCameraId || undefined)}
                    className="p-2 rounded-xl bg-slate-900/80 text-white hover:bg-slate-800 backdrop-blur-md transition-all"
                    title="إعادة تشغيل الكاميرا"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* تنبيه الخطأ أو التوجيه في حال تقييد الكاميرا */}
              {scannerError && (
                <div className="p-3.5 rounded-2xl bg-amber-950/50 border border-amber-800/80 text-amber-200 text-xs flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <p className="leading-snug">{scannerError}</p>
                </div>
              )}

              {/* خيارات مسح بديلة: صورة من الألبوم أو إدخال رقمي */}
              <div className="flex gap-2">
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 py-2.5 px-3 bg-slate-800 hover:bg-slate-750 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95 border border-slate-700"
                >
                  <Upload className="w-3.5 h-3.5 text-teal-400" />
                  <span>مسح من صورة العلبة</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsManualInput(!isManualInput)}
                  className={`py-2.5 px-3.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95 border ${
                    isManualInput ? 'bg-teal-700 text-white border-teal-500' : 'bg-slate-800 hover:bg-slate-750 text-white border-slate-700'
                  }`}
                >
                  <Search className="w-3.5 h-3.5 text-teal-400" />
                  <span>إدخال يدوي</span>
                </button>
              </div>

              {/* حقل الإدخال اليدوي الرقمي للباركود */}
              {isManualInput && (
                <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 space-y-2 animate-in slide-in-from-top-2 duration-150">
                  <p className="text-[11px] text-slate-300 text-right font-medium">أدخل رقم باركود الدواء المطبوع أسفل الخطوط:</p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={manualBarcode}
                      onChange={(e) => setManualBarcode(e.target.value)}
                      placeholder="مثال: 6281001230012 أو رمز GS1..."
                      className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-teal-400"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && manualBarcode.trim()) {
                          processBarcode(manualBarcode.trim());
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (manualBarcode.trim()) {
                          processBarcode(manualBarcode.trim());
                        }
                      }}
                      className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-bold active:scale-95 transition-transform"
                    >
                      فحص
                    </button>
                  </div>
                </div>
              )}

              {/* أدراج الأدوية الحقيقية الجاهزة للتجربة الفورية للصيدلي */}
              <div className="space-y-2 pt-2 border-t border-slate-800/80">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] text-teal-200 font-bold">أدوية وعلاجات حقيقية للتجربة السريعة:</p>
                  <span className="text-[10px] text-slate-400">({sampleDrugs.length} دواء)</span>
                </div>

                {/* أزرار الفئات التجريبية */}
                <div className="flex gap-1 overflow-x-auto pb-1 no-scrollbar text-[10px]">
                  {[
                    { key: 'ALL', label: 'الكل' },
                    { key: 'IRAQ', label: 'العراق (سامراء SDI)' },
                    { key: 'ANTIBIOTIC', label: 'مضادات' },
                    { key: 'PAIN', label: 'مسكنات' },
                    { key: 'CHRONIC', label: 'مزمنة وضغط' },
                  ].map((cat) => (
                    <button
                      key={cat.key}
                      type="button"
                      onClick={() => setTestCategoryFilter(cat.key)}
                      className={`px-2.5 py-1 rounded-lg font-bold transition-all whitespace-nowrap ${
                        testCategoryFilter === cat.key
                          ? 'bg-teal-600 text-white'
                          : 'bg-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>

                {/* قائمة الأدوية للتجربة المباشرة بنقرة واحدة */}
                <div className="grid grid-cols-2 gap-1.5 max-h-36 overflow-y-auto no-scrollbar pt-1">
                  {sampleDrugs.slice(0, 14).map((d) => (
                    <button
                      key={d.barcode}
                      type="button"
                      onClick={() => processBarcode(d.barcode)}
                      className="p-2 rounded-xl bg-slate-800/80 hover:bg-teal-950/60 border border-slate-700/80 hover:border-teal-500/50 text-right transition-all active:scale-95 group flex flex-col justify-between"
                    >
                      <span className="font-bold text-white text-[11px] truncate w-full group-hover:text-teal-200">
                        {d.tradeName}
                      </span>
                      <div className="flex items-center justify-between w-full mt-1">
                        <span className="font-mono text-[9px] text-teal-400">{d.barcode}</span>
                        <span className="text-[9px] text-slate-400 truncate max-w-[70px]">{d.companyName.split(' ')[0]}</span>
                      </div>
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
