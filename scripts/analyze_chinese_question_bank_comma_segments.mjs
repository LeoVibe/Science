#!/usr/bin/env node
/**
 * G3–G6 國語題庫：以逗號切分題幹與選項，統計片段出現次數，標記異常高頻（模板／硬湊）。
 *
 * 使用：node scripts/analyze_chinese_question_bank_comma_segments.mjs
 * 產出：docs/研究紀錄/國語題庫_G3-G6_逗號片段頻次分析.md
 *       docs/研究紀錄/國語題庫_G3-G6_逗號片段頻次分析.json（完整計數供機讀）
 *
 * last_updated: 2026-03-28 23:00
 * updated_by: Cursor Agent
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const OUT_MD = path.join(
  repoRoot,
  'docs/研究紀錄/國語題庫_G3-G6_逗號片段頻次分析.md'
);
const OUT_JSON = path.join(
  repoRoot,
  'docs/研究紀錄/國語題庫_G3-G6_逗號片段頻次分析.json'
);

/** 全形／半形逗號切分 */
const COMMA_SPLIT = /[，,]/;

/** 整段選項／題幹內子串掃描（不受逗號切分影響） */
const SUBSTRING_SCAN = [
  '這也是作者想強調的重點之一',
  '這點在實務上很重要',
  '如果你有仔細閱讀課文',
  '這種想法在日常生活中其實也是非常常見',
  '不過這點很容易讓許多小朋友在閱讀時產生誤解',
  '並且需要經過深思熟慮的考量',
  '呈現出文中描述的氣氛',
  '這在分析文章時非常關鍵',
  '這點在文章細節中可以發現',
  '請你仔細回想並且針對這篇文章的內容細節進行思考',
];

/** 已知模板關鍵子串（片段內含匹配，與 SUBSTRING_SCAN 對齊） */
const TEMPLATE_HINTS = SUBSTRING_SCAN;

function walkChineseBankJson(root, out = []) {
  for (const g of ['G3', 'G4', 'G5', 'G6']) {
    const base = path.join(root, 'question/platform', g, 'Chinese');
    if (!fs.existsSync(base)) continue;
    const semesters = fs.readdirSync(base);
    for (const sem of semesters) {
      const sdir = path.join(base, sem);
      if (!fs.statSync(sdir).isDirectory()) continue;
      for (const pub of fs.readdirSync(sdir)) {
        const pdir = path.join(sdir, pub);
        if (!fs.statSync(pdir).isDirectory()) continue;
        for (const f of fs.readdirSync(pdir)) {
          if (!f.endsWith('.json') || f.includes('manifest')) continue;
          out.push(path.join(pdir, f));
        }
      }
    }
  }
  return out;
}

function splitSegments(text) {
  if (typeof text !== 'string' || !text.trim()) return [];
  return text
    .split(COMMA_SPLIT)
    .map((s) => s.replace(/\s+/g, ' ').trim())
    .filter(Boolean);
}

function main() {
  const files = walkChineseBankJson(repoRoot);
  /** @type {Map<string, { stem: number; option: number; files: Set<string> }>} */
  const map = new Map();

  let totalStemSeg = 0;
  let totalOptSeg = 0;
  let questionCount = 0;
  /** 子串在「整段文字」出現次數（題幹含 question+scenario；選項為每個 option） */
  const substrStem = Object.fromEntries(SUBSTRING_SCAN.map((s) => [s, 0]));
  const substrOpt = Object.fromEntries(SUBSTRING_SCAN.map((s) => [s, 0]));

  function countSubstrings(text, bucket) {
    if (typeof text !== 'string' || !text) return;
    for (const pat of SUBSTRING_SCAN) {
      let i = 0;
      while (i < text.length) {
        const j = text.indexOf(pat, i);
        if (j === -1) break;
        bucket[pat]++;
        i = j + pat.length;
      }
    }
  }

  for (const fp of files) {
    const rel = path.relative(path.join(repoRoot, 'question/platform'), fp);
    let j;
    try {
      j = JSON.parse(fs.readFileSync(fp, 'utf8'));
    } catch {
      continue;
    }
    const qs = j.questions;
    if (!Array.isArray(qs)) continue;

    for (const q of qs) {
      questionCount++;
      const stemText = [q.question, q.scenario].filter(Boolean).join(' ');
      countSubstrings(stemText, substrStem);
      for (const seg of splitSegments(stemText)) {
        totalStemSeg++;
        let o = map.get(seg);
        if (!o) {
          o = { stem: 0, option: 0, files: new Set() };
          map.set(seg, o);
        }
        o.stem++;
        o.files.add(rel);
      }
      for (const opt of q.options || []) {
        countSubstrings(opt, substrOpt);
        for (const seg of splitSegments(opt)) {
          totalOptSeg++;
          let o = map.get(seg);
          if (!o) {
            o = { stem: 0, option: 0, files: new Set() };
            map.set(seg, o);
          }
          o.option++;
          o.files.add(rel);
        }
      }
    }
  }

  const totalSeg = totalStemSeg + totalOptSeg;
  const rows = [...map.entries()].map(([segment, v]) => ({
    segment,
    stem: v.stem,
    option: v.option,
    total: v.stem + v.option,
    fileCount: v.files.size,
    ratioOfAllSegments: totalSeg ? (v.stem + v.option) / totalSeg : 0,
    ratioOfOptionSegments: totalOptSeg ? v.option / totalOptSeg : 0,
  }));

  rows.sort((a, b) => b.total - a.total);

  /** 異常高頻啟發式：長度≥10 且 出現≥20 次，或 在選項片段中占比≥0.12% 且 次數≥15 */
  const suspicious = rows.filter((r) => {
    if (r.segment.length < 10) return false;
    if (r.total >= 20) return true;
    if (r.option >= 15 && r.ratioOfOptionSegments >= 0.0012) return true;
    return false;
  });

  const templateHits = rows.filter((r) =>
    TEMPLATE_HINTS.some((h) => r.segment.includes(h))
  );

  const substringReport = SUBSTRING_SCAN.map((pat) => ({
    pattern: pat,
    inStemFields: substrStem[pat],
    inOptions: substrOpt[pat],
    total: substrStem[pat] + substrOpt[pat],
  })).filter((x) => x.total > 0);

  const jsonOut = {
    meta: {
      last_updated: '2026-03-28 23:00',
      updated_by: 'Cursor Agent',
      scope: 'question/platform/G{3,4,5,6}/Chinese/**/*.json（不含 manifest）',
      fileCount: files.length,
      questionCount,
      totalCommaSegments: totalSeg,
      totalStemSegments: totalStemSeg,
      totalOptionSegments: totalOptSeg,
    },
    substringScanWholeText: substringReport,
    topByTotal: rows.slice(0, 200),
    suspicious,
    templateHintMatches: templateHits,
  };

  fs.mkdirSync(path.dirname(OUT_JSON), { recursive: true });
  fs.writeFileSync(OUT_JSON, JSON.stringify(jsonOut, null, 2), 'utf8');

  const lines = [];
  lines.push('# 國語題庫 G3–G6：逗號片段頻次分析');
  lines.push('');
  lines.push('`last_updated`: 2026-03-28 23:00  ');
  lines.push('`updated_by`: Cursor Agent  ');
  lines.push('');
  lines.push('## 方法');
  lines.push('');
  lines.push('- **範圍**：`question/platform/G3|G4|G5|G6/Chinese/**/*.json`（排除 `*manifest*`）。');
  lines.push('- **切分**：以全形「，」與半形「,」切分**題幹**（`question` + `scenario` 併接）與各**選項**字串；片段經 trim、空白收斂。（**未**納入 `explanation`／`commonMisconception`，以免解析文字干擾「試題本體」詞頻。）');
  lines.push('- **子串掃描**：另對題幹／選項**全文**統計固定套話之出現次數（與逗號是否出現無關），見下表「套話子串（全文掃描）」。');
  lines.push('- **集合**：相同片段內文視為同一鍵，加總出現次數（題幹側、選項側分開計，並有合計）。');
  lines.push('- **異常高頻（啟發式）**：長度≥10 且（合計≥20）或（選項側≥15 且占「所有選項片段」比例≥0.12%）。可依專案經驗調門檻。');
  lines.push('- **機讀完整計數**：見同目錄 `國語題庫_G3-G6_逗號片段頻次分析.json`（含 top 200）。');
  lines.push('');
  lines.push('## 總量');
  lines.push('');
  lines.push(`| 項目 | 數值 |`);
  lines.push(`|:---|---:|`);
  lines.push(`| JSON 檔數 | ${files.length} |`);
  lines.push(`| 題列數 | ${questionCount} |`);
  lines.push(`| 逗號片段總數（題幹側） | ${totalStemSeg} |`);
  lines.push(`| 逗號片段總數（選項側） | ${totalOptSeg} |`);
  lines.push(`| 逗號片段總數（合計） | ${totalSeg} |`);
  lines.push(`| 相異片段數 | ${map.size} |`);
  lines.push('');
  lines.push('## 套話子串（全文掃描，非逗號切分）');
  lines.push('');
  lines.push('| 子串 | 選項內次數 | 題幹內次數 | 合計 |');
  lines.push('|:---|---:|---:|---:|');
  if (substringReport.length === 0) {
    lines.push('| （無命中） | 0 | 0 | 0 |');
  } else {
    for (const x of substringReport.sort((a, b) => b.total - a.total)) {
      lines.push(
        `| ${x.pattern.replace(/\|/g, '\\|')} | ${x.inOptions} | ${x.inStemFields} | ${x.total} |`
      );
    }
  }
  lines.push('');
  lines.push('## 模板關鍵字命中（逗號片段內含下列子串者）');
  lines.push('');
  if (templateHits.length === 0) {
    lines.push('（目前題庫中未命中上述關鍵模板子串，或已清理完畢。）');
  } else {
    lines.push('| 片段（節錄） | 選項側次數 | 題幹側次數 | 合計 | 出現檔數 |');
    lines.push('|:---|---:|---:|---:|---:|');
    for (const r of templateHits.slice(0, 80)) {
      const show =
        r.segment.length > 42 ? r.segment.slice(0, 40) + '…' : r.segment;
      lines.push(
        `| ${show.replace(/\|/g, '\\|')} | ${r.option} | ${r.stem} | ${r.total} | ${r.fileCount} |`
      );
    }
  }
  lines.push('');
  lines.push('## 異常高頻片段（啟發式清單）');
  lines.push('');
  lines.push('適合優先人工複核是否為硬湊、套話或誘答模板。');
  lines.push('');
  lines.push('| 片段（節錄） | 選項側 | 題幹側 | 合計 | 占全部片段比 | 占選項片段比 | 檔數 |');
  lines.push('|:---|---:|---:|---:|---:|---:|---:|');
  for (const r of suspicious.slice(0, 120)) {
    const show =
      r.segment.length > 48 ? r.segment.slice(0, 46) + '…' : r.segment;
    lines.push(
      `| ${show.replace(/\|/g, '\\|')} | ${r.option} | ${r.stem} | ${r.total} | ${(r.ratioOfAllSegments * 100).toFixed(3)}% | ${(r.ratioOfOptionSegments * 100).toFixed(3)}% | ${r.fileCount} |`
    );
  }
  lines.push('');
  lines.push('## 合計次數 Top 30（不分題幹／選項）');
  lines.push('');
  lines.push('| 名次 | 片段（節錄） | 選項側 | 題幹側 | 合計 |');
  lines.push('|:---:|:---|---:|---:|---:|');
  rows.slice(0, 30).forEach((r, i) => {
    const show =
      r.segment.length > 40 ? r.segment.slice(0, 38) + '…' : r.segment;
    lines.push(
      `| ${i + 1} | ${show.replace(/\|/g, '\\|')} | ${r.option} | ${r.stem} | ${r.total} |`
    );
  });
  lines.push('');

  fs.writeFileSync(OUT_MD, lines.join('\n'), 'utf8');
  console.log('Wrote:', path.relative(repoRoot, OUT_MD));
  console.log('Wrote:', path.relative(repoRoot, OUT_JSON));
  console.log(
    'Files:',
    files.length,
    'questions:',
    questionCount,
    'distinct segments:',
    map.size
  );
}

main();
