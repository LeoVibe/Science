#!/usr/bin/env node
/**
 * Eidos Orchestrator v2 - 科目級派工
 * 自動化執行 G3/G4 S2 盲測與補題任務
 *
 * 【多 Agent 架構說明】
 * Claude Code（PM）透過本腳本或直接呼叫 cursor agent CLI，委派 Cursor 執行出題/盲測。
 * 規範詳見：docs/README_任務派工準則.md §5.0
 *
 * 【何時用本腳本 vs 直接呼叫】
 * - 本腳本（orchestrator）：跨科目/年級批量任務，自動掃描題數、分配 JOB 號、記錄 state
 * - 直接呼叫（單一 JOB）：cursor agent --print --yolo --workspace . "請讀取並執行派工單：jobs/JOB-XXX-*.md"
 *
 * 變更：改為科目級而非課級
 * - 原來：1課 = 1派工單 + 1 Report（213個）
 * - 現在：1科目 = 1派工單 + 1 Report（30個）
 *
 * 使用方式：
 *   node scripts/orchestrator.js
 *   node scripts/orchestrator.js --dry-run   (只列出任務，不執行)
 *   node scripts/orchestrator.js --from G3-Chinese-HanLin
 *
 * 依賴：cursor agent CLI 已安裝（which cursor 可驗證）
 */

const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// ─── 設定 ────────────────────────────────────────────────────────────────────

const ROOT = path.resolve(__dirname, '..');
const PLATFORM_DIR = path.join(ROOT, 'question', 'platform');
const JOBS_DIR = path.join(ROOT, 'jobs');
const LOGS_DIR = path.join(ROOT, 'scripts', 'orchestrator-logs');
const PLAN_FILE = path.join(JOBS_DIR, 'JOB-138-PLAN-G3G4-S2-自動化盲測補題計畫.md');
const STATE_FILE = path.join(LOGS_DIR, 'state.json');

const TASK_TIMEOUT_MS = 180 * 60 * 1000; // 180 分鐘 per subject（科目級可能較久）
const MAX_RETRY = 1;

const TARGET_COUNTS = {
  Chinese: 20,
  Math: 20,
  Science: 20,
  SocialStudies: 20,
  English: 15,
};

const GRADES = ['G3', 'G4'];
const SEMESTER = 'S2';
const SUBJECTS = ['Chinese', 'Math', 'Science', 'SocialStudies', 'English'];
const PUBLISHERS = ['HanLin', 'KangHsuan', 'NanYi'];

const DRY_RUN = process.argv.includes('--dry-run');
const FROM_TASK = (() => {
  const idx = process.argv.indexOf('--from');
  return idx !== -1 ? process.argv[idx + 1] : null;
})();

// ─── 工具函式 ─────────────────────────────────────────────────────────────────

function log(msg) {
  const ts = new Date().toISOString().replace('T', ' ').slice(0, 19);
  console.log(`[${ts}] ${msg}`);
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function getNextJobNumber() {
  const files = fs.readdirSync(JOBS_DIR);
  const nums = files
    .map(f => f.match(/^JOB-(\d+)/))
    .filter(Boolean)
    .map(m => parseInt(m[1]));
  return nums.length > 0 ? Math.max(...nums) + 1 : 139;
}

function readJsonFile(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return null;
  }
}

function saveState(state) {
  ensureDir(LOGS_DIR);
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

function loadState() {
  if (fs.existsSync(STATE_FILE)) {
    return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
  }
  return null;
}

// ─── 任務掃描（科目級） ───────────────────────────────────────────────────────

function getQuestionCount(jsonPath) {
  const data = readJsonFile(jsonPath);
  if (!data) return 0;
  if (Array.isArray(data)) return data.length;
  if (Array.isArray(data.questions)) return data.questions.length;
  return 0;
}

function scanSubjectLessons(grade, subject, publisher) {
  // 掃描某個科目-出版社下的所有課次
  const dir = path.join(PLATFORM_DIR, grade, subject, SEMESTER, publisher);
  const lessons = [];

  if (!fs.existsSync(dir)) {
    return { exists: false, lessons: [], totalQuestions: 0, needsProd: true };
  }

  const files = fs.readdirSync(dir).filter(f => f.endsWith('.json')).sort();

  for (const file of files) {
    const lessonMatch = file.match(/L(\d+)/i);
    if (!lessonMatch) continue;

    const jsonPath = path.join(dir, file);
    const lesson = `L${lessonMatch[1]}`;
    const count = getQuestionCount(jsonPath);

    lessons.push({
      lesson,
      jsonPath,
      questionCount: count,
    });
  }

  const totalQuestions = lessons.reduce((sum, l) => sum + l.questionCount, 0);
  return { exists: true, lessons, totalQuestions, needsProd: totalQuestions < TARGET_COUNTS[subject] };
}

function buildTaskList() {
  const tasks = [];
  let seq = 1;

  // 科目級任務：年級 × 科目 × 出版社 = 2 × 5 × 3 = 30 個任務
  for (const grade of GRADES) {
    for (const subject of SUBJECTS) {
      for (const publisher of PUBLISHERS) {
        const scan = scanSubjectLessons(grade, subject, publisher);
        const target = TARGET_COUNTS[subject] || 20;

        let type = 'skip'; // 預設跳過
        if (!scan.exists || scan.lessons.length === 0) {
          type = 'question_prod'; // 沒有課次檔案，需要出題
        } else if (scan.needsProd) {
          type = 'question_prod'; // 題數不足，需要補題
        } else if (scan.totalQuestions >= 10) {
          type = 'question_verify'; // 題數充足，需要盲測
        }

        tasks.push({
          id: `${grade}-${subject}-${publisher}`,
          grade,
          subject,
          publisher,
          semester: SEMESTER,
          lessons: scan.lessons,
          totalQuestions: scan.totalQuestions,
          targetQuestions: target,
          baseDir: path.join(PLATFORM_DIR, grade, subject, SEMESTER, publisher),
          status: type === 'skip' ? 'skip' : 'pending',
          type,
          retryCount: 0,
          jobNumber: null,
          result: null,
        });
        seq++;
      }
    }
  }

  return tasks;
}

// ─── Prompt 產生（科目級） ────────────────────────────────────────────────────

function buildPrompt(task) {
  const baseContext = `
你是 Eidos 題庫 Agent（Cursor PM）。本次任務已獲完整授權，請直接執行完畢，不需要詢問是否繼續，不需要確認。

專案根目錄：${ROOT}
必讀規範（啟動前先讀）：
- docs/README_任務派工準則.md
- question/README_出題與品管準則.md（若為 question_prod）
- question/README_驗證與盲測準則.md（若為 question_verify）

===== 科目級任務派工 =====
`.trim();

  if (task.type === 'question_prod') {
    const lessonsList = task.lessons.map(l => `  - ${l.lesson}：${l.questionCount}/${task.targetQuestions} 題`).join('\n');

    return `${baseContext}

任務類型：補題/重產（question_prod）
年級科目：${task.grade} ${task.subject} ${task.semester} ${task.publisher}

目標：確保該科目下所有課次各達 ${task.targetQuestions} 題
目前狀況：
${lessonsList || '  無任何課次檔案，需全新出題'}

執行步驟：
1. 批次操作：scripts/batch_*.js 可同時補多課
2. 每課確保 CQI-P ≥ 5.5，題目含 scenario 和 explanation
3. 保持原有課次結構，按 L1, L2 ... 存檔

完成後，統一產出一個科目級總結報告：jobs/JOB-${String(task.jobNumber).padStart(3, '0')}-REPORT.md

該報告應包含：
1. 各課實際產出題數（表格：L1-L12）
2. CQI-P 平均分及分布（整科+各課）
3. 異動清單（列出所有寫入的課次檔案）
4. 遺留問題（若無填「無」）
5. 建議：是否準備進入盲測階段

執行規範：
- 不詢問，不等待，執行完畢後輸出報告
- 報告格式參考：jobs/JOB-140-REPORT.md（盲測範例）
- Token 消耗請在報告最後記錄`;
  }

  if (task.type === 'question_verify') {
    const lessonsList = task.lessons.map(l => `  - ${l.lesson}：${l.questionCount} 題`).join('\n');

    return `${baseContext}

任務類型：盲測驗證（question_verify）
年級科目：${task.grade} ${task.subject} ${task.semester} ${task.publisher}

驗證範圍：以下 ${task.lessons.length} 個課次，共 ${task.totalQuestions} 題
${lessonsList}

盲測標準：整科 Match Rate ≥ 85%，CQI-V 依 README_驗證與盲測準則.md

執行步驟：
1. 批次驗證：scripts/run_blind_eval.js 可同時驗多課
2. 逐課記錄 Match Rate、Mismatch 清單、CQI-V
3. 整科匯總，判斷各課是否達標

完成後，統一產出一個科目級總結報告：jobs/JOB-${String(task.jobNumber).padStart(3, '0')}-REPORT.md

該報告應包含：
1. 整科 Match Rate（百分比，附計算方式）
2. 各課 Match Rate 與 Mismatch 清單（表格）
3. CQI-V 平均分（整科+各課）
4. 是否建議上架（各課是否達標）
5. 需返工清單（Match Rate < 85% 的課次）

執行規範：
- 不詢問，不等待，執行完畢後輸出報告
- 報告格式參考：jobs/JOB-140-REPORT.md（盲測範例）
- Token 消耗請在報告最後記錄`;
  }

  return null;
}

// ─── Report 解析 ──────────────────────────────────────────────────────────────

function parseReportResult(task, reportContent) {
  const cqiMatch = reportContent.match(/CQI-P[^:]*:\s*([\d.]+)/i);
  const matchRateMatch = reportContent.match(/Match Rate[^:]*:\s*(\d+)%/i);
  const cqi = cqiMatch ? parseFloat(cqiMatch[1]) : null;
  const matchRate = matchRateMatch ? parseInt(matchRateMatch[1]) : null;

  if (task.type === 'question_prod') {
    if (cqi !== null && cqi < 5.5) return { status: 'needs_retry', cqi };
    return { status: 'done', cqi };
  }
  if (task.type === 'question_verify') {
    if (matchRate !== null && matchRate < 85) return { status: 'needs_rework', matchRate };
    return { status: 'done', matchRate };
  }
  return { status: 'done' };
}

// ─── 中斷恢復 ─────────────────────────────────────────────────────────────────

function recoverInProgressTasks(tasks) {
  const stuck = tasks.filter(t => t.status === 'in_progress');
  if (stuck.length === 0) return false;

  log(`⚠️  發現 ${stuck.length} 個上次執行中斷的任務，開始保守恢復...`);

  for (const task of stuck) {
    if (task.jobNumber !== null) {
      const reportFile = path.join(
        JOBS_DIR,
        `JOB-${String(task.jobNumber).padStart(3, '0')}-REPORT.md`
      );
      if (fs.existsSync(reportFile)) {
        const reportContent = fs.readFileSync(reportFile, 'utf8');
        const result = parseReportResult(task, reportContent);
        task.status = result.status;
        task.result = { ...result, recovered: true };
        log(`  ✅ ${task.id} 找到 Report，恢復狀態為 ${result.status}（未重跑）`);
        continue;
      }
    }

    task.status = 'pending';
    task.result = null;
    log(`  🔁 ${task.id} 無 Report，重置為 pending，下次將重新執行`);
  }

  return true;
}

// ─── 執行單一科目任務 ──────────────────────────────────────────────────────────

function runTask(task, jobNumber) {
  task.jobNumber = jobNumber;
  const prompt = buildPrompt(task);
  if (!prompt) return { status: 'skip', reason: '任務類型為 skip' };

  if (DRY_RUN) {
    log(`[DRY-RUN] 跳過執行 ${task.id}`);
    return { status: 'done', reason: 'dry-run' };
  }

  const reportFile = path.join(JOBS_DIR, `JOB-${String(jobNumber).padStart(3, '0')}-REPORT.md`);
  const startTime = Date.now();

  log(`執行 ${task.id}：${task.grade} ${task.subject} ${task.publisher} (${task.type}) [${task.lessons.length} 課, ${task.totalQuestions} 題]`);

  try {
    const spawnResult = spawnSync(
      'cursor',
      ['agent', '--print', '--yolo', '--workspace', ROOT, prompt],
      {
        cwd: ROOT,
        timeout: TASK_TIMEOUT_MS,
        encoding: 'utf8',
        maxBuffer: 20 * 1024 * 1024,
      }
    );

    const elapsed = Math.round((Date.now() - startTime) / 1000 / 60);

    if (spawnResult.status !== 0 || spawnResult.error) {
      log(`❌ ${task.id} 執行失敗：${spawnResult.error?.message || 'exit code ' + spawnResult.status}`);
      return { status: 'failed', reason: spawnResult.stderr || spawnResult.error?.message, elapsed };
    }

    if (!fs.existsSync(reportFile)) {
      log(`❌ ${task.id} Report 未產出`);
      return { status: 'failed', reason: 'Report 檔案未產出', elapsed };
    }

    const reportContent = fs.readFileSync(reportFile, 'utf8');
    const result = parseReportResult(task, reportContent);

    log(`✅ ${task.id} 完成（${elapsed} 分鐘）${result.cqi ? ` CQI-P: ${result.cqi}` : ''}${result.matchRate ? ` Match Rate: ${result.matchRate}%` : ''}`);

    return { ...result, elapsed };

  } catch (err) {
    log(`❌ ${task.id} 例外：${err.message}`);
    return { status: 'failed', reason: err.message };
  }
}

// ─── 進度更新 ─────────────────────────────────────────────────────────────────

function buildProgressTables(tasks) {
  const tables = { G3: {}, G4: {} };

  for (const grade of GRADES) {
    for (const subject of SUBJECTS) {
      const row = {};
      for (const publisher of PUBLISHERS) {
        const task = tasks.find(
          t => t.grade === grade && t.subject === subject && t.publisher === publisher
        );
        const status = task ? task.status : 'skip';
        row[publisher] = status === 'done' ? '✅ done' : status === 'pending' ? '⏳ pending' : '❌ ' + status;
      }
      tables[grade][subject] = row;
    }
  }
  return tables;
}

function updatePlanProgress(tasks) {
  const counts = { done: 0, needs_rework: 0, needs_retry: 0, failed: 0, skip: 0, pending: 0, in_progress: 0 };
  tasks.forEach(t => counts[t.status] = (counts[t.status] || 0) + 1);
  const total = tasks.length;
  const completed = counts.done + counts.needs_rework + counts.failed + counts.skip;

  const summary = `進度：${completed} / ${total} 完成 | done: ${counts.done} | needs_rework: ${counts.needs_rework} | failed: ${counts.failed} | skip: ${counts.skip}`;
  log(summary);

  try {
    let plan = fs.readFileSync(PLAN_FILE, 'utf8');

    // 更新整體進度（改為科目級，總數應為 30）
    plan = plan.replace(
      /進度：.*完成.*/,
      `進度：${completed} / ${total} 完成 | done: ${counts.done} | needs_rework: ${counts.needs_rework} | failed: ${counts.failed} | skip: ${counts.skip}`
    );

    // 更新進度表格（科目級）
    const tables = buildProgressTables(tasks);

    let g3Table = `| 科目 | HanLin | KangHsuan | NanYi |\n|---|---|---|---|\n`;
    for (const subject of SUBJECTS) {
      const row = tables.G3[subject];
      g3Table += `| ${subject} | ${row.HanLin} | ${row.KangHsuan} | ${row.NanYi} |\n`;
    }

    let g4Table = `| 科目 | HanLin | KangHsuan | NanYi |\n|---|---|---|---|\n`;
    for (const subject of SUBJECTS) {
      const row = tables.G4[subject];
      g4Table += `| ${subject} | ${row.HanLin} | ${row.KangHsuan} | ${row.NanYi} |\n`;
    }

    plan = plan.replace(
      /## G3 S2 各科進度[\s\S]*?## G4 S2 各科進度[\s\S]*?^---/m,
      `## G3 S2 各科進度\n\n${g3Table}\n---\n\n## G4 S2 各科進度\n\n${g4Table}\n---`
    );

    fs.writeFileSync(PLAN_FILE, plan);
  } catch (err) {
    log(`⚠️  更新進度表失敗：${err.message}`);
  }
}

function updateFullReport(tasks, startTime) {
  const elapsed = Math.round((Date.now() - startTime) / 1000 / 60);
  const counts = {};
  tasks.forEach(t => counts[t.status] = (counts[t.status] || 0) + 1);

  const failedTasks = tasks.filter(t => t.status === 'failed');
  const reworkTasks = tasks.filter(t => t.status === 'needs_rework');

  try {
    let plan = fs.readFileSync(PLAN_FILE, 'utf8');

    // 更新需返工清單
    const reworkList = reworkTasks.length === 0
      ? '目前無。'
      : reworkTasks.map(t => `- ${t.id}（Match Rate: ${t.result?.matchRate ?? '-'}%）`).join('\n');

    plan = plan.replace(
      /## 需返工清單[\s\S]*?\n\n(?=##)/,
      `## 需返工清單\n\n${reworkList}\n\n`
    );

    // 更新失敗清單
    const failedList = failedTasks.length === 0
      ? '目前無。'
      : failedTasks.map(t => `- ${t.id}（原因：${t.result?.reason ?? '未知'}）`).join('\n');

    plan = plan.replace(
      /## 失敗清單[\s\S]*?\n\n(?=##|$)/,
      `## 失敗清單\n\n${failedList}\n\n`
    );

    // 更新最後更新時間
    plan = plan.replace(
      /`last_updated`: [^\n]*/,
      `\`last_updated\`: ${new Date().toISOString().slice(0, 16).replace('T', ' ')}`
    );

    fs.writeFileSync(PLAN_FILE, plan);
    log(`進度報告已更新至 JOB-138`);
  } catch (err) {
    log(`⚠️  更新報告失敗：${err.message}`);
  }
}

// ─── 主流程 ───────────────────────────────────────────────────────────────────

async function main() {
  ensureDir(LOGS_DIR);
  const startTime = Date.now();

  log('=== Eidos Orchestrator v2（科目級派工）啟動 ===');
  log(`模式：${DRY_RUN ? 'DRY-RUN（只列任務，不執行）' : '正式執行'}`);

  let state = loadState();
  let tasks;

  if (state && state.tasks) {
    tasks = state.tasks;
    log(`從上次進度繼續，共 ${tasks.length} 個科目任務，${tasks.filter(t => t.status === 'pending').length} 個待執行`);
    const recovered = recoverInProgressTasks(tasks);
    if (recovered) saveState({ tasks, startTime: state.startTime || startTime });
  } else {
    log('掃描目錄，建立科目級任務清單...');
    tasks = buildTaskList();
    log(`共找到 ${tasks.length} 個科目任務（跳過 ${tasks.filter(t => t.status === 'skip').length} 個已達標）`);
    saveState({ tasks, startTime });
  }

  let startIdx = 0;
  if (FROM_TASK) {
    startIdx = tasks.findIndex(t => t.id === FROM_TASK);
    if (startIdx === -1) {
      log(`找不到任務 ${FROM_TASK}，從頭開始`);
      startIdx = 0;
    }
  }

  if (DRY_RUN) {
    const pending = tasks.filter(t => t.status === 'pending');
    log(`\n待執行任務清單（${pending.length} 個科目）：`);
    pending.forEach(t => log(`  ${t.id} [${t.type}] - ${t.lessons.length} 課, ${t.totalQuestions} 題`));
    return;
  }

  let jobNumber = getNextJobNumber();
  let completedCount = 0;

  for (let i = startIdx; i < tasks.length; i++) {
    const task = tasks[i];

    if (task.status === 'skip' || task.status === 'done') continue;
    if (task.status === 'failed' && task.retryCount >= MAX_RETRY) continue;
    if (task.status !== 'pending' && task.status !== 'needs_retry') continue;

    task.status = 'in_progress';
    saveState({ tasks, startTime });

    const result = runTask(task, jobNumber);
    task.status = result.status;
    task.result = result;
    jobNumber++;
    completedCount++;

    if (result.status === 'needs_retry' && task.retryCount < MAX_RETRY) {
      task.retryCount++;
      task.status = 'pending';
      log(`${task.id} CQI-P 不足，安排重試（第 ${task.retryCount} 次）`);
    }

    saveState({ tasks, startTime });

    // 每完成 1 個科目更新進度
    if (completedCount % 1 === 0) {
      updatePlanProgress(tasks);
    }
  }

  updatePlanProgress(tasks);
  updateFullReport(tasks, startTime);

  log('=== Orchestrator 執行完畢 ===');
}

main().catch(err => {
  console.error('Orchestrator 執行錯誤：', err);
  process.exit(1);
});
