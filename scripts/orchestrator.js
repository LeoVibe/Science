#!/usr/bin/env node
/**
 * Eidos Orchestrator
 * 自動化執行 G3/G4 S2 盲測與補題任務
 *
 * 使用方式：
 *   node scripts/orchestrator.js
 *   node scripts/orchestrator.js --dry-run   (只列出任務，不執行)
 *   node scripts/orchestrator.js --from T045  (從指定任務編號開始)
 *
 * 依賴：claude CLI 已安裝（執行 claude --version 確認）
 */

const { execSync, spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// ─── 設定 ────────────────────────────────────────────────────────────────────

const ROOT = path.resolve(__dirname, '..');
const PLATFORM_DIR = path.join(ROOT, 'question', 'platform');
const JOBS_DIR = path.join(ROOT, 'jobs');
const LOGS_DIR = path.join(ROOT, 'scripts', 'orchestrator-logs');
const PLAN_FILE = path.join(JOBS_DIR, 'JOB-138-PLAN-G3G4-S2-自動化盲測補題計畫.md');
const STATE_FILE = path.join(LOGS_DIR, 'state.json');

const TASK_TIMEOUT_MS = 90 * 60 * 1000; // 90 分鐘 per task
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

// ─── 任務掃描 ─────────────────────────────────────────────────────────────────

function getQuestionCount(jsonPath) {
  const data = readJsonFile(jsonPath);
  if (!data) return 0;
  if (Array.isArray(data)) return data.length;
  if (Array.isArray(data.questions)) return data.questions.length;
  return 0;
}

function findBlindTestReport(grade, subject, publisher, lesson) {
  // 搜尋 jobs/ 下是否有對應的盲測 Report
  const files = fs.readdirSync(JOBS_DIR);
  const keyword = `${grade}.*${subject}.*${publisher}.*${lesson}`;
  const re = new RegExp(keyword, 'i');
  return files.some(f => f.includes('Report') && re.test(f));
}

function buildTaskList() {
  const tasks = [];
  let seq = 1;

  for (const grade of GRADES) {
    for (const subject of SUBJECTS) {
      for (const publisher of PUBLISHERS) {
        const dir = path.join(PLATFORM_DIR, grade, subject, SEMESTER, publisher);
        if (!fs.existsSync(dir)) {
          // 目錄不存在，需要出題
          tasks.push({
            id: `T${String(seq).padStart(3, '0')}`,
            grade, subject, publisher,
            semester: SEMESTER,
            lesson: 'ALL',
            jsonPath: null,
            status: 'pending',
            type: 'question_prod',
            retryCount: 0,
            jobNumber: null,
            result: null,
          });
          seq++;
          continue;
        }

        const files = fs.readdirSync(dir).filter(f => f.endsWith('.json')).sort();

        if (files.length === 0) {
          tasks.push({
            id: `T${String(seq).padStart(3, '0')}`,
            grade, subject, publisher,
            semester: SEMESTER,
            lesson: 'ALL',
            jsonPath: dir,
            status: 'pending',
            type: 'question_prod',
            retryCount: 0,
            jobNumber: null,
            result: null,
          });
          seq++;
          continue;
        }

        for (const file of files) {
          // 只處理課次檔案（L1, L2 ... 格式），跳過 manifest/mismatch 等雜項
          const lessonMatch = file.match(/L(\d+)/i);
          if (!lessonMatch) continue;

          const jsonPath = path.join(dir, file);
          const lesson = `L${lessonMatch[1]}`;
          const count = getQuestionCount(jsonPath);
          const hasBlindTest = findBlindTestReport(grade, subject, publisher, lesson);

          let type;
          if (count < 10) {
            type = 'question_prod';
          } else if (!hasBlindTest) {
            type = 'question_verify';
          } else {
            type = 'skip';
          }

          tasks.push({
            id: `T${String(seq).padStart(3, '0')}`,
            grade, subject, publisher,
            semester: SEMESTER,
            lesson,
            jsonPath,
            questionCount: count,
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
  }

  return tasks;
}

// ─── Prompt 產生 ──────────────────────────────────────────────────────────────

function buildPrompt(task) {
  const target = TARGET_COUNTS[task.subject] || 20;
  const relPath = task.jsonPath
    ? path.relative(ROOT, task.jsonPath)
    : `question/platform/${task.grade}/${task.subject}/${task.semester}/${task.publisher}/`;

  const baseContext = `
你是 Eidos 題庫 Agent。本次任務已獲完整授權，請直接執行完畢，不需要詢問是否繼續，不需要確認。

專案根目錄：${ROOT}
必讀規範（啟動前先讀）：
- docs/README_任務派工準則.md
- question/README_出題與品管準則.md（若為 question_prod）
- question/README_驗證與盲測準則.md（若為 question_verify）
`.trim();

  if (task.type === 'question_prod') {
    return `${baseContext}

任務類型：補題/重產（question_prod）
任務ID：${task.id}
目標：${task.grade} ${task.subject} ${task.semester} ${task.publisher} ${task.lesson}
目標題數：${target} 題
目前題數：${task.questionCount ?? 0} 題
目標品質：CQI-P ≥ 5.5，每題須有 scenario 和 explanation
輸出路徑：${relPath}

完成後，產出結案報告：jobs/JOB-${String(task.jobNumber).padStart(3, '0')}-REPORT.md

報告必須包含：
1. 實際產出題數
2. CQI-P 平均分（每題計算後加總）
3. 異動清單（列出實際寫入的檔案路徑）
4. 遺留問題（若無填「無」）

不詢問，不等待，執行完畢後輸出報告。`;
  }

  if (task.type === 'question_verify') {
    return `${baseContext}

任務類型：盲測驗證（question_verify）
任務ID：${task.id}
目標：${task.grade} ${task.subject} ${task.semester} ${task.publisher} ${task.lesson}
題庫路徑：${relPath}
目前題數：${task.questionCount} 題
盲測標準：Match Rate ≥ 85%，CQI-V 依 README_驗證與盲測準則.md

完成後，產出結案報告：jobs/JOB-${String(task.jobNumber).padStart(3, '0')}-REPORT.md

報告必須包含：
1. Match Rate（百分比，附計算方式）
2. 不通過題目清單（列出題號與原因）
3. CQI-V 平均分
4. 是否建議上架

不詢問，不等待，執行完畢後輸出報告。`;
  }

  return null;
}

// ─── Report 解析（共用）──────────────────────────────────────────────────────

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
        // Report 已存在，直接解析，不重新執行
        const reportContent = fs.readFileSync(reportFile, 'utf8');
        const result = parseReportResult(task, reportContent);
        task.status = result.status;
        task.result = { ...result, recovered: true };
        log(`  ✅ ${task.id} 找到 Report，恢復狀態為 ${result.status}（未重跑）`);
        continue;
      }
    }

    // Report 不存在，代表任務未完成，重置為 pending 重新執行
    task.status = 'pending';
    task.result = null;
    log(`  🔁 ${task.id} 無 Report，重置為 pending，下次將重新執行`);
  }

  return true;
}

// ─── 執行單一任務 ─────────────────────────────────────────────────────────────

function runTask(task, jobNumber) {
  task.jobNumber = jobNumber;
  const prompt = buildPrompt(task);
  if (!prompt) return { status: 'skip', reason: '任務類型為 skip' };

  if (DRY_RUN) {
    log(`[DRY-RUN] 跳過執行 ${task.id}`);
    return { status: 'done', reason: 'dry-run' };
  }

  // 呼叫 claude CLI，直接傳遞 prompt（不生成派工單文件）
  const reportFile = path.join(JOBS_DIR, `JOB-${String(jobNumber).padStart(3, '0')}-REPORT.md`);
  const startTime = Date.now();

  log(`執行 ${task.id}：${task.grade} ${task.subject} ${task.publisher} ${task.lesson} (${task.type})`);

  try {
    const spawnResult = spawnSync(
      'claude',
      ['--print', prompt],
      {
        cwd: ROOT,
        timeout: TASK_TIMEOUT_MS,
        encoding: 'utf8',
        maxBuffer: 10 * 1024 * 1024,
      }
    );

    const elapsed = Math.round((Date.now() - startTime) / 1000 / 60);

    if (spawnResult.status !== 0 || spawnResult.error) {
      log(`❌ ${task.id} 執行失敗：${spawnResult.error?.message || 'exit code ' + spawnResult.status}`);
      return { status: 'failed', reason: spawnResult.stderr || spawnResult.error?.message, elapsed };
    }

    // 確認 Report 是否存在
    if (!fs.existsSync(reportFile)) {
      log(`❌ ${task.id} Report 未產出`);
      return { status: 'failed', reason: 'Report 檔案未產出', elapsed };
    }

    // 從 Report 讀取結果
    const reportContent = fs.readFileSync(reportFile, 'utf8');
    const result = parseReportResult(task, reportContent);

    log(`✅ ${task.id} 完成（${elapsed} 分鐘）${result.cqi ? ` CQI-P: ${result.cqi}` : ''}${result.matchRate ? ` Match Rate: ${result.matchRate}%` : ''}`);

    // needs_retry 是 question_prod 專屬，其他情況直接回傳
    return { ...result, elapsed };

  } catch (err) {
    log(`❌ ${task.id} 例外：${err.message}`);
    return { status: 'failed', reason: err.message };
  }
}

// ─── 進度更新 ─────────────────────────────────────────────────────────────────

function buildProgressTables(tasks) {
  // 按年級、科目、版本分組統計進度
  const tables = { G3: {}, G4: {} };

  for (const grade of GRADES) {
    for (const subject of SUBJECTS) {
      const row = {};
      for (const publisher of PUBLISHERS) {
        const gradeSubjectTasks = tasks.filter(
          t => t.grade === grade && t.subject === subject && t.publisher === publisher
        );
        const done = gradeSubjectTasks.filter(t => t.status === 'done').length;
        const total = gradeSubjectTasks.length;
        row[publisher] = `${done}/${total} done`;
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

  // 更新 PLAN 檔中的進度摘要與表格
  try {
    let plan = fs.readFileSync(PLAN_FILE, 'utf8');

    // 更新整體進度
    plan = plan.replace(
      /進度：.*完成.*/,
      `進度：${completed} / ${total} 完成 | done: ${counts.done} | needs_rework: ${counts.needs_rework} | failed: ${counts.failed} | skip: ${counts.skip}`
    );

    // 更新進度表格
    const tables = buildProgressTables(tasks);

    // 建立 G3 表格
    let g3Table = `| 科目 | HanLin | KangHsuan | NanYi | 小計 |\n|---|---|---|---|---|\n`;
    let g3Total = 0;
    for (const subject of SUBJECTS) {
      const row = tables.G3[subject];
      const subTotal = SUBJECTS.includes(subject) ?
        (tasks.filter(t => t.grade === 'G3' && t.subject === subject && t.status === 'done').length) : 0;
      g3Total += subTotal;
      g3Table += `| ${subject} | ${row.HanLin} | ${row.KangHsuan} | ${row.NanYi} | ${subTotal}/${SUBJECTS.length * PUBLISHERS.length} |\n`;
    }
    g3Table += `| **G3 小計** | **0/60** | **0/60** | **0/60** | **${g3Total}/${tasks.filter(t => t.grade === 'G3').length}** |`;

    plan = plan.replace(
      /## G3 S2 各科進度[\s\S]*?## G4 S2 各科進度/,
      `## G3 S2 各科進度\n\n${g3Table}\n\n---\n\n## G4 S2 各科進度`
    );

    fs.writeFileSync(PLAN_FILE, plan);
  } catch (err) {
    log(`⚠️  更新進度表失敗：${err.message}`);
  }
}

// ─── 總報告 ───────────────────────────────────────────────────────────────────

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
      : reworkTasks.map(t => `- ${t.id}：${t.grade} ${t.subject} ${t.publisher} ${t.lesson}（Match Rate: ${t.result?.matchRate ?? '-'}%）`).join('\n');

    plan = plan.replace(
      /## 需返工清單（Match Rate < 85%）\n\n[^\n]*\n\n/,
      `## 需返工清單（Match Rate < 85%）\n\n${reworkList}\n\n`
    );

    // 更新失敗清單
    const failedList = failedTasks.length === 0
      ? '目前無。'
      : failedTasks.map(t => `- ${t.id}：${t.grade} ${t.subject} ${t.publisher} ${t.lesson}（原因：${t.result?.reason ?? '未知'}）`).join('\n');

    plan = plan.replace(
      /## 失敗清單\n\n[^\n]*\n\n/,
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

  log('=== Eidos Orchestrator 啟動 ===');
  log(`模式：${DRY_RUN ? 'DRY-RUN（只列任務，不執行）' : '正式執行'}`);

  // 載入或建立狀態
  let state = loadState();
  let tasks;

  if (state && state.tasks) {
    tasks = state.tasks;
    log(`從上次進度繼續，共 ${tasks.length} 個任務，${tasks.filter(t => t.status === 'pending').length} 個待執行`);
    const recovered = recoverInProgressTasks(tasks);
    if (recovered) saveState({ tasks, startTime: state.startTime || startTime });
  } else {
    log('掃描目錄，建立任務清單...');
    tasks = buildTaskList();
    log(`共找到 ${tasks.length} 個任務（跳過 ${tasks.filter(t => t.status === 'skip').length} 個已達標）`);
    saveState({ tasks, startTime });
  }

  // 從指定任務開始
  let startIdx = 0;
  if (FROM_TASK) {
    startIdx = tasks.findIndex(t => t.id === FROM_TASK);
    if (startIdx === -1) {
      log(`找不到任務 ${FROM_TASK}，從頭開始`);
      startIdx = 0;
    }
  }

  // 列出任務清單（dry-run 或正式執行前）
  if (DRY_RUN) {
    const pending = tasks.filter(t => t.status === 'pending');
    log(`\n待執行任務清單（${pending.length} 個）：`);
    pending.forEach(t => log(`  ${t.id} ${t.grade} ${t.subject} ${t.publisher} ${t.lesson} [${t.type}]`));
    return;
  }

  // 執行任務
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

    // needs_retry：排到末端重試一次
    if (result.status === 'needs_retry' && task.retryCount < MAX_RETRY) {
      task.retryCount++;
      task.status = 'pending';
      log(`${task.id} CQI-P 不足，安排重試（第 ${task.retryCount} 次）`);
    }

    saveState({ tasks, startTime });

    // 每 10 個更新進度
    if (completedCount % 10 === 0) {
      updatePlanProgress(tasks);
    }
  }

  // 最終進度
  updatePlanProgress(tasks);
  updateFullReport(tasks, startTime);

  log('=== Orchestrator 執行完畢 ===');
}

main().catch(err => {
  console.error('Orchestrator 執行錯誤：', err);
  process.exit(1);
});
