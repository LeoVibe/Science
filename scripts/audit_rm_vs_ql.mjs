#!/usr/bin/env node
/**
 * audit_rm_vs_ql.mjs — 素材成熟度(RM) vs 題目品質(QL) 矛盾稽核
 *
 * 依據：docs/superpowers/specs/2026-06-16-題庫評估規則v2-課文非必要-design.md
 *
 * 邏輯：遍歷每個題庫(grade/semester/subject/publisher)，逐課讀取 KL4 單課研究檔頭的
 * RM 標記，換算成「素材天花板 QL」。若該庫任一課的題目 quality_level 數字 > 天花板，
 * 即判定為矛盾庫。
 *
 * 重要：
 *  - RM 取自檔頭「研究成熟度」那一行（檔內其他 RM 字樣不算，避免誤判）。
 *  - 單課研究紀錄 + 考古題與討論 兩檔，該課 RM = 兩者較高者。
 *  - 兩檔皆缺/皆無 RM 標記 → 該課素材無法判定(skip)，不臆造 RM0。
 *  - 數學/英語走 KL3 體系，標『另議』不判矛盾。
 *  - 檔名比對一律 NFC 正規化（macOS 檔名為 NFD，否則中文比對 false negative）。
 *
 * 用法：
 *   node scripts/audit_rm_vs_ql.mjs            # 人讀彙總
 *   node scripts/audit_rm_vs_ql.mjs --json     # 機讀 JSON
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const nfc = (s) => s.normalize('NFC');

// ---- 對應表 ----
const GRADES = ['G3', 'G4', 'G5', 'G6'];
const SUBJECTS = ['Chinese', 'SocialStudies', 'Science', 'Math', 'English'];
const SEMS = ['S1', 'S2'];
const PUBLISHERS = ['HanLin', 'KangHsuan', 'NanYi'];

const SUBJECT_CN = {
  Chinese: '國語',
  SocialStudies: '社會',
  Science: '自然',
  Math: '數學',
  English: '英語',
};
const GRADE_CN = { G3: '三', G4: '四', G5: '五', G6: '六' };
const SEM_CN = { S1: '上', S2: '下' };
const PUBLISHER_CN = { HanLin: '翰林', KangHsuan: '康軒', NanYi: '南一' };

// 走 KL3 體系、不判矛盾的科目
const DEFERRED_SUBJECTS = new Set(['Math', 'English']);

// RM → 素材天花板 QL 數字（RM0/RM1→QL1, RM2→QL2, RM3→QL4, RM4→QL4）
const RM_TO_QL_CEILING = { 0: 1, 1: 1, 2: 2, 3: 4, 4: 4 };

// ---- 工具 ----

/**
 * 從 KL4 研究檔讀「成熟度」標註行的 RM 數字；讀不到回 null。
 *
 * 兩種已知格式（survey 2026-06-16）：
 *  - 自然/社會：檔頭「**研究成熟度**：RMn」
 *  - 國語：RC-06 檢核行「單課研究成熟度標註為 RMn」（約第 64 行，故需掃全檔）
 *
 * 一律鎖定含「成熟度」的行再抓 RM，避免誤撈路線圖句（「升級至 RM2」不含成熟度）。
 * 同檔多行皆有時取最大值。
 */
function readHeaderRM(filePath) {
  let text;
  try {
    text = fs.readFileSync(filePath, 'utf8');
  } catch {
    return null;
  }
  let rm = null;
  for (const line of text.split(/\r?\n/)) {
    if (!line.includes('成熟度')) continue;
    const m = line.match(/RM([0-9])/);
    if (m) {
      const v = Number(m[1]);
      if (rm === null || v > rm) rm = v;
    }
  }
  return rm;
}

/** 找某庫某課的 RM：取單課研究紀錄與考古題與討論兩檔檔頭 RM 的較高者；皆無回 null */
function lessonRM(knowledgeDir, gradeCn, semCn, pubCn, lessonNum) {
  if (!fs.existsSync(knowledgeDir)) return null;
  let files;
  try {
    files = fs.readdirSync(knowledgeDir).map(nfc);
  } catch {
    return null;
  }
  // 檔名前綴：KL4_{年中}{學期中}_{版中}_L{n}_
  const prefix = nfc(`KL4_${gradeCn}${semCn}_${pubCn}_L${lessonNum}_`);
  const candidates = files.filter(
    (f) =>
      f.startsWith(prefix) &&
      (f.includes('單課研究紀錄') || f.includes('考古題與討論')) &&
      f.endsWith('.md')
  );
  const rms = [];
  for (const f of candidates) {
    const rm = readHeaderRM(path.join(knowledgeDir, f));
    if (rm !== null) rms.push(rm);
  }
  if (rms.length === 0) return null;
  return Math.max(...rms);
}

/** 讀題庫 JSON 的所有 quality_level 數字 */
function readQuestionQLs(jsonPath) {
  let data;
  try {
    data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  } catch {
    return [];
  }
  const qs = Array.isArray(data) ? data : data.questions || [];
  const qls = [];
  for (const q of qs) {
    const ql = q && q.quality_level;
    if (typeof ql === 'string') {
      const m = ql.match(/QL([0-9])/);
      if (m) qls.push(Number(m[1]));
    }
  }
  return qls;
}

/** 眾數（出現最多的值）；空陣列回 null */
function mode(arr) {
  if (arr.length === 0) return null;
  const count = new Map();
  for (const v of arr) count.set(v, (count.get(v) || 0) + 1);
  let best = null;
  let bestN = -1;
  for (const [v, n] of count) {
    if (n > bestN) {
      best = v;
      bestN = n;
    }
  }
  return best;
}

/** 列出某庫的課級 JSON（排除 _new/manifest/_index/backup） */
function listLessonJsons(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => {
      const n = nfc(f);
      if (!n.endsWith('.json')) return false;
      if (n.endsWith('_new.json')) return false;
      if (n.includes('manifest')) return false;
      if (n.includes('_index')) return false;
      if (n.includes('backup')) return false;
      return /_L\d+\.json$/.test(n);
    })
    .map((f) => path.join(dir, f))
    .sort();
}

/** 從檔名抓 lesson 編號 L{n} */
function lessonNumFromFile(filePath) {
  const m = nfc(path.basename(filePath)).match(/_L(\d+)\.json$/);
  return m ? Number(m[1]) : null;
}

// ---- 主流程 ----

function auditLibrary(grade, semester, subject, publisher) {
  const platformDir = path.join(
    ROOT,
    'question/platform',
    grade,
    subject,
    semester,
    publisher
  );
  const jsons = listLessonJsons(platformDir);
  if (jsons.length === 0) return null; // 無此庫

  const libName = `${grade}_${semester}_${SUBJECT_CN[subject]}_${PUBLISHER_CN[publisher]}`;
  const deferred = DEFERRED_SUBJECTS.has(subject);

  const knowledgeDir = path.join(
    ROOT,
    'knowledge/1_課綱研究',
    SUBJECT_CN[subject],
    `${GRADE_CN[grade]}${SEM_CN[semester]}`,
    PUBLISHER_CN[publisher]
  );

  const allQLs = [];
  const rmValues = []; // 有實證的課級 RM
  let skippedLessons = 0; // 素材無法判定的課數
  const conflicts = []; // {lesson, ql, rm, ceiling}

  for (const jsonPath of jsons) {
    const lessonNum = lessonNumFromFile(jsonPath);
    const qls = readQuestionQLs(jsonPath);
    allQLs.push(...qls);

    if (deferred) continue; // 數學/英語：不判矛盾，但仍統計 QL 眾數

    const rm = lessonNum === null ? null : lessonRM(knowledgeDir, GRADE_CN[grade], SEM_CN[semester], PUBLISHER_CN[publisher], lessonNum);
    if (rm === null) {
      skippedLessons++;
      continue; // 無素材實證 → 不臆造，跳過比對
    }
    rmValues.push(rm);
    const ceiling = RM_TO_QL_CEILING[rm];
    // 逐課比對：題目 QL > 天花板 → 矛盾
    const maxQL = qls.length ? Math.max(...qls) : null;
    if (maxQL !== null && maxQL > ceiling) {
      conflicts.push({ lesson: lessonNum, ql: maxQL, rm, ceiling });
    }
  }

  const qlMode = mode(allQLs);
  let verdict;
  if (deferred) {
    verdict = 'KL3體系·另議';
  } else if (rmValues.length === 0) {
    verdict = '素材無法判定';
  } else if (conflicts.length > 0) {
    verdict = '矛盾';
  } else {
    verdict = '素材足';
  }

  const rmRange =
    rmValues.length === 0
      ? '-'
      : `RM${Math.min(...rmValues)}~RM${Math.max(...rmValues)}`;

  return {
    library: libName,
    grade,
    semester,
    subject,
    publisher,
    lessonCount: jsons.length,
    qlMode: qlMode === null ? null : `QL${qlMode}`,
    rmRange,
    rmValues,
    skippedLessons,
    deferred,
    verdict,
    conflicts,
  };
}

function run() {
  const rows = [];
  for (const grade of GRADES) {
    for (const subject of SUBJECTS) {
      for (const semester of SEMS) {
        for (const publisher of PUBLISHERS) {
          const r = auditLibrary(grade, semester, subject, publisher);
          if (r) rows.push(r);
        }
      }
    }
  }
  return rows;
}

function main() {
  const asJson = process.argv.includes('--json');
  const rows = run();

  const conflictLibs = rows.filter((r) => r.verdict === '矛盾');
  const okLibs = rows.filter((r) => r.verdict === '素材足');
  const deferredLibs = rows.filter((r) => r.verdict === 'KL3體系·另議');
  const undecidableLibs = rows.filter((r) => r.verdict === '素材無法判定');

  if (asJson) {
    process.stdout.write(
      JSON.stringify(
        {
          summary: {
            totalLibraries: rows.length,
            conflict: conflictLibs.length,
            ok: okLibs.length,
            deferred: deferredLibs.length,
            undecidable: undecidableLibs.length,
          },
          conflictLibraries: conflictLibs.map((r) => r.library),
          rows,
        },
        null,
        2
      ) + '\n'
    );
    return;
  }

  // 人讀輸出：每庫一行
  console.log('RM vs QL 稽核（依 2026-06-16 評估規則 v2）\n');
  console.log('庫名 | 課數 | JSON QL眾數 | 素材RM範圍 | 判定');
  console.log('-'.repeat(72));
  for (const r of rows) {
    const note =
      r.verdict === '矛盾'
        ? ` (${r.conflicts.length} 課超標)`
        : r.skippedLessons > 0 && !r.deferred
          ? ` (${r.skippedLessons} 課無素材)`
          : '';
    console.log(
      `${r.library} | ${r.lessonCount} | ${r.qlMode ?? '-'} | ${r.rmRange} | ${r.verdict}${note}`
    );
  }

  console.log('\n' + '='.repeat(72));
  console.log(
    `彙總：總庫 ${rows.length}｜矛盾庫 ${conflictLibs.length}｜素材足 ${okLibs.length}｜另議 ${deferredLibs.length}｜素材無法判定 ${undecidableLibs.length}`
  );

  if (conflictLibs.length > 0) {
    console.log('\n矛盾庫清單：');
    for (const r of conflictLibs) {
      const detail = r.conflicts
        .map((c) => `L${c.lesson}:QL${c.ql}>天花板QL${c.ceiling}(RM${c.rm})`)
        .join(', ');
      console.log(`  - ${r.library} → ${detail}`);
    }
  }
}

main();
