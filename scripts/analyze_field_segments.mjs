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
 * 來源：JOB-190（JOB-189/JOB-128 後盲區補掃）
 * last_updated: 2026-04-15
 * updated_by: Claude Code (claude-sonnet-4-6)
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

// ── 切割規則（句號+逗號雙重分割）─────────────────────────────────────────
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
const EXCLUDE_KEYWORDS = ['manifest', 'mismatch', 'catalog', 'backup', 'libraryStats'];

function isQuestionFile(fname) {
  if (!fname.endsWith('.json')) return false;
  return !EXCLUDE_KEYWORDS.some((kw) => fname.includes(kw));
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

// ── 榜單建構 ──────────────────────────────────────────────────────────────
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

// ── Markdown 輸出 ─────────────────────────────────────────────────────────
function generateMarkdown({ rankings, legacySummary, meta }) {
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
  lines.push(`| 各榜顯示前 N 名 | ${meta.topN} |`);
  lines.push('');

  // 各欄位總榜
  for (const field of TARGET_FIELDS) {
    const rows = rankings[field];
    lines.push(`## ${field} 欄位 Top ${TOP_N}`);
    lines.push('');
    lines.push(`> 共 ${rows.length} 個片段達到最低頻次門檻（≥ ${MIN_FREQ} 次）`);
    lines.push('');
    if (rows.length === 0) {
      lines.push('（無片段達到門檻）');
    } else {
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
    }
    lines.push('');
  }

  // 舊案對照
  lines.push('## 舊案對照（JOB-128 REMOVAL_PHRASES 在三欄位中的殘留狀況）');
  lines.push('');
  lines.push('| 狀態 | 原始模式（節錄） | question | scenario | explanation | 合計 |');
  lines.push('|:---:|:---|---:|---:|---:|---:|');
  for (const x of legacySummary.sort((a, b) => b.total - a.total)) {
    const show = x.phrase.length > 35 ? x.phrase.slice(0, 33) + '…' : x.phrase;
    const q = x.byField.question ?? 0;
    const s = x.byField.scenario ?? 0;
    const e = x.byField.explanation ?? 0;
    lines.push(`| ${x.status} | ${show.replace(/\|/g, '\\|')} | ${q} | ${s} | ${e} | ${x.total} |`);
  }
  lines.push('');
  lines.push('> 機讀完整計數詳見同目錄 `全科題庫_三欄位_高頻片段分析.json`。');

  fs.writeFileSync(OUT_MD, lines.join('\n'), 'utf8');
  console.log('MD 輸出：', path.relative(repoRoot, OUT_MD));
}

// ── 主流程 ────────────────────────────────────────────────────────────────
function main() {
  const files = walkAllBankJson(repoRoot);
  console.log(`掃描 ${files.length} 個題庫 JSON...`);

  // fieldMaps[fieldName] = Map<segment, { total, bySubject: Map<subjectKey, count> }>
  const fieldMaps = new Map(TARGET_FIELDS.map((f) => [f, new Map()]));
  const fieldTotals = new Map(TARGET_FIELDS.map((f) => [f, 0]));
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

    // 從路徑提取科目標籤：G3/Chinese、G4/Science 等
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

  // 建構榜單
  const rankings = {};
  for (const field of TARGET_FIELDS) {
    rankings[field] = buildFieldRankings(fieldMaps.get(field), MIN_FREQ);
  }

  // 舊案殘留摘要
  const legacySummary = [];
  for (const [phrase, fieldCounts] of legacyHits) {
    const total = [...fieldCounts.values()].reduce((a, b) => a + b, 0);
    legacySummary.push({
      phrase,
      byField: Object.fromEntries(fieldCounts),
      total,
      status: total > 0 ? '⚠️ 仍有殘留' : '✅ 已清除',
    });
  }

  const today = new Date().toISOString().slice(0, 10);
  const meta = {
    last_updated: today,
    updated_by: 'Claude Code (claude-sonnet-4-6, JOB-190)',
    scope: 'question/platform/**/*.json（全科 G3-G6，排除 manifest/mismatch/catalog/backup）',
    fileCount,
    questionCount,
    minFreq: MIN_FREQ,
    topN: TOP_N,
    fieldTotals: Object.fromEntries(fieldTotals),
  };

  // JSON 輸出
  const jsonOut = {
    meta,
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

  // MD 輸出
  generateMarkdown({ rankings, legacySummary, meta });

  // 摘要統計
  console.log('\n── 各欄位榜單片段數 ──');
  for (const field of TARGET_FIELDS) {
    console.log(`  ${field}: ${rankings[field].length} 個片段達門檻（≥${MIN_FREQ}次），Top${TOP_N} 輸出`);
  }
  const residualCount = legacySummary.filter((x) => x.total > 0).length;
  console.log(`\n── 舊案對照 ──`);
  console.log(`  JOB-128 的 36 個模式中，${residualCount} 個在三欄位中仍有殘留`);
}

main();
