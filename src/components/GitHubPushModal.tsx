import React, { useState, useEffect } from 'react';
import { 
  GitBranch, 
  UploadCloud, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  ExternalLink, 
  X, 
  Layers, 
  ShieldCheck, 
  Download,
  KeyRound,
  RefreshCw
} from 'lucide-react';
import { 
  pushChangesToGitHub, 
  fetchLatestWorkflowRun, 
  getSavedGitHubToken, 
  saveGitHubToken, 
  getSavedGitHubRepo, 
  saveGitHubRepo,
  WorkflowRunStatus 
} from '../services/githubPush';

interface GitHubPushModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentMedicines: any[];
  isDarkMode?: boolean;
}

export const GitHubPushModal: React.FC<GitHubPushModalProps> = ({
  isOpen,
  onClose,
  currentMedicines,
  isDarkMode = false,
}) => {
  const [repo, setRepo] = useState(getSavedGitHubRepo());
  const [token, setToken] = useState(getSavedGitHubToken());
  const [commitMessage, setCommitMessage] = useState('تحديث أدوية الصيدلية وإعدادات المعاينة');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successResult, setSuccessResult] = useState<{ commitSha: string; commitUrl: string } | null>(null);
  const [workflowRun, setWorkflowRun] = useState<WorkflowRunStatus | null>(null);
  const [showTokenSettings, setShowTokenSettings] = useState(false);
  const [isPolling, setIsPolling] = useState(false);

  // إعادة التعيين عند فتح النافذة
  useEffect(() => {
    if (isOpen) {
      setError(null);
      setSuccessResult(null);
      setWorkflowRun(null);
    }
  }, [isOpen]);

  // مراقبة تقدم الـ GitHub Action بعد نجاح الدفع
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPolling && isOpen) {
      interval = setInterval(async () => {
        const run = await fetchLatestWorkflowRun(repo, token);
        if (run) {
          setWorkflowRun(run);
          if (run.status === 'completed') {
            setIsPolling(false);
          }
        }
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [isPolling, isOpen, repo, token]);

  if (!isOpen) return null;

  const handlePush = async () => {
    setIsLoading(true);
    setError(null);
    setSuccessResult(null);

    // حفظ الإعدادات في حال تعديلها
    saveGitHubRepo(repo);
    saveGitHubToken(token);

    const res = await pushChangesToGitHub({
      commitMessage,
      token,
      repo,
      currentMedicines,
    });

    setIsLoading(false);

    if (res.success && res.commitSha) {
      setSuccessResult({
        commitSha: res.commitSha,
        commitUrl: res.commitUrl || `https://github.com/${repo}/commit/${res.commitSha}`,
      });
      // بدء مراقبة الـ Action التلقائي
      setIsPolling(true);
      // فحص أولي بعد 2 ثانية
      setTimeout(async () => {
        const run = await fetchLatestWorkflowRun(repo, token);
        if (run) setWorkflowRun(run);
      }, 2500);
    } else {
      setError(res.error || 'فشل دفع التغييرات إلى GitHub');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className={`w-full max-w-lg rounded-3xl border shadow-2xl overflow-hidden transition-all text-right ${
          isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'
        }`}
        dir="rtl"
      >
        {/* Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-teal-800 to-emerald-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center border border-white/20">
              <UploadCloud className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base">دفع التغييرات إلى GitHub (CI/CD)</h3>
              <p className="text-[11px] text-teal-100 font-medium">إرسال التعديلات لفرع main وتشغيل بناء APK تلقائياً</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* شريط حالة المستودع */}
          <div className={`p-3.5 rounded-2xl border flex items-center justify-between text-xs ${
            isDarkMode ? 'bg-slate-800/60 border-slate-700' : 'bg-slate-50 border-slate-200'
          }`}>
            <div className="flex items-center gap-2">
              <GitBranch className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
              <div>
                <span className="font-bold text-slate-900 dark:text-white block">{repo}</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">الفرع المستهدف: main | التشغيل التلقائي مفعل</span>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              جاهز للدفع
            </span>
          </div>

          {/* حالة النجاح وبدء الـ Action */}
          {successResult && (
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs space-y-2.5 animate-in slide-in-from-top-2">
              <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>تم دفع التغييرات بنجاح إلى GitHub!</span>
              </div>
              <p className="text-[11px] text-emerald-700 dark:text-emerald-400">
                وصل الـ Commit إلى الفرع الرئيسي، وبدأ سير العمل في GitHub Actions بالعمل تلقائياً بدون أي تدخل منك.
              </p>

              {/* مراقبة الـ Action المباشر */}
              <div className="mt-2 pt-2 border-t border-emerald-200 dark:border-emerald-800/60 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  {workflowRun?.status === 'in_progress' ? (
                    <RefreshCw className="w-3.5 h-3.5 text-amber-600 animate-spin" />
                  ) : workflowRun?.conclusion === 'success' ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Loader2 className="w-3.5 h-3.5 text-teal-600 animate-spin" />
                  )}
                  <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200">
                    حالة بناء الـ APK:{' '}
                    {workflowRun?.status === 'in_progress' ? 'قيد التجميع والبناء الآن ⏳' : 
                     workflowRun?.conclusion === 'success' ? 'تم إنشاء الـ APK بنجاح! 📦' : 'جاري بدء سير العمل...'}
                  </span>
                </div>
                <a
                  href={`https://github.com/${repo}/actions`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[10.5px] font-bold text-teal-700 dark:text-teal-300 hover:underline flex items-center gap-1"
                >
                  <span>متابعة البناء</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <a
                  href={`https://github.com/${repo}/releases`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-teal-700 text-white font-bold text-[11px] hover:bg-teal-800 transition-colors flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>صفحة تنزيل الـ APK</span>
                </a>
                <a
                  href={successResult.commitUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-xl border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-200 font-bold text-[11px] hover:bg-emerald-100/50 transition-colors flex items-center gap-1"
                >
                  <span>عرض الـ Commit</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          )}

          {/* تنبيه الخطأ */}
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">تعذر الدفع إلى GitHub:</span>
                <span className="text-[11px] opacity-90">{error}</span>
              </div>
            </div>
          )}

          {/* إحصائيات ما سيتم دفعه */}
          <div className="p-3 rounded-2xl bg-teal-50/50 dark:bg-teal-950/30 border border-teal-100 dark:border-teal-900 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-teal-700 dark:text-teal-400" />
              <span className="font-bold text-teal-950 dark:text-teal-200">الأصناف الدوائية المراد مزامنتها:</span>
            </div>
            <span className="font-extrabold text-teal-700 dark:text-teal-300 px-2 py-0.5 rounded-lg bg-teal-100 dark:bg-teal-900/60">
              {currentMedicines.length} صنف دوائي
            </span>
          </div>

          {/* رسالة الـ Commit */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
              رسالة الـ Commit (وصف التعديل):
            </label>
            <input
              type="text"
              value={commitMessage}
              onChange={(e) => setCommitMessage(e.target.value)}
              placeholder="مثال: تحديث تواريخ الصلاحية وإضافة أدوية جديدة"
              className={`w-full px-3.5 py-2.5 rounded-xl border text-xs outline-hidden focus:border-teal-600 transition-colors ${
                isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
              }`}
            />
          </div>

          {/* إعدادات متقدمة للتوكن والمستودع */}
          <div>
            <button
              type="button"
              onClick={() => setShowTokenSettings(!showTokenSettings)}
              className="text-[11px] text-slate-500 hover:text-teal-600 flex items-center gap-1 font-bold"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>{showTokenSettings ? 'إخفاء إعدادات التوكن' : 'تعديل التوكن أو اسم المستودع'}</span>
            </button>

            {showTokenSettings && (
              <div className="mt-2 p-3 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
                <div>
                  <label className="text-[10.5px] font-bold block mb-1">اسم المستودع (Owner/Repo):</label>
                  <input
                    type="text"
                    value={repo}
                    onChange={(e) => setRepo(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border text-xs"
                  />
                </div>
                <div>
                  <label className="text-[10.5px] font-bold block mb-1">رمز الوصول الشخصي (GitHub Token):</label>
                  <input
                    type="password"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border text-xs font-mono"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className={`p-4 border-t flex items-center justify-between gap-3 ${
          isDarkMode ? 'bg-slate-800/50 border-slate-800' : 'bg-slate-50 border-slate-200'
        }`}>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-700 transition-colors"
          >
            إغلاق
          </button>

          <button
            onClick={handlePush}
            disabled={isLoading}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-700 to-emerald-600 hover:from-teal-800 hover:to-emerald-700 text-white font-extrabold text-xs shadow-md shadow-teal-700/20 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>جاري الحزم والدفع لـ GitHub...</span>
              </>
            ) : (
              <>
                <UploadCloud className="w-4 h-4" />
                <span>دفع التغييرات إلى GitHub وبدء البناء فوراً</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
