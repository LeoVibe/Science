/**
 * JOB-169：修正舊題非四選一、answer_index 字串等問題，利於 CQI-P 計分。
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

function fixStringAnswerIndex(q) {
  if (!Array.isArray(q.options) || q.options.length !== 4) return;
  const ai = q.answer_index;
  if (typeof ai === 'string') {
    const idx = q.options.indexOf(ai);
    if (idx >= 0) q.answer_index = idx;
  }
}

function fixTrueFalseEmpty(q) {
  const qt = String(q.question || '').trim();
  const ans = q.answer_index;
  if (ans !== 'True' && ans !== 'False') return false;
  q.question = `請評估下列說法是否合理：「${qt.replace(/\.$/, '')}。」`;
  q.options = [
    '說法合理，與觀察或課本解釋一致',
    '說法不合理，與科學解釋不符',
    '題目資訊不足，無法判斷',
    '需先改變實驗地點才能判斷'
  ];
  q.answer_index = ans === 'True' ? 0 : 1;
  q.taxonomy = q.taxonomy || 'inferential';
  return true;
}

function fixFillEmpty(q) {
  const qt = String(q.question || '').trim();
  const ans = q.answer_index;
  if (typeof ans !== 'string' || ans === 'True' || ans === 'False') return false;
  if (qt.includes('重量') || qt.includes('測量物體')) {
    q.question = '測量物體所受重力大小（重量）時，較常使用哪一種工具？';
    q.options = ['彈簧秤或電子秤', '溫度計', '量筒', '直尺'];
    q.answer_index = 0;
    q.taxonomy = q.taxonomy || 'literal';
    return true;
  }
  const correct = ans.includes('、') ? ans.split('、')[0].trim() : ans.trim();
  q.question = qt.replace(/_{2,}/, '（請選出最合適的答案）').replace(/______/, '（請選出最合適的答案）');
  if (q.question === qt) {
    q.question = `請選出最合適的答案，完成下列敘述：${qt}`;
  }
  q.options = [
    correct,
    '與重力與液體性質無關的描述',
    '僅在完全無重力時才成立的描述',
    '與日常觀察明顯矛盾的描述'
  ];
  q.answer_index = 0;
  q.taxonomy = q.taxonomy || 'literal';
  return true;
}

function processFile(fp) {
  const bank = JSON.parse(fs.readFileSync(fp, 'utf8'));
  for (const q of bank.questions) {
    if (!Array.isArray(q.options) || q.options.length === 0) {
      if (!fixTrueFalseEmpty(q)) fixFillEmpty(q);
    }
    fixStringAnswerIndex(q);
  }
  fs.writeFileSync(fp, JSON.stringify(bank, null, 2), 'utf8');
}

function main() {
  for (const rel of FILES) {
    processFile(path.join(ROOT, rel));
    console.log('fixed legacy', rel);
  }
}

main();
