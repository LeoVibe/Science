#!/usr/bin/env node
// scripts/check_dual_blind_consistency.js
// 雙盲一致性檢查 + MTP 分流（spec 第 9.4 節）。
// 用法：
//   node scripts/check_dual_blind_consistency.js <path/to/blind_evaluated.json>
// 模組用法：
//   const { analyzeDualBlind } = require('./check_dual_blind_consistency');

const TYPE_B_THRESHOLD = 0.05;
const INCONSISTENCY_THRESHOLD = 0.2;

function classifyQuestion(q) {
  const ans = q.answer_index;
  const g = q.blind_eval_g || {};
  const c = q.blind_eval_c || {};
  const gMatch = g.predicted_index === ans;
  const cMatch = c.predicted_index === ans;

  if (gMatch && cMatch) {
    return { status: 'keep', mtp_type: null, partial: false };
  }

  // TYPE-A：兩 model 都標 -1 或 reasoning 顯示「找不到正確選項」
  const noOption = (idx, reasoning) =>
    idx === -1 ||
    (typeof reasoning === 'string' &&
      /找不到|沒有正確|no correct option|cannot find/i.test(reasoning));
  if (!gMatch && !cMatch && noOption(g.predicted_index, g.reasoning) && noOption(c.predicted_index, c.reasoning)) {
    return { status: 'keep', mtp_type: 'A', partial: false };
  }

  // TYPE-B：兩 model 都推得相同錯誤答案
  if (!gMatch && !cMatch && g.predicted_index === c.predicted_index && g.predicted_index !== -1) {
    return { status: 'discard', mtp_type: 'B', partial: false };
  }

  // TYPE-C：兩 model 都 mismatch 但推不同答案
  if (!gMatch && !cMatch) {
    return { status: 'manual_review', mtp_type: 'C', partial: false };
  }

  // partial：一 Match 一 Mismatch
  return { status: 'manual_review', mtp_type: null, partial: true };
}

function analyzeDualBlind(json) {
  const questions = (json.questions || []).map((q) => ({
    id: q.id,
    answer_index: q.answer_index,
    ...classifyQuestion(q),
  }));

  const total = questions.length;
  const count = (pred) => questions.filter(pred).length;

  const keep = count((q) => q.status === 'keep');
  const discard = count((q) => q.status === 'discard');
  const manual_review = count((q) => q.status === 'manual_review');
  const partial = count((q) => q.partial);
  const type_b_count = count((q) => q.mtp_type === 'B');
  const type_b_ratio = total ? type_b_count / total : 0;
  const inconsistency_ratio = total ? partial / total : 0;

  const warnings = [];
  if (type_b_ratio > TYPE_B_THRESHOLD) warnings.push('TYPE-B > 5%');
  if (inconsistency_ratio > INCONSISTENCY_THRESHOLD) warnings.push('inconsistency > 20%');

  let suggested_tsv_status = 'keep';
  if (warnings.length > 0) suggested_tsv_status = 'manual_review';
  else if (manual_review > 0 || discard > 0) suggested_tsv_status = 'manual_review';

  return {
    questions,
    summary: {
      total,
      keep,
      discard,
      manual_review,
      partial,
      type_b_count,
      type_b_ratio,
      inconsistency_ratio,
      warnings,
      suggested_tsv_status,
    },
  };
}

function main() {
  const target = process.argv[2];
  if (!target) {
    console.error('用法：node scripts/check_dual_blind_consistency.js <path/to/blind_evaluated.json>');
    process.exit(1);
  }
  const path = require('path');
  const json = require(path.resolve(target));
  const result = analyzeDualBlind(json);

  console.log(`雙盲一致性檢查結果：${target}`);
  console.log(`  總題數：${result.summary.total}`);
  console.log(`  keep：${result.summary.keep}`);
  console.log(`  discard：${result.summary.discard}`);
  console.log(`  manual_review：${result.summary.manual_review}`);
  console.log(`  partial：${result.summary.partial}`);
  console.log(`  TYPE-B 比例：${(result.summary.type_b_ratio * 100).toFixed(1)}%`);
  console.log(`  不一致率：${(result.summary.inconsistency_ratio * 100).toFixed(1)}%`);
  if (result.summary.warnings.length) {
    console.log(`  ⚠️ 警告：${result.summary.warnings.join(', ')}`);
  }
  console.log(`  建議課級 status：${result.summary.suggested_tsv_status}`);
}

if (require.main === module) {
  main();
}

module.exports = { analyzeDualBlind, classifyQuestion };
