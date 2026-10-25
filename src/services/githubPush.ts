// خدمة دفع التغييرات إلى GitHub ومتابعة سير عمل GitHub Actions تلقائياً

export interface GitHubPushResult {
  success: boolean;
  commitSha?: string;
  commitUrl?: string;
  error?: string;
}

export interface WorkflowRunStatus {
  id: number;
  status: 'queued' | 'in_progress' | 'completed';
  conclusion: 'success' | 'failure' | 'cancelled' | null;
  htmlUrl: string;
  createdAt: string;
  runNumber: number;
}

const DEFAULT_REPO = 'phmohammedalkadim-max/ExpiroApp';

export function getSavedGitHubToken(): string {
  return localStorage.getItem('expiro_github_token') || '';
}

export function saveGitHubToken(token: string): void {
  localStorage.setItem('expiro_github_token', token.trim());
}

export function getSavedGitHubRepo(): string {
  return localStorage.getItem('expiro_github_repo') || DEFAULT_REPO;
}

export function saveGitHubRepo(repo: string): void {
  localStorage.setItem('expiro_github_repo', repo.trim());
}

/**
 * توليد كود Flutter المحدّث بناءً على أدوية الصيدلية الحالية في المعاينة
 */
export function generateDartMedicinesList(medicines: any[]): string {
  if (!medicines || medicines.length === 0) {
    return `[
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
    ]`;
  }

  const items = medicines.map((m, idx) => {
    // حساب الفرق بالأيام بالنسبة لليوم الحالي
    const expDate = new Date(m.expiryDate || Date.now());
    const now = new Date();
    const diffMs = expDate.getTime() - now.getTime();
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
    
    const dateExpr = diffDays < 0
      ? `now.subtract(const Duration(days: ${Math.abs(diffDays)}))`
      : `now.add(const Duration(days: ${diffDays}))`;

    const safeTrade = (m.tradeName || 'دواء غير مسمى').replace(/'/g, "\\'");
    const safeSci = (m.scientificName || '').replace(/'/g, "\\'");
    const safeComp = (m.companyName || 'صيدلية مسجلة').replace(/'/g, "\\'");
    const safeCat = (m.category || 'عام').replace(/'/g, "\\'");
    const safeCode = (m.barcode || '').replace(/'/g, "\\'");
    const safeNotes = (m.notes || '').replace(/'/g, "\\'");

    return `      Medicine(
        id: ${m.id || idx + 1},
        tradeName: '${safeTrade}',
        scientificName: '${safeSci}',
        companyName: '${safeComp}',
        category: '${safeCat}',
        barcode: '${safeCode}',
        expiryDate: ${dateExpr},
        alertThresholdDays: ${m.alertThresholdDays || 60},
        quantity: ${m.quantity || 1},
        notes: '${safeNotes}',
      )`;
  }).join(',\n');

  return `[\n${items},\n    ]`;
}

/**
 * دفع التغييرات مباشرة إلى GitHub عبر REST API (Git Data API)
 */
export async function pushChangesToGitHub(params: {
  commitMessage: string;
  token?: string;
  repo?: string;
  currentMedicines?: any[];
}): Promise<GitHubPushResult> {
  const token = (params.token || getSavedGitHubToken()).trim();
  const repo = (params.repo || getSavedGitHubRepo()).trim();
  const commitMessage = params.commitMessage.trim() || 'تحديث أدوية الصيدلية وتعديلات المعاينة - Expiro Web';

  const headers = {
    'Authorization': `token ${token}`,
    'Accept': 'application/vnd.github.v3+json',
    'Content-Type': 'application/json',
    'User-Agent': 'Expiro-Web-App',
  };

  try {
    // 1. الحصول على أحدث Commit على فرع main
    const refResp = await fetch(`https://api.github.com/repos/${repo}/git/ref/heads/main`, { headers });
    if (!refResp.ok) {
      const err = await refResp.json().catch(() => ({}));
      throw new Error(`فشل الاتصال بفرع main في مستودع GitHub: ${err.message || refResp.statusText}`);
    }
    const refData = await refResp.json();
    const latestCommitSha = refData.object.sha;

    // 2. الحصول على Base Tree من أحدث Commit
    const commitResp = await fetch(`https://api.github.com/repos/${repo}/git/commits/${latestCommitSha}`, { headers });
    if (!commitResp.ok) {
      throw new Error('فشل جلب تفاصيل أحدث Commit من GitHub');
    }
    const commitData = await commitResp.json();
    const baseTreeSha = commitData.tree.sha;

    // 3. جلب ملف main.dart الحالي من المستودع لتحديث قائمة الأدوية بداخله إن وُجدت
    let updatedDartContent: string | null = null;
    try {
      const fileResp = await fetch(`https://api.github.com/repos/${repo}/contents/lib/main.dart?ref=main`, { headers });
      if (fileResp.ok) {
        const fileData = await fileResp.json();
        // فك تشفير محتوى Base64
        const binaryString = atob(fileData.content.replace(/\s/g, ''));
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        const decodedContent = new TextDecoder('utf-8').decode(bytes);

        if (params.currentMedicines && params.currentMedicines.length > 0) {
          const newMedListCode = generateDartMedicinesList(params.currentMedicines);
          // استبدال _medicines = [...];
          const regex = /_medicines = \[[\s\S]*?\];/;
          if (regex.test(decodedContent)) {
            updatedDartContent = decodedContent.replace(regex, `_medicines = ${newMedListCode};`);
          }
        }
      }
    } catch (e) {
      console.warn('Could not update dart content dynamically, keeping existing:', e);
    }

    // 4. إنشاء الشجرة (Tree) الجديدة مع التعديلات
    const treeItems: any[] = [];

    if (updatedDartContent) {
      treeItems.push({
        path: 'lib/main.dart',
        mode: '100644',
        type: 'blob',
        content: updatedDartContent,
      });
    }

    // ملف تأكيد المزامنة لضمان وجود تغيير يُطلق الـ commit وبناء الـ APK فوراً
    treeItems.push({
      path: '.expiro-sync.json',
      mode: '100644',
      type: 'blob',
      content: JSON.stringify({
        lastSyncTime: new Date().toISOString(),
        pushedBy: 'Expiro Web Preview (إعدادات الصيدلية)',
        message: commitMessage,
        medicinesCount: params.currentMedicines ? params.currentMedicines.length : 8,
      }, null, 2),
    });

    const createTreeResp = await fetch(`https://api.github.com/repos/${repo}/git/trees`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        base_tree: baseTreeSha,
        tree: treeItems,
      }),
    });

    if (!createTreeResp.ok) {
      const err = await createTreeResp.json().catch(() => ({}));
      throw new Error(`فشل إنشاء شجرة التغييرات في GitHub: ${err.message || createTreeResp.statusText}`);
    }
    const newTreeData = await createTreeResp.json();
    const newTreeSha = newTreeData.sha;

    // 5. إنشاء الـ Commit الجديد
    const createCommitResp = await fetch(`https://api.github.com/repos/${repo}/git/commits`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        message: commitMessage,
        tree: newTreeSha,
        parents: [latestCommitSha],
      }),
    });

    if (!createCommitResp.ok) {
      const err = await createCommitResp.json().catch(() => ({}));
      throw new Error(`فشل إنشاء الـ Commit: ${err.message || createCommitResp.statusText}`);
    }
    const newCommitData = await createCommitResp.json();
    const newCommitSha = newCommitData.sha;

    // 6. تحديث فرع main ليرمز للـ Commit الجديد (هذا يُطلق الـ GitHub Action تلقائياً!)
    const updateRefResp = await fetch(`https://api.github.com/repos/${repo}/git/refs/heads/main`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({
        sha: newCommitSha,
        force: false,
      }),
    });

    if (!updateRefResp.ok) {
      const err = await updateRefResp.json().catch(() => ({}));
      throw new Error(`فشل تحديث فرع main: ${err.message || updateRefResp.statusText}`);
    }

    return {
      success: true,
      commitSha: newCommitSha,
      commitUrl: `https://github.com/phmohammedalkadim-max/ExpiroApp/commit/${newCommitSha}`,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'حدث خطأ غير متوقع أثناء دفع التغييرات إلى GitHub',
    };
  }
}

/**
 * جلب حالة أحدث سير عمل في GitHub Actions لمتابعة تقدم بناء الـ APK
 */
export async function fetchLatestWorkflowRun(repo = DEFAULT_REPO, token = getSavedGitHubToken()): Promise<WorkflowRunStatus | null> {
  const headers = {
    'Authorization': `token ${token}`,
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'Expiro-Web-App',
  };

  try {
    const resp = await fetch(`https://api.github.com/repos/${repo}/actions/runs?per_page=1`, { headers });
    if (!resp.ok) return null;
    const data = await resp.json();
    const runs = data.workflow_runs;
    if (!runs || runs.length === 0) return null;
    const r = runs[0];
    return {
      id: r.id,
      status: r.status,
      conclusion: r.conclusion,
      htmlUrl: r.html_url,
      createdAt: r.created_at,
      runNumber: r.run_number,
    };
  } catch {
    return null;
  }
}
