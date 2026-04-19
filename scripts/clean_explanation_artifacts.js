/**
 * clean_explanation_artifacts.js
 * JOB-191 — explanation 欄位元評論清除
 *
 * 輸入：docs/研究紀錄/explanation_元評論_關鍵字掃描.json（JOB-190 Phase 2 產出）
 * 輸出：修改 question/platform/ 下對應題目的 explanation 欄位
 *
 * 安全機制：
 * --dry-run  只輸出預覽，不寫入任何檔案
 * 清除後剩餘 < 10 字 → 標記 review_needed: true，不留空，不寫入
 */

const fs = require('fs');
const path = require('path');

const DRY_RUN = process.argv.includes('--dry-run');
const ROOT = path.join(__dirname, '..');
const SCAN_JSON = path.join(ROOT, 'docs', '研究紀錄', 'explanation_元評論_關鍵字掃描.json');
const LOGS_DIR = path.join(ROOT, 'logs');

if (!fs.existsSync(LOGS_DIR)) fs.mkdirSync(LOGS_DIR, { recursive: true });

// ─── 清除規則（sentence-level 正規表達式） ────────────────────────────────────
// 每條規則移除「命中句」，保留同段落其他句子
const REMOVAL_PATTERNS = [
  // 閱讀策略 4 句套組（G3 國語，通常連續出現）
  /可回到課文關鍵段落[^。！？\n]*/g,
  /將四個選項逐一對照文本線索[^；。！？\n]*/g,
  /正解與課文敘述一致[^；。！？\n]*/g,
  /其餘選項多為字面誤讀[^。！？\n]*/g,
  // 選項設計元評論
  /正確選項陳述符合[^；。！？\n]*/g,
  /其餘選項(?:混淆|誤解|帶有迷思|錯置|含有迷思)[^。！？\n]*/g,
  /而在選項設計中[^。！？\n]*/g,
  // 出題意圖元評論（精確句型，不含一般教育敘述）
  /此題(?:旨在|引導)[^。！？\n]*/g,
  /引導學生進行批判性思考[^。！？\n]*/g,
  // AI 自我評分
  /高品質命題[^。！？\n]*/g,
  // 截斷殘留：「選項X為正解/正確」（行首）
  /^\[?選項\s*[A-Da-d]\]?\s*為?正(?:解|確)[^。！？\n]*/mg,
  // 注意：不加 /批判性思考/ 獨立 pattern，避免誤刪教育內容
];

// 清除後做二次清理：多餘標點、空白、孤立分號
function cleanupPunctuation(text) {
  return text
    .replace(/；\s*；/g, '；')
    .replace(/，\s*；/g, '；')
    .replace(/；\s*。/g, '。')
    .replace(/^\s*[；，、]\s*/gm, '')
    // 清除殘留的孤立句點（前面沒有文字的 。）
    .replace(/\s+。/g, '。')
    .replace(/^。\s*/gm, '')
    // 清除末尾殘留的標點
    .replace(/[；，、]\s*$/g, '')
    .replace(/\s{2,}/g, ' ')
    .replace(/\n{2,}/g, '\n')
    .trim();
}

function cleanExplanation(explanation) {
  let cleaned = explanation;
  for (const pat of REMOVAL_PATTERNS) {
    cleaned = cleaned.replace(pat, '');
  }
  cleaned = cleanupPunctuation(cleaned);
  return cleaned;
}

// ─── 主流程 ───────────────────────────────────────────────────────────────────
const scanData = JSON.parse(fs.readFileSync(SCAN_JSON, 'utf8'));
const hits = scanData.hits;

// 按檔案分組
const byFile = {};
for (const hit of hits) {
  if (!byFile[hit.file]) byFile[hit.file] = [];
  byFile[hit.file].push(hit);
}

const log = {
  run_at: new Date().toISOString(),
  dry_run: DRY_RUN,
  files_processed: 0,
  questions_cleaned: 0,
  questions_review_needed: 0,
  questions_unchanged: 0,
  details: [],
};

let totalCleaned = 0, totalReview = 0, totalUnchanged = 0;

for (const [relPath, fileHits] of Object.entries(byFile)) {
  const absPath = path.join(ROOT, relPath);
  if (!fs.existsSync(absPath)) {
    console.warn(`[SKIP] 檔案不存在：${relPath}`);
    continue;
  }

  const raw = JSON.parse(fs.readFileSync(absPath, 'utf8'));
  const questions = Array.isArray(raw) ? raw : (raw.questions || []);
  if (!questions.length) continue;

  // 收集此檔案所有需要清除的題號（去重）
  const qIndexSet = new Set(fileHits.map(h => h.question_index));
  let fileModified = false;

  for (const qIdx of qIndexSet) {
    const q = questions[qIdx];
    if (!q || !q.explanation) continue;

    const original = q.explanation;
    const cleaned = cleanExplanation(original);

    if (cleaned === original) {
      totalUnchanged++;
      log.details.push({ file: relPath, q: qIdx + 1, status: 'unchanged' });
      continue;
    }

    if (cleaned.length < 5) {
      // 清除後內容過短 → 標記 review_needed，不修改 explanation
      if (!DRY_RUN) {
        q.review_needed = true;
        q.review_notes = (q.review_notes || '') + ' [JOB-191: explanation 清除後過短，需人工補寫]';
      }
      totalReview++;
      log.details.push({
        file: relPath, q: qIdx + 1, status: 'review_needed',
        original: original.slice(0, 80), cleaned_preview: cleaned,
      });
      console.log(`[REVIEW] ${relPath} #${qIdx + 1} → 清除後剩 ${cleaned.length} 字，標記 review_needed`);
      fileModified = true;
    } else {
      if (!DRY_RUN) {
        q.explanation = cleaned;
      }
      totalCleaned++;
      fileModified = true;
      log.details.push({
        file: relPath, q: qIdx + 1, status: 'cleaned',
        original_len: original.length, cleaned_len: cleaned.length,
        removed_chars: original.length - cleaned.length,
      });
      if (DRY_RUN) {
        console.log(`[DRY] ${relPath} #${qIdx + 1} | ${original.length}→${cleaned.length} 字`);
        console.log(`  原始：${original.slice(0, 100)}`);
        console.log(`  清後：${cleaned.slice(0, 100)}`);
      }
    }
  }

  if (fileModified && !DRY_RUN) {
    const output = Array.isArray(raw) ? questions : { ...raw, questions };
    fs.writeFileSync(absPath, JSON.stringify(output, null, 2), 'utf8');
    log.files_processed++;
  } else if (fileModified) {
    log.files_processed++;
  }
}

log.questions_cleaned = totalCleaned;
log.questions_review_needed = totalReview;
log.questions_unchanged = totalUnchanged;

// ─── 寫入執行紀錄 ─────────────────────────────────────────────────────────────
if (!DRY_RUN) {
  const ts = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const logPath = path.join(LOGS_DIR, `clean_explanation_${ts}.json`);
  fs.writeFileSync(logPath, JSON.stringify(log, null, 2), 'utf8');
  console.log(`\n紀錄寫入：${logPath}`);
}

// ─── 終端摘要 ─────────────────────────────────────────────────────────────────
console.log(`\n=== JOB-191 explanation 清除${DRY_RUN ? '（DRY RUN）' : ''} ===`);
console.log(`處理檔案：${log.files_processed} 個`);
console.log(`成功清除：${totalCleaned} 題`);
console.log(`需人工補寫（review_needed）：${totalReview} 題`);
console.log(`無變化（pattern 未命中）：${totalUnchanged} 題`);
if (DRY_RUN) console.log('\n⚠️  DRY RUN 模式，未寫入任何檔案。確認無誤後移除 --dry-run 執行。');
