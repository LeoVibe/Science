# 全科題庫三欄位高頻片段分析 — 實作計畫

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.
>
> **本專案執行方式**：由 Cursor 讀取此派工單執行。Claude Code 為 PM，Cursor 為執行者。
> **派工單正本位置**：`jobs/JOB-[NNN]-AG-*.md`（由 Claude Code 建立後才啟動）

**Goal:** 全庫掃描 `question` / `scenario` / `explanation` 三個欄位，輸出各欄位高頻片段排行榜（含分科子榜），供後續 JOB 制定清除規則使用。

**Architecture:** 單一 Node.js ESM 腳本遞迴遍歷所有題庫 JSON，以句號+逗號雙重分割各欄位文字，各欄位獨立計頻，輸出 `.md`（人工審視）與 `.json`（機讀）兩份報告。零寫入題庫。

**Tech Stack:** Node.js ESM (`.mjs`)、`fs`、`path`、參考 `scripts/analyze_chinese_question_bank_comma_segments.mjs`

**Spec 位置:** `docs/superpowers/specs/2026-04-15-field-segment-analysis-design.md`

---

## 檔案結構

| 動作 | 路徑 | 職責 |
|:--|:--|:--|
| 新建 | `scripts/analyze_field_segments.mjs` | 主腳本：掃描、計頻、輸出 |
| 新建 | `docs/研究紀錄/全科題庫_三欄位_高頻片段分析.md` | 人工審視報告（由腳本產出） |
| 新建 | `docs/研究紀錄/全科題庫_三欄位_高頻片段分析.json` | 機讀完整計數（由腳本產出） |

---

## JOB-128 舊案清單（36 個，供腳本內嵌「舊案對照」用）

```js
const JOB128_PHRASES = [
  '如果你有仔細閱讀課文的話，應該可以發現這個微小的細節',
  '作者透過深刻的細節描寫與情感連結，引發讀者對於自然或生命的共鳴，進而傳達出守護與珍惜的核心價值感',
  '作者認為這些問題都太過複雜，所以選擇用一種避重就輕的方式來描述，讓讀者自己去猜測其中的含義',
  '作者純粹是為了滿足出版商的要求，所以才刻意挑選了這個主題',
  '作者僅僅是為了增加文章的篇幅，所以在文中加入了大量無關緊要的修辭',
  '這種想法在日常生活中其實也是非常常見的一種自然現象',
  '。，並且需要經過深思熟慮的考量。',
  '，並且需要經過深思熟慮的考量。',
  '並且需要經過深思熟慮的考量。',
  '並且需要經過深思熟慮的考量',
  '請你仔細回想並且針對這篇文章的內容細節進行思考，',
  '請你仔細回想並且針對這篇文章的內容細節進行思考',
  '不過這點很容易讓許多小朋友在閱讀時產生誤解',
  '這點在文章細節中可以發現',
  '呈現出文中描述的氣氛',
  '這在分析文章時非常關鍵',
  '如果你有仔細閱讀課文的話',
  '如果你有仔細閱讀課文',
  '這種想法在日常生活中其實也是非常常見',
  '文中並沒有任何真實的情感流露在內',
  '所以才刻意挑選了這個主題',
  '作者純粹是為了滿足出版商的要求',
  '讓讀者自己去猜測其中的含義',
  '所以選擇用一種避重就輕的方式來描述',
  '作者認為這些問題都太過複雜',
  '實際上並沒有什麼特別的思想',
  '所以在文中加入了大量無關緊要的修辭',
  '作者僅僅是為了增加文章的篇幅',
  '小明在餐桌上分享學校發生的趣事',
  '小明在餐桌上看到媽媽辛苦煮了一桌菜',
  '，且內容敘述完整',
  '且內容敘述完整',
  '，這也是作者想強調的重點之一。',
  '這也是作者想強調的重點之一。',
  '，這點在實務上很重要。',
  '這點在實務上很重要。',
];
```

---

## Task 1：建立腳本骨架 + 參數解析 + 檔案遍歷

**Files:**
- Create: `scripts/analyze_field_segments.mjs`

- [ ] **Step 1：建立腳本骨架**

建立 `scripts/analyze_field_segments.mjs`，內容如下：

```js
#!/usr/bin/env node
/**
 * analyze_field_segments.mjs
 *
 * 全科題庫三欄位（question / scenario / explanation）高頻片段分析
 * 以句號+逗號雙重分割，各欄位獨立計頻，輸出分科子榜與跨科總榜。
 *
 * 用法：
 *   node scripts/analyze_field_segments.mjs
 *   node scripts/analyze_field_segments.mjs --min-freq 10 --top 50
 *
 * 產出：
 *   docs/研究紀錄/全科題庫_三欄位_高頻片段分析.md
 *   docs/研究紀錄/全科題庫_三欄位_高頻片段分析.json
 *
 * last_updated: 2026-04-15
 * updated_by: Cursor Agent (JOB-[NNN])
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');

// ── 參數解析 ──────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const getArg = (flag, def) => {
  const i = args.indexOf(flag);
  return i !== -1 && args[i + 1] ? args[i + 1] : def;
};
const MIN_FREQ = parseInt(getArg('--min-freq', '5'), 10);
const TOP_N = parseInt(getArg('--top', '100'), 10);

const OUT_MD = path.join(repoRoot, 'docs/研究紀錄/全科題庫_三欄位_高頻片段分析.md');
const OUT_JSON = path.join(repoRoot, 'docs/研究紀錄/全科題庫_三欄位_高頻片段分析.json');

// ── 欄位設定 ──────────────────────────────────────────────────────────────
const TARGET_FIELDS = ['question', 'scenario', 'explanation'];

// ── 切割規則 ──────────────────────────────────────────────────────────────
const SPLIT_RE = /[。，,！？；]/;

// ── 片段過濾 ──────────────────────────────────────────────────────────────
const MIN_LEN = 4;
const MAX_LEN = 30;
const PURE_NUMBER = /^\d+$/;
const PURE_LATIN = /^[a-zA-Z0-9\s]+$/;

function splitSegments(text) {
  if (typeof text !== 'string' || !text.trim()) return [];
  return text
    .split(SPLIT_RE)
    .map((s) => s.replace(/\s+/g, ' ').trim())
    .filter((s) => {
      if (s.length < MIN_LEN || s.length > MAX_LEN) return false;
      if (PURE_NUMBER.test(s)) return false;
      if (PURE_LATIN.test(s)) return false;
      return true;
    });
}

main();
```

- [ ] **Step 2：新增遞迴檔案遍歷函式**

在 `main()` 之前加入：

```js
// ── JOB-128 舊案清單（36 個）──────────────────────────────────────────────
const JOB128_PHRASES = [
  '如果你有仔細閱讀課文的話，應該可以發現這個微小的細節',
  '作者透過深刻的細節描寫與情感連結，引發讀者對於自然或生命的共鳴，進而傳達出守護與珍惜的核心價值感',
  '作者認為這些問題都太過複雜，所以選擇用一種避重就輕的方式來描述，讓讀者自己去猜測其中的含義',
  '作者純粹是為了滿足出版商的要求，所以才刻意挑選了這個主題',
  '作者僅僅是為了增加文章的篇幅，所以在文中加入了大量無關緊要的修辭',
  '這種想法在日常生活中其實也是非常常見的一種自然現象',
  '。，並且需要經過深思熟慮的考量。',
  '，並且需要經過深思熟慮的考量。',
  '並且需要經過深思熟慮的考量。',
  '並且需要經過深思熟慮的考量',
  '請你仔細回想並且針對這篇文章的內容細節進行思考，',
  '請你仔細回想並且針對這篇文章的內容細節進行思考',
  '不過這點很容易讓許多小朋友在閱讀時產生誤解',
  '這點在文章細節中可以發現',
  '呈現出文中描述的氣氛',
  '這在分析文章時非常關鍵',
  '如果你有仔細閱讀課文的話',
  '如果你有仔細閱讀課文',
  '這種想法在日常生活中其實也是非常常見',
  '文中並沒有任何真實的情感流露在內',
  '所以才刻意挑選了這個主題',
  '作者純粹是為了滿足出版商的要求',
  '讓讀者自己去猜測其中的含義',
  '所以選擇用一種避重就輕的方式來描述',
  '作者認為這些問題都太過複雜',
  '實際上並沒有什麼特別的思想',
  '所以在文中加入了大量無關緊要的修辭',
  '作者僅僅是為了增加文章的篇幅',
  '小明在餐桌上分享學校發生的趣事',
  '小明在餐桌上看到媽媽辛苦煮了一桌菜',
  '，且內容敘述完整',
  '且內容敘述完整',
  '，這也是作者想強調的重點之一。',
  '這也是作者想強調的重點之一。',
  '，這點在實務上很重要。',
  '這點在實務上很重要。',
];

// ── 檔案遍歷 ──────────────────────────────────────────────────────────────
const EXCLUDE = ['manifest', 'mismatch', 'catalog', 'backup', 'libraryStats'];

function isQuestionFile(fname) {
  if (!fname.endsWith('.json')) return false;
  return !EXCLUDE.some((kw) => fname.includes(kw));
}

function walkAllBankJson(root) {
  const out = [];
  const platformDir = path.join(root, 'question/platform');
  if (!fs.existsSync(platformDir)) return out;

  function recurse(dir) {
    for (const entry of fs.readdirSync(dir)) {
      const full = path.join(dir, entry);
      const stat = fs.statSync(full);
      if (stat.isDirectory()) {
        recurse(full);
      } else if (isQuestionFile(entry)) {
        out.push(full);
      }
    }
  }
  recurse(platformDir);
  return out;
}
```

- [ ] **Step 3：確認語法無誤**

```bash
node --input-type=module < scripts/analyze_field_segments.mjs 2>&1 | head -5
```

預期：只有「欄位資料尚未統計」或直接完成（main() 目前是空的）。若有 SyntaxError 則修正。

---

## Task 2：實作計頻核心邏輯

**Files:**
- Modify: `scripts/analyze_field_segments.mjs`

- [ ] **Step 1：實作 main() 計頻邏輯**

將 `main()` 替換為以下完整實作：

```js
function main() {
  const files = walkAllBankJson(repoRoot);
  console.log(`掃描 ${files.length} 個題庫 JSON...`);

  // 結構：fieldMaps[fieldName] = Map<segment, { total: number, bySubject: Map<subjectKey, number> }>
  /** @type {Map<string, Map<string, { total: number, bySubject: Map<string, number> }>>} */
  const fieldMaps = new Map(TARGET_FIELDS.map((f) => [f, new Map()]));
  const fieldTotals = new Map(TARGET_FIELDS.map((f) => [f, 0])); // 各欄位有效片段總數
  let questionCount = 0;
  let fileCount = 0;

  // JOB-128 舊案殘留計數：phrase -> { field -> count }
  const legacyHits = new Map(
    JOB128_PHRASES.map((p) => [p, new Map(TARGET_FIELDS.map((f) => [f, 0]))])
  );

  for (const fp of files) {
    let j;
    try {
      j = JSON.parse(fs.readFileSync(fp, 'utf8'));
    } catch {
      continue;
    }
    const qs = j.questions;
    if (!Array.isArray(qs) || qs.length === 0) continue;
    fileCount++;

    // 從路徑提取科目標籤：question/platform/G3/Chinese/S2/HanLin/...  -> "G3/Chinese"
    const rel = path.relative(path.join(repoRoot, 'question/platform'), fp);
    const parts = rel.split(path.sep);
    const subjectKey = parts.length >= 2 ? `${parts[0]}/${parts[1]}` : parts[0];

    for (const q of qs) {
      questionCount++;

      for (const field of TARGET_FIELDS) {
        const text = typeof q[field] === 'string' ? q[field] : null;
        if (!text) continue;

        // 舊案全文掃描
        for (const phrase of JOB128_PHRASES) {
          if (text.includes(phrase)) {
            legacyHits.get(phrase).set(field, (legacyHits.get(phrase).get(field) || 0) + 1);
          }
        }

        // 片段計頻
        const segs = splitSegments(text);
        fieldTotals.set(field, fieldTotals.get(field) + segs.length);
        const fmap = fieldMaps.get(field);
        for (const seg of segs) {
          if (!fmap.has(seg)) {
            fmap.set(seg, { total: 0, bySubject: new Map() });
          }
          const entry = fmap.get(seg);
          entry.total++;
          entry.bySubject.set(subjectKey, (entry.bySubject.get(subjectKey) || 0) + 1);
        }
      }
    }
  }

  console.log(`完成：${fileCount} 檔 / ${questionCount} 題`);
  generateOutput({ fieldMaps, fieldTotals, legacyHits, fileCount, questionCount });
}
```

- [ ] **Step 2：新增 generateOutput 函式佔位**

在 `main()` 之前插入：

```js
function generateOutput({ fieldMaps, fieldTotals, legacyHits, fileCount, questionCount }) {
  // Task 3 實作
  console.log('generateOutput: TODO');
}
```

- [ ] **Step 3：驗證計頻邏輯可執行**

```bash
node scripts/analyze_field_segments.mjs 2>&1 | head -10
```

預期輸出（範例）：
```
掃描 653 個題庫 JSON...
完成：653 檔 / XXXXX 題
generateOutput: TODO
```

若掃描數明顯低於 600 則檢查 `walkAllBankJson` 路徑。

- [ ] **Step 4：Commit**

```bash
git add scripts/analyze_field_segments.mjs
git commit -m "feat(JOB-[NNN]): 新增 analyze_field_segments.mjs 骨架與計頻核心"
```

---

## Task 3：實作輸出生成（MD + JSON）

**Files:**
- Modify: `scripts/analyze_field_segments.mjs`

- [ ] **Step 1：實作 buildFieldRankings 輔助函式**

在 `generateOutput` 之前插入：

```js
/**
 * 將 fieldMap 轉為排序後的榜單陣列
 * @param {Map<string, { total: number, bySubject: Map<string, number> }>} fmap
 * @param {number} minFreq
 * @returns {Array<{ segment: string, total: number, topSubjects: [string, number][] }>}
 */
function buildFieldRankings(fmap, minFreq) {
  const rows = [];
  for (const [segment, { total, bySubject }] of fmap) {
    if (total < minFreq) continue;
    const topSubjects = [...bySubject.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
    rows.push({ segment, total, topSubjects });
  }
  rows.sort((a, b) => b.total - a.total);
  return rows;
}
```

- [ ] **Step 2：實作 generateOutput 的 JSON 輸出**

替換 `generateOutput` 函式：

```js
function generateOutput({ fieldMaps, fieldTotals, legacyHits, fileCount, questionCount }) {
  const rankings = {};
  for (const field of TARGET_FIELDS) {
    rankings[field] = buildFieldRankings(fieldMaps.get(field), MIN_FREQ);
  }

  // 舊案殘留摘要
  const legacySummary = [];
  for (const [phrase, fieldCounts] of legacyHits) {
    const total = [...fieldCounts.values()].reduce((a, b) => a + b, 0);
    if (total > 0) {
      legacySummary.push({
        phrase,
        byField: Object.fromEntries(fieldCounts),
        total,
        status: '⚠️ 仍有殘留',
      });
    } else {
      legacySummary.push({ phrase, byField: {}, total: 0, status: '✅ 已清除' });
    }
  }

  const jsonOut = {
    meta: {
      last_updated: new Date().toISOString().slice(0, 10),
      updated_by: 'Cursor Agent',
      scope: 'question/platform/**/*.json（全科 G3-G6，排除 manifest/mismatch/catalog/backup）',
      fileCount,
      questionCount,
      minFreq: MIN_FREQ,
      topN: TOP_N,
      fieldTotals: Object.fromEntries(fieldTotals),
    },
    rankings: {
      question: rankings.question.slice(0, TOP_N),
      scenario: rankings.scenario.slice(0, TOP_N),
      explanation: rankings.explanation.slice(0, TOP_N),
    },
    legacyComparison: legacySummary,
  };

  fs.mkdirSync(path.dirname(OUT_JSON), { recursive: true });
  fs.writeFileSync(OUT_JSON, JSON.stringify(jsonOut, null, 2), 'utf8');
  console.log('JSON 輸出：', path.relative(repoRoot, OUT_JSON));

  generateMarkdown({ rankings, legacySummary, jsonOut });
}
```

- [ ] **Step 3：實作 generateMarkdown 函式**

在 `generateOutput` 之後插入：

```js
function generateMarkdown({ rankings, legacySummary, jsonOut }) {
  const { meta } = jsonOut;
  const lines = [];

  lines.push('# 全科題庫三欄位高頻片段分析');
  lines.push('');
  lines.push(`\`last_updated\`: ${meta.last_updated}  `);
  lines.push(`\`updated_by\`: ${meta.updated_by}  `);
  lines.push('');
  lines.push('## 掃描摘要');
  lines.push('');
  lines.push('| 項目 | 數值 |');
  lines.push('|:---|---:|');
  lines.push(`| 掃描 JSON 檔數 | ${meta.fileCount} |`);
  lines.push(`| 題目總數 | ${meta.questionCount} |`);
  lines.push(`| question 欄位有效片段數 | ${meta.fieldTotals.question ?? 0} |`);
  lines.push(`| scenario 欄位有效片段數 | ${meta.fieldTotals.scenario ?? 0} |`);
  lines.push(`| explanation 欄位有效片段數 | ${meta.fieldTotals.explanation ?? 0} |`);
  lines.push(`| 最低頻次門檻 | ${meta.minFreq} |`);
  lines.push('');

  // 各欄位總榜
  for (const field of TARGET_FIELDS) {
    const rows = rankings[field];
    lines.push(`## ${field} 欄位 Top ${TOP_N}`);
    lines.push('');
    lines.push(`> 共 ${rows.length} 個片段達到最低頻次門檻（≥ ${MIN_FREQ} 次）`);
    lines.push('');
    lines.push('| 名次 | 片段（節錄） | 出現次數 | 前三高科目 |');
    lines.push('|:---:|:---|---:|:---|');
    rows.slice(0, TOP_N).forEach((r, i) => {
      const show = r.segment.length > 40 ? r.segment.slice(0, 38) + '…' : r.segment;
      const topSubs = r.topSubjects
        .slice(0, 3)
        .map(([k, v]) => `${k}(${v})`)
        .join(' / ');
      lines.push(`| ${i + 1} | ${show.replace(/\|/g, '\\|')} | ${r.total} | ${topSubs} |`);
    });
    lines.push('');
  }

  // 舊案對照
  lines.push('## 舊案對照（JOB-128 REMOVAL_PHRASES 殘留狀況）');
  lines.push('');
  lines.push('| 狀態 | 原始模式 | question | scenario | explanation | 合計 |');
  lines.push('|:---:|:---|---:|---:|---:|---:|');
  for (const x of legacySummary.sort((a, b) => b.total - a.total)) {
    const show = x.phrase.length > 35 ? x.phrase.slice(0, 33) + '…' : x.phrase;
    const q = x.byField.question ?? 0;
    const s = x.byField.scenario ?? 0;
    const e = x.byField.explanation ?? 0;
    lines.push(`| ${x.status} | ${show.replace(/\|/g, '\\|')} | ${q} | ${s} | ${e} | ${x.total} |`);
  }
  lines.push('');
  lines.push('> 機讀完整計數詳見同目錄 `.json` 檔。');

  fs.writeFileSync(OUT_MD, lines.join('\n'), 'utf8');
  console.log('MD 輸出：', path.relative(repoRoot, OUT_MD));
}
```

- [ ] **Step 4：完整執行驗證**

```bash
node scripts/analyze_field_segments.mjs 2>&1
```

預期輸出（範例）：
```
掃描 653 個題庫 JSON...
完成：653 檔 / 13000 題
JSON 輸出：docs/研究紀錄/全科題庫_三欄位_高頻片段分析.json
MD 輸出：docs/研究紀錄/全科題庫_三欄位_高頻片段分析.md
```

**驗收條件：**
- 掃描檔案數 ≥ 600
- `全科題庫_三欄位_高頻片段分析.json` 存在且 JSON 合法
- `全科題庫_三欄位_高頻片段分析.md` 存在且含三個欄位榜
- 舊案對照表存在（36 列）

驗證指令：
```bash
# JSON 合法性
node -e "JSON.parse(require('fs').readFileSync('docs/研究紀錄/全科題庫_三欄位_高頻片段分析.json','utf8')); console.log('JSON OK')"

# 榜單行數
grep -c "欄位 Top" docs/研究紀錄/全科題庫_三欄位_高頻片段分析.md

# 舊案列數（應為 36）
grep -c "已清除\|仍有殘留" docs/研究紀錄/全科題庫_三欄位_高頻片段分析.md
```

預期：`JSON OK`、`3`、`36`

- [ ] **Step 5：Commit**

```bash
git add scripts/analyze_field_segments.mjs \
  docs/研究紀錄/全科題庫_三欄位_高頻片段分析.md \
  docs/研究紀錄/全科題庫_三欄位_高頻片段分析.json
git commit -m "feat(JOB-[NNN]): 完成三欄位高頻片段分析腳本與輸出報告"
```

---

## Task 4：撰寫 JOB Report

**Files:**
- Create: `jobs/JOB-[NNN]-Report.md`（使用 `jobs/_JOB-REPORT-TEMPLATE.md` 格式）

- [ ] **Step 1：確認掃描統計數字**

從 Task 3 的執行輸出中記錄：
- 掃描 JSON 檔數
- 題目總數
- 各欄位有效片段數
- 舊案對照：幾個模式仍有殘留

- [ ] **Step 2：撰寫 Report**

依 `jobs/_JOB-REPORT-TEMPLATE.md` 格式填入：
- 成果摘要表（掃描數、片段數、舊案殘留數）
- 驗收 Checklist（含佐證數字）
- 遺留問題：「垃圾模式清單待使用者人工審視後開立 JOB-B」

- [ ] **Step 3：Commit**

```bash
git add jobs/JOB-[NNN]-Report.md
git commit -m "docs(JOB-[NNN]): 完成 Report 與結案文件"
```

---

## Task 5：結案

- [ ] **Step 1：確認 Report 已填妥**，含 `/pj_sync` 打勾項目

- [ ] **Step 2：通知 Claude Code (PM) 審視輸出報告**

```
告知 Claude Code：JOB-[NNN] 執行完成。
產出路徑：
  docs/研究紀錄/全科題庫_三欄位_高頻片段分析.md
  docs/研究紀錄/全科題庫_三欄位_高頻片段分析.json
掃描統計：[填入實際數字]
舊案對照：[幾個仍有殘留]
```

---

## 自我審查記錄

| 檢查項目 | 結果 |
|:--|:--|
| Spec 覆蓋率 | ✅ 全三欄位、全科全年級、句號+逗號分割、分科子榜、舊案對照 均有對應 Task |
| Placeholder 掃描 | ✅ 無 TBD/TODO；`JOB-[NNN]` 為佔位符，Cursor 執行前應替換為實際 JOB 號 |
| 類型一致性 | ✅ `buildFieldRankings` 回傳結構在 `generateOutput` 和 `generateMarkdown` 中一致使用 |
| 零寫入驗證 | ✅ 腳本只寫入 `docs/研究紀錄/`，不碰 `question/platform/` |
| 驗收指令完整 | ✅ 每個 Task 均含預期輸出與驗證指令 |
