#!/usr/bin/env node
/**
 * 依《國語題庫_G3-G6_逗號片段頻次分析》移除題幹／選項中的套話與硬湊片段。
 *
 * 使用：node scripts/strip_chinese_bank_template_phrases.mjs
 * last_updated: 2026-03-28 23:45
 * updated_by: Cursor Agent
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const { evaluateFile } = require('./evaluate_question_quality.js');

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const LOG = path.join(
  repoRoot,
  'docs/研究紀錄/國語題庫_套話刪除執行紀錄.md'
);

/**
 * 由長而短移除，避免殘留子串。
 * 來源：國語題庫_G3-G6_逗號片段頻次分析.md（套話子串、異常高頻、實務掃描補強）
 */
const REMOVAL_PHRASES = [
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
  // 先前品管已刪之句式，若殘留則再清
  '，這也是作者想強調的重點之一。',
  '這也是作者想強調的重點之一。',
  '，這點在實務上很重要。',
  '這點在實務上很重要。',
];

function normalizePunctuation(t) {
  let s = t.replace(/\s+/g, ' ').trim();
  s = s.replace(/。{2,}/g, '。');
  s = s.replace(/，{2,}/g, '，');
  s = s.replace(/。，/g, '，');
  s = s.replace(/，。/g, '。');
  s = s.replace(/^[,，。\s]+|[,，。\s]+$/g, '');
  return s.trim();
}

function stripTemplates(s) {
  if (typeof s !== 'string') return s;
  let t = s;
  let prev;
  do {
    prev = t;
    for (const ph of REMOVAL_PHRASES) {
      t = t.split(ph).join('');
    }
    t = normalizePunctuation(t);
  } while (t !== prev);
  return t;
}

function walkChineseBankJson(root, out = []) {
  for (const g of ['G3', 'G4', 'G5', 'G6']) {
    const base = path.join(root, 'question/platform', g, 'Chinese');
    if (!fs.existsSync(base)) continue;
    for (const sem of fs.readdirSync(base)) {
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

/** 不含逗號，避免詞頻分析再被切分 */
const PLACEHOLDER_OPTION = '與課文敘述明顯不符（選項待人工重寫）';

function cleanQuestion(q, stats) {
  const fields = ['question', 'scenario'];
  for (const k of fields) {
    if (!q[k]) continue;
    const n = stripTemplates(q[k]);
    if (n !== q[k]) stats.fieldChanges++;
    q[k] = n || q[k];
  }
  if (Array.isArray(q.options)) {
    q.options = q.options.map((opt, i) => {
      const n = stripTemplates(opt);
      if (n !== opt) stats.optionChanges++;
      if (!n || n.length < 2) {
        stats.emptyOptions++;
        return PLACEHOLDER_OPTION;
      }
      return n;
    });
  }
  return q;
}

function updateChineseManifests() {
  for (const g of ['G3', 'G4', 'G5', 'G6']) {
    const base = path.join(repoRoot, 'question/platform', g, 'Chinese');
    if (!fs.existsSync(base)) continue;
    for (const sem of fs.readdirSync(base)) {
      const sdir = path.join(base, sem);
      if (!fs.statSync(sdir).isDirectory()) continue;
      for (const pub of fs.readdirSync(sdir)) {
        const manName = `${g}_${sem}_CHI_${pub.toUpperCase()}_manifest.json`;
        const manPath = path.join(sdir, pub, manName);
        if (!fs.existsSync(manPath)) continue;
        const m = JSON.parse(fs.readFileSync(manPath, 'utf8'));
        let total = 0;
        for (const item of m.items || []) {
          const jf = path.join(sdir, pub, item.file);
          if (fs.existsSync(jf)) {
            const j = JSON.parse(fs.readFileSync(jf, 'utf8'));
            item.count = (j.questions || []).length;
            total += item.count;
          }
        }
        m.moduleMetaData = m.moduleMetaData || {};
        m.moduleMetaData.total_questions = total;
        m.moduleMetaData.last_updated = new Date().toISOString();
        fs.writeFileSync(manPath, JSON.stringify(m, null, 2) + '\n', 'utf8');
      }
    }
  }
}

function main() {
  const files = walkChineseBankJson(repoRoot);
  const stats = {
    filesTouched: 0,
    fieldChanges: 0,
    optionChanges: 0,
    emptyOptions: 0,
  };
  const touchedList = [];

  for (const fp of files) {
    let j;
    try {
      j = JSON.parse(fs.readFileSync(fp, 'utf8'));
    } catch {
      continue;
    }
    if (!Array.isArray(j.questions)) continue;
    const before = JSON.stringify(j);
    j.questions = j.questions.map((q) => cleanQuestion({ ...q }, stats));
    const after = JSON.stringify(j);
    if (before !== after) {
      fs.writeFileSync(fp, JSON.stringify(j, null, 2) + '\n', 'utf8');
      stats.filesTouched++;
      touchedList.push(path.relative(path.join(repoRoot, 'question/platform'), fp));
    }
  }

  for (const fp of files) {
    try {
      evaluateFile(fp);
    } catch (_) {}
  }

  updateChineseManifests();

  const logLines = [
    '# 國語題庫套話刪除執行紀錄',
    '',
    '`last_updated`: 2026-03-28 23:45  ',
    '`updated_by`: Cursor Agent  ',
    '',
    '## 依據',
    '',
    '- `docs/研究紀錄/國語題庫_G3-G6_逗號片段頻次分析.md` 所列套話子串、異常高頻片段與已知硬湊尾句。',
    '- 腳本：`scripts/strip_chinese_bank_template_phrases.mjs`（`REMOVAL_PHRASES` 可擴充）。',
    '',
    '## 統計',
    '',
    `| 項目 | 數值 |`,
    `|:---|---:|`,
    `| 異動檔數 | ${stats.filesTouched} |`,
    `| 題幹／情境欄位變更次數 | ${stats.fieldChanges} |`,
    `| 選項字串變更次數 | ${stats.optionChanges} |`,
    `| 刪除後過短而置換為占位句之選項數 | ${stats.emptyOptions} |`,
    '',
    '## 異動檔案清單（相對 question/platform）',
    '',
    touchedList.length
      ? touchedList.map((x) => `- \`${x}\``).join('\n')
      : '（無）',
    '',
  ];
  fs.mkdirSync(path.dirname(LOG), { recursive: true });
  fs.writeFileSync(LOG, logLines.join('\n'), 'utf8');

  console.log(JSON.stringify(stats, null, 2));
  console.log('Log:', path.relative(repoRoot, LOG));
}

main();
