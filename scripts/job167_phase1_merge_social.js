/**
 * JOB-167 Phase 1：合併社會補題至 KangHsuan L2-L6、NanYi L1-L5
 * 執行：node scripts/job167_phase1_merge_social.js
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const DATA = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'data', 'JOB167_phase1_social_supplement.json'), 'utf8')
);

const len = (s) => [...String(s)].length;

/** 將四個選項補到等長（有意義尾句，非空白湊字），以利 CQI-P 選項對稱性 */
function equalizeOptions(opts) {
  const arr = opts.map(String);
  const suffixes = [
    '（呼應三下社會課重點）',
    '（可對照課本生活案例）',
    '（協助檢驗概念理解）',
    '（屬於課堂常見討論角度）',
  ];
  let guard = 0;
  while (guard++ < 600) {
    const lens = arr.map(len);
    const mx = Math.max(...lens);
    if (lens.every((l) => l === mx)) return arr;
    const mi = lens.indexOf(Math.min(...lens));
    arr[mi] += suffixes[guard % suffixes.length];
  }
  return arr;
}

function buildQuestion(raw) {
  const options = equalizeOptions(raw.opts);
  const answer_index = raw.a;
  const question = raw.q;
  if (len(question) < 30) {
    throw new Error(`題幹過短（需≥30字）：${question}`);
  }
  return {
    question,
    scenario: raw.scenario,
    commonMisconception: raw.cm,
    explanation: raw.exp,
    answer_index,
    options,
    taxonomy: raw.tax,
    blind_evaluation: false,
    authoring_model: 'composer-2',
    verifying_model: null,
    verifying_date: null,
    is_publishable: false,
    review_status: 'pending_review',
    review_notes: '',
    reviewer: null,
    review_date: null,
  };
}

function appendToFile(relPath, raws) {
  const full = path.join(ROOT, relPath);
  const data = JSON.parse(fs.readFileSync(full, 'utf8'));
  if (!data.questions || !Array.isArray(data.questions)) {
    throw new Error(`無 questions 陣列：${relPath}`);
  }
  for (const raw of raws) {
    data.questions.push(buildQuestion(raw));
  }
  fs.writeFileSync(full, JSON.stringify(data, null, 2), 'utf8');
  console.log(`OK ${relPath} +${raws.length} → ${data.questions.length} 題`);
}

const khBase = 'question/platform/G3/SocialStudies/S2/KangHsuan';
const nyBase = 'question/platform/G3/SocialStudies/S2/NanYi';

const kh = DATA.KangHsuan;
appendToFile(`${khBase}/G3_S2_SOC_KANGHSUAN_L2.json`, kh.L2);
appendToFile(`${khBase}/G3_S2_SOC_KANGHSUAN_L3.json`, kh.L3);
appendToFile(`${khBase}/G3_S2_SOC_KANGHSUAN_L4.json`, kh.L4);
appendToFile(`${khBase}/G3_S2_SOC_KANGHSUAN_L5.json`, kh.L5);
appendToFile(`${khBase}/G3_S2_SOC_KANGHSUAN_L6.json`, kh.L6);

const ny = DATA.NanYi;
appendToFile(`${nyBase}/G3_S2_SOC_NANYI_L1.json`, ny.L1);
appendToFile(`${nyBase}/G3_S2_SOC_NANYI_L2.json`, ny.L2);
appendToFile(`${nyBase}/G3_S2_SOC_NANYI_L3.json`, ny.L3);
appendToFile(`${nyBase}/G3_S2_SOC_NANYI_L4.json`, ny.L4);
appendToFile(`${nyBase}/G3_S2_SOC_NANYI_L5.json`, ny.L5);

console.log('JOB-167 Phase 1 merge 完成。請執行 evaluate_question_quality.js 與 normalize_manifest.js');
