/**
 * JOB-183 後續：合併補題至 G5 國語 S2 指定 JSON
 * last_updated: 2026-04-12
 * updated_by: Cursor Agent
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');

const FILES = {
  l9: path.join(ROOT, 'question/platform/G5/Chinese/S2/KangHsuan/G5_S2_CHI_KANGHSUAN_L9.json'),
  l10: path.join(ROOT, 'question/platform/G5/Chinese/S2/KangHsuan/G5_S2_CHI_KANGHSUAN_L10.json'),
  l12: path.join(ROOT, 'question/platform/G5/Chinese/S2/KangHsuan/G5_S2_CHI_KANGHSUAN_L12.json'),
  ny1: path.join(ROOT, 'question/platform/G5/Chinese/S2/NanYi/G5_S2_CHI_NANYI_L1.json')
};

const EXTRA = {
  l9: path.join(__dirname, 'job183_l9.json'),
  l10: path.join(__dirname, 'job183_l10.json'),
  l12: path.join(__dirname, 'job183_l12.json'),
  ny1: path.join(__dirname, 'job183_ny1.json')
};

function merge(key) {
  const filePath = FILES[key];
  const extraPath = EXTRA[key];
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const incoming = JSON.parse(fs.readFileSync(extraPath, 'utf8'));
  if (!Array.isArray(incoming) || incoming.length === 0) {
    throw new Error(`${extraPath} 為空或格式錯誤`);
  }
  data.questions = (data.questions || []).concat(incoming);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  console.log(`${key}: +${incoming.length} → 總題數 ${data.questions.length} (${path.basename(filePath)})`);
}

merge('l9');
merge('l10');
merge('l12');
merge('ny1');
console.log('JOB183 merge 完成');
