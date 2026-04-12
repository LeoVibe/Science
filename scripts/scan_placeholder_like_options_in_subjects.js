/**
 * scan_placeholder_like_options_in_subjects.js
 *
 * 目的：掃描 question/platform 下的 SocialStudies 與 Science 題庫，統計 options 中是否出現
 * 「占位/待人工重寫類」字串殘留。
 *
 * 與 JOB-128 對齊的重點：
 * - JOB-128 的占位選項常見來源：刪除套話後，選項過短而被腳本改成 PLACEHOLDER_OPTION
 * - 此處不執行清除，只做驗證掃描與彙總報告
 */

const fs = require('fs');
const path = require('path');

const repoRoot = path.join(__dirname, '..');
const platformRoot = path.join(repoRoot, 'question/platform');

// JOB-128 的 PLACEHOLDER_OPTION（精確比對）
const PLACEHOLDER_EXACT = '與課文敘述明顯不符（選項待人工重寫）';

// 占位/待人工重寫的「較寬比對」：只要包含此子串即可
const PLACEHOLDER_LIKE_SUBSTRING = '待人工重寫';

const SUBJECTS = [
  { folder: 'SocialStudies', label: '社會' },
  { folder: 'Science', label: '自然' },
];

const GRADES = ['G3', 'G4', 'G5', 'G6'];

function walkJsonFiles(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    const st = fs.statSync(p);
    if (st.isDirectory()) walkJsonFiles(p, out);
    else if (name.endsWith('.json') && !name.toLowerCase().includes('manifest')) out.push(p);
  }
  return out;
}

function getKeyFromRel(rel) {
  // question/platform/G3/SocialStudies/S2/HanLin/L1_*.json
  const parts = rel.split(path.sep);
  // parts[0]=G3, [1]=SubjectFolder, [2]=S1/S2, [3]=Publisher
  const grade = parts[0] || '';
  const subjectFolder = parts[1] || '';
  const semester = parts[2] || '';
  const publisher = parts[3] || '';
  return { grade, subjectFolder, semester, publisher };
}

function avg(arr) {
  if (!arr.length) return 0;
  const s = arr.reduce((a, b) => a + b, 0) / arr.length;
  return Math.round(s * 100) / 100;
}

function analyzeFile(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  let data;
  try {
    data = JSON.parse(raw);
  } catch {
    return null;
  }
  const questions = Array.isArray(data.questions) ? data.questions : [];
  if (!questions.length) return null;

  const rel = path.relative(platformRoot, filePath);
  const { grade, subjectFolder, semester, publisher } = getKeyFromRel(rel);
  const exactQuestions = [];
  const likeQuestions = [];

  let totalOptions = 0;
  let exactOptions = 0;
  let likeOptions = 0;

  for (let qi = 0; qi < questions.length; qi++) {
    const q = questions[qi] || {};
    const opts = Array.isArray(q.options) ? q.options : [];
    totalOptions += opts.length;

    const exactCount = opts.filter((o) => o === PLACEHOLDER_EXACT).length;
    const likeCount = opts.filter((o) => typeof o === 'string' && o.includes(PLACEHOLDER_LIKE_SUBSTRING)).length;

    if (exactCount > 0) exactOptions += exactCount;
    if (likeCount > 0) likeOptions += likeCount;

    if (exactCount > 0) exactQuestions.push({ qi, exactCount });
    if (likeCount > 0) likeQuestions.push({ qi, likeCount });
  }

  return {
    rel,
    meta: data.meta || {},
    grade,
    subjectFolder,
    semester,
    publisher,
    totalQuestions: questions.length,
    exactQuestionsCount: exactQuestions.length,
    likeQuestionsCount: likeQuestions.length,
    totalOptions,
    exactOptions,
    likeOptions,
    exactQuestions,
    likeQuestions,
  };
}

function subjectLabelFromFolder(folder) {
  const s = SUBJECTS.find((x) => x.folder === folder);
  return s ? s.label : folder;
}

function main() {
  const files = [];
  for (const g of GRADES) {
    for (const s of SUBJECTS) {
      files.push(...walkJsonFiles(path.join(platformRoot, g, s.folder)));
    }
  }

  const results = [];
  for (const fp of files) {
    const r = analyzeFile(fp);
    if (!r) continue;
    if (r.exactQuestionsCount === 0 && r.likeQuestionsCount === 0) continue;
    results.push(r);
  }

  const total = {
    files: results.length,
    exactQuestions: results.reduce((a, r) => a + r.exactQuestionsCount, 0),
    likeQuestions: results.reduce((a, r) => a + r.likeQuestionsCount, 0),
    exactOptions: results.reduce((a, r) => a + r.exactOptions, 0),
    likeOptions: results.reduce((a, r) => a + r.likeOptions, 0),
  };

  // Aggregate: grade|semester|subjectFolder
  const agg = new Map();
  function addAgg(key, r) {
    if (!agg.has(key)) {
      agg.set(key, {
        grade: r.grade,
        semester: r.semester,
        subjectFolder: r.subjectFolder,
        files: 0,
        exactQuestions: 0,
        likeQuestions: 0,
        exactOptions: 0,
        likeOptions: 0,
        totalQuestions: 0,
        totalOptions: 0,
      });
    }
    const a = agg.get(key);
    a.files += 1;
    a.exactQuestions += r.exactQuestionsCount;
    a.likeQuestions += r.likeQuestionsCount;
    a.exactOptions += r.exactOptions;
    a.likeOptions += r.likeOptions;
    a.totalQuestions += r.totalQuestions;
    a.totalOptions += r.totalOptions;
  }

  // Important: totalQuestions/totalOptions only accumulates files where placeholder exists (results filtered).
  // For「占位占比」我們仍可以給相對比例，但若要精確分母需改掃全檔再統計。
  for (const r of results) {
    const key = `${r.grade}|${r.semester}|${r.subjectFolder}`;
    addAgg(key, r);
  }

  // Output
  console.log('=== 社會/自然題庫：占位/待人工重寫類 options 殘留掃描（僅列出含命中的檔案） ===');
  console.log('PLACEHOLDER_EXACT =', PLACEHOLDER_EXACT);
  console.log('LIKE_SUBSTRING =', PLACEHOLDER_LIKE_SUBSTRING);
  console.log('');
  console.log('合計命中：', total);
  console.log('');

  const rows = [...results].sort((a, b) => a.grade.localeCompare(b.grade) || a.semester.localeCompare(b.semester) || a.rel.localeCompare(b.rel));
  for (const r of rows) {
    const lesson = r.meta.title || r.meta.lesson || '';
    const publisherLabel = r.publisher || '';
    console.log(
      `- ${r.grade} ${r.semester} ${subjectLabelFromFolder(r.subjectFolder)} / ${publisherLabel} / ${r.rel}  （題數=${r.totalQuestions}，exact題=${r.exactQuestionsCount}，like題=${r.likeQuestionsCount}，exact選項=${r.exactOptions}，like選項=${r.likeOptions}，課名=${lesson || '未標示'}）`
    );
  }

  console.log('');
  console.log('=== 聚合（以「含命中檔案」作分母，供快速判斷） ===');
  const keys = [...agg.keys()].sort();
  for (const k of keys) {
    const a = agg.get(k);
    console.log(
      `${a.grade} ${a.semester} ${subjectLabelFromFolder(a.subjectFolder)}\t檔案(命中檔)=${a.files}\t` +
        `exact題=${a.exactQuestions}\tlike題=${a.likeQuestions}\t` +
        `exact選項=${a.exactOptions}\tlike選項=${a.likeOptions}`
    );
  }
}

main();

