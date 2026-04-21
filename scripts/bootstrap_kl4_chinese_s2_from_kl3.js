#!/usr/bin/env node
/**
 * 自 KL3 國語課文索引匯出「下學期」KL4 單課雙檔初稿，供 auto_generate_questions.js 讀取課文。
 * 關聯派工：JOB-102（四下／五下／六下國語 S2 補題前置）。
 *
 * 用法：node scripts/bootstrap_kl4_chinese_s2_from_kl3.js [--force]
 * --force：已存在同名檔時仍覆寫（預設略過已存在之單課研究檔）。
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const KL3_PATH = path.join(ROOT, 'knowledge/1_課綱研究/國語/KL3_國語_研究進度_課文與索引.md');
const KNOWLEDGE_CHI = path.join(ROOT, 'knowledge/1_課綱研究/國語');

const PUB_DIR = { '1': '翰林', '2': '康軒', '3': '南一' };
/** 課碼：0 + 版本(1翰2康3南) + 年級(3-6) + 學期(01上02下) + 課次兩碼 */
const SEM_FOLDER = {
  '302': '三下',
  '402': '四下',
  '502': '五下',
  '602': '六下',
};

function parseCourseCode(code) {
  if (!code || code.length !== 7 || code[0] !== '0') return null;
  const publisher = code[1];
  const grade = code[2];
  const semester = code.slice(3, 5);
  return { publisher, grade, semester, lessonDigits: code.slice(5, 7), raw: code };
}

function folderFor(grade, semester) {
  const key = `${grade}${semester}`;
  return SEM_FOLDER[key] || null;
}

function normLessonTag(tag) {
  const m = String(tag).match(/^L(\d+)$/i);
  if (!m) return null;
  return `L${parseInt(m[1], 10)}`;
}

function safeFileStem(title) {
  return title
    .replace(/&lt;/g, '')
    .replace(/&gt;/g, '')
    .replace(/[／]/g, '_')
    .replace(/[\/\\:*?"<>|]/g, '_')
    .replace(/\s+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '')
    .slice(0, 80);
}

function extractBlocks(md) {
  const re = /<a id="(kl3-[^"]+)"><\/a>\n#### `(\d{7})` · (L\d+|x\d+) · ([^\n]+)\n/g;
  const blocks = [];
  let m;
  while ((m = re.exec(md)) !== null) {
    const start = m.index + m[0].length;
    const end = md.indexOf('\n---\n', start);
    const bodyRaw = end >= 0 ? md.slice(start, end) : md.slice(start, start + 12000);
    blocks.push({
      anchor: m[1],
      code: m[2],
      lessonTag: m[3],
      title: m[4].trim(),
      bodyRaw: bodyRaw.trim(),
    });
  }
  return blocks;
}

function buildExamStub({ semFolder, pubFolder, lesson, title, anchor }) {
  return `# 💬 KL4 ${semFolder} ${pubFolder} ${lesson}《${title.replace(/&lt;/g, '<').replace(/&gt;/g, '>')}》考古題與討論
\`last_updated\`: ${nowStamp()}
\`updated_by\`: Cursor Agent（bootstrap_kl4_chinese_s2_from_kl3.js）

**檔案定位**：考古題脈絡／迷思討論初稿（自 KL3 索引機械產生，請後續依 RC-04～RC-05 補強真實試題來源）
**對應主檔**：\`KL4_${semFolder}_${pubFolder}_${lesson}_${safeFileStem(title)}_單課研究紀錄.md\`
**索引錨點**：${anchor}

---

## 第一部：試題脈絡（待補真實考古來源網址）

### 📌 題型案例 A（閱讀理解）
- **題幹方向**：依課文內容，辨識敘事觀點、因果關係或關鍵細節。
- **誘答設計**：以「字詞表面義」與「過度推論」作為常見迷思選項。

### 📌 題型案例 B（詞彙／句型）
- **題幹方向**：在語境中選擇正確用字或用詞。
- **誘答設計**：近義詞混淆、搭配錯誤。

## 第二部：迷思討論（RC-05 初稿）
- 本課常見迷思：將細節記憶等同於主旨理解；忽略作者情感或說明順序。
- 教學提醒：對照課文「課文全文錄製」段落，先抓段旨再作答。

---

## ✅ 品質稽核（後續人工／研究派工勾選）
- [ ] **RC-04**：補齊 ≥2 道可核對之真實考古或等效試題
- [ ] **RC-05**：補寫本課具體迷思案例
`;
}

function buildStudyDoc({
  semFolder,
  pubFolder,
  lesson,
  title,
  code,
  anchor,
  bodyForQuote,
  grade,
}) {
  const cleanTitle = title.replace(/&lt;/g, '<').replace(/&gt;/g, '>');
  const stem = safeFileStem(title);
  const gradeZh = { '4': '四', '5': '五', '6': '六' };
  const gz = gradeZh[grade] || grade;
  return `# 💬 KL4 ${pubFolder}${semFolder} ${lesson}《${cleanTitle}》單課研究紀錄
\`last_updated\`: ${nowStamp()}
\`updated_by\`: Cursor Agent（bootstrap_kl4_chinese_s2_from_kl3.js）

**檔案定位**：${gz}年級下學期／${pubFolder}版／${lesson}／《${cleanTitle}》
**對應副檔**：\`KL4_${semFolder}_${pubFolder}_${lesson}_${stem}_考古題與討論.md\`
**課碼**：${code} · 索引錨點：${anchor}

---

## 📖 第一部：文本深度層次分析 (Textual Strategy)
- **文體分類**：（待研）本檔由 \`KL3_國語_研究進度_課文與索引.md\` 匯出，請依 \`ei_research\` 補 RC-02～RC-03。
- **認知核心**：請對照課文抓「主旨／結構／關鍵概念」。

### 1. 課文全文錄製 (Textual Evidence) - RC-01

${bodyForQuote}

---

## ✅ 品質稽核 Checklist (RC-01 ~ RC-06)
- [x] **RC-01**：課文正文取自 KL3 索引（與教材來源連結一致者請自行核對）。
- [ ] **RC-02**～**RC-06**：待研究派工補齊。

## 💲作業匯總
 Token數: --- | 花費: --- | 使用模型: --- | 執行者: Cursor Agent
`;
}

function nowStamp() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

function formatBodyAsBlockquote(bodyRaw) {
  const lines = bodyRaw.split(/\r?\n/).filter((l) => l.length > 0);
  return lines.map((l) => (l.startsWith('>') ? l : `> ${l}`)).join('\n');
}

function main() {
  const force = process.argv.includes('--force');
  if (!fs.existsSync(KL3_PATH)) {
    console.error('找不到 KL3 索引:', KL3_PATH);
    process.exit(1);
  }
  const md = fs.readFileSync(KL3_PATH, 'utf8');
  const blocks = extractBlocks(md);
  let createdStudy = 0;
  let createdExam = 0;
  let skipped = 0;
  let shortBody = 0;

  for (const b of blocks) {
    if (!/^L\d+$/i.test(b.lessonTag)) continue;
    const parsed = parseCourseCode(b.code);
    if (!parsed) continue;
    if (parsed.semester !== '02') continue;
    if (!['4', '5', '6'].includes(parsed.grade)) continue;

    const semFolder = folderFor(parsed.grade, parsed.semester);
    if (!semFolder) continue;

    const pubFolder = PUB_DIR[parsed.publisher];
    if (!pubFolder) continue;

    const lesson = normLessonTag(b.lessonTag);
    if (!lesson) continue;

    const stem = safeFileStem(b.title);
    if (!stem) continue;

    const outDir = path.join(KNOWLEDGE_CHI, semFolder, pubFolder);
    fs.mkdirSync(outDir, { recursive: true });

    const studyName = `KL4_${semFolder}_${pubFolder}_${lesson}_${stem}_單課研究紀錄.md`;
    const examName = `KL4_${semFolder}_${pubFolder}_${lesson}_${stem}_考古題與討論.md`;
    const studyPath = path.join(outDir, studyName);
    const examPath = path.join(outDir, examName);

    if (fs.existsSync(studyPath) && !force) {
      skipped++;
      continue;
    }

    const bodyQuoted = formatBodyAsBlockquote(b.bodyRaw);
    const plainLen = b.bodyRaw.replace(/^>\s?/gm, '').replace(/\s+/g, ' ').trim().length;
    if (plainLen < 40) {
      console.warn(`⚠️ 課文過短略過: ${b.code} ${lesson} ${b.title} (${plainLen} 字)`);
      shortBody++;
      continue;
    }

    const studyDoc = buildStudyDoc({
      semFolder,
      pubFolder,
      lesson,
      title: b.title,
      code: b.code,
      anchor: b.anchor,
      bodyForQuote: bodyQuoted,
      grade: parsed.grade,
    });
    const examDoc = buildExamStub({
      semFolder,
      pubFolder,
      lesson,
      title: b.title,
      anchor: b.anchor,
    });

    fs.writeFileSync(studyPath, studyDoc, 'utf8');
    fs.writeFileSync(examPath, examDoc, 'utf8');
    createdStudy++;
    createdExam++;
  }

  console.log(
    JSON.stringify(
      {
        createdStudy,
        createdExam,
        skippedExisting: skipped,
        skippedShortBody: shortBody,
      },
      null,
      2
    )
  );
}

main();
