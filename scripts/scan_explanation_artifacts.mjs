/**
 * scan_explanation_artifacts.mjs
 * JOB-190 Phase 2 — explanation 欄位元評論關鍵字深度掃描
 *
 * 設計原則：
 * - 不依賴頻率統計，以正規表達式主動偵測已知元評論句型
 * - 零寫入：只讀取，不修改任何 question/platform/ 檔案
 * - 輸出逐題命中清單，供 JOB-191 清除腳本直接引用
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, relative, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const PLATFORM_DIR = join(ROOT, 'question', 'platform');
const OUTPUT_DIR = join(ROOT, 'docs', '研究紀錄');

// ─── 關鍵字清單（12 類） ─────────────────────────────────────────────────────
const PATTERNS = [
  {
    type: 'AI自我評分',
    label: 'AI自我評分詞彙',
    regex: /高品質命題/,
  },
  {
    type: '元評論—出題意圖',
    label: '此題旨在／此題引導',
    regex: /此題(?:旨在|引導)/,
  },
  {
    type: '元評論—出題意圖',
    label: '引導學生進行批判性思考',
    regex: /引導學生進行批判性思考/,
  },
  {
    type: '元評論—選項設計',
    label: '正確選項陳述符合',
    regex: /正確選項陳述符合/,
  },
  {
    type: '元評論—選項設計',
    label: '其餘選項混淆／誤解／迷思／錯置',
    regex: /其餘選項.*(?:混淆|誤解|迷思|錯置)/,
  },
  {
    type: '元評論—選項設計',
    label: '而在選項設計中',
    regex: /而在選項設計中/,
  },
  {
    type: '元評論—閱讀策略',
    label: '可回到課文關鍵段落',
    regex: /可回到課文關鍵段落/,
  },
  {
    type: '元評論—閱讀策略',
    label: '將四個選項逐一對照文本線索',
    regex: /將四個選項逐一對照文本線索/,
  },
  {
    type: '元評論—閱讀策略',
    label: '正解與課文敘述一致',
    regex: /正解與課文敘述一致/,
  },
  {
    type: '元評論—閱讀策略',
    label: '其餘選項多為字面誤讀',
    regex: /其餘選項多為字面誤讀/,
  },
  {
    type: '截斷殘留',
    label: '「選項X」為正解／正確',
    regex: /^\[?選項\s*[A-Da-d]\]?\s*為?正(?:解|確)/m,
  },
  {
    type: '批判性思考標籤',
    label: '批判性思考（分類標籤混入解析）',
    regex: /批判性思考/,
  },
];

// ─── 遞迴列出所有 JSON ────────────────────────────────────────────────────────
function listJsonFiles(dir) {
  const results = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      results.push(...listJsonFiles(full));
    } else if (
      entry.endsWith('.json') &&
      !entry.includes('manifest') &&
      !entry.includes('BACKUP') &&
      !entry.includes('backup')
    ) {
      results.push(full);
    }
  }
  return results;
}

// ─── 主掃描邏輯 ───────────────────────────────────────────────────────────────
const hits = [];          // 逐題命中紀錄
const typeStats = {};     // 各 type 命中數
const labelStats = {};    // 各 label 命中數
PATTERNS.forEach(p => {
  typeStats[p.type] = (typeStats[p.type] || 0);
  labelStats[p.label] = 0;
});

const files = listJsonFiles(PLATFORM_DIR);
let scannedFiles = 0;
let scannedQuestions = 0;

for (const filePath of files) {
  let raw;
  try {
    raw = JSON.parse(readFileSync(filePath, 'utf8'));
  } catch {
    continue;
  }
  const questions = Array.isArray(raw) ? raw : (raw.questions || []);
  if (!questions.length) continue;

  scannedFiles++;
  const relPath = relative(ROOT, filePath);
  // 從路徑解析科目標籤，例如 G4/Science/S2/NanYi
  const pathParts = relPath.replace('question/platform/', '').split('/');
  const subject = pathParts.slice(0, 3).join('/'); // G4/Science/S2

  questions.forEach((q, idx) => {
    scannedQuestions++;
    const explanation = q.explanation || '';
    if (!explanation) return;

    for (const pat of PATTERNS) {
      if (pat.regex.test(explanation)) {
        // 找出命中的完整句子（以。！？換行分割）
        const sentences = explanation.split(/[。！？\n]/).filter(s => s.trim().length > 0);
        const matchedSentences = sentences.filter(s => pat.regex.test(s));

        hits.push({
          file: relPath,
          subject,
          question_index: idx,
          question_preview: (q.question || '').slice(0, 40),
          matched_type: pat.type,
          matched_label: pat.label,
          matched_sentences: matchedSentences,
          full_explanation: explanation,
        });

        typeStats[pat.type] = (typeStats[pat.type] || 0) + 1;
        labelStats[pat.label] = (labelStats[pat.label] || 0) + 1;
        // 同一題可能命中多個 pattern，繼續掃
      }
    }
  });
}

// 命中題目去重（同一題可能被多個 pattern 命中）
const uniqueQuestions = new Set(hits.map(h => `${h.file}::${h.question_index}`)).size;

// ─── 輸出 JSON ────────────────────────────────────────────────────────────────
const jsonOutput = {
  meta: {
    generated_at: new Date().toISOString(),
    scanned_files: scannedFiles,
    scanned_questions: scannedQuestions,
    total_hits: hits.length,
    unique_questions_with_hits: uniqueQuestions,
    patterns_count: PATTERNS.length,
  },
  type_stats: typeStats,
  label_stats: labelStats,
  hits,
};

writeFileSync(
  join(OUTPUT_DIR, 'explanation_元評論_關鍵字掃描.json'),
  JSON.stringify(jsonOutput, null, 2),
  'utf8'
);

// ─── 輸出 MD ──────────────────────────────────────────────────────────────────
const today = new Date().toISOString().slice(0, 10);

// 按 type 分組
const byType = {};
for (const h of hits) {
  if (!byType[h.matched_type]) byType[h.matched_type] = [];
  byType[h.matched_type].push(h);
}

// 按 subject 統計
const bySubject = {};
for (const h of hits) {
  bySubject[h.subject] = (bySubject[h.subject] || 0) + 1;
}
const subjectRanking = Object.entries(bySubject)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 20);

let md = `# explanation 欄位元評論關鍵字掃描報告

\`last_updated\`: ${today}
\`generated_by\`: scripts/scan_explanation_artifacts.mjs（JOB-190 Phase 2）

## 掃描摘要

| 指標 | 數值 |
|:--|:--|
| 掃描 JSON 檔數 | ${scannedFiles} 個 |
| 掃描題目總數 | ${scannedQuestions} 題 |
| 命中紀錄總數 | ${hits.length} 筆（含同一題多 pattern 命中） |
| 命中不重複題數 | ${uniqueQuestions} 題 |
| 掃描 pattern 數 | ${PATTERNS.length} 類 |

---

## 各類型命中統計

| 類型 | 命中筆數 |
|:--|--:|
${Object.entries(typeStats)
  .sort((a, b) => b[1] - a[1])
  .map(([t, n]) => `| ${t} | ${n} |`)
  .join('\n')}

---

## 各 Pattern 命中統計

| Pattern 標籤 | 命中筆數 |
|:--|--:|
${Object.entries(labelStats)
  .sort((a, b) => b[1] - a[1])
  .map(([l, n]) => `| ${l} | ${n} |`)
  .join('\n')}

---

## 科目命中 Top 20

| 科目路徑 | 命中筆數 |
|:--|--:|
${subjectRanking.map(([s, n]) => `| ${s} | ${n} |`).join('\n')}

---

`;

// 各類型詳細清單
for (const [type, typeHits] of Object.entries(byType).sort((a, b) => b[1].length - a[1].length)) {
  // 按 label 子分組
  const byLabel = {};
  for (const h of typeHits) {
    if (!byLabel[h.matched_label]) byLabel[h.matched_label] = [];
    byLabel[h.matched_label].push(h);
  }

  md += `## ${type}（${typeHits.length} 筆）\n\n`;

  for (const [label, labelHits] of Object.entries(byLabel).sort((a, b) => b[1].length - a[1].length)) {
    md += `### ${label}（${labelHits.length} 筆）\n\n`;
    md += `| 檔案 | 題號 | 題幹預覽 | 命中句 |\n|:--|:--|:--|:--|\n`;
    for (const h of labelHits.slice(0, 30)) {
      const sentences = h.matched_sentences.map(s => s.trim()).join('；').slice(0, 60);
      md += `| ${h.file.replace('question/platform/', '')} | #${h.question_index + 1} | ${h.question_preview.replace(/\|/g, '｜')} | ${sentences.replace(/\|/g, '｜')} |\n`;
    }
    if (labelHits.length > 30) {
      md += `\n> 僅顯示前 30 筆，完整清單見 JSON。\n`;
    }
    md += '\n';
  }
}

writeFileSync(
  join(OUTPUT_DIR, 'explanation_元評論_關鍵字掃描.md'),
  md,
  'utf8'
);

// ─── 終端摘要 ─────────────────────────────────────────────────────────────────
console.log('\n=== JOB-190 Phase 2 — explanation 元評論關鍵字掃描完成 ===\n');
console.log(`掃描 JSON 檔：${scannedFiles} 個`);
console.log(`掃描題目：${scannedQuestions} 題`);
console.log(`命中紀錄：${hits.length} 筆`);
console.log(`命中不重複題數：${uniqueQuestions} 題\n`);
console.log('各類型命中：');
Object.entries(typeStats)
  .sort((a, b) => b[1] - a[1])
  .forEach(([t, n]) => console.log(`  ${t}：${n} 筆`));
console.log('\n各 Pattern 命中：');
Object.entries(labelStats)
  .sort((a, b) => b[1] - a[1])
  .forEach(([l, n]) => console.log(`  ${l}：${n} 筆`));
console.log('\n輸出：');
console.log('  docs/研究紀錄/explanation_元評論_關鍵字掃描.md');
console.log('  docs/研究紀錄/explanation_元評論_關鍵字掃描.json');
