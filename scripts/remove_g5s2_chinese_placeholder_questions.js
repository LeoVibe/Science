/**
 * 刪除 G5 S2 國語題庫中「任一新項為占位句」的整題，並更新該段三版 manifest 之 count／avg_cqi／total_questions。
 * 占位句與 JOB-128 strip 腳本一致。
 */
const fs = require('fs');
const path = require('path');
const { evaluateFile } = require('./evaluate_question_quality.js');

const PLACEHOLDER = '與課文敘述明顯不符（選項待人工重寫）';
const repoRoot = path.join(__dirname, '..');
const G5S2_BASE = path.join(repoRoot, 'question/platform/G5/Chinese/S2');

function hasPlaceholderQuestion(q) {
  const opts = q.options;
  return Array.isArray(opts) && opts.some((o) => o === PLACEHOLDER);
}

function avgCqi(questions) {
  const scores = (questions || [])
    .map((q) => q.cqi_score)
    .filter((x) => typeof x === 'number' && !Number.isNaN(x));
  if (!scores.length) return 0;
  const s = scores.reduce((a, b) => a + b, 0) / scores.length;
  return Math.round(s * 100) / 100;
}

function walkLessonJson(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    const st = fs.statSync(p);
    if (st.isDirectory()) walkLessonJson(p, out);
    else if (name.endsWith('.json') && !name.toLowerCase().includes('manifest')) out.push(p);
  }
  return out;
}

function updateManifestForPublisher(pubDir, publisherFolderName) {
  const manName = `G5_S2_CHI_${publisherFolderName.toUpperCase()}_manifest.json`;
  const manPath = path.join(pubDir, manName);
  if (!fs.existsSync(manPath)) return;
  const m = JSON.parse(fs.readFileSync(manPath, 'utf8'));
  let total = 0;
  for (const item of m.items || []) {
    const jf = path.join(pubDir, item.file);
    if (!fs.existsSync(jf)) continue;
    const j = JSON.parse(fs.readFileSync(jf, 'utf8'));
    const qs = j.questions || [];
    item.count = qs.length;
    item.avg_cqi = avgCqi(qs);
    total += item.count;
  }
  m.moduleMetaData = m.moduleMetaData || {};
  m.moduleMetaData.total_questions = total;
  m.moduleMetaData.last_updated = new Date().toISOString();
  fs.writeFileSync(manPath, JSON.stringify(m, null, 2) + '\n', 'utf8');
}

function main() {
  const files = walkLessonJson(G5S2_BASE);
  let removedQuestions = 0;
  let touchedFiles = 0;

  for (const fp of files) {
    let j;
    try {
      j = JSON.parse(fs.readFileSync(fp, 'utf8'));
    } catch {
      continue;
    }
    if (!Array.isArray(j.questions)) continue;
    const before = j.questions.length;
    j.questions = j.questions.filter((q) => !hasPlaceholderQuestion(q));
    const after = j.questions.length;
    if (before !== after) {
      removedQuestions += before - after;
      touchedFiles++;
      fs.writeFileSync(fp, JSON.stringify(j, null, 2) + '\n', 'utf8');
      try {
        evaluateFile(fp);
      } catch (e) {
        console.warn('evaluateFile 略過:', fp, e.message);
      }
    }
  }

  for (const pub of ['HanLin', 'KangHsuan', 'NanYi']) {
    const pubDir = path.join(G5S2_BASE, pub);
    if (fs.existsSync(pubDir)) updateManifestForPublisher(pubDir, pub);
  }

  console.log(
    JSON.stringify(
      {
        touchedFiles,
        removedQuestions,
        note: 'G5 S2 國語：已刪除含占位選項之整題，並更新三版 manifest',
      },
      null,
      2
    )
  );
}

main();
