/**
 * sync_v3_public_questions.mjs
 *
 * 將 repo 根目錄 question/platform/G{3,4,5,6} 同步至
 * apps/v3_eidos/public/question/platform/G{3,4,5,6}。
 *
 * 行為：
 *   1. 刪除 public 目標目錄下的舊格式檔案（完整清除再複製）
 *   2. 從 question/platform/ 複製新格式 JSON
 *   3. 為每個出版社目錄建立 manifest.json（從 G*_S*_*_manifest.json 複製）
 *
 * 由 apps/v3_eidos 的 npm prebuild 呼叫。
 * 可單獨執行：node scripts/sync_v3_public_questions.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const srcBase = path.join(root, 'question', 'platform');
const destBase = path.join(root, 'apps', 'v3_eidos', 'public', 'question', 'platform');

const OPEN_GRADES = ['G3', 'G4', 'G5', 'G6'];
const OPEN_SEMESTER = 'S2';

let copied = 0;
let deleted = 0;
let manifestsCreated = 0;
let errors = 0;

function syncPublisherDir(srcDir, destDir) {
  // 清除目的地目錄舊內容
  if (fs.existsSync(destDir)) {
    fs.rmSync(destDir, { recursive: true, force: true });
    deleted++;
  }
  fs.mkdirSync(destDir, { recursive: true });

  const files = fs.readdirSync(srcDir);

  // 找出 manifest 檔（G*_S*_*_manifest.json）
  const manifestFile = files.find(f => f.endsWith('_manifest.json'));
  if (!manifestFile) {
    console.warn(`  [WARN] 找不到 manifest：${srcDir}`);
    errors++;
  } else {
    // 複製為 manifest.json
    fs.copyFileSync(
      path.join(srcDir, manifestFile),
      path.join(destDir, 'manifest.json')
    );
    manifestsCreated++;
  }

  // 複製所有題庫 JSON（排除 manifest 本身）
  for (const file of files) {
    if (file === '.DS_Store') continue;
    if (file.endsWith('_manifest.json')) continue;
    if (!file.endsWith('.json')) continue;

    const srcFile = path.join(srcDir, file);
    const stat = fs.statSync(srcFile);
    if (stat.isDirectory()) continue;

    fs.copyFileSync(srcFile, path.join(destDir, file));
    copied++;
  }
}

function syncGrade(grade) {
  const srcGradeDir = path.join(srcBase, grade);
  if (!fs.existsSync(srcGradeDir)) {
    console.warn(`[sync] 略過 ${grade}：來源不存在`);
    return;
  }

  const subjects = fs.readdirSync(srcGradeDir).filter(d =>
    fs.statSync(path.join(srcGradeDir, d)).isDirectory()
  );

  for (const subject of subjects) {
    const srcSubjectDir = path.join(srcGradeDir, subject);
    const semDir = path.join(srcSubjectDir, OPEN_SEMESTER);
    if (!fs.existsSync(semDir)) continue;

    const publishers = fs.readdirSync(semDir).filter(d => {
      if (/backup|_job\d+|_legacy/i.test(d)) return false;
      return fs.statSync(path.join(semDir, d)).isDirectory();
    });

    for (const publisher of publishers) {
      const srcPubDir = path.join(semDir, publisher);
      const destPubDir = path.join(destBase, grade, subject, OPEN_SEMESTER, publisher);
      syncPublisherDir(srcPubDir, destPubDir);
    }
  }
}

console.log('[sync_v3_public_questions] 開始同步 G3-G6 → public/question/platform/');

for (const grade of OPEN_GRADES) {
  console.log(`  同步 ${grade}...`);
  syncGrade(grade);
}

console.log(`[sync_v3_public_questions] 完成`);
console.log(`  清除舊目錄: ${deleted} 個`);
console.log(`  複製題庫 JSON: ${copied} 個`);
console.log(`  建立 manifest.json: ${manifestsCreated} 個`);
if (errors > 0) console.warn(`  警告: ${errors} 個 manifest 缺失`);
