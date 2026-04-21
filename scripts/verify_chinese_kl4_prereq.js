#!/usr/bin/env node
/**
 * 檢驗國語題庫 JSON 與 KL4 雙檔、課文全文錄製是否滿足 auto_generate_questions.js 前置條件。
 * 關聯：JOB-102、ei_qst。
 *
 * 用法：node scripts/verify_chinese_kl4_prereq.js [G3|G4|G5|G6|all]
 * 預設：all（掃描 platform 內 G3～G6 Chinese S2）
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const PLATFORM = path.join(ROOT, 'question/platform');
const KNOWLEDGE_CHINESE_ROOT = path.join(ROOT, 'knowledge/1_課綱研究/國語');

const GRADE_SEM_TO_DIR = {
  G1: { S1: '一上', S2: '一下' },
  G2: { S1: '二上', S2: '二下' },
  G3: { S1: '三上', S2: '三下' },
  G4: { S1: '四上', S2: '四下' },
  G5: { S1: '五上', S2: '五下' },
  G6: { S1: '六上', S2: '六下' },
};
const PUBLISHER_TO_DIR = {
  HANLIN: '翰林',
  KANGHSUAN: '康軒',
  NANYI: '南一',
};

function extractLessonBodyFromKl4Markdown(md) {
  const match = md.match(/###\s*1\.\s*課文全文錄製[^\n]*/);
  if (!match) return '';
  const start = match.index + match[0].length;
  const tail = md.slice(start);
  const lines = tail.split(/\r?\n/);
  const buf = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/^---\s*$/.test(line)) break;
    if (/^##\s+/.test(line)) break;
    if (i > 0 && /^###\s+/.test(line)) break;
    buf.push(line.replace(/^>\s?/, ''));
  }
  return buf.join('\n').replace(/^\*\*課文標題：.*\*\*\s*$/gm, '').replace(/^\*\*來源：.*\*\*\s*$/gm, '').replace(/^\*\*作者：.*\*\*\s*$/gm, '').trim();
}

function findKl4ChinesePair(grade, semester, publisher, lesson) {
  const semDir = GRADE_SEM_TO_DIR[grade] && GRADE_SEM_TO_DIR[grade][semester];
  const pubDir = PUBLISHER_TO_DIR[publisher];
  if (!semDir || !pubDir || !lesson) return null;
  const dir = path.join(KNOWLEDGE_CHINESE_ROOT, semDir, pubDir);
  if (!fs.existsSync(dir)) return { dir, semDir, pubDir, lesson, missingDir: true };
  let files;
  try {
    files = fs.readdirSync(dir);
  } catch {
    return null;
  }
  const prefix = `KL4_${semDir}_${pubDir}_${lesson}_`;
  const study = files.find((f) => f.startsWith(prefix) && f.endsWith('_單課研究紀錄.md'));
  const exam = files.find((f) => f.startsWith(prefix) && f.endsWith('_考古題與討論.md'));
  return {
    dir,
    semDir,
    pubDir,
    lesson,
    study,
    exam,
    studyPath: study ? path.join(dir, study) : null,
    examPath: exam ? path.join(dir, exam) : null,
  };
}

function getBankMeta(jsonObj) {
  const m = jsonObj.meta || {};
  return {
    grade: m.grade || jsonObj.grade,
    semester: m.semester || jsonObj.semester,
    publisher: m.publisher || jsonObj.publisher,
    lesson: m.lesson || jsonObj.lesson_id,
  };
}

function checkKl4ForJson(jpath) {
  const json = JSON.parse(fs.readFileSync(jpath, 'utf8'));
  const meta = getBankMeta(json);
  let lesson = meta.lesson;
  if (!lesson) {
    const m = jpath.match(/L\d+/i);
    lesson = m ? m[0] : null;
  }
  if (lesson) {
    const n = String(lesson).match(/(\d+)/);
    lesson = n ? `L${n[1]}` : null;
  }
  const minLessonChars = 40;
  const minExamBytes = 80;

  const pair = findKl4ChinesePair(meta.grade, meta.semester, meta.publisher, lesson);
  if (!pair) return { jpath, status: 'no-pair-meta', meta, lesson };
  if (pair.missingDir) return { jpath, status: 'missing-knowledge-dir', dir: pair.dir, meta, lesson };
  if (!pair.study || !pair.exam) {
    return { jpath, status: 'incomplete-pair', dir: pair.dir, lesson, study: pair.study, exam: pair.exam, meta };
  }
  if (fs.statSync(pair.examPath).size < minExamBytes) {
    return { jpath, status: 'exam-too-short', examPath: pair.examPath };
  }
  const md = fs.readFileSync(pair.studyPath, 'utf8');
  const body = extractLessonBodyFromKl4Markdown(md);
  if (body.length < minLessonChars) {
    return {
      jpath,
      status: 'lesson-body-short-or-missing-heading',
      bodyLen: body.length,
      studyPath: pair.studyPath,
      hasHeading: /###\s*1\.\s*課文全文錄製/.test(md),
    };
  }
  return { jpath, status: 'ok', bodyLen: body.length };
}

function walkChineseS2(gradeFilter) {
  const grades = gradeFilter === 'all' ? ['G3', 'G4', 'G5', 'G6'] : [gradeFilter];
  const out = [];
  for (const g of grades) {
    const base = path.join(PLATFORM, g, 'Chinese', 'S2');
    if (!fs.existsSync(base)) continue;
    for (const pub of fs.readdirSync(base)) {
      const pdir = path.join(base, pub);
      if (!fs.statSync(pdir).isDirectory()) continue;
      for (const f of fs.readdirSync(pdir)) {
        if (!f.endsWith('.json') || f.includes('manifest')) continue;
        out.push(path.join(pdir, f));
      }
    }
  }
  return out.sort();
}

const gradeArg = process.argv[2] || 'all';
const valid = ['G3', 'G4', 'G5', 'G6', 'all'];
if (!valid.includes(gradeArg)) {
  console.error('用法: node scripts/verify_chinese_kl4_prereq.js [G3|G4|G5|G6|all]');
  process.exit(1);
}

const files = walkChineseS2(gradeArg);
const byStatus = {};
const details = [];

for (const jpath of files) {
  let r;
  try {
    r = checkKl4ForJson(jpath);
  } catch (e) {
    r = { jpath, status: 'error', detail: e.message };
  }
  byStatus[r.status] = (byStatus[r.status] || 0) + 1;
  if (r.status !== 'ok') details.push(r);
}

console.log('掃描範圍:', gradeArg, '／ JSON 檔數:', files.length);
console.log('狀態統計:', JSON.stringify(byStatus, null, 2));

if (details.length) {
  console.log('\n未通過（最多列 50 筆）：');
  details.slice(0, 50).forEach((r) => {
    console.log('-', r.status, path.relative(ROOT, r.jpath));
    if (r.studyPath) console.log('    ', r.studyPath);
    if (r.dir) console.log('    ', r.dir);
  });
  if (details.length > 50) console.log('... 其餘', details.length - 50, '筆');
  process.exit(1);
}

console.log('\n✅ 全部通過（與 auto_generate_questions.js 國語載入條件一致）。');
process.exit(0);
