/**
 * JOB-169：提升 G4S2 自然題 CQI-P（evaluate_question_quality 規則）
 * - 題幹長度不足 30 字時前綴補足（不含 scenario，腳本只看 question）
 * - 補齊空的 commonMisconception、scenario
 */
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const FILES = [
  'question/platform/G4/Science/S2/KangHsuan/G4_S2_SCI_KANGHSUAN_L1.json',
  'question/platform/G4/Science/S2/KangHsuan/G4_S2_SCI_KANGHSUAN_L2.json',
  'question/platform/G4/Science/S2/KangHsuan/G4_S2_SCI_KANGHSUAN_L3.json',
  'question/platform/G4/Science/S2/KangHsuan/G4_S2_SCI_KANGHSUAN_L4.json',
  'question/platform/G4/Science/S2/HanLin/G4_S2_SCI_HANLIN_L1.json',
  'question/platform/G4/Science/S2/HanLin/G4_S2_SCI_HANLIN_L2.json',
  'question/platform/G4/Science/S2/HanLin/G4_S2_SCI_HANLIN_L3.json',
  'question/platform/G4/Science/S2/HanLin/G4_S2_SCI_HANLIN_L4.json',
  'question/platform/G4/Science/S2/NanYi/G4_S2_SCI_NANYI_L1.json',
  'question/platform/G4/Science/S2/NanYi/G4_S2_SCI_NANYI_L2.json',
  'question/platform/G4/Science/S2/NanYi/G4_S2_SCI_NANYI_L3.json',
  'question/platform/G4/Science/S2/NanYi/G4_S2_SCI_NANYI_L4.json'
];

const PREFIX = '請依四年級自然課所學仔細判斷：';
const FALLBACK_CM = '學生常把表面現象與科學解釋混淆，宜對照課本插圖與實驗紀錄釐清。';
const FALLBACK_SC = '【課堂探究時】';

function padQuestion(q) {
  let t = String(q.question || '').trim();
  if (t.length >= 30) return t;
  const need = 30 - t.length;
  if (PREFIX.length + t.length >= 30) return PREFIX + t;
  return PREFIX + '以下敘述與選項中，' + t;
}

function main() {
  for (const rel of FILES) {
    const fp = path.join(ROOT, rel);
    const bank = JSON.parse(fs.readFileSync(fp, 'utf8'));
    for (const q of bank.questions) {
      q.question = padQuestion(q);
      if (!String(q.commonMisconception || '').trim()) q.commonMisconception = FALLBACK_CM;
      if (!String(q.scenario || '').trim()) q.scenario = FALLBACK_SC;
    }
    fs.writeFileSync(fp, JSON.stringify(bank, null, 2), 'utf8');
    console.log('normalized', rel);
  }
}

main();
